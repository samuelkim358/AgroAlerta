/* ============================================================
   panel_alerta.js — AgroAlerta
   Gestión de alertas regionales y planes de acción por cultivo.
   ============================================================ */

document.addEventListener("DOMContentLoaded", async () => {
    // 1. VALIDACIÓN DE SESIÓN
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!currentUser) {
        window.location.href = "login.html";
        return;
    }

    // 2. INTERFAZ BÁSICA (Avatar y Fecha)
    const avatar = document.querySelector(".avatar");
    if (avatar) avatar.textContent = currentUser.iniciales || "AA";

    const dateElement = document.querySelector(".topbar-date");
    if (dateElement) {
        const options = { day: "numeric", month: "long", year: "numeric" };
        dateElement.textContent = `📅 ${new Date().toLocaleDateString("es-MX", options)}`;
    }

    // 3. SIDEBAR TOGGLE
    const sidebar = document.getElementById("sidebar");
    const toggle = document.getElementById("sidebarToggle");
    if (sidebar && toggle) {
        const saved = localStorage.getItem("sidebarCollapsed");
        if (saved === "true") sidebar.classList.add("collapsed");

        toggle.addEventListener("click", () => {
            sidebar.classList.toggle("collapsed");
            localStorage.setItem("sidebarCollapsed", sidebar.classList.contains("collapsed"));
        });
    }

    // 4. ASEGURAR DATOS EN LOCALSTORAGE (Solución al problema de carga)
    // Si no existen datos de campos, los traemos del JSON antes de cargar el panel
    if (!localStorage.getItem("camposData")) {
        try {
            const res = await fetch("../data/campos.json");
            if (res.ok) {
                const data = await res.json();
                localStorage.setItem("camposData", JSON.stringify(data));
            } else {
                throw new Error("No se pudo obtener campos.json");
            }
        } catch (error) {
            console.error("Error en precarga de datos:", error);
            localStorage.setItem("camposData", JSON.stringify([]));
        }
    }

    // 5. CARGA DINÁMICA DE ALERTAS Y RECOMENDACIONES
    loadAlertsData();

    async function loadAlertsData() {
        const alertsStrip = document.getElementById("alertsStrip");
        const recsList = document.getElementById("recommendationsList");
        const regionSubtitle = document.getElementById("regionSubtitle");

        if (!alertsStrip || !recsList) return;

        const userRegion = currentUser.region || "Atlixco";
        
        // Obtenemos los datos ya asegurados en el paso anterior
        let camposData = JSON.parse(localStorage.getItem("camposData")) || [];
        
        // Buscamos el campo que pertenece al usuario logueado
        let miCampo = camposData.find(c => String(c.id_usuario) === String(currentUser.id));

        // Si el usuario no tiene un campo registrado aún (usuario nuevo), creamos uno base
        if (!miCampo) {
            miCampo = {
                id_campo: `campo-${currentUser.id}`,
                id_usuario: currentUser.id,
                nombre_campo: "Mi Parcela",
                region: userRegion,
                cultivos: []
            };
            camposData.push(miCampo);
            localStorage.setItem("camposData", JSON.stringify(camposData));
        }

        const misCultivos = miCampo.cultivos || [];

        if (regionSubtitle) {
            regionSubtitle.textContent = `Riesgos detectados en ${userRegion}`;
        }

        try {
            // Cargar alertas meteorológicas y biológicas
            const response = await fetch("../data/alerts.json");
            if (!response.ok) throw new Error("Error al cargar alerts.json");
            const todasLasAlertas = await response.json();

            // Filtrar alertas por la región del usuario
            const alertasFiltradas = todasLasAlertas.filter(a => a.region === userRegion);

            // --- RENDERIZAR ALERTAS (BANNER SUPERIOR) ---
            if (alertasFiltradas.length === 0) {
                alertsStrip.innerHTML = `
                    <div class="alert-pill info">
                        <strong>📍 ${userRegion} — Sin Riesgos</strong>
                        <p class="alert-desc">No se detectan amenazas climáticas o biológicas activas para hoy.</p>
                    </div>`;
            } else {
                alertsStrip.innerHTML = alertasFiltradas.map(alerta => {
                    const nivel = alerta.nivel === "rojo" ? "rojo" : (alerta.nivel === "amarillo" ? "warn" : "info");
                    return `
                        <div class="alert-pill ${nivel}">
                            <div style="display:flex; justify-content:space-between; width:100%; align-items:center; margin-bottom:8px;">
                                <span style="font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; opacity:0.8;">
                                    📍 ${alerta.region} — ${alerta.tipo_cultivo}
                                </span>
                                <span style="font-size:10px; opacity:0.7;">VENCE: ${alerta.fecha_fin}</span>
                            </div>
                            <strong>${alerta.titulo}</strong>
                            <p class="alert-desc">${alerta.descripcion}</p>
                        </div>
                    `;
                }).join("");
            }

            // --- RENDERIZAR RECOMENDACIONES (PLANES DE ACCIÓN) ---
            if (misCultivos.length === 0) {
                recsList.innerHTML = `
                    <div style="grid-column: 1/-1; text-align: center; padding: 40px; background: #f8fafc; border-radius: 20px; border: 2px dashed #cbd5e0;">
                        <p style="color: var(--text-light); margin-bottom: 15px;">No tienes cultivos registrados para generar acciones específicas.</p>
                        <a href="tus_cultivos.html" style="display:inline-block; padding: 10px 20px; background: var(--accent-green); color: white; border-radius: 10px; text-decoration: none; font-weight: 600;">
                            Registrar mis cultivos
                        </a>
                    </div>`;
                return;
            }

            const iconos = { 
                maiz: "🌽", frijol: "🫘", chile: "🌶️", flores: "🌸", 
                agave: "🌵", cafe: "☕", papa: "🥔", cana: "🎋", hortalizas: "🥬"
            };

            const cardsHTML = misCultivos.map(cultivo => {
                // Buscamos alerta específica para el tipo de cultivo o una general de la región
                const alertaAsociada = alertasFiltradas.find(a => 
                    a.tipo_cultivo.toLowerCase() === cultivo.tipo.toLowerCase() || 
                    a.tipo_cultivo === "general"
                );

                return `
                    <div class="rec-card">
                        <div class="rec-header">
                            <div class="rec-icon-circle">${iconos[cultivo.tipo.toLowerCase()] || "🌱"}</div>
                            <div class="rec-meta">
                                <h4>${cultivo.nombre}</h4>
                                <span>${cultivo.tipo} • ${cultivo.hectareas} ha</span>
                            </div>
                        </div>
                        <div class="rec-content">
                            <strong>Plan de Acción Sugerido</strong>
                            <p>${alertaAsociada ? alertaAsociada.recomendacion : "Condiciones estables. Mantener el programa de monitoreo y riego estándar."}</p>
                        </div>
                    </div>
                `;
            }).join("");

            recsList.innerHTML = `<div class="recommendations-grid">${cardsHTML}</div>`;

        } catch (error) {
            console.error("Error en la carga de alertas:", error);
            if (alertsStrip) {
                alertsStrip.innerHTML = `<div class="alert-pill rojo"><strong>Error de conexión</strong> No se pudo sincronizar con el servidor de alertas.</div>`;
            }
        }
    }
});
