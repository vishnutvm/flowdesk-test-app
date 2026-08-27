"use client";
import { useState, FormEvent } from "react";
import { useFlowDeskStore } from "@/lib/store";
import { SettingsShell } from "@/components/dashboard/SettingsShell";
import { Card } from "@/components/ui/Misc";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";

const AVAILABLE_EVENTS = ["task.created", "task.updated", "project.created", "project.updated"];

export default function IntegrationsSettingsPage() {
  const integrations = useFlowDeskStore((s) => s.integrations);
  const toggleIntegration = useFlowDeskStore((s) => s.toggleIntegration);
  const apiKeys = useFlowDeskStore((s) => s.apiKeys);
  const generateApiKey = useFlowDeskStore((s) => s.generateApiKey);
  const revokeApiKey = useFlowDeskStore((s) => s.revokeApiKey);
  const webhooks = useFlowDeskStore((s) => s.webhooks);
  const addWebhook = useFlowDeskStore((s) => s.addWebhook);
  const removeWebhook = useFlowDeskStore((s) => s.removeWebhook);
  const { showToast } = useToast();

  const [keyModalOpen, setKeyModalOpen] = useState(false);
  const [keyName, setKeyName] = useState("");
  const [revealedKey, setRevealedKey] = useState<string | null>(null);

  const [webhookModalOpen, setWebhookModalOpen] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [webhookEvents, setWebhookEvents] = useState<string[]>(["task.created"]);
  const [webhookError, setWebhookError] = useState<string | null>(null);

  function handleGenerateKey(e: FormEvent) {
    e.preventDefault();
    const raw = generateApiKey(keyName);
    setRevealedKey(raw);
  }

  function closeKeyModal() {
    setKeyModalOpen(false);
    setKeyName("");
    setRevealedKey(null);
  }

  function handleAddWebhook(e: FormEvent) {
    e.preventDefault();
    const result = addWebhook(webhookUrl, webhookEvents);
    if (!result.ok) {
      setWebhookError(result.error ?? "Unable to add webhook.");
      return;
    }
    showToast("Webhook added.");
    setWebhookModalOpen(false);
    setWebhookUrl("");
    setWebhookEvents(["task.created"]);
    setWebhookError(null);
  }

  return (
    <SettingsShell title="Integrations" description="Connect FlowDesk with the tools your team already uses.">
      <Card className="divide-y divide-slate-100 p-2">
        <div className="flex items-center justify-between px-4 py-4">
          <div>
            <p className="text-sm font-medium text-slate-800">Slack</p>
            <p className="text-sm text-slate-500">Post project and task updates to a Slack channel.</p>
          </div>
          <Button
            data-testid="slack-connect-toggle"
            data-ai-target="slack-connect-toggle"
            variant={integrations.slack ? "outline" : "primary"}
            size="sm"
            onClick={() => {
              toggleIntegration("slack", !integrations.slack);
              showToast(integrations.slack ? "Slack disconnected." : "Slack connected.");
            }}
          >
            {integrations.slack ? "Disconnect" : "Connect"}
          </Button>
        </div>
        <div className="flex items-center justify-between px-4 py-4">
          <div>
            <p className="text-sm font-medium text-slate-800">Google Calendar</p>
            <p className="text-sm text-slate-500">Sync project due dates to your calendar.</p>
          </div>
          <Button
            data-testid="google-calendar-connect-toggle"
            data-ai-target="google-calendar-connect-toggle"
            variant={integrations.googleCalendar ? "outline" : "primary"}
            size="sm"
            onClick={() => {
              toggleIntegration("googleCalendar", !integrations.googleCalendar);
              showToast(integrations.googleCalendar ? "Google Calendar disconnected." : "Google Calendar connected.");
            }}
          >
            {integrations.googleCalendar ? "Disconnect" : "Connect"}
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">API keys</h3>
          <Button data-testid="generate-api-key-button" data-ai-target="generate-api-key-button" size="sm" onClick={() => setKeyModalOpen(true)}>
            Generate new key
          </Button>
        </div>
        <ul data-testid="api-keys-list" className="mt-3 divide-y divide-slate-100">
          {apiKeys.map((k) => (
            <li key={k.id} data-testid={`api-key-${k.id}`} className="flex items-center justify-between py-3 text-sm">
              <div>
                <p className="font-medium text-slate-800">{k.name}</p>
                <p className="font-mono text-xs text-slate-500">{k.maskedKey}</p>
                <p className="text-xs text-slate-400">Created {k.createdAt} · Last used {k.lastUsedAt ?? "never"}</p>
              </div>
              <button
                data-testid={`revoke-api-key-${k.id}`}
                onClick={() => {
                  revokeApiKey(k.id);
                  showToast("API key revoked.");
                }}
                className="text-sm font-medium text-red-600 hover:text-red-500"
              >
                Revoke
              </button>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">Webhooks</h3>
          <Button data-testid="add-webhook-button" data-ai-target="add-webhook-button" size="sm" onClick={() => setWebhookModalOpen(true)}>
            Add webhook
          </Button>
        </div>
        <ul data-testid="webhooks-list" className="mt-3 divide-y divide-slate-100">
          {webhooks.map((w) => (
            <li key={w.id} data-testid={`webhook-${w.id}`} className="flex items-center justify-between py-3 text-sm">
              <div>
                <p className="font-mono text-xs text-slate-700">{w.url}</p>
                <p className="text-xs text-slate-500">{w.events.join(", ")}</p>
              </div>
              <button
                data-testid={`remove-webhook-${w.id}`}
                onClick={() => {
                  removeWebhook(w.id);
                  showToast("Webhook removed.");
                }}
                className="text-sm font-medium text-red-600 hover:text-red-500"
              >
                Remove
              </button>
            </li>
          ))}
          {webhooks.length === 0 && <p className="py-3 text-sm text-slate-500">No webhooks configured.</p>}
        </ul>
      </Card>

      <Modal open={keyModalOpen} onClose={closeKeyModal} title="Generate API key" testId="generate-api-key-modal">
        {revealedKey ? (
          <div data-testid="revealed-api-key-container">
            <p className="text-sm text-slate-600">Copy this key now — you won&apos;t be able to see it again.</p>
            <div data-testid="revealed-api-key" className="mt-3 break-all rounded-lg bg-slate-100 p-3 font-mono text-xs text-slate-800">
              {revealedKey}
            </div>
            <div className="mt-6 flex justify-end">
              <Button data-testid="close-revealed-key" onClick={closeKeyModal}>
                Done
              </Button>
            </div>
          </div>
        ) : (
          <form data-testid="generate-api-key-form" onSubmit={handleGenerateKey} noValidate className="space-y-4">
            <Input id="api-key-name" data-testid="api-key-name-input" data-ai-target="api-key-name-input" label="Key name" value={keyName} onChange={(e) => setKeyName(e.target.value)} required />
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={closeKeyModal}>
                Cancel
              </Button>
              <Button type="submit" data-testid="confirm-generate-api-key" data-ai-target="confirm-generate-api-key">
                Generate key
              </Button>
            </div>
          </form>
        )}
      </Modal>

      <Modal open={webhookModalOpen} onClose={() => setWebhookModalOpen(false)} title="Add webhook" testId="add-webhook-modal">
        <form data-testid="add-webhook-form" onSubmit={handleAddWebhook} noValidate className="space-y-4">
          <Input
            id="webhook-url"
            data-testid="webhook-url-input"
            data-ai-target="webhook-url-input"
            label="Webhook URL"
            placeholder="https://example.com/webhook"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            required
          />
          <fieldset>
            <legend className="text-sm font-medium text-slate-700">Events</legend>
            <div className="mt-2 space-y-2">
              {AVAILABLE_EVENTS.map((evt) => (
                <label key={evt} className="flex items-center gap-2 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    data-testid={`webhook-event-${evt}`}
                    checked={webhookEvents.includes(evt)}
                    onChange={(e) => {
                      setWebhookEvents((prev) => (e.target.checked ? [...prev, evt] : prev.filter((x) => x !== evt)));
                    }}
                    className="h-4 w-4 rounded border-slate-300"
                  />
                  {evt}
                </label>
              ))}
            </div>
          </fieldset>
          {webhookError && (
            <p role="alert" data-testid="webhook-form-error" className="text-sm font-medium text-red-600">
              {webhookError}
            </p>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setWebhookModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" data-testid="confirm-add-webhook" data-ai-target="confirm-add-webhook">
              Add webhook
            </Button>
          </div>
        </form>
      </Modal>
    </SettingsShell>
  );
}
