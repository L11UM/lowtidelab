import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { date: string } }) {
  const workday = await prisma.workday.findUnique({
    where: { date: params.date },
    include: { artifacts: { orderBy: { createdAt: "asc" } } },
  });
  if (!workday) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ workday });
}
