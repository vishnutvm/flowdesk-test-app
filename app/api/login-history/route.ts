import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { LoginHistoryEntryModel } from "@/lib/db/models";
import { withErrorHandling, stripMongoId } from "@/lib/db/api-helpers";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Read-only: login history entries are only ever produced by a real auth
// provider, which this demo intentionally does not have.
export async function GET() {
  return withErrorHandling("GET /api/login-history", async () => {
    await connectToDatabase();
    const entries = await LoginHistoryEntryModel.find().sort({ at: -1 }).lean();
    return NextResponse.json(entries.map(stripMongoId));
  });
}
