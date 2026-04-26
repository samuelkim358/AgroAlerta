document.addEventListener("DOMContentLoaded", () => {

  const registerForm = document.getElementById("registerForm");
  const loginForm = document.getElementById("loginForm");
  const authMessage = document.getElementById("authMessage");

  // ============================================================
  // ⚙️ BOOTSTRAP: inicializar users desde users.json
  // ============================================================
  (function initUsers() {
    let users = JSON.parse(localStorage.getItem("users"));

    // Si ya existen usuarios en localStorage, no hacer nada
    if (users && users.length > 0) {
      return;
    }

    // Si no existen, cargar desde JSON
    fetch("../data/users.json")
      .then(response => response.json())
      .then(data => {
        localStorage.setItem("users", JSON.stringify(data));
        console.log("Usuarios iniciales cargados desde users.json");
      })
      .catch(error => {
        console.error("Error cargando users.json:", error);

        // Fallback por seguridad incluyendo los nuevos campos
        const defaultUser = [
          {
            id: 1,
            nombre: "Juan Pérez",
            usuario: "juan",
            password: "1234",
            email: "juan@agroalerta.com",
            telefono: "2441234567",
            region: "Atlixco",
            iniciales: "JP"
          }
        ];

        localStorage.setItem("users", JSON.stringify(defaultUser));
      });

  })();

  // =========================
  // REGISTRO DE USUARIO
  // =========================
  if (registerForm) {
    registerForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const nombre = document.getElementById("nombre").value.trim();
      const usuario = document.getElementById("usuario").value.trim();
      const password = document.getElementById("password").value.trim();
      const email = document.getElementById("email").value.trim(); // Nuevo campo
      const telefono = document.getElementById("telefono").value.trim(); // Nuevo campo
      const region = document.getElementById("region").value;

      let users = JSON.parse(localStorage.getItem("users")) || [];

      // Validar si el usuario ya existe
      const existeUsuario = users.find(user => user.usuario === usuario);
      if (existeUsuario) {
        showMessage("Ese nombre de usuario ya está registrado.", "error");
        return;
      }

      // Generar ID correlativo
      const newId = users.length > 0
        ? users[users.length - 1].id + 1
        : 1;

      // Generar Iniciales
      const partesNombre = nombre.split(" ");
      let iniciales = "";
      if (partesNombre.length >= 2) {
        iniciales = partesNombre[0][0] + partesNombre[1][0];
      } else {
        iniciales = partesNombre[0][0];
      }
      iniciales = iniciales.toUpperCase();

      // Objeto de nuevo usuario con campos de contacto
      const nuevoUsuario = {
        id: newId,
        nombre,
        usuario,
        password,
        email,
        telefono,
        region,
        iniciales
      };

      users.push(nuevoUsuario);
      localStorage.setItem("users", JSON.stringify(users));

      showMessage("Registro exitoso. Redirigiendo al inicio de sesión...", "success");

      setTimeout(() => {
        window.location.href = "login.html";
      }, 1500);
    });
  }

  // =========================
  // LOGIN DE USUARIO
  // =========================
  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const usuarioInput = document.getElementById("usuario");
      const passwordInput = document.getElementById("password");

      const usuario = usuarioInput.value.trim();
      const password = passwordInput.value.trim();

      const users = JSON.parse(localStorage.getItem("users")) || [];

      // Buscar usuario y validar credenciales
      const userFound = users.find(
        user => user.usuario === usuario && user.password === password
      );

      if (!userFound) {
        showMessage("Usuario o contraseña incorrectos.", "error");
        usuarioInput.value = "";
        passwordInput.value = "";
        return;
      }

      // Guardar sesión actual (incluye email y tel para las colaboraciones)
      localStorage.setItem("currentUser", JSON.stringify(userFound));

      showMessage("Inicio de sesión exitoso. Redirigiendo...", "success");

      // Limpiar inputs
      usuarioInput.value = "";
      passwordInput.value = "";

      setTimeout(() => {
        window.location.href = "panel_alerta.html";
      }, 1000);
    });
  }

  // =========================
  // MENSAJES EN PANTALLA
  // =========================
  function showMessage(message, type) {
    authMessage.innerHTML = `
      <div class="auth-message ${type}">
        ${message}
      </div>
    `;
  }

});