import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { TeamMemberModel } from "@/lib/db/models";
import { jsonError, withErrorHandling } from "@/lib/db/api-helpers";
import type { Role } from "@/lib/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  return withErrorHandling("PATCH /api/team-members/[id]", async () => {
    const { id } = await params;
    const body = (await req.json().catch(() => null)) as { role?: Role } | null;
    if (!body || !body.role) return jsonError("A role is required.");

    await connectToDatabase();
    const member = await TeamMemberModel.findOneAndUpdate({ id }, { role: body.role }, { returnDocument: "after" });
    if (!member) return jsonError("Team member not found.", 404);
    return NextResponse.json(member.toJSON());
  });
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  return withErrorHandling("DELETE /api/team-members/[id]", async () => {
    const { id } = await params;
    await connectToDatabase();
    const member = await TeamMemberModel.findOneAndDelete({ id });
    if (!member) return jsonError("Team member not found.", 404);
    return NextResponse.json({ ok: true });
  });
}
