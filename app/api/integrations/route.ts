import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { IntegrationStateModel, SINGLETON_ID } from "@/lib/db/models";
import { jsonError, withErrorHandling } from "@/lib/db/api-helpers";
import type { IntegrationState } from "@/lib/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  return withErrorHandling("GET /api/integrations", async () => {
    await connectToDatabase();
    const integrations = await IntegrationStateModel.findOne({ id: SINGLETON_ID });
    if (!integrations) return jsonError("Integration settings not found. Run `npm run db:seed`.", 404);
    return NextResponse.json(integrations.toJSON());
  });
}

export async function PATCH(req: NextRequest) {
  return withErrorHandling("PATCH /api/integrations", async () => {
    const body = (await req.json().catch(() => null)) as Partial<IntegrationState> | null;
    if (!body) return jsonError("Invalid request body.");

    await connectToDatabase();
    const integrations = await IntegrationStateModel.findOneAndUpdate({ id: SINGLETON_ID }, body, { returnDocument: "after" });
    if (!integrations) return jsonError("Integration settings not found. Run `npm run db:seed`.", 404);
    return NextResponse.json(integrations.toJSON());
  });
}
