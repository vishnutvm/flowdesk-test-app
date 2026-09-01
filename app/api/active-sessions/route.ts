import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ActiveSessionModel } from "@/lib/db/models";
import { withErrorHandling, stripMongoId } from "@/lib/db/api-helpers";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  return withErrorHandling("GET /api/active-sessions", async () => {
    await connectToDatabase();
    const sessions = await ActiveSessionModel.find().sort({ lastActive: -1 }).lean();
    return NextResponse.json(sessions.map(stripMongoId));
  });
}
