"use server"
// app/api/session/route.js
import { cookies } from "next/headers";

export async function GET() {
  const sessionId = cookies().get("session_id")?.value || null;
  return Response.json({ sessionId });
}
