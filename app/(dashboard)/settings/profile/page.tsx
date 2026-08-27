"use client";
import { useState, FormEvent } from "react";
import { useFlowDeskStore } from "@/lib/store";
import { SettingsShell } from "@/components/dashboard/SettingsShell";
import { Card } from "@/components/ui/Misc";
import { Input, Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

const TIMEZONES = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "UTC",
  "Europe/London",
  "Europe/Berlin",
  "Asia/Kolkata",
  "Asia/Singapore",
  "Australia/Sydney",
];

export default function ProfileSettingsPage() {
  const currentUser = useFlowDeskStore((s) => s.currentUser);
  const updateProfile = useFlowDeskStore((s) => s.updateProfile);
  const simulateSaveFailure = useFlowDeskStore((s) => s.simulateSaveFailure);
  const setSimulateSaveFailure = useFlowDeskStore((s) => s.setSimulateSaveFailure);
  const { showToast } = useToast();

  const [name, setName] = useState(currentUser?.name ?? "");
  const [email, setEmail] = useState(currentUser?.email ?? "");
  const [timezone, setTimezone] = useState(currentUser?.timezone ?? "UTC");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSaving(true);
    setTimeout(() => {
      const result = updateProfile({ name, email, timezone });
      setIsSaving(false);
      if (!result.ok) {
        setError(result.error ?? "Could not save changes.");
        return;
      }
      showToast("Profile updated successfully.");
    }, 350);
  }

  return (
    <SettingsShell title="Profile" description="Update your personal information and how you appear to your team.">
      <Card className="p-6">
        <div className="flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img data-testid="profile-avatar-preview" src={currentUser?.avatarUrl} alt="" className="h-16 w-16 rounded-full bg-slate-200" />
          <div>
            <p className="text-sm font-medium text-slate-800">Profile photo</p>
            <p className="text-xs text-slate-500">Generated automatically from your name in this demo.</p>
          </div>
        </div>

        <form data-testid="profile-form" onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
          <Input
            id="profile-name"
            data-testid="profile-name-input"
            data-ai-target="profile-name-input"
            label="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            id="profile-email"
            data-testid="profile-email-input"
            data-ai-target="profile-email-input"
            label="Email address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Select
            id="profile-timezone"
            data-testid="profile-timezone-input"
            data-ai-target="profile-timezone-input"
            label="Timezone"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
          >
            {TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>{tz}</option>
            ))}
          </Select>

          <label className="flex items-center gap-2 text-xs text-slate-500">
            <input
              type="checkbox"
              data-testid="simulate-save-failure-toggle"
              data-ai-target="simulate-save-failure-toggle"
              checked={simulateSaveFailure}
              onChange={(e) => setSimulateSaveFailure(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300"
            />
            Simulate save failure (for testing error states)
          </label>

          {error && (
            <p role="alert" data-testid="profile-form-error" className="text-sm font-medium text-red-600">
              {error}
            </p>
          )}

          <div className="flex justify-end pt-2">
            <Button type="submit" data-testid="save-profile-button" data-ai-target="save-profile-button" isLoading={isSaving}>
              Save changes
            </Button>
          </div>
        </form>
      </Card>
    </SettingsShell>
  );
}
