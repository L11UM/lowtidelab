import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function GET() {
  const idea = await prisma.idea.findFirst({ where: { status: "active" }, orderBy: { updatedAt: "desc" } });
  return NextResponse.json({ idea });
}

const IdeaInput = z.object({
  title: z.string().min(1),
  oneLiner: z.string().min(1),
  audience: z.string().optional(),
  budget: z.string().optional(),
  dontDo: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = IdeaInput.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }
  // Single active idea at a time — archive any currently active idea first.
  await prisma.idea.updateMany({ where: { status: "active" }, data: { status: "archived" } });
  const idea = await prisma.idea.create({ data: { ...parsed.data, status: "active" } });
  await prisma.companyBrief.create({
    data: {
      ideaId: idea.id,
      problem: idea.oneLiner,
      icp: idea.audience || "UNKNOWN — validate the first reachable customer segment.",
      offer: idea.title,
      bets: JSON.stringify([]),
      killedIdeas: JSON.stringify([]),
      openQuestions: JSON.stringify(["What is the fastest evidence-based test of demand?"]),
      version: 1,
    },
  });
  return NextResponse.json({ idea });
}
