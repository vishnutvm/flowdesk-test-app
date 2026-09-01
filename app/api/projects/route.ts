import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ProjectModel } from "@/lib/db/models";
import { jsonError, uid, today, withErrorHandling, stripMongoId } from "@/lib/db/api-helpers";
import { validateProjectInput } from "@/lib/validators";
import type { ProjectStatus } from "@/lib/types";

// Route handlers hit MongoDB, so they must run at request time (Node.js
// runtime, dynamic rendering) — never evaluated during `next build`.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  return withErrorHandling("GET /api/projects", async () => {
    await connectToDatabase();
    const projects = await ProjectModel.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json(projects.map(stripMongoId));
  });
}

interface CreateProjectBody {
  name: string;
  description?: string;
  status: ProjectStatus;
  dueDate: string;
  ownerId?: string;
}

export async function POST(req: NextRequest) {
  return withErrorHandling("POST /api/projects", async () => {
    const body = (await req.json().catch(() => null)) as CreateProjectBody | null;
    if (!body) return jsonError("Invalid request body.");

    const error = validateProjectInput(body);
    if (error) return jsonError(error);

    await connectToDatabase();
    const project = await ProjectModel.create({
      id: uid("proj"),
      name: body.name.trim(),
      description: (body.description ?? "").trim(),
      status: body.status,
      ownerId: body.ownerId ?? "user-1",
      progress: 0,
      dueDate: body.dueDate,
      createdAt: today(),
    });
    return NextResponse.json(project.toJSON(), { status: 201 });
  });
}
