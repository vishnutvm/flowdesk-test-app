import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { WebhookModel } from "@/lib/db/models";
import { jsonError, uid, today, withErrorHandling, stripMongoId } from "@/lib/db/api-helpers";
import { validateWebhookUrl } from "@/lib/validators";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  return withErrorHandling("GET /api/webhooks", async () => {
    await connectToDatabase();
    const webhooks = await WebhookModel.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json(webhooks.map(stripMongoId));
  });
}

interface CreateWebhookBody {
  url: string;
  events: string[];
}

export async function POST(req: NextRequest) {
  return withErrorHandling("POST /api/webhooks", async () => {
    const body = (await req.json().catch(() => null)) as CreateWebhookBody | null;
    if (!body) return jsonError("Invalid request body.");

    const error = validateWebhookUrl(body.url);
    if (error) return jsonError(error);

    await connectToDatabase();
    const webhook = await WebhookModel.create({
      id: uid("wh"),
      url: body.url,
      events: body.events ?? [],
      active: true,
      createdAt: today(),
    });
    return NextResponse.json(webhook.toJSON(), { status: 201 });
  });
}
