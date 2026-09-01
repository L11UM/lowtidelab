import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const AGENT_ORDER = ["product", "builder", "growth", "researcher", "operator", "critic"];

export async function GET() {
  const idea = await prisma.idea.findFirst({ where: { status: "active" }, orderBy: { updatedAt: "desc" } });
  if (!idea) return NextResponse.json({ idea: null, artifacts: [], actions: [] });

  const artifacts = await prisma.artifact.findMany({
    where: { workday: { ideaId: idea.id }, error: null },
    orderBy: { createdAt: "desc" },
    include: { workday: { select: { date: true, slot: true } } },
  });
  const latestByAgent = new Map<string, (typeof artifacts)[number]>();
  for (const artifact of artifacts) {
    if (!latestByAgent.has(artifact.agent)) latestByAgent.set(artifact.agent, artifact);
  }

  const actions = await prisma.actionItem.findMany({
    where: { workday: { ideaId: idea.id }, status: "open" },
    orderBy: { updatedAt: "desc" },
    take: 3,
    include: { workday: { select: { date: true, slot: true } } },
  });

  return NextResponse.json({
    idea,
    artifacts: AGENT_ORDER.map((agent) => latestByAgent.get(agent)).filter(Boolean),
    actions,
  });
}
