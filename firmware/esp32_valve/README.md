# Firmware ESP32

## Preparar configuración

1. Copiá `config.example.h` en esta carpeta con el nombre `config.h`.
2. Completá SSID, contraseña, URL pública de Vercel y `DEVICE_TOKEN` (el mismo valor que `DEVICE_TOKEN` en Vercel).
3. Confirmá la polaridad de entrada del módulo de relé. Usá `HIGH` si se activa aplicando nivel alto y `LOW` si el módulo es activo en bajo.
4. Obtené el certificado raíz CA que valida el certificado HTTPS de tu dominio y pegalo dentro de `ROOT_CA_PEM`. Para un dominio `*.vercel.app`, inspeccioná la cadena actual con el navegador o `openssl s_client -showcerts -connect tu-proyecto.vercel.app:443`; usá el certificado raíz de confianza de la cadena, no copies un certificado intermedio sin verificar. Renovalo si cambia la CA.

La validación TLS está habilitada y el firmware no usa `setInsecure()`. No publiques `config.h` ni compartas el token del dispositivo.

## Cargar

- En Arduino IDE, instala el core **esp32 by Espressif Systems** y la biblioteca **ArduinoJson**.
- Selecciona la placa **ESP32 Dev Module** y el puerto correspondiente.
- Abre `esp32_valve.ino`, compila y carga.
- Monitor serie a 115200 baudios. El ESP32 consulta el backend cada 2 segundos.

## Conexión del relé

- Conectá `RELAY_PIN` (GPIO 26 por defecto) a la entrada lógica del módulo de relé y uní GND del ESP32 con GND del módulo cuando el fabricante lo requiera.
- El módulo debe aceptar una señal lógica de 3,3 V del ESP32. Algunos relés no pueden manejarse directamente desde un GPIO.
- La fuente de la electroválvula pasa por los contactos COM/NO o COM/NC según el circuito requerido y la lógica de reposo. No alimentes la válvula desde el ESP32.
- Verificá tensión y corriente de la válvula, capacidad de contactos del relé, aislamiento y protección inductiva antes de energizar. Para cargas de continua, usá supresión adecuada (por ejemplo, diodo si corresponde al tipo de válvula).

Al arrancar, la salida se configura apagada. Si se pierde Wi-Fi/API durante el uso, conserva el último estado; al reiniciar queda apagada hasta recibir una lectura válida.
