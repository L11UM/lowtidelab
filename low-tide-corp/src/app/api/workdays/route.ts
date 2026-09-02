import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const workdays = await prisma.workday.findMany({
    orderBy: [{ date: "desc" }, { slot: "asc" }],
    select: { id: true, date: true, slot: true, status: true, summary: true, criticScore: true, createdAt: true, updatedAt: true },
  });
  const latestBySession = new Map<string, (typeof workdays)[number]>();
  for (const workday of workdays) {
    const key = `${workday.date}:${workday.slot}`;
    const current = latestBySession.get(key);
    if (!current || workday.updatedAt > current.updatedAt) latestBySession.set(key, workday);
  }
  return NextResponse.json({
    workdays: [...latestBySession.values()].map(({ updatedAt: _updatedAt, ...workday }) => workday),
  });
}
