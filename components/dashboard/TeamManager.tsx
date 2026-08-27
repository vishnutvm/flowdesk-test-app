"use client";
import { useState, FormEvent, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useFlowDeskStore } from "@/lib/store";
import { canManageTeam } from "@/lib/permissions";
import { Card, Badge, PermissionDenied } from "@/components/ui/Misc";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import type { Role } from "@/lib/types";

const ROLES: Role[] = ["Owner", "Admin", "Member", "Viewer"];

function TeamManagerInner({ embedded }: { embedded?: boolean }) {
  const searchParams = useSearchParams();
  const teamMembers = useFlowDeskStore((s) => s.teamMembers);
  const inviteMember = useFlowDeskStore((s) => s.inviteMember);
  const removeMember = useFlowDeskStore((s) => s.removeMember);
  const changeMemberRole = useFlowDeskStore((s) => s.changeMemberRole);
  const simulatedRole = useFlowDeskStore((s) => s.simulatedRole);
  const setSimulatedRole = useFlowDeskStore((s) => s.setSimulatedRole);
  const { showToast } = useToast();

  const canManage = canManageTeam(simulatedRole);
  const [modalOpen, setModalOpen] = useState(searchParams.get("invite") === "1");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("Member");
  const [error, setError] = useState<string | null>(null);

  function handleInvite(e: FormEvent) {
    e.preventDefault();
    const result = inviteMember(email, role);
    if (!result.ok) {
      setError(result.error ?? "Unable to send invite.");
      return;
    }
    showToast("Invitation sent.");
    setModalOpen(false);
    setEmail("");
    setRole("Member");
    setError(null);
  }

  return (
    <div data-testid={embedded ? "settings-team-page" : "team-page"} className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {!embedded && (
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Team</h1>
            <p className="mt-1 text-sm text-slate-500">Manage who has access to your organization.</p>
          </div>
        )}
        <div className="flex items-center gap-3">
          <label htmlFor={`simulate-role-${embedded ? "settings" : "team"}`} className="text-xs text-slate-500">
            Simulate role (testing)
          </label>
          <select
            id={`simulate-role-${embedded ? "settings" : "team"}`}
            data-testid="simulate-role-select"
            data-ai-target="simulate-role-select"
            value={simulatedRole}
            onChange={(e) => setSimulatedRole(e.target.value as Role)}
            className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <Button data-testid="invite-member-button" data-ai-target="invite-member-button" disabled={!canManage} onClick={() => setModalOpen(true)}>
            + Invite member
          </Button>
        </div>
      </div>

      {!canManage && <PermissionDenied action="invite or remove team members" />}

      <Card className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-slate-200 text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {teamMembers.map((m) => (
              <tr key={m.id} data-testid={`team-row-${m.id}`} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={m.avatarUrl} alt="" className="h-7 w-7 rounded-full bg-slate-200" />
                    <span className="font-medium text-slate-800">{m.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-600">{m.email}</td>
                <td className="px-4 py-3">
                  <select
                    aria-label={`Change role for ${m.name}`}
                    data-testid={`member-role-select-${m.id}`}
                    data-ai-target="member-role-select"
                    value={m.role}
                    disabled={!canManage}
                    onChange={(e) => {
                      changeMemberRole(m.id, e.target.value as Role);
                      showToast("Member role updated.");
                    }}
                    className="rounded-md border border-slate-300 px-2 py-1 text-xs disabled:bg-slate-50 disabled:text-slate-400"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <Badge>{m.status}</Badge>
                </td>
                <td className="px-4 py-3">
                  <button
                    data-testid={`remove-member-${m.id}`}
                    data-ai-target="remove-member-button"
                    disabled={!canManage}
                    onClick={() => {
                      removeMember(m.id);
                      showToast("Team member removed.");
                    }}
                    className="text-sm font-medium text-red-600 hover:text-red-500 disabled:cursor-not-allowed disabled:text-slate-300"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Invite team member" testId="invite-member-modal">
        <form data-testid="invite-member-form" onSubmit={handleInvite} noValidate className="space-y-4">
          <Input id="invite-email" data-testid="invite-email-input" data-ai-target="invite-email-input" label="Email address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Select id="invite-role" data-testid="invite-role-input" data-ai-target="invite-role-input" label="Role" value={role} onChange={(e) => setRole(e.target.value as Role)}>
            {ROLES.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </Select>
          {error && (
            <p role="alert" data-testid="invite-member-error" className="text-sm font-medium text-red-600">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" data-testid="send-invite-submit" data-ai-target="send-invite-submit">
              Send invite
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export function TeamManager(props: { embedded?: boolean }) {
  return (
    <Suspense fallback={null}>
      <TeamManagerInner {...props} />
    </Suspense>
  );
}
