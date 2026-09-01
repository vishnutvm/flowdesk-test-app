import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { TaskModel } from "@/lib/db/models";
import { jsonError, withErrorHandling } from "@/lib/db/api-helpers";
import type { Task } from "@/lib/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  return withErrorHandling("GET /api/tasks/[id]", async () => {
    const { id } = await params;
    await connectToDatabase();
    const task = await TaskModel.findOne({ id });
    if (!task) return jsonError("Task not found.", 404);
    return NextResponse.json(task.toJSON());
  });
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  return withErrorHandling("PATCH /api/tasks/[id]", async () => {
    const { id } = await params;
    const body = (await req.json().catch(() => null)) as Partial<Task> | null;
    if (!body) return jsonError("Invalid request body.");
    if (body.title !== undefined && !body.title.trim()) {
      return jsonError("Task title is required.");
    }

    await connectToDatabase();
    const { id: _ignoredId, ...updates } = body;
    void _ignoredId;
    const task = await TaskModel.findOneAndUpdate({ id }, updates, { returnDocument: "after" });
    if (!task) return jsonError("Task not found.", 404);
    return NextResponse.json(task.toJSON());
  });
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  return withErrorHandling("DELETE /api/tasks/[id]", async () => {
    const { id } = await params;
    await connectToDatabase();
    const task = await TaskModel.findOneAndDelete({ id });
    if (!task) return jsonError("Task not found.", 404);
    return NextResponse.json({ ok: true });
  });
}
