# 🌾 AgroAlerta 
Resiliencia para el campo mexicano

AgroAlerta es una plataforma tecnológica diseñada para cerrar la brecha de información climática en el sector agrícola, específicamente en el estado de Puebla. Nuestra misión es empoderar a los pequeños y medianos productores mediante alertas personalizadas y recomendaciones prácticas ante eventos climáticos extremos.

---

## ⚠️ Nota sobre el Prototipo (Proof of Concept)

Este repositorio contiene un **prototipo funcional** desarrollado para fines de demostración en el marco del Hackathon 2026. Es importante tener en cuenta las siguientes consideraciones:

* **Base de Datos Mock (JSON):** Actualmente no se utiliza un servidor de base de datos relacional. El sistema utiliza archivos **JSON** locales (ubicados en `/data`) que actúan como persistencia de datos inicial.
* **Simulación en Tiempo Real:** Las alertas y datos climáticos son estáticos. En producción real, el sistema se conectaría vía API con estaciones meteorológicas.
* **Enfoque:** La prioridad es validar la arquitectura del frontend, la experiencia de usuario (UX) y la viabilidad del flujo de trabajo agrícola.

---

## 💾 Gestión de Datos: LocalStorage y JSON

Al ser un prototipo sin backend activo, hemos implementado una estrategia de persistencia híbrida:

1.  **Datos Iniciales (JSON):** Los perfiles de usuario y alertas base se cargan desde archivos JSON estáticos.
2.  **Persistencia Dinámica (LocalStorage):** Utilizamos la API de **LocalStorage** del navegador para gestionar sesiones y simular la escritura de nuevos cultivos o tickets de soporte.

---

## 🛠️ Stack Tecnológico y Lenguajes

* **HTML5:** Estructura semántica para múltiples vistas.
* **CSS3:** Diseño responsivo y modular.
* **JavaScript (Vanilla JS):** Lógica de comportamiento y persistencia en el navegador.
* **JSON:** Estructura de objetos para simular la base de datos.

---

## 📂 Estructura Completa del Proyecto

```text
AGROALERTA
├── assets/images/          # Recursos visuales (index1-5, logo.png)
├── css/                    # Estilos modulares
├── data/                   # "Base de datos" en formato JSON
├── js/                     # Lógica y persistencia LocalStorage
├── pages/                  # Vistas del ecosistema
├── index.html              # Landing page principal
└── README.MD               # Documentación del proyecto
```

---

## 🧪 Guía de Pruebas y Reseteo (LocalStorage)

Para probar el flujo de usuario múltiples veces (como el registro inicial o el inicio de sesión), es posible que necesites limpiar los datos guardados en tu navegador.
¿Cómo reiniciar el prototipo?

Si deseas borrar los datos guardados (sesiones iniciadas o cultivos agregados durante la prueba), sigue estos pasos:

    En tu navegador (Chrome, Edge o Firefox), presiona F12 o clic derecho -> Inspeccionar.

    Ve a la pestaña Application (Aplicación) en la parte superior.

    En el menú lateral izquierdo, despliega la sección Local Storage.

    Haz clic derecho sobre la URL de la página (ej. http://127.0.0.1 o github.io) y selecciona Clear (Limpiar).

    Refresca la página (F5). El prototipo volverá a su estado inicial.


---

## 🚀 Hoja de Ruta para Producción

    Backend: Migración de LocalStorage a un servidor robusto (Node.js/PostgreSQL).

    API Climática: Integración con servicios oficiales (CONAGUA / OpenWeather).

    Notificaciones: Sistema de alertas críticas vía SMS/WhatsApp para zonas rurales.


---

## 👥 Equipo BIT & MOL

Proyecto desarrollado para el Hackathon 2026 — Por Amor a Puebla.

Tecnología con raíces en la tierra.

---

## ⚖️ Licencia

Este proyecto está bajo la Licencia MIT.
