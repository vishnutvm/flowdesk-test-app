import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { WebhookModel } from "@/lib/db/models";
import { jsonError, withErrorHandling } from "@/lib/db/api-helpers";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  return withErrorHandling("DELETE /api/webhooks/[id]", async () => {
    const { id } = await params;
    await connectToDatabase();
    const webhook = await WebhookModel.findOneAndDelete({ id });
    if (!webhook) return jsonError("Webhook not found.", 404);
    return NextResponse.json({ ok: true });
  });
}
