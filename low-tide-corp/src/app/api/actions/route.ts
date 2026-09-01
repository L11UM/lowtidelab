import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const idea = await prisma.idea.findFirst({ where: { status: "active" }, orderBy: { updatedAt: "desc" } });
  if (!idea) return NextResponse.json({ actions: [] });
  const actions = await prisma.actionItem.findMany({
    where: { workday: { ideaId: idea.id } },
    orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
    take: 12,
    include: { workday: { select: { date: true, slot: true } } },
  });
  return NextResponse.json({ actions });
}
