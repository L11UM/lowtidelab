import { NextRequest } from "next/server";
import { z } from "zod";
import { sseResponse } from "@/lib/sse";
import { rerunAgent } from "@/lib/run";
import type { AgentKey } from "@/lib/agents/types";

export const dynamic = "force-dynamic";

const Body = z.object({
  agent: z.enum(["researcher", "product", "builder", "growth", "operator", "critic"]),
});

export async function POST(req: NextRequest, { params }: { params: { date: string } }) {
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return new Response(JSON.stringify({ error: parsed.error.message }), { status: 400 });
  const agent = parsed.data.agent as Exclude<AgentKey, "orchestrator">;
  return sseResponse((emit) => rerunAgent(params.date, agent, emit, "night"));
}