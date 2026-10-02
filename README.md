# Sebas Fit

Una sola app para dar clases y entrenar clientes: bitácora de clases en estudios (Sculpt, Fuerza, Barre),
generador de rutinas por estaciones, música por bloque, clientes de personal trainer con programas por nivel
y seguimiento, y cotizador (presencial y rutina mandada). Instalable en compu, iPad y iPhone.

- **Datos:** viven cifrados (AES-GCM + gzip, llave derivada de tu contraseña con PBKDF2) en un solo paquete.
  Se guardan en el dispositivo y en la nube (Supabase, con historial de versiones). El repo solo tiene código.
- **Bóveda:** reutiliza la de Clases Semanales (`clases-semanales`) — misma contraseña, tus clases llegan intactas.
- **Spotify (opcional):** en Ajustes se conecta una vez con tu Client ID para crear la playlist de cada clase.

## Archivos
| Archivo | Qué hace |
|---|---|
| `js/core.js` | Bóveda cifrada, nube, fusión entre dispositivos, bloqueo |
| `js/sculpt.js` | Generador y vista de clases (Sculpt/Fuerza/Barre), vista Instructor |
| `js/estacion.js` | Estaciones en capas (tu forma de dar Sculpt) |
| `js/armar.js` | Armar clase: escribes ejercicios y la app sugiere cuáles siguen |
| `js/musica.js` | Música por bloque, catálogo, Spotify |
| `js/clases.js` | Bitácora, horario, tarifas, depósitos y cobros |
| `js/ptlib.js`, `js/pt.js` | Biblioteca de ejercicios PT, programas por nivel, sesiones, progreso |
| `js/cot.js` | Cotizador con precios de mercado |
| `js/main.js` | Navegación, ajustes, arranque |

## Pruebas
`node tests/core.test.js` prueba la bóveda (cifrado, migración, fusión, respaldo). Las pruebas de navegador
están en `tests/*.browser.js` y usan una nube simulada (`tests/boot.js`).
