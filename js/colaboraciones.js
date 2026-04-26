document.addEventListener("DOMContentLoaded", () => {

    // =========================
    // SESIÓN DE USUARIO
    // =========================
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));

    if (!currentUser) {
        window.location.href = "login.html";
        return;
    }

    // =========================
    // AVATAR (INICIALES)
    // =========================
    const avatar = document.querySelector(".avatar");
    if (avatar) {
        avatar.textContent = currentUser.iniciales || "AA";
    }

    // =========================
    // FECHA AUTOMÁTICA
    // =========================
    const dateElement = document.querySelector(".topbar-date");
    if (dateElement) {
        const options = { day: "numeric", month: "long", year: "numeric" };
        const today = new Date().toLocaleDateString("es-MX", options);
        dateElement.textContent = `📅 ${today}`;
    }

    // =========================
    // SIDEBAR TOGGLE
    // =========================
    initSidebarToggle();

    // ===================================
    // LÓGICA DE COLABORACIONES (HACKATHON)
    // ===================================
    loadCollaborations();

    async function loadCollaborations() {
        const grid = document.getElementById("collabGrid");
        const banner = document.getElementById("activeCollaborationBanner");
        const regionSubtitle = document.getElementById("regionSubtitle");

        if (!grid) return;

        // 1. Mostrar la región del usuario en el subtítulo
        if (regionSubtitle) {
            regionSubtitle.textContent = `Instituciones disponibles en ${currentUser.region}`;
        }

        // 2. Obtener estado de postulación del usuario desde LocalStorage
        const userApps = JSON.parse(localStorage.getItem("userApplications")) || {};
        const activeInstId = userApps[currentUser.id];

        try {
            const response = await fetch("../data/colaboraciones.json");
            const data = await response.json();

            // 3. Filtrar por región del usuario
            const regionData = data.filter(inst => inst.regiones.includes(currentUser.region));

            // 4. Gestionar el Banner de Postulación Activa (MOSTRANDO EMAIL DEL USUARIO)
            if (activeInstId) {
                const activeInst = data.find(i => i.id === activeInstId);
                if (activeInst && banner) {
                    banner.style.display = "flex";
                    banner.innerHTML = `
                        <div class="banner-content">
                            <h3><span class="icon">✅</span> Postulación Activa: ${activeInst.nombre}</h3>
                            <p>Tu parcela ha sido vinculada con <strong>${activeInst.siglas}</strong>. Se ha enviado un comprobante a tu correo: <strong>${currentUser.email}</strong>. La institución te contactará pronto.</p>
                        </div>
                        <div class="banner-status">En proceso</div>
                    `;
                }
            }

            // 5. Renderizar Tarjetas
            if (regionData.length === 0) {
                grid.innerHTML = `
                    <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #64748b;">
                        <p>No hay instituciones registradas en <strong>${currentUser.region}</strong> por el momento.</p>
                    </div>`;
                return;
            }

            grid.innerHTML = regionData.map(inst => {
                const isApplied = activeInstId === inst.id;
                const isOtherApplied = activeInstId && activeInstId !== inst.id;

                return `
                <div class="collab-card ${isApplied ? 'applied' : ''}">
                    <div class="card-body">
                        <div class="inst-header">
                            <div class="logo-circle">${inst.logo_inicial}</div>
                            <div class="inst-meta">
                                <span class="inst-type">${inst.tipo.replace('_', ' ')}</span>
                                <h3>${inst.nombre}</h3>
                            </div>
                        </div>
                        
                        <p class="collab-desc">${inst.descripcion}</p>
                        
                        <div class="interest-tags">
                            ${inst.interes.map(tag => `<span class="tag">#${tag}</span>`).join('')}
                            <span class="tag duration">⏱ ${inst.duracion_meses} meses</span>
                        </div>

                        <div class="benefit-box">
                            <strong>Tu beneficio como productor:</strong>
                            <p>${inst.beneficio_agricultor}</p>
                        </div>
                    </div>

                    <div class="card-footer">
                        <button class="btn-postular" 
                            onclick="postular('${inst.id}', '${inst.siglas}')"
                            ${isApplied || isOtherApplied ? 'disabled' : ''}>
                            ${isApplied ? '✓ Ya estás postulado' : (isOtherApplied ? 'Inscrito en otro programa' : 'Postular mi parcela')}
                        </button>
                    </div>
                </div>
                `;
            }).join('');

        } catch (e) {
            console.error("Error cargando colaboraciones:", e);
            grid.innerHTML = "<p>Error al cargar las oportunidades. Inténtalo más tarde.</p>";
        }
    } 
});

// =========================
// FUNCIONES GLOBALES
// =========================

function postular(id, siglas) {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    
    const mensaje = `¿Deseas postular tus cultivos para colaborar con la ${siglas}? 
    
Al aceptar, la institución recibirá tus datos de contacto (${currentUser.email} / ${currentUser.telefono}) y ubicación para instalar herramientas de monitoreo.`;

    if (confirm(mensaje)) {
        let userApps = JSON.parse(localStorage.getItem("userApplications")) || {};
        userApps[currentUser.id] = id;
        localStorage.setItem("userApplications", JSON.stringify(userApps));
        
        alert(`¡Solicitud enviada a ${siglas}! Se han compartido tus datos de contacto.`);
        location.reload(); 
    }
}

function initSidebarToggle() {
    const sidebar = document.getElementById("sidebar");
    const toggle = document.getElementById("sidebarToggle");

    if (!sidebar || !toggle) return;

    const saved = localStorage.getItem("sidebarCollapsed");
    if (saved === "true") {
        sidebar.classList.add("collapsed");
    }

    toggle.addEventListener("click", () => {
        sidebar.classList.toggle("collapsed");
        localStorage.setItem("sidebarCollapsed", sidebar.classList.contains("collapsed"));
    });
}