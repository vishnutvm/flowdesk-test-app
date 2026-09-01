"use client";
import { useState, FormEvent } from "react";
import { useFlowDeskStore } from "@/lib/store";
import { Card, Badge, EmptyState, Skeleton, ErrorState } from "@/components/ui/Misc";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import type { CustomerStatus } from "@/lib/types";

const STATUSES: CustomerStatus[] = ["Lead", "Active", "Churned"];

export default function CustomersPage() {
  const customers = useFlowDeskStore((s) => s.customers);
  const createCustomer = useFlowDeskStore((s) => s.createCustomer);
  const deleteCustomer = useFlowDeskStore((s) => s.deleteCustomer);
  const dataLoaded = useFlowDeskStore((s) => s.dataLoaded);
  const dataError = useFlowDeskStore((s) => s.dataError);
  const initData = useFlowDeskStore((s) => s.initData);
  const { showToast } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<CustomerStatus>("Lead");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const result = await createCustomer({ name, company, email, status });
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error ?? "Unable to add customer.");
      return;
    }
    showToast("Customer added.");
    setModalOpen(false);
    setName("");
    setCompany("");
    setEmail("");
    setStatus("Lead");
    setError(null);
  }

  return (
    <div data-testid="customers-page" className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Customers</h1>
          <p className="mt-1 text-sm text-slate-500">Track the people and companies you work with.</p>
        </div>
        <Button data-testid="new-customer-button" data-ai-target="new-customer-button" disabled={!dataLoaded} onClick={() => setModalOpen(true)}>
          + New customer
        </Button>
      </div>

      {dataError ? (
        <ErrorState testId="customers-error-state" onRetry={() => initData()} />
      ) : !dataLoaded ? (
        <div data-testid="customers-loading" className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : customers.length === 0 ? (
        <EmptyState
          testId="customers-empty-state"
          title="No customers yet"
          description="Add your first customer to start tracking their account."
          action={
            <Button data-testid="empty-state-new-customer" onClick={() => setModalOpen(true)}>
              + New customer
            </Button>
          }
        />
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-slate-200 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Company</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {customers.map((c) => (
                <tr key={c.id} data-testid={`customer-row-${c.id}`} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">{c.name}</td>
                  <td className="px-4 py-3 text-slate-600">{c.company}</td>
                  <td className="px-4 py-3 text-slate-600">{c.email}</td>
                  <td className="px-4 py-3">
                    <Badge>{c.status}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      data-testid={`remove-customer-${c.id}`}
                      onClick={() => {
                        void deleteCustomer(c.id).then(() => showToast("Customer removed."));
                      }}
                      className="text-sm font-medium text-red-600 hover:text-red-500"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add customer" testId="new-customer-modal">
        <form data-testid="new-customer-form" onSubmit={handleCreate} noValidate className="space-y-4">
          <Input id="customer-name" data-testid="customer-name-input" data-ai-target="customer-name-input" label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input id="customer-company" data-testid="customer-company-input" data-ai-target="customer-company-input" label="Company" value={company} onChange={(e) => setCompany(e.target.value)} />
          <Input id="customer-email" data-testid="customer-email-input" data-ai-target="customer-email-input" label="Email address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Select id="customer-status" data-testid="customer-status-input" data-ai-target="customer-status-input" label="Status" value={status} onChange={(e) => setStatus(e.target.value as CustomerStatus)}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </Select>
          {error && (
            <p role="alert" data-testid="customer-form-error" className="text-sm font-medium text-red-600">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" data-testid="create-customer-submit" data-ai-target="create-customer-submit" isLoading={submitting}>
              Add customer
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
