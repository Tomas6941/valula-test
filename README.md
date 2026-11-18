# Control remoto de electroválvula

Web en Vercel y ESP32 DevKit V1 que consulta el backend por Wi-Fi/HTTPS. El navegador nunca se conecta directamente a la placa. La interfaz guarda un estado deseado; no mide la posición física de la válvula.

## Servicios necesarios

1. Crea un proyecto en Vercel desde este repositorio.
2. Crea una base Redis compatible con Upstash y vincúlala o copia las variables REST de Upstash.
3. Genera dos secretos aleatorios largos e independientes: `DEVICE_TOKEN` y `CONTROL_TOKEN`.
4. En Vercel → Settings → Environment Variables configura:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
   - `DEVICE_TOKEN`
   - `CONTROL_TOKEN`
5. Desplegá/redeployá después de guardar variables.
6. Abre la web y pega el valor de `CONTROL_TOKEN` en el campo Clave de control. Se guarda en `sessionStorage` de esa pestaña y se elimina al cerrar la sesión del navegador o al desconectar.
7. En `firmware/esp32_valve`, copia `config.example.h` a `config.h`, configura Wi-Fi, URL Vercel y `DEVICE_TOKEN`, y sigue su README.

El token de control viaja al navegador al utilizar el panel; cualquiera que tenga acceso a ese valor puede operar la válvula. Compartilo solo con usuarios autorizados. El token de dispositivo solo se configura en Vercel y en el ESP32.

## Desarrollo local

Requiere Node.js 20 o posterior. Copia `.env.example` a `.env.local` y completa los valores de Upstash y tokens. Luego:

```sh
npm install
npm run dev
```

Abre `http://localhost:3000` e ingresa el `CONTROL_TOKEN`.

## API

- `GET /api/state`: requiere `Authorization: Bearer DEVICE_TOKEN`; devuelve `{ "open": boolean, "updatedAt": string }`.
- `POST /api/state`: requiere `Authorization: Bearer CONTROL_TOKEN`; recibe `{ "open": boolean }`.

Las respuestas no se cachean. Si Redis no está configurado o no responde, la API responde 503. El dispositivo consulta cada 2 segundos por defecto.

## Pruebas y compilación

```sh
npm test
npm run lint
npm run build
```

Para el firmware y las precauciones eléctricas, consulta [firmware/esp32_valve/README.md](firmware/esp32_valve/README.md).
