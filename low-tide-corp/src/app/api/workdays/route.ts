import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const idea = await prisma.idea.findFirst({ where: { status: "active" }, orderBy: { updatedAt: "desc" } });
  if (!idea) return NextResponse.json({ workdays: [] });
  const workdays = await prisma.workday.findMany({
    where: { ideaId: idea.id },
    orderBy: [{ date: "desc" }, { slot: "asc" }],
    select: { id: true, date: true, slot: true, status: true, summary: true, criticScore: true, createdAt: true },
  });
  return NextResponse.json({ workdays });
}
