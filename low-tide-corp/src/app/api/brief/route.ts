import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const idea = await prisma.idea.findFirst({ where: { status: "active" }, orderBy: { updatedAt: "desc" } });
  const brief = idea
    ? await prisma.companyBrief.findFirst({ where: { ideaId: idea.id }, orderBy: { version: "desc" } })
    : null;
  return NextResponse.json({ brief });
}
