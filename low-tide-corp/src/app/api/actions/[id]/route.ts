import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const ActionUpdate = z.object({
  status: z.enum(["open", "done", "blocked"]),
  evidence: z.string().trim().max(2000).optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const input = ActionUpdate.safeParse(await req.json().catch(() => ({})));
  if (!input.success) return NextResponse.json({ error: input.error.message }, { status: 400 });

  const action = await prisma.actionItem.update({
    where: { id: params.id },
    data: {
      status: input.data.status,
      evidence: input.data.evidence || null,
      completedAt: input.data.status === "done" ? new Date() : null,
    },
  });
  return NextResponse.json({ action });
}
