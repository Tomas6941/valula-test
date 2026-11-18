import { NextRequest, NextResponse } from "next/server";
import { hasBearerToken } from "@/lib/auth";
import { readState, writeState } from "@/lib/state-store";

export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "no-store, max-age=0" };

export async function GET(request: NextRequest) {
  if (!hasBearerToken(request, process.env.DEVICE_TOKEN)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401, headers });
  }
  try {
    return NextResponse.json(await readState(), { headers });
  } catch {
    return NextResponse.json({ error: "No se pudo leer el estado" }, { status: 503, headers });
  }
}

export async function POST(request: NextRequest) {
  if (!hasBearerToken(request, process.env.CONTROL_TOKEN)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401, headers });
  }
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400, headers });
  }
  if (!payload || typeof payload !== "object" || typeof (payload as { open?: unknown }).open !== "boolean") {
    return NextResponse.json({ error: "Se requiere open: true o false" }, { status: 400, headers });
  }
  try {
    return NextResponse.json(await writeState((payload as { open: boolean }).open), { headers });
  } catch {
    return NextResponse.json({ error: "No se pudo guardar el estado" }, { status: 503, headers });
  }
}
