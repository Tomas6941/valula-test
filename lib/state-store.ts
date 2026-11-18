import { Redis } from "@upstash/redis";

export type ValveState = { open: boolean; updatedAt: string };
const STATE_KEY = "valve:desired-state";

function redisClient(): Redis {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw new Error("Redis no está configurado");
  return new Redis({ url, token });
}

export async function readState(): Promise<ValveState> {
  const stored = await redisClient().get<ValveState>(STATE_KEY);
  return stored && typeof stored.open === "boolean" && typeof stored.updatedAt === "string"
    ? stored
    : { open: false, updatedAt: new Date(0).toISOString() };
}

export async function writeState(open: boolean): Promise<ValveState> {
  const state = { open, updatedAt: new Date().toISOString() };
  await redisClient().set(STATE_KEY, state);
  return state;
}
