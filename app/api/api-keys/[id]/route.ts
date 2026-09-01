import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ApiKeyModel } from "@/lib/db/models";
import { jsonError, withErrorHandling } from "@/lib/db/api-helpers";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  return withErrorHandling("DELETE /api/api-keys/[id]", async () => {
    const { id } = await params;
    await connectToDatabase();
    const key = await ApiKeyModel.findOneAndDelete({ id });
    if (!key) return jsonError("API key not found.", 404);
    return NextResponse.json({ ok: true });
  });
}
