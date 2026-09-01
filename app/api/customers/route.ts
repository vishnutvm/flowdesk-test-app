import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { CustomerModel } from "@/lib/db/models";
import { jsonError, uid, today, withErrorHandling, stripMongoId } from "@/lib/db/api-helpers";
import { validateCustomerInput } from "@/lib/validators";
import type { CustomerStatus } from "@/lib/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  return withErrorHandling("GET /api/customers", async () => {
    await connectToDatabase();
    const customers = await CustomerModel.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json(customers.map(stripMongoId));
  });
}

interface CreateCustomerBody {
  name: string;
  company?: string;
  email: string;
  status: CustomerStatus;
}

export async function POST(req: NextRequest) {
  return withErrorHandling("POST /api/customers", async () => {
    const body = (await req.json().catch(() => null)) as CreateCustomerBody | null;
    if (!body) return jsonError("Invalid request body.");

    const error = validateCustomerInput(body);
    if (error) return jsonError(error);

    await connectToDatabase();
    const customer = await CustomerModel.create({
      id: uid("cust"),
      name: body.name.trim(),
      company: (body.company ?? "").trim(),
      email: body.email.trim(),
      status: body.status,
      createdAt: today(),
    });
    return NextResponse.json(customer.toJSON(), { status: 201 });
  });
}
