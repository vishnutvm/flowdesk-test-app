import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { OrganizationModel } from "@/lib/db/models";
import { jsonError, withErrorHandling } from "@/lib/db/api-helpers";
import type { Organization } from "@/lib/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const VALID_PLANS: Organization["plan"][] = ["Free", "Starter", "Pro", "Enterprise"];

// FlowDesk is single-tenant, so there is exactly one Organization document
// (see SINGLETON_ID in lib/db/models.ts), seeded by scripts/seed-db.ts.
export async function GET() {
  return withErrorHandling("GET /api/organization", async () => {
    await connectToDatabase();
    const organization = await OrganizationModel.findOne();
    if (!organization) return jsonError("Organization not found. Run `npm run db:seed`.", 404);
    return NextResponse.json(organization.toJSON());
  });
}

export async function PATCH(req: NextRequest) {
  return withErrorHandling("PATCH /api/organization", async () => {
    const body = (await req.json().catch(() => null)) as { plan?: Organization["plan"] } | null;
    if (!body?.plan || !VALID_PLANS.includes(body.plan)) {
      return jsonError("A valid plan is required.");
    }

    await connectToDatabase();
    const organization = await OrganizationModel.findOneAndUpdate({}, { plan: body.plan }, { returnDocument: "after" });
    if (!organization) return jsonError("Organization not found. Run `npm run db:seed`.", 404);
    return NextResponse.json(organization.toJSON());
  });
}
