import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ProjectModel, TaskModel } from "@/lib/db/models";
import { jsonError, withErrorHandling } from "@/lib/db/api-helpers";
import type { Project } from "@/lib/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  return withErrorHandling("GET /api/projects/[id]", async () => {
    const { id } = await params;
    await connectToDatabase();
    const project = await ProjectModel.findOne({ id });
    if (!project) return jsonError("Project not found.", 404);
    return NextResponse.json(project.toJSON());
  });
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  return withErrorHandling("PATCH /api/projects/[id]", async () => {
    const { id } = await params;
    const body = (await req.json().catch(() => null)) as Partial<Project> | null;
    if (!body) return jsonError("Invalid request body.");
    if (body.name !== undefined && body.name.trim().length < 3) {
      return jsonError("Project name must be at least 3 characters.");
    }

    await connectToDatabase();
    // Never allow the immutable id to be overwritten via a PATCH body.
    const { id: _ignoredId, ...updates } = body;
    void _ignoredId;
    const project = await ProjectModel.findOneAndUpdate({ id }, updates, { returnDocument: "after" });
    if (!project) return jsonError("Project not found.", 404);
    return NextResponse.json(project.toJSON());
  });
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  return withErrorHandling("DELETE /api/projects/[id]", async () => {
    const { id } = await params;
    await connectToDatabase();
    const project = await ProjectModel.findOneAndDelete({ id });
    if (!project) return jsonError("Project not found.", 404);
    // Cascade delete: tasks belonging to a deleted project are orphaned
    // otherwise, matching the previous in-memory store behavior.
    await TaskModel.deleteMany({ projectId: id });
    return NextResponse.json({ ok: true });
  });
}
