import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ApiKeyModel } from "@/lib/db/models";
import { jsonError, uid, today, withErrorHandling, stripMongoId } from "@/lib/db/api-helpers";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  return withErrorHandling("GET /api/api-keys", async () => {
    await connectToDatabase();
    const keys = await ApiKeyModel.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json(keys.map(stripMongoId));
  });
}

export async function POST(req: NextRequest) {
  return withErrorHandling("POST /api/api-keys", async () => {
    const body = (await req.json().catch(() => null)) as { name?: string } | null;
    if (!body) return jsonError("Invalid request body.");

    await connectToDatabase();
    // The raw key is only ever returned once, in this response — the
    // database only ever stores the masked form, mirroring how real API
    // key systems (and the previous in-memory mock) behave.
    const rawKey = `fd_live_${uid("key")}`;
    const name = (body.name ?? "").trim() || "Untitled key";
    const key = await ApiKeyModel.create({
      id: uid("key"),
      name,
      maskedKey: `fd_live_••••••••••••${rawKey.slice(-4)}`,
      createdAt: today(),
      lastUsedAt: null,
    });
    return NextResponse.json({ ...key.toJSON(), rawKey }, { status: 201 });
  });
}
