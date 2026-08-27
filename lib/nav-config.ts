export interface NavItem {
  label: string;
  href: string;
  aiTarget: string;
  testId: string;
}

export const primaryNav: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", aiTarget: "sidebar-dashboard", testId: "nav-dashboard" },
  { label: "Projects", href: "/projects", aiTarget: "sidebar-projects", testId: "nav-projects" },
  { label: "Tasks", href: "/tasks", aiTarget: "sidebar-tasks", testId: "nav-tasks" },
  { label: "Team", href: "/team", aiTarget: "sidebar-team", testId: "nav-team" },
  { label: "Customers", href: "/customers", aiTarget: "sidebar-customers", testId: "nav-customers" },
  { label: "Notifications", href: "/notifications", aiTarget: "sidebar-notifications", testId: "nav-notifications" },
];

export const secondaryNav: NavItem[] = [
  { label: "Settings", href: "/settings/profile", aiTarget: "sidebar-settings", testId: "nav-settings" },
  { label: "Help & Docs", href: "/help", aiTarget: "sidebar-help", testId: "nav-help" },
];

export const settingsNav: NavItem[] = [
  { label: "Profile", href: "/settings/profile", aiTarget: "settings-profile", testId: "settings-nav-profile" },
  { label: "Security", href: "/settings/security", aiTarget: "settings-security", testId: "settings-nav-security" },
  { label: "Notifications", href: "/settings/notifications", aiTarget: "settings-notifications", testId: "settings-nav-notifications" },
  { label: "Billing", href: "/settings/billing", aiTarget: "settings-billing", testId: "settings-nav-billing" },
  { label: "Team", href: "/settings/team", aiTarget: "settings-team", testId: "settings-nav-team" },
  { label: "Integrations", href: "/settings/integrations", aiTarget: "settings-integrations", testId: "settings-nav-integrations" },
];
