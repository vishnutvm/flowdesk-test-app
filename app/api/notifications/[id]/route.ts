import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { AppNotificationModel } from "@/lib/db/models";
import { jsonError, withErrorHandling } from "@/lib/db/api-helpers";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(_req: NextRequest, { params }: RouteParams) {
  return withErrorHandling("PATCH /api/notifications/[id]", async () => {
    const { id } = await params;
    await connectToDatabase();
    const notification = await AppNotificationModel.findOneAndUpdate({ id }, { read: true }, { returnDocument: "after" });
    if (!notification) return jsonError("Notification not found.", 404);
    return NextResponse.json(notification.toJSON());
  });
}
