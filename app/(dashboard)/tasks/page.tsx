"use client";
import { useMemo, useState, FormEvent, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useFlowDeskStore } from "@/lib/store";
import { Card, Badge, EmptyState, Skeleton, ErrorState } from "@/components/ui/Misc";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import type { TaskStatus, TaskPriority } from "@/lib/types";

const STATUSES: TaskStatus[] = ["Todo", "In Progress", "Review", "Completed"];
const PRIORITIES: TaskPriority[] = ["Low", "Medium", "High", "Urgent"];

function TasksContent() {
  const searchParams = useSearchParams();
  const tasks = useFlowDeskStore((s) => s.tasks);
  const projects = useFlowDeskStore((s) => s.projects);
  const teamMembers = useFlowDeskStore((s) => s.teamMembers);
  const createTask = useFlowDeskStore((s) => s.createTask);
  const updateTask = useFlowDeskStore((s) => s.updateTask);
  const dataLoaded = useFlowDeskStore((s) => s.dataLoaded);
  const dataError = useFlowDeskStore((s) => s.dataError);
  const initData = useFlowDeskStore((s) => s.initData);
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState(searchParams.get("projectId") ?? "all");
  const [modalOpen, setModalOpen] = useState(searchParams.get("new") === "1");

  const [projectId, setProjectId] = useState(searchParams.get("projectId") ?? projects[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>("Todo");
  const [priority, setPriority] = useState<TaskPriority>("Medium");
  const [assigneeId, setAssigneeId] = useState<string>("");
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Projects load asynchronously now, so the "New task" form can't resolve
  // its default project selection at mount time the way it could when data
  // was seeded synchronously (projects[] was empty on first render). Fall
  // back to the first loaded project at render/submit time instead of
  // trying to pre-fill `projectId` state once, which would go stale.
  const effectiveProjectId = projectId || projects[0]?.id || "";

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      if (statusFilter !== "all" && t.status !== statusFilter) return false;
      if (priorityFilter !== "all" && t.priority !== priorityFilter) return false;
      if (projectFilter !== "all" && t.projectId !== projectFilter) return false;
      return true;
    });
  }, [tasks, statusFilter, priorityFilter, projectFilter]);

  function resetForm() {
    setTitle("");
    setDescription("");
    setStatus("Todo");
    setPriority("Medium");
    setAssigneeId("");
    setDueDate("");
    setError(null);
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const result = await createTask({
      projectId: effectiveProjectId,
      title,
      description,
      status,
      priority,
      assigneeId: assigneeId || null,
      dueDate,
    });
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error ?? "Unable to create task.");
      return;
    }
    showToast("Task created successfully.");
    setModalOpen(false);
    resetForm();
  }

  function projectName(id: string) {
    return projects.find((p) => p.id === id)?.name ?? "Unknown project";
  }

  return (
    <div data-testid="tasks-page" className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Tasks</h1>
          <p className="mt-1 text-sm text-slate-500">All tasks across your projects.</p>
        </div>
        <Button data-testid="new-task-button" data-ai-target="new-task-button" disabled={!dataLoaded} onClick={() => setModalOpen(true)}>
          + New task
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <select data-testid="task-status-filter" data-ai-target="task-status-filter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm" aria-label="Filter by status">
          <option value="all">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select data-testid="task-priority-filter" data-ai-target="task-priority-filter" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm" aria-label="Filter by priority">
          <option value="all">All priorities</option>
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <select data-testid="task-project-filter" data-ai-target="task-project-filter" value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm" aria-label="Filter by project">
          <option value="all">All projects</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {dataError ? (
        <ErrorState testId="tasks-error-state" onRetry={() => initData()} />
      ) : !dataLoaded ? (
        <div data-testid="tasks-loading" className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          testId="tasks-empty-state"
          title="No tasks match these filters"
          description="Try adjusting your filters, or create a new task."
          action={
            <Button data-testid="empty-state-new-task" onClick={() => setModalOpen(true)}>
              + New task
            </Button>
          }
        />
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-slate-200 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Project</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Priority</th>
                <th className="px-4 py-3 font-medium">Assignee</th>
                <th className="px-4 py-3 font-medium">Due date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((t) => {
                const assignee = teamMembers.find((m) => m.id === t.assigneeId);
                return (
                  <tr key={t.id} data-testid={`task-row-${t.id}`} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <Link href={`/tasks/${t.id}`} data-testid={`task-link-${t.id}`} className="font-medium text-indigo-600 hover:text-indigo-500">
                        {t.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{projectName(t.projectId)}</td>
                    <td className="px-4 py-3">
                      <select
                        aria-label={`Change status for ${t.title}`}
                        data-testid={`task-status-select-${t.id}`}
                        data-ai-target="task-status-select"
                        value={t.status}
                        onChange={(e) => {
                          void updateTask(t.id, { status: e.target.value as TaskStatus }).then(() => showToast("Task status updated."));
                        }}
                        className="rounded-md border border-slate-300 px-2 py-1 text-xs"
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <Badge>{t.priority}</Badge>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{assignee?.name ?? "Unassigned"}</td>
                    <td className="px-4 py-3 text-slate-600">{t.dueDate}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create new task" testId="new-task-modal">
        <form data-testid="new-task-form" onSubmit={handleCreate} noValidate className="space-y-4">
          <Select id="task-project" data-testid="task-project-input" data-ai-target="task-project-input" label="Project" value={effectiveProjectId} onChange={(e) => setProjectId(e.target.value)} required>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </Select>
          <Input id="task-title" data-testid="task-title-input" data-ai-target="task-title-input" label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <Textarea id="task-description" data-testid="task-description-input" data-ai-target="task-description-input" label="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
          <div className="grid grid-cols-2 gap-4">
            <Select id="task-status-new" data-testid="task-status-input" data-ai-target="task-status-input" label="Status" value={status} onChange={(e) => setStatus(e.target.value as TaskStatus)}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </Select>
            <Select id="task-priority-new" data-testid="task-priority-input" data-ai-target="task-priority-input" label="Priority" value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)}>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </Select>
          </div>
          <Select id="task-assignee" data-testid="task-assignee-input" data-ai-target="task-assignee-input" label="Assignee" value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)}>
            <option value="">Unassigned</option>
            {teamMembers.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </Select>
          <Input id="task-due-date" data-testid="task-due-date-input" data-ai-target="task-due-date-input" label="Due date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
          {error && (
            <p role="alert" data-testid="task-form-error" className="text-sm font-medium text-red-600">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" data-testid="create-task-submit" data-ai-target="create-task-submit" isLoading={submitting}>
              Create task
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default function TasksPage() {
  return (
    <Suspense fallback={null}>
      <TasksContent />
    </Suspense>
  );
}
