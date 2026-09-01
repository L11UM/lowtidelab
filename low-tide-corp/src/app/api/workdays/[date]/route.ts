import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { date: string } }) {
  const workday = await prisma.workday.findFirst({
    where: { date: params.date, slot: "morning" },
    orderBy: { updatedAt: "desc" },
    include: { artifacts: { orderBy: { createdAt: "asc" } } },
  });
  if (!workday) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const latestArtifacts = new Map<string, (typeof workday.artifacts)[number]>();
  for (const artifact of workday.artifacts) latestArtifacts.set(artifact.agent, artifact);
  return NextResponse.json({ workday: { ...workday, artifacts: [...latestArtifacts.values()] } });
}
