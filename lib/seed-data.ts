// Deterministic seed data for FlowDesk. Not randomized — every id, date and value
// is fixed so E2E tests and an external AI chatbot see stable, repeatable content.
import type {
  User,
  Organization,
  TeamMember,
  Project,
  Task,
  Customer,
  AppNotification,
  Invoice,
  ApiKey,
  Webhook,
  LoginHistoryEntry,
  ActiveSession,
  IntegrationState,
  NotificationPrefs,
} from "./types";

export const DEMO_EMAIL = "demo@flowdesk.test";
export const DEMO_PASSWORD = "Demo@12345";

export const seedUser: User = {
  id: "user-1",
  name: "Jordan Blake",
  email: DEMO_EMAIL,
  avatarUrl: "https://api.dicebear.com/9.x/initials/svg?seed=Jordan%20Blake&backgroundColor=4f46e5",
  timezone: "America/New_York",
  role: "Owner",
};

export const seedOrganization: Organization = {
  id: "org-1",
  name: "Flowdesk Labs",
  plan: "Pro",
  billingCycle: "Monthly",
};

export const seedTeamMembers: TeamMember[] = [
  {
    id: "user-1",
    name: "Jordan Blake",
    email: DEMO_EMAIL,
    role: "Owner",
    avatarUrl: "https://api.dicebear.com/9.x/initials/svg?seed=Jordan%20Blake&backgroundColor=4f46e5",
    status: "Active",
    joinedAt: "2024-01-10",
  },
  {
    id: "user-2",
    name: "Priya Nair",
    email: "priya.nair@flowdesk.test",
    role: "Admin",
    avatarUrl: "https://api.dicebear.com/9.x/initials/svg?seed=Priya%20Nair&backgroundColor=0891b2",
    status: "Active",
    joinedAt: "2024-02-03",
  },
  {
    id: "user-3",
    name: "Marcus Chen",
    email: "marcus.chen@flowdesk.test",
    role: "Member",
    avatarUrl: "https://api.dicebear.com/9.x/initials/svg?seed=Marcus%20Chen&backgroundColor=16a34a",
    status: "Active",
    joinedAt: "2024-03-14",
  },
  {
    id: "user-4",
    name: "Elena Rodriguez",
    email: "elena.rodriguez@flowdesk.test",
    role: "Member",
    avatarUrl: "https://api.dicebear.com/9.x/initials/svg?seed=Elena%20Rodriguez&backgroundColor=ea580c",
    status: "Active",
    joinedAt: "2024-04-22",
  },
  {
    id: "user-5",
    name: "Sam Whitfield",
    email: "sam.whitfield@flowdesk.test",
    role: "Viewer",
    avatarUrl: "https://api.dicebear.com/9.x/initials/svg?seed=Sam%20Whitfield&backgroundColor=64748b",
    status: "Invited",
    joinedAt: "2024-05-30",
  },
];

export const seedProjects: Project[] = [
  { id: "proj-1", name: "Atlas Website Redesign", description: "Full redesign of the marketing site and blog.", status: "Active", ownerId: "user-1", progress: 62, dueDate: "2026-09-30", createdAt: "2026-05-01" },
  { id: "proj-2", name: "Nimbus Mobile App", description: "Native iOS and Android companion app.", status: "Active", ownerId: "user-2", progress: 41, dueDate: "2026-10-15", createdAt: "2026-04-12" },
  { id: "proj-3", name: "Q3 Customer Onboarding", description: "Streamline onboarding flow for new customers.", status: "Planning", ownerId: "user-1", progress: 8, dueDate: "2026-11-01", createdAt: "2026-07-01" },
  { id: "proj-4", name: "Internal Analytics Dashboard", description: "Company-wide KPI dashboard for leadership.", status: "Active", ownerId: "user-3", progress: 74, dueDate: "2026-09-05", createdAt: "2026-03-18" },
  { id: "proj-5", name: "Legacy API Migration", description: "Migrate v1 API consumers to v2.", status: "Completed", ownerId: "user-2", progress: 100, dueDate: "2026-06-30", createdAt: "2026-01-15" },
  { id: "proj-6", name: "Support Center Revamp", description: "Rebuild the public help center.", status: "Planning", ownerId: "user-4", progress: 5, dueDate: "2026-12-01", createdAt: "2026-08-01" },
  { id: "proj-7", name: "Vendor Security Audit", description: "Annual third-party vendor security review.", status: "Archived", ownerId: "user-1", progress: 100, dueDate: "2026-02-28", createdAt: "2025-12-01" },
  { id: "proj-8", name: "Growth Experiments Q3", description: "Pricing page and signup funnel experiments.", status: "Active", ownerId: "user-3", progress: 33, dueDate: "2026-09-20", createdAt: "2026-07-10" },
];

function t(id: string, projectId: string, title: string, description: string, status: Task["status"], priority: Task["priority"], assigneeId: string | null, dueDate: string, createdAt: string): Task {
  return { id, projectId, title, description, status, priority, assigneeId, dueDate, createdAt };
}

export const seedTasks: Task[] = [
  t("task-1", "proj-1", "Design new homepage hero", "Create hi-fi mockups for the homepage hero section.", "Completed", "High", "user-4", "2026-07-10", "2026-05-02"),
  t("task-2", "proj-1", "Build responsive nav component", "Implement the new mega-menu navigation.", "In Progress", "High", "user-3", "2026-08-30", "2026-05-05"),
  t("task-3", "proj-1", "Write homepage copy", "Draft and finalize homepage copy with marketing.", "Review", "Medium", "user-2", "2026-08-28", "2026-05-06"),
  t("task-4", "proj-1", "Set up Cloudflare CDN", "Configure caching rules for static assets.", "Todo", "Low", null, "2026-09-10", "2026-05-10"),
  t("task-5", "proj-1", "QA cross-browser testing", "Test on Safari, Firefox, Edge, Chrome.", "Todo", "Medium", "user-1", "2026-09-20", "2026-05-12"),
  t("task-6", "proj-2", "Define app navigation architecture", "Plan tab bar and stack navigation.", "Completed", "High", "user-2", "2026-06-01", "2026-04-13"),
  t("task-7", "proj-2", "Implement push notifications", "Wire up push notification service.", "In Progress", "Urgent", "user-3", "2026-09-01", "2026-04-20"),
  t("task-8", "proj-2", "Build offline sync", "Local cache with background sync on reconnect.", "In Progress", "High", "user-4", "2026-09-15", "2026-04-25"),
  t("task-9", "proj-2", "App Store listing assets", "Screenshots, icon, and description copy.", "Todo", "Medium", "user-5", "2026-10-01", "2026-05-01"),
  t("task-10", "proj-2", "Beta TestFlight rollout", "Ship beta build to 50 testers.", "Todo", "Medium", "user-2", "2026-10-05", "2026-05-03"),
  t("task-11", "proj-3", "Interview 5 recent signups", "Understand onboarding drop-off points.", "In Progress", "High", "user-1", "2026-08-15", "2026-07-02"),
  t("task-12", "proj-3", "Draft onboarding checklist UI", "Wireframe the in-app checklist widget.", "Todo", "Medium", "user-4", "2026-08-25", "2026-07-05"),
  t("task-13", "proj-3", "Define activation metric", "Agree on the north-star activation event.", "Todo", "High", "user-1", "2026-08-20", "2026-07-06"),
  t("task-14", "proj-4", "Build revenue chart widget", "Line chart with MRR trend.", "Completed", "High", "user-3", "2026-07-01", "2026-03-19"),
  t("task-15", "proj-4", "Build churn cohort table", "Cohort retention table by signup month.", "In Progress", "Medium", "user-3", "2026-09-01", "2026-03-25"),
  t("task-16", "proj-4", "Add CSV export", "Export any dashboard table to CSV.", "Review", "Low", "user-2", "2026-08-29", "2026-04-01"),
  t("task-17", "proj-4", "Set up role-based dashboard access", "Restrict finance views to Admin/Owner.", "Todo", "High", "user-1", "2026-09-05", "2026-04-05"),
  t("task-18", "proj-5", "Deprecate v1 auth endpoints", "Sunset old auth routes after migration.", "Completed", "Urgent", "user-2", "2026-06-15", "2026-01-16"),
  t("task-19", "proj-5", "Migrate webhook consumers", "Move all webhook subscribers to v2 payloads.", "Completed", "High", "user-3", "2026-06-20", "2026-01-20"),
  t("task-20", "proj-5", "Update SDK documentation", "Refresh public API docs for v2.", "Completed", "Medium", "user-4", "2026-06-25", "2026-01-25"),
  t("task-21", "proj-6", "Audit existing help articles", "Catalogue and tag all current articles.", "Todo", "Medium", "user-4", "2026-08-20", "2026-08-02"),
  t("task-22", "proj-6", "Design new article template", "Improve readability and add table of contents.", "Todo", "Low", "user-4", "2026-09-01", "2026-08-05"),
  t("task-23", "proj-6", "Plan search indexing", "Evaluate search providers for help center.", "Todo", "Medium", "user-3", "2026-09-10", "2026-08-06"),
  t("task-24", "proj-7", "Review vendor access logs", "Audit third-party access to production data.", "Completed", "Urgent", "user-1", "2026-02-10", "2025-12-02"),
  t("task-25", "proj-7", "Rotate shared credentials", "Rotate all shared vendor API keys.", "Completed", "High", "user-2", "2026-02-15", "2025-12-05"),
  t("task-26", "proj-8", "Launch pricing page A/B test", "Two-variant test on annual discount framing.", "In Progress", "High", "user-3", "2026-09-01", "2026-07-11"),
  t("task-27", "proj-8", "Instrument funnel analytics", "Track signup funnel drop-off per step.", "In Progress", "Medium", "user-2", "2026-09-05", "2026-07-12"),
  t("task-28", "proj-8", "Draft trial-extension email", "Lifecycle email for trial users at day 10.", "Todo", "Low", "user-4", "2026-09-12", "2026-07-15"),
  t("task-29", "proj-8", "Review experiment results", "Weekly readout of active experiments.", "Todo", "Medium", "user-1", "2026-09-25", "2026-07-18"),
  t("task-30", "proj-3", "Set up analytics dashboard for onboarding", "Track activation funnel in analytics tool.", "Todo", "Medium", "user-3", "2026-09-01", "2026-07-08"),
  t("task-31", "proj-1", "Accessibility audit", "WCAG 2.1 AA audit of the new site.", "Todo", "High", "user-4", "2026-09-15", "2026-05-15"),
  t("task-32", "proj-2", "Crash reporting integration", "Wire up crash + error reporting SDK.", "Completed", "Medium", "user-3", "2026-06-10", "2026-04-15"),
];

export const seedCustomers: Customer[] = [
  { id: "cust-1", name: "Alicia Fernandez", company: "Brightpath Logistics", email: "alicia@brightpathlogistics.com", status: "Active", createdAt: "2026-02-14" },
  { id: "cust-2", name: "Tom Reilly", company: "Northwind Supply Co.", email: "tom.reilly@northwindsupply.com", status: "Active", createdAt: "2026-03-01" },
  { id: "cust-3", name: "Grace Okafor", company: "Solarion Energy", email: "grace.okafor@solarion.io", status: "Lead", createdAt: "2026-06-20" },
  { id: "cust-4", name: "David Kim", company: "Kim & Partners", email: "david@kimpartners.legal", status: "Active", createdAt: "2026-01-09" },
  { id: "cust-5", name: "Renee Dubois", company: "Maison Digital", email: "renee@maisondigital.fr", status: "Churned", createdAt: "2025-11-11" },
  { id: "cust-6", name: "Hassan Ali", company: "Delta Freight Group", email: "hassan.ali@deltafreight.com", status: "Active", createdAt: "2026-04-18" },
  { id: "cust-7", name: "Mei Lin", company: "Chorus Studio", email: "mei@chorusstudio.co", status: "Lead", createdAt: "2026-07-25" },
  { id: "cust-8", name: "Oliver Brandt", company: "Vantage Retail", email: "oliver.brandt@vantageretail.de", status: "Active", createdAt: "2026-02-28" },
];

export const seedNotifications: AppNotification[] = [
  { id: "notif-1", type: "task", title: "Task assigned to you", message: "\"QA cross-browser testing\" was assigned to you in Atlas Website Redesign.", read: false, createdAt: "2026-08-25T14:12:00Z" },
  { id: "notif-2", type: "project", title: "Project due soon", message: "Internal Analytics Dashboard is due in 10 days.", read: false, createdAt: "2026-08-25T09:00:00Z" },
  { id: "notif-3", type: "team", title: "New team member invited", message: "Sam Whitfield was invited as a Viewer.", read: false, createdAt: "2026-08-24T17:45:00Z" },
  { id: "notif-4", type: "billing", title: "Invoice paid", message: "Your invoice #INV-2026-0007 was paid successfully.", read: true, createdAt: "2026-08-20T11:30:00Z" },
  { id: "notif-5", type: "task", title: "Task moved to Review", message: "\"Write homepage copy\" moved to Review.", read: true, createdAt: "2026-08-19T08:05:00Z" },
  { id: "notif-6", type: "system", title: "Scheduled maintenance", message: "FlowDesk will undergo maintenance on Sept 1, 2026 at 2:00 AM UTC.", read: true, createdAt: "2026-08-15T12:00:00Z" },
  { id: "notif-7", type: "project", title: "Project completed", message: "Legacy API Migration was marked Completed.", read: true, createdAt: "2026-07-25T16:20:00Z" },
];

export const seedInvoices: Invoice[] = [
  { id: "inv-1", number: "INV-2026-0007", date: "2026-08-01", amount: 99, status: "Paid" },
  { id: "inv-2", number: "INV-2026-0006", date: "2026-07-01", amount: 99, status: "Paid" },
  { id: "inv-3", number: "INV-2026-0005", date: "2026-06-01", amount: 99, status: "Paid" },
  { id: "inv-4", number: "INV-2026-0004", date: "2026-05-01", amount: 49, status: "Paid" },
  { id: "inv-5", number: "INV-2026-0003", date: "2026-04-01", amount: 49, status: "Paid" },
];

export const seedApiKeys: ApiKey[] = [
  { id: "key-1", name: "Production Server", maskedKey: "fd_live_••••••••••••ax92", createdAt: "2026-06-01", lastUsedAt: "2026-08-24" },
  { id: "key-2", name: "Staging", maskedKey: "fd_test_••••••••••••q71c", createdAt: "2026-06-15", lastUsedAt: "2026-08-10" },
];

export const seedWebhooks: Webhook[] = [
  { id: "wh-1", url: "https://hooks.example.com/flowdesk/tasks", events: ["task.created", "task.updated"], active: true, createdAt: "2026-05-10" },
];

export const seedLoginHistory: LoginHistoryEntry[] = [
  { id: "lh-1", device: "Chrome on Windows", location: "New York, US", ip: "203.0.113.24", at: "2026-08-25T13:02:00Z", success: true },
  { id: "lh-2", device: "Safari on iPhone", location: "New York, US", ip: "203.0.113.55", at: "2026-08-24T08:44:00Z", success: true },
  { id: "lh-3", device: "Chrome on Windows", location: "Unknown", ip: "198.51.100.7", at: "2026-08-20T02:15:00Z", success: false },
];

export const seedActiveSessions: ActiveSession[] = [
  { id: "sess-1", device: "Chrome on Windows", location: "New York, US", lastActive: "2026-08-26T10:00:00Z", current: true },
  { id: "sess-2", device: "Safari on iPhone", location: "New York, US", lastActive: "2026-08-24T08:44:00Z", current: false },
];

export const seedIntegrations: IntegrationState = {
  slack: true,
  googleCalendar: false,
};

export const seedNotificationPrefs: NotificationPrefs = {
  email: true,
  push: true,
  taskUpdates: true,
  weeklyReport: false,
};
