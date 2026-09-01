import { NextRequest, NextResponse } from "next/server";
import { runWorkday, type RunEvent } from "@/lib/run";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const events: RunEvent[] = [];
  await runWorkday(undefined, false, (event) => events.push(event), "night");
  const finalEvent = events.at(-1);
  if (finalEvent?.type === "workday_error") return NextResponse.json({ ok: false, events }, { status: 500 });
  return NextResponse.json({ ok: true, events });
}