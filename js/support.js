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
    const options = {
      day: "numeric",
      month: "long",
      year: "numeric"
    };

    const today = new Date().toLocaleDateString("es-MX", options);
    dateElement.textContent = `📅 ${today}`;
  }

  // =========================
  // SIDEBAR TOGGLE
  // =========================
  initSidebarToggle();

  function initSidebarToggle() {
    const sidebar = document.getElementById("sidebar");
    const toggle  = document.getElementById("sidebarToggle");

    if (!sidebar || !toggle) return;

    const saved = localStorage.getItem("sidebarCollapsed");
    if (saved === "true") {
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

  // =========================
  // TICKETS (LOCAL + JSON)
  // =========================
  let tickets = JSON.parse(localStorage.getItem("tickets"));

  if (!tickets || tickets.length === 0) {
    fetch("../data/tickets.json")
      .then(res => res.json())
      .then(data => {
        localStorage.setItem("tickets", JSON.stringify(data));
        tickets = data;
      })
      .catch(err => console.error("Error cargando tickets.json", err));
  }

  // =========================
  // GUARDAR NUEVO MENSAJE
  // =========================
  const form = document.getElementById("supportForm");

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const subject = document.getElementById("asunto").value.trim();
      const message = document.getElementById("mensaje").value.trim();

      if (!subject || !message) return;

      const newTicket = {
        id: "tck-" + Date.now(),
        user: currentUser.nombre || "Usuario",
        initials: currentUser.iniciales || "AA",
        subject: subject,
        message: message,
        date: new Date().toISOString().split("T")[0],
        status: "no_resuelto",
        response: ""
      };

      let storedTickets = JSON.parse(localStorage.getItem("tickets")) || [];

      storedTickets.push(newTicket);

      localStorage.setItem("tickets", JSON.stringify(storedTickets));

      form.reset();

      alert("Mensaje enviado correctamente");
    });
  }

});