import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { CustomerModel } from "@/lib/db/models";
import { jsonError, withErrorHandling } from "@/lib/db/api-helpers";
import { isValidEmail } from "@/lib/validators";
import type { Customer } from "@/lib/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  return withErrorHandling("GET /api/customers/[id]", async () => {
    const { id } = await params;
    await connectToDatabase();
    const customer = await CustomerModel.findOne({ id });
    if (!customer) return jsonError("Customer not found.", 404);
    return NextResponse.json(customer.toJSON());
  });
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  return withErrorHandling("PATCH /api/customers/[id]", async () => {
    const { id } = await params;
    const body = (await req.json().catch(() => null)) as Partial<Customer> | null;
    if (!body) return jsonError("Invalid request body.");
    if (body.email !== undefined && !isValidEmail(body.email)) {
      return jsonError("Enter a valid email address.");
    }

    await connectToDatabase();
    const { id: _ignoredId, ...updates } = body;
    void _ignoredId;
    const customer = await CustomerModel.findOneAndUpdate({ id }, updates, { returnDocument: "after" });
    if (!customer) return jsonError("Customer not found.", 404);
    return NextResponse.json(customer.toJSON());
  });
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  return withErrorHandling("DELETE /api/customers/[id]", async () => {
    const { id } = await params;
    await connectToDatabase();
    const customer = await CustomerModel.findOneAndDelete({ id });
    if (!customer) return jsonError("Customer not found.", 404);
    return NextResponse.json({ ok: true });
  });
}
