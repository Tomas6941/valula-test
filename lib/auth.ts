import { timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";

export function hasBearerToken(request: NextRequest, expected: string | undefined): boolean {
  if (!expected) return false;
  const header = request.headers.get("authorization") ?? "";
  const match = /^Bearer (.+)$/i.exec(header);
  if (!match) return false;
  const actualBytes = Buffer.from(match[1]);
  const expectedBytes = Buffer.from(expected);
  return actualBytes.length === expectedBytes.length && timingSafeEqual(actualBytes, expectedBytes);
}
