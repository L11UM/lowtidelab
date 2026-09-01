import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const idea = await prisma.idea.findFirst({ where: { status: "active" }, orderBy: { updatedAt: "desc" } });
  if (!idea) return NextResponse.json({ recentWorkdays: [], totalTokens: 0, recentErrors: 0 });
  const [recentWorkdays, latestLogs] = await Promise.all([
    prisma.workday.findMany({
      where: { ideaId: idea.id },
      orderBy: [{ date: "desc" }, { slot: "desc" }],
      take: 4,
      select: { date: true, slot: true, status: true, criticScore: true, updatedAt: true },
    }),
    prisma.runLog.findMany({
      where: { workday: { ideaId: idea.id } },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: { level: true, tokensIn: true, tokensOut: true },
    }),
  ]);

  const totalTokens = latestLogs.reduce((sum, log) => sum + (log.tokensIn ?? 0) + (log.tokensOut ?? 0), 0);
  const recentErrors = latestLogs.filter((log) => log.level === "error").length;
  return NextResponse.json({ recentWorkdays, totalTokens, recentErrors });
}
