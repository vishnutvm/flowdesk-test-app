import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { TeamMemberModel } from "@/lib/db/models";
import { jsonError, uid, today, withErrorHandling, stripMongoId } from "@/lib/db/api-helpers";
import { validateInviteInput } from "@/lib/validators";
import type { Role } from "@/lib/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  return withErrorHandling("GET /api/team-members", async () => {
    await connectToDatabase();
    const members = await TeamMemberModel.find().sort({ joinedAt: 1 }).lean();
    return NextResponse.json(members.map(stripMongoId));
  });
}

interface InviteMemberBody {
  email: string;
  role: Role;
}

export async function POST(req: NextRequest) {
  return withErrorHandling("POST /api/team-members", async () => {
    const body = (await req.json().catch(() => null)) as InviteMemberBody | null;
    if (!body) return jsonError("Invalid request body.");

    const error = validateInviteInput(body.email);
    if (error) return jsonError(error);

    await connectToDatabase();
    const escaped = body.email.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const existing = await TeamMemberModel.findOne({ email: new RegExp(`^${escaped}$`, "i") });
    if (existing) return jsonError("This person is already a team member.");

    const member = await TeamMemberModel.create({
      id: uid("user"),
      name: body.email.split("@")[0],
      email: body.email.trim(),
      role: body.role,
      avatarUrl: `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(body.email)}&backgroundColor=64748b`,
      status: "Invited",
      joinedAt: today(),
    });
    return NextResponse.json(member.toJSON(), { status: 201 });
  });
}
