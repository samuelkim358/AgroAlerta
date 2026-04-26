/* ============================================================
   mis_cultivos.js — AgroAlerta
   Lógica compartida: Tus Cultivos + Agregar Cultivo + Gráficas
   ============================================================ */

document.addEventListener("DOMContentLoaded", async () => {

  // ─────────────────────────────────────────
  // 1. SESIÓN DE USUARIO
  // ─────────────────────────────────────────
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUser) {
    window.location.href = "login.html";
    return;
  }

  // ─────────────────────────────────────────
  // 2. AVATAR (INICIALES)
  // ─────────────────────────────────────────
  const avatar = document.querySelector(".avatar");
  if (avatar) {
    avatar.textContent = currentUser.iniciales || "AA";
  }

  // ─────────────────────────────────────────
  // 3. FECHA AUTOMÁTICA
  // ─────────────────────────────────────────
  const dateElement = document.querySelector(".topbar-date");
  if (dateElement) {
    const today = new Date().toLocaleDateString("es-MX", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    dateElement.textContent = `📅 ${today}`;
  }

  // ─────────────────────────────────────────
  // 4. SIDEBAR TOGGLE
  // ─────────────────────────────────────────
  const sidebar = document.getElementById("sidebar");
  const toggle  = document.getElementById("sidebarToggle");
  if (sidebar && toggle) {
    if (localStorage.getItem("sidebarCollapsed") === "true") {
      sidebar.classList.add("collapsed");
    }
    toggle.addEventListener("click", () => {
      sidebar.classList.toggle("collapsed");
      localStorage.setItem(
        "sidebarCollapsed",
        sidebar.classList.contains("collapsed")
      );
    });
  }

  // ─────────────────────────────────────────
  // 5. CARGAR DATOS DESDE JSON (FETCH)
  // ─────────────────────────────────────────
  if (!localStorage.getItem("camposData")) {
    try {
      const response = await fetch("../data/campos.json");
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("camposData", JSON.stringify(data));
      } else {
        throw new Error("No se pudo cargar campos.json");
      }
    } catch (error) {
      console.error("Error cargando la base de datos de cultivos:", error);
      localStorage.setItem("camposData", JSON.stringify([]));
    }
  }

  let camposData = JSON.parse(localStorage.getItem("camposData")) || [];
  let miCampo = camposData.find(c => c.id_usuario === currentUser.id);

  if (!miCampo) {
    miCampo = {
      id_campo: `campo-nuevo-${currentUser.id}`,
      id_usuario: currentUser.id,
      nombre_campo: "Mi Parcela",
      region: currentUser.region || "Sin región",
      hectareas_total: 0,
      cultivos: []
    };
    camposData.push(miCampo);
    localStorage.setItem("camposData", JSON.stringify(camposData));
  }

  const iconosCultivo = {
    maiz: "🌽", frijol: "🫘", chile: "🌶️", flores: "🌸", agave: "🌵",
    cafe: "☕", papa: "🥔", cana: "🎋", trigo: "🌾", sorgo: "🌾",
    nopal: "🪴", jitomate: "🍅", hortalizas: "🥬", fresa: "🍓", otro: "🌱"
  };

  // ─────────────────────────────────────────
  // 6. LÓGICA: PÁGINA "TUS CULTIVOS"
  // ─────────────────────────────────────────
  const gridCultivos = document.getElementById("cultivosGrid");
  if (gridCultivos) {
    document.getElementById("nombreCampo").textContent = miCampo.nombre_campo;
    document.getElementById("regionCampo").textContent = miCampo.region;

    const cultivos = miCampo.cultivos || [];
    const totalHa = cultivos.reduce((acc, curr) => acc + parseFloat(curr.hectareas), 0).toFixed(1);
    
    document.getElementById("statCultivos").textContent = cultivos.length;
    document.getElementById("statHectareas").textContent = totalHa + " ha";

    const hoy = new Date();
    let diasMinimos = Infinity;
    let proximaCosechaStr = "—";
    
    // Objeto para acumular datos de la gráfica
    const datosGrafica = {};

    if (cultivos.length === 0) {
      gridCultivos.innerHTML = `
        <div class="cultivos-empty">
          <div class="empty-icon">🌱</div>
          <p>Aún no tienes cultivos registrados en tu parcela.</p>
          <a href="agregar_cultivo.html" class="btn-agregar-main">Agregar mi primer cultivo</a>
        </div>
      `;
    } else {
      gridCultivos.innerHTML = "";

      cultivos.forEach(cultivo => {
        const fSiembra = new Date(cultivo.fecha_siembra + 'T12:00:00');
        const fCosecha = new Date(cultivo.fecha_estimada_cosecha + 'T12:00:00');
        const totalDias = (fCosecha - fSiembra) / (1000 * 60 * 60 * 24);
        const diasPasados = (hoy - fSiembra) / (1000 * 60 * 60 * 24);
        
        let porcentaje = Math.min(Math.max((diasPasados / totalDias) * 100, 0), 100);
        const diasRestantes = Math.ceil((fCosecha - hoy) / (1000 * 60 * 60 * 24));

        if (diasRestantes > 0 && diasRestantes < diasMinimos) {
          diasMinimos = diasRestantes;
          proximaCosechaStr = fCosecha.toLocaleDateString("es-MX", { month: "short", day: "numeric" });
        }

        // Acumular hectáreas para la gráfica por tipo
        datosGrafica[cultivo.tipo] = (datosGrafica[cultivo.tipo] || 0) + parseFloat(cultivo.hectareas);

        const icono = iconosCultivo[cultivo.tipo] || "🌱";

        const cardHTML = `
          <div class="cultivo-card">
            <div class="cultivo-card-top">
              <div class="cultivo-icon">${icono}</div>
              <div class="cultivo-info">
                <div class="cultivo-nombre">${cultivo.nombre}</div>
                <div class="cultivo-tipo">${cultivo.variedad || cultivo.tipo}</div>
              </div>
              <div class="cultivo-ha">${cultivo.hectareas} ha</div>
              <button class="btn-eliminar" data-id="${cultivo.id_cultivo}" title="Eliminar cultivo">✕</button>
            </div>

            <div class="cultivo-progreso-wrap">
              <div class="cultivo-progreso-labels">
                <span>Progreso</span>
                <span class="cultivo-dias-text">${diasRestantes > 0 ? diasRestantes + ' días restantes' : 'Cosecha lista'}</span>
              </div>
              <div class="cultivo-progreso-bar">
                <div class="cultivo-progreso-fill" style="width: ${porcentaje}%"></div>
              </div>
              <div class="cultivo-progreso-pct">${Math.round(porcentaje)}% completado</div>
            </div>

            <div class="cultivo-detalles">
              <div class="cultivo-detalle-item">
                <span class="detalle-label">Siembra</span>
                <span class="detalle-valor">${fSiembra.toLocaleDateString("es-MX", { month: "short", day: "numeric" })}</span>
              </div>
              <div class="cultivo-detalle-item">
                <span class="detalle-label">Cosecha</span>
                <span class="detalle-valor">${fCosecha.toLocaleDateString("es-MX", { month: "short", day: "numeric", year: "numeric" })}</span>
              </div>
              <div class="cultivo-detalle-item">
                <span class="detalle-label">Riego</span>
                <span class="detalle-valor" style="text-transform: capitalize;">${cultivo.riego}</span>
              </div>
            </div>
          </div>
        `;
        gridCultivos.insertAdjacentHTML('beforeend', cardHTML);
      });

      // Lógica eliminar
      document.querySelectorAll(".btn-eliminar").forEach(btn => {
        btn.addEventListener("click", (e) => {
          const idCultivo = e.target.getAttribute("data-id");
          if (confirm("¿Estás seguro de que deseas eliminar este cultivo?")) {
            miCampo.cultivos = miCampo.cultivos.filter(c => c.id_cultivo !== idCultivo);
            miCampo.hectareas_total = miCampo.cultivos.reduce((acc, curr) => acc + parseFloat(curr.hectareas), 0);
            localStorage.setItem("camposData", JSON.stringify(camposData));
            window.location.reload();
          }
        });
      });

      // INICIALIZAR GRÁFICA SI HAY DATOS
      if (Object.keys(datosGrafica).length > 0) {
        renderizarGrafica(datosGrafica);
      }
    }

    if (diasMinimos !== Infinity) {
      document.getElementById("statProxima").textContent = proximaCosechaStr;
      document.getElementById("statDias").textContent = diasMinimos;
    }
  }

  // ─────────────────────────────────────────
  // 7. LÓGICA: PÁGINA "AGREGAR CULTIVO"
  // ─────────────────────────────────────────
  const formAgregar = document.getElementById("formAgregarCultivo");
  if (formAgregar) {
    formAgregar.addEventListener("submit", (e) => {
      e.preventDefault();
      
      const tipo = document.getElementById("tipoCultivo").value;
      const nombre = document.getElementById("nombreCultivo").value;
      const hectareas = parseFloat(document.getElementById("hectareas").value);
      const variedad = document.getElementById("variedad").value;
      const fSiembra = document.getElementById("fechaSiembra").value;
      const fCosecha = document.getElementById("fechaCosecha").value;
      const riego = document.getElementById("tipoRiego").value;

      if (new Date(fCosecha) <= new Date(fSiembra)) {
        const msg = document.getElementById("cultivoMsg");
        msg.className = "cultivo-message error";
        msg.textContent = "La fecha de cosecha debe ser posterior a la fecha de siembra.";
        return;
      }

      const nuevoCultivo = {
        id_cultivo: "cult-" + Date.now(),
        tipo: tipo,
        nombre: nombre,
        hectareas: hectareas,
        fecha_siembra: fSiembra,
        fecha_estimada_cosecha: fCosecha,
        variedad: variedad,
        riego: riego,
        historial: []
      };

      miCampo.cultivos.push(nuevoCultivo);
      miCampo.hectareas_total = miCampo.cultivos.reduce((acc, curr) => acc + parseFloat(curr.hectareas), 0);
      localStorage.setItem("camposData", JSON.stringify(camposData));

      const msg = document.getElementById("cultivoMsg");
      msg.className = "cultivo-message success";
      msg.textContent = "¡Cultivo agregado con éxito! Redirigiendo...";

      setTimeout(() => {
        window.location.href = "tus_cultivos.html";
      }, 1200);
    });
  }
});

// Función auxiliar para Chart.js
function renderizarGrafica(datos) {
  const ctx = document.getElementById('chartHectareas');
  if (!ctx) return;

  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: Object.keys(datos).map(label => label.charAt(0).toUpperCase() + label.slice(1)),
      datasets: [{
        data: Object.values(datos),
        backgroundColor: ['#2ecc71', '#3498db', '#f1c40f', '#e67e22', '#9b59b6', '#e74c3c', '#1abc9c'],
        borderWidth: 2,
        hoverOffset: 10
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom' }
      }
    }
  });
}