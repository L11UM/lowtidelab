import { NextRequest, NextResponse } from "next/server";
import { runWorkday, type RunEvent } from "@/lib/run";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  const header = req.headers.get("authorization");
  return Boolean(secret && header === `Bearer ${secret}`);
}

/**
 * Invoked once per day by Vercel Cron. `runWorkday` is idempotent by date, so
 * duplicate delivery is harmless and the existing Neon brief/artifacts remain intact.
 */
export async function GET(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const events: RunEvent[] = [];
  await runWorkday(undefined, false, (event) => events.push(event));
  const finalEvent = events.at(-1);

  if (finalEvent?.type === "workday_error") {
    return NextResponse.json({ ok: false, events }, { status: 500 });
  }

  return NextResponse.json({ ok: true, events });
}
