import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { TaskModel } from "@/lib/db/models";
import { jsonError, uid, today, withErrorHandling, stripMongoId } from "@/lib/db/api-helpers";
import { validateTaskInput } from "@/lib/validators";
import type { TaskStatus, TaskPriority } from "@/lib/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  return withErrorHandling("GET /api/tasks", async () => {
    await connectToDatabase();
    const tasks = await TaskModel.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json(tasks.map(stripMongoId));
  });
}

interface CreateTaskBody {
  projectId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: string | null;
  dueDate: string;
}

export async function POST(req: NextRequest) {
  return withErrorHandling("POST /api/tasks", async () => {
    const body = (await req.json().catch(() => null)) as CreateTaskBody | null;
    if (!body) return jsonError("Invalid request body.");

    const error = validateTaskInput(body);
    if (error) return jsonError(error);

    await connectToDatabase();
    const task = await TaskModel.create({
      id: uid("task"),
      projectId: body.projectId,
      title: body.title.trim(),
      description: (body.description ?? "").trim(),
      status: body.status,
      priority: body.priority,
      assigneeId: body.assigneeId,
      dueDate: body.dueDate,
      createdAt: today(),
    });
    return NextResponse.json(task.toJSON(), { status: 201 });
  });
}
