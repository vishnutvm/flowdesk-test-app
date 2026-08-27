import { SettingsShell } from "@/components/dashboard/SettingsShell";
import { TeamManager } from "@/components/dashboard/TeamManager";

export default function SettingsTeamPage() {
  return (
    <SettingsShell title="Team" description="Invite teammates and manage roles for your organization.">
      <TeamManager embedded />
    </SettingsShell>
  );
}
