# AgroAlerta
Tenología y resiliencia para el campo

AgroAlerta es una plataforma tecnológica diseñada para cerrar la brecha de información climática en el sector agrícola, específicamente en el estado de Puebla. Nuestra misión es empoderar a los pequeños y medianos productores mediante alertas personalizadas y recomendaciones prácticas ante eventos climáticos extremos.

---

⚠️ Nota sobre el Prototipo (Proof of Concept)

Este repositorio contiene un **prototipo funcional** desarrollado para fines de demostración en el marco del Hackathon 2026. Es importante tener en cuenta las siguientes consideraciones:

**Base de Datos Mock (JSON):** Actualmente no se utiliza un servidor de base de datos relacional. El sistema utiliza archivos **JSON** locales (ubicados en `/data`) que actúan como persistencia de datos inicial para simular usuarios, cultivos y alertas.
**Simulación en Tiempo Real:** Las alertas y datos climáticos son estáticos. En producción real, el sistema se conectaría vía API con estaciones meteorológicas para emitir notificaciones en tiempo real.
**Enfoque:** La prioridad es validar la arquitectura del frontend, la experiencia de usuario (UX) y la viabilidad del flujo de trabajo agrícola.

---

💾 Gestión de Datos: LocalStorage y JSON

Al ser un prototipo sin backend activo, hemos implementado una estrategia de persistencia híbrida:

1.  **Datos Iniciales (JSON):** Los perfiles de usuario, alertas base y catálogos de cultivos se cargan desde archivos JSON estáticos.
2.  **Persistencia Dinámica (LocalStorage):** Utilizamos la API de **LocalStorage** del navegador para:
    * **Gestión de Sesión:** Mantener al usuario conectado mientras navega entre las diferentes páginas del panel sin necesidad de un token de servidor.
    * **Simulación de Escritura:** Cuando un usuario "agrega un cultivo" o "envía un ticket", los datos se guardan temporalmente en la memoria del navegador. Esto permite que la información persista incluso si el usuario refresca la página.
    * **Experiencia de Usuario:** Permite que las configuraciones personalizadas y el estado de las alertas leídas se mantengan durante toda la sesión de demostración.

---

🛠️ Stack Tecnológico y Lenguajes

**HTML5:** Estructura semántica para múltiples vistas (Panel, Foro, Cultivos).
**CSS3:** Diseño responsivo y modular con archivos específicos para cada módulo.
**JavaScript (Vanilla JS):** Lógica para el consumo de JSON, manipulación de LocalStorage y animaciones.
**JSON:** Estructura de objetos para simular la base de datos.

---

📂 Estructura Completa del Proyecto

```text
AGROALERTA
├── assets/images/          # Recursos visuales (index1-5, logo.png)
├── css/                    # Estilos modulares (auth, cultivos, foro, etc.)
├── data/                   # "Base de datos" en formato JSON (users, alerts, etc.)
├── js/                     # Lógica de comportamiento y persistencia LocalStorage
├── pages/                  # Vistas del ecosistema (login, panel, foro, etc.)
├── index.html              # Landing page principal
└── README.MD               # Documentación del proyecto
```

---

🚀 Hoja de Ruta para Producción

Para escalar este prototipo a una solución real, se planean las siguientes mejoras:

    Backend: Migración de LocalStorage a un servidor robusto (Node.js/PostgreSQL).

    API Climática: Integración con servicios oficiales (CONAGUA / OpenWeather).

    Seguridad: Implementación de autenticación real mediante JWT.

    Notificaciones: Sistema de alertas críticas vía SMS/WhatsApp para zonas rurales.

---

👥 Equipo BIT & MOL

Proyecto desarrollado para el Hackathon 2026 — Por Amor a Puebla.

---

⚖️ Licencia

Este proyecto está bajo la Licencia MIT.
