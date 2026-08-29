import { NextRequest } from "next/server";
import { sseResponse } from "@/lib/sse";
import { runWorkday } from "@/lib/run";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const force = Boolean(body?.force);
  const date = typeof body?.date === "string" ? body.date : undefined;
  return sseResponse((emit) => runWorkday(date, force, emit));
}
