import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { AppNotificationModel } from "@/lib/db/models";
import { withErrorHandling, stripMongoId } from "@/lib/db/api-helpers";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  return withErrorHandling("GET /api/notifications", async () => {
    await connectToDatabase();
    const notifications = await AppNotificationModel.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json(notifications.map(stripMongoId));
  });
}

// Marks every notification as read in one batch update — used by the
// "Mark all as read" action instead of N individual PATCH requests.
export async function PATCH() {
  return withErrorHandling("PATCH /api/notifications", async () => {
    await connectToDatabase();
    await AppNotificationModel.updateMany({ read: false }, { read: true });
    const notifications = await AppNotificationModel.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json(notifications.map(stripMongoId));
  });
}
