#pragma once

// Copiá como config.h y reemplazá cada valor de ejemplo.
#define WIFI_SSID "TU_WIFI"
#define WIFI_PASSWORD "TU_CLAVE_WIFI"
#define API_BASE_URL "https://tu-proyecto.vercel.app"
#define DEVICE_TOKEN "TOKEN_LARGO_EXCLUSIVO_PARA_ESP32"

#define RELAY_PIN 26
// HIGH: módulo activo con nivel alto. Cambiar a LOW para módulos activos en bajo.
#define RELAY_ACTIVE_LEVEL HIGH
#define POLL_INTERVAL_MS 2000UL

// Pegar aquí el certificado raíz vigente de la CA de tu dominio HTTPS.
// Se deja vacío intencionalmente para evitar una cadena de confianza obsoleta.
static const char ROOT_CA_PEM[] PROGMEM = R"CERT(
)CERT";
