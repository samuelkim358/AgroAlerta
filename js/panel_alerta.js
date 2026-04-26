document.addEventListener("DOMContentLoaded", () => {
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

    // 4. CARGA DINÁMICA DE DATOS
    loadAlertsData();

    async function loadAlertsData() {
        const alertsStrip = document.getElementById("alertsStrip");
        const recsList = document.getElementById("recommendationsList");
        const regionSubtitle = document.getElementById("regionSubtitle");

        if (!alertsStrip || !recsList) return;

        const userRegion = currentUser.region || "Atlixco";
        const camposData = JSON.parse(localStorage.getItem("camposData")) || [];
        
        // Buscamos el campo del usuario (asegurando coincidencia de tipo de dato)
        const miCampo = camposData.find(c => String(c.id_usuario) === String(currentUser.id));
        const misCultivos = miCampo ? miCampo.cultivos : [];

        if (regionSubtitle) regionSubtitle.textContent = `Riesgos detectados en ${userRegion}`;

        try {
            const response = await fetch("../data/alerts.json");
            if (!response.ok) throw new Error("Error al cargar JSON");
            const todasLasAlertas = await response.json();

            // Filtrar alertas por la región del usuario
            const alertasFiltradas = todasLasAlertas.filter(a => a.region === userRegion);

            // --- RENDERIZAR ALERTAS (BANNER SUPERIOR CON UBICACIÓN) ---
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

            // --- RENDERIZAR RECOMENDACIONES (GRID DE TARJETAS LIMPIAS) ---
            if (misCultivos.length === 0) {
                recsList.innerHTML = `<p style="padding:20px; color:var(--text-light);">No tienes cultivos registrados para generar acciones.</p>`;
                return;
            }

            const iconos = { 
                maiz: "🌽", frijol: "🫘", chile: "🌶️", flores: "🌸", 
                agave: "🌵", cafe: "☕", papa: "🥔", cana: "🎋" 
            };

            const cardsHTML = misCultivos.map(cultivo => {
                // Buscamos alerta específica para el tipo de cultivo o una general de la región
                const alertaAsociada = alertasFiltradas.find(a => a.tipo_cultivo === cultivo.tipo || a.tipo_cultivo === "general");

                return `
                    <div class="rec-card">
                        <div class="rec-header">
                            <div class="rec-icon-circle">${iconos[cultivo.tipo] || "🌱"}</div>
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

            // Inyectamos el grid completo
            recsList.innerHTML = `<div class="recommendations-grid">${cardsHTML}</div>`;

        } catch (error) {
            console.error("Error:", error);
            alertsStrip.innerHTML = `<div class="alert-pill rojo"><strong>Error de conexión</strong> No se pudo sincronizar con el servidor de alertas.</div>`;
        }
    }
});