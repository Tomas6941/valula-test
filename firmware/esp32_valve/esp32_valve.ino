#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include "config.h"

static bool valveOpen = false;
static unsigned long lastPoll = 0;

void applyValve(bool open) {
  valveOpen = open;
  const uint8_t activeLevel = RELAY_ACTIVE_LEVEL;
  digitalWrite(RELAY_PIN, open ? activeLevel : (activeLevel == HIGH ? LOW : HIGH));
  Serial.printf("Estado deseado aplicado: %s\n", open ? "ABIERTA" : "CERRADA");
}

bool pollDesiredState() {
  WiFiClientSecure tls;
  tls.setCACert(ROOT_CA_PEM);
  HTTPClient http;
  const String url = String(API_BASE_URL) + "/api/state";
  if (!http.begin(tls, url)) { Serial.println("No se pudo iniciar HTTPS"); return false; }
  http.setTimeout(8000);
  http.addHeader("Authorization", String("Bearer ") + DEVICE_TOKEN);
  const int status = http.GET();
  if (status != HTTP_CODE_OK) {
    Serial.printf("Consulta fallida, HTTP %d\n", status);
    http.end();
    return false;
  }
  JsonDocument doc;
  const DeserializationError error = deserializeJson(doc, http.getString());
  http.end();
  if (error || !doc["open"].is<bool>()) { Serial.println("Respuesta JSON inválida"); return false; }
  const bool requestedOpen = doc["open"].as<bool>();
  if (requestedOpen != valveOpen) applyValve(requestedOpen);
  Serial.printf("Estado consultado correctamente: %s\n", valveOpen ? "ABIERTA" : "CERRADA");
  return true;
}

void connectWiFi() {
  if (WiFi.status() == WL_CONNECTED) return;
  Serial.printf("Conectando a Wi-Fi %s", WIFI_SSID);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  const unsigned long start = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - start < 20000) { delay(300); Serial.print("."); }
  Serial.println();
  if (WiFi.status() == WL_CONNECTED) Serial.printf("Wi-Fi conectado. IP: %s\n", WiFi.localIP().toString().c_str());
  else Serial.println("Wi-Fi no disponible; se reintentará.");
}

void setup() {
  Serial.begin(115200);
  // Pre-cargar el nivel inactivo antes de habilitar la salida reduce pulsos al arrancar.
  digitalWrite(RELAY_PIN, RELAY_ACTIVE_LEVEL == HIGH ? LOW : HIGH);
  pinMode(RELAY_PIN, OUTPUT);
  valveOpen = false;
  connectWiFi();
  if (WiFi.status() == WL_CONNECTED) pollDesiredState();
  lastPoll = millis();
}

void loop() {
  connectWiFi();
  if (millis() - lastPoll >= POLL_INTERVAL_MS) {
    lastPoll = millis();
    if (WiFi.status() == WL_CONNECTED) pollDesiredState();
  }
  delay(20);
}
