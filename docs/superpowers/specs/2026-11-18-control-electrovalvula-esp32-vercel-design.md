# Control de electroválvula con ESP32 y Vercel

Fecha: 2026-11-18

## Objetivo

Controlar desde una página web el encendido y apagado de una electroválvula conectada a un relé, usando un ESP32 DevKit V1 con Wi-Fi. El navegador no se conecta directamente a la placa: ambos se comunican con un backend alojado en Vercel.

## Arquitectura

- La página web se despliega en Vercel.
- Una API serverless en Vercel expone acciones para leer y cambiar el estado deseado.
- Un almacén de estado compartido persistente, accesible por la API (por ejemplo, Redis gestionado), conserva el último comando. No se usa memoria local de la función serverless.
- El ESP32 se conecta a la red Wi-Fi y consulta la API periódicamente por HTTPS. Cuando recibe un estado válido, actualiza la salida del relé.
- La interfaz muestra el estado deseado y comunica errores de solicitud. No afirma que la válvula cambió físicamente sin confirmación de la placa.

## Flujo

1. El usuario pulsa Abrir o Cerrar en la web.
2. La web envía el nuevo estado a la API.
3. La API valida la solicitud y persiste el estado deseado.
4. En su siguiente consulta, el ESP32 lee el estado y conmuta el relé.
5. Si el ESP32 no logra consultar el backend, conserva localmente la salida que tenía, informa el error por Serial y reintenta. Al reiniciar, la salida inicia en estado cerrado/apagado hasta recibir un estado válido.

## API y configuración

- `GET /api/state`: devuelve el estado deseado.
- `POST /api/state`: guarda `open: true|false`.
- La API requiere un secreto compartido para las solicitudes de control y del dispositivo; el secreto se configura como variable de entorno y no se incluye en el repositorio ni en el código de la web.
- Variables de despliegue: credenciales del almacén persistente y token de dispositivo/control.
- El firmware recibe SSID, contraseña Wi-Fi, URL base y token mediante configuración local fuera del repositorio o placeholders claramente identificados.

## Hardware y seguridad eléctrica

- Placa: ESP32 DevKit V1.
- Salida de control: GPIO configurable, inicialmente GPIO 26.
- Relé: módulo compatible con la lógica de 3,3 V del GPIO. La polaridad (activo HIGH o activo LOW) será configurable; asumir activo HIGH hasta confirmar el módulo.
- El GPIO se configura en estado apagado/cerrado al inicio.
- La alimentación de la válvula pasa por los contactos adecuados del relé y una fuente dimensionada para la válvula. No se conecta la carga de la válvula al GPIO. La tensión/corriente de la válvula y del relé deben verificarse según sus placas antes de energizar.

## Límites y comportamiento

- El control es de estado deseado, no un temporizador ni una automatización.
- El retraso de respuesta depende del intervalo de consulta, configurable (valor inicial: 2 segundos).
- En pérdida de Wi-Fi o backend, la salida conserva su último estado hasta reinicio; al reiniciar queda apagada. Esto evita aperturas nuevas causadas por falta de conexión, pero no cierra automáticamente una válvula que ya estaba abierta.
- No se informa estado físico real sin una entrada de realimentación adicional.

## Validación

- Verificar compilación/configuración del firmware para ESP32 DevKit V1.
- Verificar API con estados válidos e inválidos y errores del almacén.
- Verificar interfaz en estados de carga, éxito y error.
- Probar relé y válvula primero con la carga desconectada y confirmar polaridad, tensión y corriente antes de la conexión final.
