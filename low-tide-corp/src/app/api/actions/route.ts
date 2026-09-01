import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const actions = await prisma.actionItem.findMany({
    orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
    take: 12,
    include: { workday: { select: { date: true, slot: true } } },
  });
  return NextResponse.json({ actions });
}
