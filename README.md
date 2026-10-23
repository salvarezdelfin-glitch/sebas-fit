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

## Finanzas: motor de cálculo (`CAP` en `js/finanzas.js`)
Entre `/*CAPITAL-START*/` y `/*CAPITAL-END*/` hay un motor sin pantalla que trabaja en **centavos enteros** (sin errores de coma flotante):
- `disponible` y `compra` — «¿Me lo puedo comprar?»: saldo proyectado − reservas − pagos hasta el siguiente ingreso confirmado − gasto esencial − reserva de seguridad. Veredictos: viable, viable con condiciones, mejor esperar, no recomendable; fecha en que sí cabría; crédito con cuota, intereses y carga mensual.
- `estrategiaDeudas` — avalancha vs bola de nieve con meses, intereses y orden de pago.
- `proyeccion` — saldo a N días en escenario conservador, base y optimista.
- `patrimonio` — activos − pasivos (solo lo que tiene valor conocido).
Los ingresos solo esperados nunca se cuentan como dinero seguro; sin ingreso confirmado la respuesta sale «provisional». `node tests/capital.test.js` ejecuta 50 pruebas con datos ficticios y cuentas hechas a mano.
No son asesoría financiera profesional: es aritmética con tus datos registrados.
