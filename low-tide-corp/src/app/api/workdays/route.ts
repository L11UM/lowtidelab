import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const workdays = await prisma.workday.findMany({
    orderBy: [{ date: "desc" }, { slot: "asc" }],
    select: { id: true, date: true, slot: true, status: true, summary: true, criticScore: true, createdAt: true },
  });
  return NextResponse.json({ workdays });
}
