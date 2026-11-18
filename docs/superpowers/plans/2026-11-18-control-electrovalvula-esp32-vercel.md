# Control de electroválvula ESP32 y Vercel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Entregar una web desplegable en Vercel, una API segura con estado persistente y firmware para controlar una electroválvula con un ESP32 DevKit V1.

**Architecture:** La web llama una API serverless de Vercel que lee/escribe el estado deseado en Upstash Redis. El ESP32 usa Wi-Fi y HTTPS para consultar periódicamente la misma API y accionar un relé en GPIO configurable. Secretos, URL, Wi-Fi, polaridad y tiempos se configuran sin publicar credenciales.

**Tech Stack:** Next.js App Router, TypeScript, Vercel Functions, Upstash Redis REST, Arduino framework para ESP32, ArduinoJson.

**Spec:** `docs/superpowers/specs/2026-11-18-control-electrovalvula-esp32-vercel-design.md`

## Global Constraints

- El navegador no se conecta directamente al ESP32.
- El ESP32 consulta la API periódicamente por HTTPS.
- El estado almacenado es el estado deseado y no representa realimentación física.
- El ESP32 arranca con la salida apagada/cerrada.
- La salida del relé es GPIO 26 por defecto y la lógica activa HIGH es configurable.
- SSID, contraseña, URL y secretos no se guardan en el repositorio.
- Si falla una consulta, el ESP32 conserva el estado actual y reintenta.

---

### Task 1: Estructura Next.js y endpoint de estado

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `app/layout.tsx`, `app/page.tsx`, `app/globals.css`
- Create: `app/api/state/route.ts`, `lib/state-store.ts`, `lib/auth.ts`
- Create: `.env.example`, `.gitignore`
- Test: `tests/state-api.test.ts`

**Interfaces:**
- `GET /api/state` recibe `Authorization: Bearer <DEVICE_TOKEN>` y devuelve `{ "open": boolean, "updatedAt": string }`.
- `POST /api/state` recibe `Authorization: Bearer <CONTROL_TOKEN>` y JSON `{ "open": boolean }`; responde el nuevo estado.
- Upstash env: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`; auth env: `DEVICE_TOKEN`, `CONTROL_TOKEN`.

- [ ] Crear pruebas para rechazar credenciales faltantes/incorrectas, JSON inválido y estado válido.
- [ ] Ejecutar `npm test` y confirmar falla por módulos aún ausentes.
- [ ] Implementar auth, almacenamiento Redis con clave `valve:desired-state` y rutas GET/POST.
- [ ] Ejecutar pruebas del endpoint.

### Task 2: Página de control

**Files:**
- Modify: `app/page.tsx`, `app/globals.css`, `app/api/state/route.ts`
- Test: `tests/control-page.test.tsx`

**Interfaces:**
- La página llama POST `/api/state` con `CONTROL_TOKEN` entregado al cliente como variable `NEXT_PUBLIC_CONTROL_TOKEN`.
- Variables cliente: `NEXT_PUBLIC_CONTROL_TOKEN`.

- [ ] Definir pruebas para mostrar estado, bloquear botones durante solicitud y mostrar errores de red.
- [ ] Ejecutar las pruebas para confirmar falla.
- [ ] Implementar una interfaz responsive en español con botones Abrir/Cerrar, estado deseado, estado de solicitud y errores.
- [ ] Aplicar límites anti-cache al endpoint y respuesta accesible en la página.
- [ ] Ejecutar pruebas de interfaz.

### Task 3: Firmware ESP32

**Files:**
- Create: `firmware/esp32_valve/esp32_valve.ino`
- Create: `firmware/esp32_valve/config.example.h`, `firmware/esp32_valve/README.md`

**Interfaces:**
- Config local excluida de Git: `WIFI_SSID`, `WIFI_PASSWORD`, `API_BASE_URL`, `DEVICE_TOKEN`, `RELAY_PIN`, `RELAY_ACTIVE_LEVEL`, `POLL_INTERVAL_MS`.
- El firmware consulta `GET /api/state` con Bearer token y JSON `{ "open": boolean }`.

- [ ] Implementar y revisar las funciones de conversión estado lógico → nivel físico, incluyendo polaridad activa HIGH/LOW.
- [ ] Configurar GPIO en nivel inactivo antes de conectar Wi-Fi; mantener nivel actual ante error de red/API y reintentar.
- [ ] Verificar TLS usando certificado raíz configurable y explicar cómo instalarlo/actualizarlo en el README; no usar `setInsecure()` como valor de producción.
- [ ] Documentar instalación de dependencias, carga de configuración, cableado GPIO/relé y precaución de alimentación de la válvula.
- [ ] Compilar cuando esté disponible Arduino CLI/core ESP32.

### Task 4: Despliegue y documentación

**Files:**
- Create: `README.md`, `vercel.json`
- Modify: `.env.example`, `.gitignore`

- [ ] Documentar creación de proyecto Vercel, instancia Upstash y variables de entorno requeridas.
- [ ] Documentar que `NEXT_PUBLIC_CONTROL_TOKEN` se entrega al navegador: usar un token largo y exclusivo para control web; el token del ESP32 permanece server-side.
- [ ] Incluir pasos locales de desarrollo, despliegue y solución de errores comunes.
- [ ] Revisar que no haya secretos reales y que los pasos coincidan con las rutas y variables.
- [ ] Ejecutar `npm run lint`, `npm test` y `npm run build`; compilar firmware si las herramientas están disponibles.
