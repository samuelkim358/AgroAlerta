/* ============================================================
   foro_support.js — AgroAlerta
   Lógica compartida: Apoyo Técnico + Foro
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
  // 5. CARGA DE TICKETS (una sola fuente de verdad)
  //    Lee localStorage; si está vacío, carga tickets.json
  //    y lo persiste. Nunca sobreescribe lo que ya hay.
  // ─────────────────────────────────────────
  async function cargarTickets() {
    const stored = localStorage.getItem("tickets");
    if (stored) {
      return JSON.parse(stored);
    }
    try {
      const res  = await fetch("../data/tickets.json");
      const data = await res.json();
      localStorage.setItem("tickets", JSON.stringify(data));
      return data;
    } catch (err) {
      console.error("Error cargando tickets.json:", err);
      return [];
    }
  }

  function guardarTickets(tickets) {
    localStorage.setItem("tickets", JSON.stringify(tickets));
  }

  // ─────────────────────────────────────────
  // 6. DETECTAR PÁGINA ACTIVA
  // ─────────────────────────────────────────
  const enSoporte = !!document.getElementById("supportForm");
  const enForo    = !!document.getElementById("foroLista");

  // ═══════════════════════════════════════════
  //   PÁGINA: APOYO TÉCNICO
  // ═══════════════════════════════════════════
  if (enSoporte) {
    const form    = document.getElementById("supportForm");
    const msgDiv  = document.getElementById("supportMessage");

    function mostrarMensaje(texto, tipo) {
      msgDiv.innerHTML = `<div class="support-message ${tipo}">${texto}</div>`;
      setTimeout(() => { msgDiv.innerHTML = ""; }, 4000);
    }

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const subject = document.getElementById("asunto").value.trim();
      const message = document.getElementById("mensaje").value.trim();
      if (!subject || !message) return;

      const tickets = await cargarTickets();

      const newTicket = {
        id:       "tck-" + Date.now(),           // ← bug corregido
        user:     currentUser.nombre   || "Usuario",
        initials: currentUser.iniciales || "AA",
        subject,
        message,
        date:     new Date().toISOString().split("T")[0],
        status:   "no_resuelto",
        response: "",
      };

      tickets.push(newTicket);
      guardarTickets(tickets);
      form.reset();
      mostrarMensaje("✅ Mensaje enviado correctamente.", "success"); // ← sin alert()
    });
  }

  // ═══════════════════════════════════════════
  //   PÁGINA: FORO
  // ═══════════════════════════════════════════
  if (enForo) {
    const lista       = document.getElementById("foroLista");
    const filtrosBtns = document.querySelectorAll("[data-filtro]");
    const buscador    = document.getElementById("foroBuscar");

    let tickets       = await cargarTickets();
    let filtroActivo  = "todos";

    // ── Renderizar lista de tickets ──
    function renderizar() {
      const query = buscador ? buscador.value.toLowerCase() : "";

      const filtrados = tickets.filter((t) => {
        const coincideFiltro =
          filtroActivo === "todos"       ||
          (filtroActivo === "resuelto"    && t.status === "resuelto")    ||
          (filtroActivo === "no_resuelto" && t.status === "no_resuelto");

        const coincideBusqueda =
          !query ||
          t.subject.toLowerCase().includes(query) ||
          t.user.toLowerCase().includes(query)    ||
          t.message.toLowerCase().includes(query);

        return coincideFiltro && coincideBusqueda;
      });

      lista.innerHTML = "";

      if (filtrados.length === 0) {
        lista.innerHTML = `<p class="foro-empty">No hay tickets para mostrar.</p>`;
        return;
      }

      filtrados.forEach((t) => {
        const card = document.createElement("article");
        card.className = "foro-card";
        card.dataset.status = t.status;

        const resuelto = t.status === "resuelto";

        card.innerHTML = `
          <div class="foro-card-header">
            <div class="foro-avatar">${t.initials}</div>
            <div class="foro-meta">
              <span class="foro-user">${t.user}</span>
              <span class="foro-date">${formatDate(t.date)}</span>
            </div>
            <span class="foro-badge ${resuelto ? "badge-resuelto" : "badge-pendiente"}">
              ${resuelto ? "✓ Resuelto" : "⏳ Pendiente"}
            </span>
          </div>

          <h3 class="foro-subject">${t.subject}</h3>
          <p class="foro-message">${t.message}</p>

          ${resuelto && t.response ? `
            <div class="foro-response">
              <span class="foro-response-label">💬 Respuesta del equipo</span>
              <p>${t.response}</p>
            </div>` : ""}
        `;

        lista.appendChild(card);
      });
    }

    // ── Formato de fecha legible ──
    function formatDate(isoDate) {
      if (!isoDate) return "";
      const [y, m, d] = isoDate.split("-");
      return new Date(y, m - 1, d).toLocaleDateString("es-MX", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    }

    // ── Filtros ──
    filtrosBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        filtrosBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        filtroActivo = btn.dataset.filtro;
        renderizar();
      });
    });

    // ── Buscador ──
    if (buscador) {
      buscador.addEventListener("input", renderizar);
    }

    // ── Render inicial ──
    renderizar();
  }

});