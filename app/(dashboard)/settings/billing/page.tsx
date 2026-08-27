"use client";
import { useState } from "react";
import { useFlowDeskStore } from "@/lib/store";
import { canManageBilling } from "@/lib/permissions";
import { SettingsShell } from "@/components/dashboard/SettingsShell";
import { Card, Badge, PermissionDenied } from "@/components/ui/Misc";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import type { Organization } from "@/lib/types";

const PLANS: { name: Organization["plan"]; price: string; features: string[] }[] = [
  { name: "Free", price: "$0/mo", features: ["Up to 2 projects", "3 team members", "Community support"] },
  { name: "Starter", price: "$29/mo", features: ["Up to 10 projects", "5 team members", "Email support"] },
  { name: "Pro", price: "$99/mo", features: ["Up to 20 projects", "15 team members", "Priority support"] },
  { name: "Enterprise", price: "Custom", features: ["Unlimited projects", "Unlimited team members", "Dedicated support"] },
];

export default function BillingSettingsPage() {
  const organization = useFlowDeskStore((s) => s.organization);
  const invoices = useFlowDeskStore((s) => s.invoices);
  const changePlan = useFlowDeskStore((s) => s.changePlan);
  const simulatedRole = useFlowDeskStore((s) => s.simulatedRole);
  const { showToast } = useToast();
  const canManage = canManageBilling(simulatedRole);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Organization["plan"]>(organization.plan);
  const [confirmStep, setConfirmStep] = useState(false);

  function openModal() {
    setSelectedPlan(organization.plan);
    setConfirmStep(false);
    setModalOpen(true);
  }

  function confirmChange() {
    const isUpgrade = PLANS.findIndex((p) => p.name === selectedPlan) > PLANS.findIndex((p) => p.name === organization.plan);
    changePlan(selectedPlan);
    showToast(`Plan ${isUpgrade ? "upgraded" : "changed"} to ${selectedPlan}.`);
    setModalOpen(false);
  }

  return (
    <SettingsShell title="Billing" description="Manage your subscription plan, payment method, and invoices.">
      {!canManage && <PermissionDenied action="change billing settings" />}

      <Card className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">Current plan</p>
            <p className="mt-1 text-xl font-semibold text-slate-900" data-testid="current-plan-name">{organization.plan}</p>
            <p className="mt-1 text-sm text-slate-500">Billed {organization.billingCycle.toLowerCase()}</p>
          </div>
          <Button data-testid="change-plan-button" data-ai-target="change-plan-button" disabled={!canManage} onClick={openModal}>
            Change plan
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-sm font-semibold text-slate-900">Payment method</h3>
        <div data-testid="payment-method-display" className="mt-3 flex items-center gap-3 rounded-lg border border-slate-200 px-4 py-3">
          <div className="flex h-8 w-12 items-center justify-center rounded bg-slate-800 text-[10px] font-bold text-white">VISA</div>
          <div>
            <p className="text-sm font-medium text-slate-800">•••• •••• •••• 4242</p>
            <p className="text-xs text-slate-500">Expires 08/2029 — display only, cannot be edited in this demo</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-sm font-semibold text-slate-900">Invoices</h3>
        <table className="mt-3 w-full text-left text-sm" data-testid="invoices-table">
          <thead className="border-b border-slate-200 text-slate-500">
            <tr>
              <th className="py-2 font-medium">Invoice</th>
              <th className="py-2 font-medium">Date</th>
              <th className="py-2 font-medium">Amount</th>
              <th className="py-2 font-medium">Status</th>
              <th className="py-2 font-medium" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {invoices.map((inv) => (
              <tr key={inv.id} data-testid={`invoice-row-${inv.id}`}>
                <td className="py-2.5 font-medium text-slate-800">{inv.number}</td>
                <td className="py-2.5 text-slate-600">{inv.date}</td>
                <td className="py-2.5 text-slate-600">${inv.amount.toFixed(2)}</td>
                <td className="py-2.5">
                  <Badge>{inv.status}</Badge>
                </td>
                <td className="py-2.5 text-right">
                  <a href="#" data-testid={`download-invoice-${inv.id}`} onClick={(e) => e.preventDefault()} className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                    Download
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Change plan" testId="change-plan-modal">
        {!confirmStep ? (
          <div className="space-y-3">
            {PLANS.map((p) => (
              <label
                key={p.name}
                data-testid={`plan-option-${p.name.toLowerCase()}`}
                className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 ${selectedPlan === p.name ? "border-indigo-500 ring-1 ring-indigo-200" : "border-slate-200"}`}
              >
                <input
                  type="radio"
                  name="plan"
                  value={p.name}
                  checked={selectedPlan === p.name}
                  onChange={() => setSelectedPlan(p.name)}
                  className="mt-1"
                  data-ai-target={`plan-radio-${p.name.toLowerCase()}`}
                />
                <div>
                  <p className="font-medium text-slate-800">{p.name} — {p.price}</p>
                  <ul className="mt-1 list-inside list-disc text-sm text-slate-500">
                    {p.features.map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                </div>
              </label>
            ))}
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button data-testid="continue-plan-change" onClick={() => setConfirmStep(true)} disabled={selectedPlan === organization.plan}>
                Continue
              </Button>
            </div>
          </div>
        ) : (
          <div data-testid="plan-change-confirmation">
            <p className="text-sm text-slate-600">
              Confirm switching from <strong>{organization.plan}</strong> to <strong>{selectedPlan}</strong>? This is a mocked billing change — no real payment will be charged.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setConfirmStep(false)}>
                Back
              </Button>
              <Button data-testid="confirm-plan-change" onClick={confirmChange}>
                Confirm {PLANS.findIndex((p) => p.name === selectedPlan) > PLANS.findIndex((p) => p.name === organization.plan) ? "upgrade" : "downgrade"}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </SettingsShell>
  );
}
