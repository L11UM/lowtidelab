import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

async function ensureSettings() {
  let settings = await prisma.settings.findUnique({ where: { id: "singleton" } });
  if (!settings) settings = await prisma.settings.create({ data: { id: "singleton" } });
  return settings;
}

export async function GET() {
  const settings = await ensureSettings();
  return NextResponse.json({ settings: { ...settings, agentsOn: JSON.parse(settings.agentsOn) } });
}

const SettingsInput = z.object({
  provider: z.enum(["openai", "anthropic", "gemini"]).optional(),
  model: z.string().optional(),
  timezone: z.string().optional(),
  maxDollarsPerDay: z.number().optional(),
  agentsOn: z.record(z.boolean()).optional(),
});

export async function POST(req: NextRequest) {
  await ensureSettings();
  const parsed = SettingsInput.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  const { agentsOn, ...rest } = parsed.data;
  const settings = await prisma.settings.update({
    where: { id: "singleton" },
    data: { ...rest, ...(agentsOn ? { agentsOn: JSON.stringify(agentsOn) } : {}) },
  });
  return NextResponse.json({ settings: { ...settings, agentsOn: JSON.parse(settings.agentsOn) } });
}
