import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { NotificationPrefsModel, SINGLETON_ID } from "@/lib/db/models";
import { jsonError, withErrorHandling } from "@/lib/db/api-helpers";
import type { NotificationPrefs } from "@/lib/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  return withErrorHandling("GET /api/notification-prefs", async () => {
    await connectToDatabase();
    const prefs = await NotificationPrefsModel.findOne({ id: SINGLETON_ID });
    if (!prefs) return jsonError("Notification preferences not found. Run `npm run db:seed`.", 404);
    return NextResponse.json(prefs.toJSON());
  });
}

export async function PATCH(req: NextRequest) {
  return withErrorHandling("PATCH /api/notification-prefs", async () => {
    const body = (await req.json().catch(() => null)) as Partial<NotificationPrefs> | null;
    if (!body) return jsonError("Invalid request body.");

    await connectToDatabase();
    const prefs = await NotificationPrefsModel.findOneAndUpdate({ id: SINGLETON_ID }, body, { returnDocument: "after" });
    if (!prefs) return jsonError("Notification preferences not found. Run `npm run db:seed`.", 404);
    return NextResponse.json(prefs.toJSON());
  });
}
