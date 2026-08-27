"use client";
import { use, useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFlowDeskStore } from "@/lib/store";
import { Card, Badge, EmptyState } from "@/components/ui/Misc";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import type { ProjectStatus } from "@/lib/types";

const STATUSES: ProjectStatus[] = ["Planning", "Active", "Completed", "Archived"];

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { showToast } = useToast();
  const project = useFlowDeskStore((s) => s.projects.find((p) => p.id === id));
  const tasks = useFlowDeskStore((s) => s.tasks.filter((t) => t.projectId === id));
  const teamMembers = useFlowDeskStore((s) => s.teamMembers);
  const updateProject = useFlowDeskStore((s) => s.updateProject);
  const deleteProject = useFlowDeskStore((s) => s.deleteProject);

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [name, setName] = useState(project?.name ?? "");
  const [description, setDescription] = useState(project?.description ?? "");
  const [status, setStatus] = useState<ProjectStatus>(project?.status ?? "Planning");
  const [dueDate, setDueDate] = useState(project?.dueDate ?? "");
  const [error, setError] = useState<string | null>(null);

  if (!project) {
    return (
      <EmptyState
        testId="project-not-found"
        title="Project not found"
        description="This project may have been deleted."
        action={
          <Link href="/projects">
            <Button>Back to projects</Button>
          </Link>
        }
      />
    );
  }

  function openEdit() {
    setName(project!.name);
    setDescription(project!.description);
    setStatus(project!.status);
    setDueDate(project!.dueDate);
    setError(null);
    setEditOpen(true);
  }

  function handleSave(e: FormEvent) {
    e.preventDefault();
    if (name.trim().length < 3) {
      setError("Project name must be at least 3 characters.");
      return;
    }
    if (!dueDate) {
      setError("Due date is required.");
      return;
    }
    updateProject(project!.id, { name: name.trim(), description, status, dueDate });
    showToast("Project updated.");
    setEditOpen(false);
  }

  function handleDelete() {
    deleteProject(project!.id);
    showToast("Project deleted.");
    router.push("/projects");
  }

  return (
    <div data-testid="project-detail-page" className="space-y-6">
      <Link href="/projects" data-testid="back-to-projects" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
        ← Back to projects
      </Link>

      <Card className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 data-testid="project-detail-name" className="text-2xl font-semibold text-slate-900">
                {project.name}
              </h1>
              <Badge>{project.status}</Badge>
            </div>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">{project.description}</p>
            <p className="mt-2 text-xs text-slate-400">Due {project.dueDate} · Created {project.createdAt}</p>
          </div>
          <div className="flex gap-2">
            <Button data-testid="edit-project-button" data-ai-target="edit-project-button" variant="outline" onClick={openEdit}>
              Edit
            </Button>
            <Button data-testid="delete-project-button" data-ai-target="delete-project-button" variant="danger" onClick={() => setDeleteOpen(true)}>
              Delete
            </Button>
          </div>
        </div>
        <div className="mt-5">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-indigo-600" style={{ width: `${project.progress}%` }} />
          </div>
          <p className="mt-1.5 text-xs text-slate-500">{project.progress}% complete</p>
        </div>
      </Card>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Tasks in this project</h2>
        <Link href={`/tasks?new=1&projectId=${project.id}`} data-testid="project-new-task-link">
          <Button size="sm">+ New task</Button>
        </Link>
      </div>

      {tasks.length === 0 ? (
        <EmptyState testId="project-tasks-empty-state" title="No tasks yet" description="Add a task to start tracking work for this project." />
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-slate-200 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Priority</th>
                <th className="px-4 py-3 font-medium">Assignee</th>
                <th className="px-4 py-3 font-medium">Due date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tasks.map((t) => {
                const assignee = teamMembers.find((m) => m.id === t.assigneeId);
                return (
                  <tr key={t.id} data-testid={`project-task-row-${t.id}`} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <Link href={`/tasks/${t.id}`} className="font-medium text-indigo-600 hover:text-indigo-500">
                        {t.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <Badge>{t.status}</Badge>
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

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit project" testId="edit-project-modal">
        <form data-testid="edit-project-form" onSubmit={handleSave} noValidate className="space-y-4">
          <Input id="edit-project-name" data-testid="edit-project-name-input" label="Project name" value={name} onChange={(e) => setName(e.target.value)} required />
          <Textarea id="edit-project-description" data-testid="edit-project-description-input" label="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
          <Select id="edit-project-status" data-testid="edit-project-status-input" label="Status" value={status} onChange={(e) => setStatus(e.target.value as ProjectStatus)}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
          <Input id="edit-project-due-date" data-testid="edit-project-due-date-input" label="Due date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
          {error && (
            <p role="alert" data-testid="edit-project-error" className="text-sm font-medium text-red-600">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" data-testid="save-project-submit">
              Save changes
            </Button>
          </div>
        </form>
      </Modal>

      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete project" testId="delete-project-modal">
        <p className="text-sm text-slate-600">
          Are you sure you want to delete <strong>{project.name}</strong>? This will also delete all of its tasks. This action cannot be undone.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setDeleteOpen(false)}>
            Cancel
          </Button>
          <Button data-testid="confirm-delete-project" variant="danger" onClick={handleDelete}>
            Delete project
          </Button>
        </div>
      </Modal>
    </div>
  );
}
