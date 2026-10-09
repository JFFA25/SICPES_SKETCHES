# SICPES · Sketches de navegación

Prototipo interactivo de sketches en HTML, CSS y JavaScript puros para la Práctica 07. Presenta los recorridos principales de estudiantes y administración en un marco móvil, un panel de pantallas y destinos interactivo, datos de ejemplo en español y un diagrama SVG seleccionable que puede descargarse como PNG.

## Ver en línea

**[Sketches de SICPES](https://jffa25.github.io/SICPES_SKETCHES/index.html)**
 
[![Abrir prototipo](https://img.shields.io/badge/Abrir%20prototipo-GitHub%20Pages-16a34a?style=for-the-badge)](https://jffa25.github.io/SICPES_SKETCHES/)



## Vizualizacion

### Movil
![Sketches de SICPES](/sketches.png)

### PWA

![Sketches de SICPES](/pwa.png)

## Diagrama de Navegacion

![Sketches de SICPES](/DiagramadeNavegacion.png)


## Cómo abrirlo

- **En línea:** entra al enlace de GitHub Pages de arriba, sin instalar nada.
- **En local:** abre `index.html` en un navegador moderno. No requiere instalación ni compilación.

Google Fonts se usa como mejora tipográfica; sin conexión, la página conserva fuentes de respaldo.

## Pantallas

**Estudiante:** Landing, Iniciar sesión, Crear cuenta, Carga, Inicio, Reservar habitación, Gestión de Pagos y Cuenta / Perfil.

**Administrador:** Login admin, Carga, Reservaciones, Pagos pendientes, Pisos y Configuración global.

## Mapa de navegación

| Origen | Acción | Destino |
|---|---|---|
| Landing | Explorar habitaciones | Reservar habitación |
| Landing | Iniciar sesión | Login estudiante |
| Login estudiante | Entrar | Carga → Inicio |
| Login estudiante | Regístrate | Crear cuenta |
| Crear cuenta | Registrarse (aceptar términos) | Carga → Inicio |
| Inicio | Tarjeta Tu reservación | Reservar habitación |
| Inicio | Tarjeta Próximo pago / aviso | Gestión de Pagos |
| Reservar habitación | Reservar | Confirmación → Inicio |
| Gestión de Pagos | Solicitar pago / Cargar archivo | Confirmación / selector de archivo |
| Cuenta / Perfil |