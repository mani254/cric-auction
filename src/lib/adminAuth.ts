import { NextRequest, NextResponse } from "next/server";

export function verifyAdminToken(req: NextRequest): boolean {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return false;
  const token = authHeader.replace("Bearer ", "");
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) return false;
  const expected = Buffer.from(`admin:${adminPassword}`).toString("base64");
  return token === expected;
}
