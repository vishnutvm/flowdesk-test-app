import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { InvoiceModel } from "@/lib/db/models";
import { withErrorHandling, stripMongoId } from "@/lib/db/api-helpers";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Invoices are read-only in this demo — there is no billing provider to
// generate real invoices, so no POST/PATCH/DELETE handlers exist here.
export async function GET() {
  return withErrorHandling("GET /api/invoices", async () => {
    await connectToDatabase();
    const invoices = await InvoiceModel.find().sort({ date: -1 }).lean();
    return NextResponse.json(invoices.map(stripMongoId));
  });
}
