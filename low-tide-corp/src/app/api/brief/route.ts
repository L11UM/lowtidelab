import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const brief = await prisma.companyBrief.findFirst({ orderBy: { version: "desc" } });
  return NextResponse.json({ brief });
}
