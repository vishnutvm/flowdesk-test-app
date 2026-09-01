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
import type { ProjectStatus } from "@/lib/types";

const STATUSES: ProjectStatus[] = ["Planning", "Active", "Completed", "Archived"];

function ProjectsContent() {
  const searchParams = useSearchParams();
  const projects = useFlowDeskStore((s) => s.projects);
  const createProject = useFlowDeskStore((s) => s.createProject);
  const dataLoaded = useFlowDeskStore((s) => s.dataLoaded);
  const dataError = useFlowDeskStore((s) => s.dataError);
  const initData = useFlowDeskStore((s) => s.initData);
  const { showToast } = useToast();

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [modalOpen, setModalOpen] = useState(searchParams.get("new") === "1");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<ProjectStatus>("Planning");
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const filtered = useMemo(
    () => (statusFilter === "all" ? projects : projects.filter((p) => p.status === statusFilter)),
    [projects, statusFilter]
  );

  function resetForm() {
    setName("");
    setDescription("");
    setStatus("Planning");
    setDueDate("");
    setError(null);
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const result = await createProject({ name, description, status, dueDate });
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error ?? "Unable to create project.");
      return;
    }
    showToast("Project created successfully.");
    setModalOpen(false);
    resetForm();
  }

  return (
    <div data-testid="projects-page" className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Projects</h1>
          <p className="mt-1 text-sm text-slate-500">Track progress across all of your organization&apos;s projects.</p>
        </div>
        <Button data-testid="new-project-button" data-ai-target="new-project-button" disabled={!dataLoaded} onClick={() => setModalOpen(true)}>
          + New project
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <label htmlFor="project-status-filter" className="text-sm font-medium text-slate-600">
          Status
        </label>
        <select
          id="project-status-filter"
          data-testid="project-status-filter"
          data-ai-target="project-status-filter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
        >
          <option value="all">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {dataError ? (
        <ErrorState testId="projects-error-state" onRetry={() => initData()} />
      ) : !dataLoaded ? (
        <div data-testid="projects-loading" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          testId="projects-empty-state"
          title="No projects yet"
          description="Create your first project to start organizing tasks and tracking progress."
          action={
            <Button data-testid="empty-state-new-project" onClick={() => setModalOpen(true)}>
              + New project
            </Button>
          }
        />
      ) : (
        <div data-testid="projects-grid" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <Link key={p.id} href={`/projects/${p.id}`} data-testid={`project-card-${p.id}`} data-ai-target="project-card">
              <Card className="h-full p-5 transition-shadow hover:shadow-md">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-slate-900">{p.name}</h3>
                  <Badge>{p.status}</Badge>
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-slate-500">{p.description}</p>
                <div className="mt-4">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-indigo-600" style={{ width: `${p.progress}%` }} />
                  </div>
                  <div className="mt-1.5 flex items-center justify-between text-xs text-slate-500">
                    <span>{p.progress}% complete</span>
                    <span>Due {p.dueDate}</span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create new project" testId="new-project-modal">
        <form data-testid="new-project-form" onSubmit={handleCreate} noValidate className="space-y-4">
          <Input
            id="project-name"
            data-testid="project-name-input"
            data-ai-target="project-name-input"
            label="Project name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Textarea
            id="project-description"
            data-testid="project-description-input"
            data-ai-target="project-description-input"
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Select
            id="project-status"
            data-testid="project-status-input"
            data-ai-target="project-status-input"
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as ProjectStatus)}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
          <Input
            id="project-due-date"
            data-testid="project-due-date-input"
            data-ai-target="project-due-date-input"
            label="Due date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
          />
          {error && (
            <p role="alert" data-testid="project-form-error" className="text-sm font-medium text-red-600">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" data-testid="create-project-submit" data-ai-target="create-project-submit" isLoading={submitting}>
              Create project
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default function ProjectsPage() {
  return (
    <Suspense fallback={null}>
      <ProjectsContent />
    </Suspense>
  );
}
