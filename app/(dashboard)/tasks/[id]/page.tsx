"use client";
import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFlowDeskStore } from "@/lib/store";
import { Card, Badge, EmptyState, Skeleton, ErrorState } from "@/components/ui/Misc";
import { Button } from "@/components/ui/Button";
import { Select, Textarea, Input } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import type { TaskStatus, TaskPriority } from "@/lib/types";

const STATUSES: TaskStatus[] = ["Todo", "In Progress", "Review", "Completed"];
const PRIORITIES: TaskPriority[] = ["Low", "Medium", "High", "Urgent"];

export default function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { showToast } = useToast();
  const task = useFlowDeskStore((s) => s.tasks.find((t) => t.id === id));
  const projects = useFlowDeskStore((s) => s.projects);
  const teamMembers = useFlowDeskStore((s) => s.teamMembers);
  const updateTask = useFlowDeskStore((s) => s.updateTask);
  const deleteTask = useFlowDeskStore((s) => s.deleteTask);
  const dataLoaded = useFlowDeskStore((s) => s.dataLoaded);
  const dataError = useFlowDeskStore((s) => s.dataError);
  const initData = useFlowDeskStore((s) => s.initData);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [dueDate, setDueDate] = useState(task?.dueDate ?? "");
  const [titleError, setTitleError] = useState<string | null>(null);

  if (dataError) {
    return <ErrorState testId="task-detail-error" onRetry={() => initData()} />;
  }

  if (!dataLoaded) {
    return (
      <div data-testid="task-detail-loading" className="space-y-4">
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!task) {
    return (
      <EmptyState
        testId="task-not-found"
        title="Task not found"
        description="This task may have been deleted."
        action={
          <Link href="/tasks">
            <Button>Back to tasks</Button>
          </Link>
        }
      />
    );
  }

  const project = projects.find((p) => p.id === task.projectId);

  async function saveField<K extends "title" | "description" | "dueDate">(field: K, value: string) {
    if (field === "title" && !value.trim()) {
      setTitleError("Title is required.");
      return;
    }
    setTitleError(null);
    await updateTask(task!.id, { [field]: value } as never);
    showToast("Task updated.");
  }

  async function handleDelete() {
    await deleteTask(task!.id);
    showToast("Task deleted.");
    router.push("/tasks");
  }

  return (
    <div data-testid="task-detail-page" className="space-y-6">
      <Link href="/tasks" data-testid="back-to-tasks" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
        ← Back to tasks
      </Link>

      <Card className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex-1">
            <label htmlFor="task-detail-title" className="sr-only">
              Task title
            </label>
            <input
              id="task-detail-title"
              data-testid="task-detail-title-input"
              data-ai-target="task-detail-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => saveField("title", title)}
              className="w-full border-none bg-transparent text-2xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-200 rounded-md"
            />
            {titleError && (
              <p role="alert" data-testid="task-title-error" className="mt-1 text-sm font-medium text-red-600">
                {titleError}
              </p>
            )}
            {project && (
              <Link href={`/projects/${project.id}`} data-testid="task-project-link" className="mt-1 inline-block text-sm text-indigo-600 hover:text-indigo-500">
                {project.name}
              </Link>
            )}
          </div>
          <Button data-testid="delete-task-button" data-ai-target="delete-task-button" variant="danger" onClick={() => setDeleteOpen(true)}>
            Delete
          </Button>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select
            id="task-detail-status"
            data-testid="task-detail-status-select"
            data-ai-target="task-detail-status"
            label="Status"
            value={task.status}
            onChange={(e) => {
              void updateTask(task.id, { status: e.target.value as TaskStatus }).then(() => showToast("Task status updated."));
            }}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </Select>
          <Select
            id="task-detail-priority"
            data-testid="task-detail-priority-select"
            data-ai-target="task-detail-priority"
            label="Priority"
            value={task.priority}
            onChange={(e) => {
              void updateTask(task.id, { priority: e.target.value as TaskPriority }).then(() => showToast("Task priority updated."));
            }}
          >
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </Select>
          <Select
            id="task-detail-assignee"
            data-testid="task-detail-assignee-select"
            data-ai-target="task-detail-assignee"
            label="Assignee"
            value={task.assigneeId ?? ""}
            onChange={(e) => {
              void updateTask(task.id, { assigneeId: e.target.value || null }).then(() => showToast("Task assignee updated."));
            }}
          >
            <option value="">Unassigned</option>
            {teamMembers.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </Select>
          <Input
            id="task-detail-due-date"
            data-testid="task-detail-due-date-input"
            data-ai-target="task-detail-due-date"
            label="Due date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            onBlur={() => saveField("dueDate", dueDate)}
          />
        </div>

        <div className="mt-4">
          <Textarea
            id="task-detail-description"
            data-testid="task-detail-description-input"
            data-ai-target="task-detail-description"
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={() => saveField("description", description)}
          />
        </div>

        <div className="mt-4 flex gap-4 text-xs text-slate-400">
          <span>Created {task.createdAt}</span>
          <span>
            Current status: <Badge>{task.status}</Badge>
          </span>
        </div>
      </Card>

      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete task" testId="delete-task-modal">
        <p className="text-sm text-slate-600">
          Are you sure you want to delete <strong>{task.title}</strong>? This action cannot be undone.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setDeleteOpen(false)}>
            Cancel
          </Button>
          <Button data-testid="confirm-delete-task" variant="danger" onClick={handleDelete}>
            Delete task
          </Button>
        </div>
      </Modal>
    </div>
  );
}
