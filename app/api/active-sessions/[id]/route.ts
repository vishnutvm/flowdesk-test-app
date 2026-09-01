import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ActiveSessionModel } from "@/lib/db/models";
import { jsonError, withErrorHandling } from "@/lib/db/api-helpers";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Revokes (deletes) an active session record. This is display-only data —
// it does not affect the mocked auth session, which lives entirely in
// client-side localStorage.
export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  return withErrorHandling("DELETE /api/active-sessions/[id]", async () => {
    const { id } = await params;
    await connectToDatabase();
    const session = await ActiveSessionModel.findOneAndDelete({ id });
    if (!session) return jsonError("Session not found.", 404);
    return NextResponse.json({ ok: true });
  });
}
