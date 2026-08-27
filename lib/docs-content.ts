export interface DocArticle {
  slug: string;
  title: string;
  category: string;
  summary: string;
  body: string[];
  relatedPath: string;
}

// 15 help-center articles. Each article's steps intentionally match the
// real UI exactly (same labels, same routes, same data-testid/data-ai-target
// names used in the app) so an external AI chatbot can answer questions from
// this content and then guide a user to the matching UI element.
export const docArticles: DocArticle[] = [
  {
    slug: "change-password",
    title: "How to change your password",
    category: "Account & Security",
    summary: "Update your account password from Settings > Security.",
    relatedPath: "/settings/security",
    body: [
      "You can change your FlowDesk password at any time from Settings > Security. This is the recommended way to rotate your password periodically or after you suspect your account may have been compromised.",
      "To change your password: open the sidebar and select Settings, then choose the Security tab (or go directly to /settings/security). Under the \"Change password\" section, enter your current password, then your new password, then confirm the new password in the third field.",
      "Your new password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character. If the two new password fields do not match, or the current password is incorrect, FlowDesk will show an inline error and will not save the change.",
      "Once the form validates, click \"Save password\". You will see a confirmation toast and the fields will clear. FlowDesk does not email you a confirmation in this demo environment — the change takes effect immediately for the current session.",
      "If you cannot remember your current password at all, use the \"Forgot password\" link on the login page instead, which sends you through a reset flow via /forgot-password and /reset-password.",
    ],
  },
  {
    slug: "update-profile",
    title: "How to update your profile",
    category: "Account & Security",
    summary: "Edit your name, email, avatar and timezone from Settings > Profile.",
    relatedPath: "/settings/profile",
    body: [
      "Your profile controls the name and avatar shown throughout FlowDesk, including on tasks assigned to you and in the team directory.",
      "Go to Settings > Profile (/settings/profile). You'll see fields for Full name, Email address, Avatar, and Timezone.",
      "Update the Full name field to change your display name, or the Email field to change your login email (this must be a valid email address). Choose your Timezone from the dropdown so due dates and activity timestamps display correctly for you.",
      "Click \"Save changes\" to apply the update. A success toast confirms the save. If the save fails (for example, due to a simulated network issue), you'll see an inline error and your previous profile values remain unchanged.",
      "Profile changes are scoped to your current session in this demo app and are stored locally in your browser, not on a real server.",
    ],
  },
  {
    slug: "invite-team-members",
    title: "How to invite team members",
    category: "Team Management",
    summary: "Invite new teammates by email and assign them a role.",
    relatedPath: "/team",
    body: [
      "Owners and Admins can invite new people to the organization from the Team page (/team) or from Settings > Team (/settings/team) — both show the same team list.",
      "Click the \"Invite member\" button to open the invite dialog. Enter the person's email address and choose a role: Owner, Admin, Member, or Viewer.",
      "Click \"Send invite\". FlowDesk validates that the email is well-formed and that the person isn't already a member. The new teammate appears immediately in the team list with an \"Invited\" status badge — no real email is sent in this demo environment.",
      "If you are signed in as a Viewer, the Invite member button is disabled and a permission-denied message explains that only Owners and Admins can invite people.",
      "You can change a pending invitee's role at any time from the role dropdown next to their name, or remove the invite entirely with the Remove action.",
    ],
  },
  {
    slug: "create-project",
    title: "How to create a project",
    category: "Projects",
    summary: "Start a new project with a name, description, status and due date.",
    relatedPath: "/projects",
    body: [
      "Projects organize related tasks and give you a place to track overall progress and deadlines.",
      "From the Projects page (/projects), click \"New project\" to open the creation form. Fill in the Project name (at least 3 characters), an optional Description, a Status (Planning, Active, Completed, or Archived), and a Due date.",
      "Click \"Create project\". FlowDesk validates the name length and requires a due date; if either is missing or invalid, you'll see an inline error next to the relevant field and the project will not be created.",
      "On success, the new project appears at the top of the project list with 0% progress and you're shown a confirmation toast. Click into the project to start adding tasks.",
      "You can edit a project's name, description, status, or due date at any time from the project detail page, and delete a project (which also removes its tasks) from the same page.",
    ],
  },
  {
    slug: "create-task",
    title: "How to create a task",
    category: "Tasks",
    summary: "Add a task to a project with priority, assignee, and due date.",
    relatedPath: "/tasks",
    body: [
      "Tasks are the unit of work in FlowDesk and always belong to a project.",
      "From the Tasks page (/tasks) or from within a specific project's detail page, click \"New task\" to open the task form. Choose the Project the task belongs to, enter a Title and optional Description, then set Status, Priority, Assignee, and Due date.",
      "Status options are Todo, In Progress, Review, and Completed. Priority options are Low, Medium, High, and Urgent.",
      "Click \"Create task\". A title and a due date are required — if either is missing, FlowDesk shows an inline validation error and does not create the task.",
      "The new task appears in the task list and on its parent project's task table. You can filter the Tasks page by project, status, priority, or assignee using the filter controls above the table.",
    ],
  },
  {
    slug: "change-task-status",
    title: "How to change a task's status",
    category: "Tasks",
    summary: "Move a task between Todo, In Progress, Review, and Completed.",
    relatedPath: "/tasks",
    body: [
      "Task status reflects where a piece of work stands: Todo, In Progress, Review, or Completed.",
      "Open the task from the Tasks list or from a project's task table to reach its detail page (/tasks/[id]). Use the Status dropdown near the top of the page to pick the new status.",
      "The change saves automatically and the task's status badge updates immediately, both on the detail page and everywhere else the task appears (project view, task list).",
      "You can also change status inline from the Tasks list using the status control in each row, without opening the task detail page.",
      "There are no restrictions on which status transitions are allowed — you can move a task from Completed back to In Progress if it needs more work, for example.",
    ],
  },
  {
    slug: "assign-task",
    title: "How to assign a task",
    category: "Tasks",
    summary: "Set or change who is responsible for a task.",
    relatedPath: "/tasks",
    body: [
      "Every task has an Assignee field that can be set to any active team member, or left unassigned.",
      "On the task detail page (/tasks/[id]), use the Assignee dropdown to choose a team member from your organization. Selecting \"Unassigned\" clears the assignee.",
      "You can also set the assignee when first creating the task, using the same Assignee field in the New task form.",
      "The assigned person will see the task reflected in their view of Tasks, and assigning a task creates an entry in the Notifications feed (in a real deployment this would notify the assignee; in this demo it's reflected in the in-app Notifications list).",
      "Only one person can be assigned to a task at a time in FlowDesk; there is no multi-assignee support.",
    ],
  },
  {
    slug: "upgrade-subscription",
    title: "How to upgrade your subscription",
    category: "Billing",
    summary: "Change your plan from Settings > Billing.",
    relatedPath: "/settings/billing",
    body: [
      "Go to Settings > Billing (/settings/billing) to see your current plan, billing cycle, and payment method.",
      "Click \"Change plan\" to open the plan selection dialog. Choose from Free, Starter, Pro, or Enterprise, and review the price and feature differences shown for each tier.",
      "Click \"Confirm upgrade\" (or \"Confirm downgrade\" if moving to a lower tier) to complete the change. A confirmation step summarizes the new plan before you finalize it.",
      "Your Billing page updates immediately to reflect the new plan. No real payment is processed in this demo — the payment method shown is a mocked card on file and cannot be edited to a real card.",
      "Only Owners and Admins can change the subscription plan; Members and Viewers will see the Change plan action disabled.",
    ],
  },
  {
    slug: "how-billing-works",
    title: "How billing works",
    category: "Billing",
    summary: "Understand plans, billing cycles, and invoices.",
    relatedPath: "/settings/billing",
    body: [
      "FlowDesk offers four plans: Free, Starter, Pro, and Enterprise, each with increasing limits on projects, team members, and storage.",
      "Your organization is billed on a Monthly or Annual cycle, shown on the Billing page. Annual billing is typically discounted compared to paying monthly.",
      "Each billing period generates an invoice, listed in the Invoices table on the Billing page with its date, amount, and status (Paid or Due). Click an invoice's link to view (a mock) PDF.",
      "The payment method on file is shown as a masked card for reference only; this demo environment does not collect or process real card details anywhere in the product.",
      "If a payment fails in a real deployment, the organization would see a Due invoice and a banner prompting an update to the payment method — FlowDesk's billing page structure mirrors that pattern even though no real charge occurs here.",
    ],
  },
  {
    slug: "configure-notifications",
    title: "How to configure notifications",
    category: "Notifications",
    summary: "Control which notifications you receive from Settings > Notifications.",
    relatedPath: "/settings/notifications",
    body: [
      "Go to Settings > Notifications (/settings/notifications) to control what FlowDesk notifies you about.",
      "You can toggle Email notifications and Push notifications independently, plus two content-specific toggles: Task updates (assignment, status changes) and Weekly report (a digest summary).",
      "Toggling a switch saves immediately — there is no separate save button. Each toggle shows its current state clearly (on/off) and is operable with the keyboard as well as the mouse.",
      "These preferences only affect this demo account's stored settings; no real emails or push notifications are ever sent by FlowDesk.",
      "You can also review unread notifications directly in the product from the Notifications page (/notifications), independent of these delivery preferences.",
    ],
  },
  {
    slug: "enable-2fa",
    title: "How to enable two-factor authentication (2FA)",
    category: "Account & Security",
    summary: "Add an extra layer of security to your account.",
    relatedPath: "/settings/security",
    body: [
      "Two-factor authentication (2FA) adds a second verification step at login, in addition to your password.",
      "Go to Settings > Security (/settings/security) and locate the \"Two-factor authentication\" section. Toggle it on to enable 2FA for your account.",
      "In this demo environment, enabling 2FA is mocked — toggling it on immediately marks 2FA as enabled without requiring a real authenticator app or SMS code, and the toggle state persists for your session.",
      "The same Security page also shows your Active sessions (devices currently signed in) and a Login history log, so you can review recent access to your account.",
      "You can turn 2FA off again at any time using the same toggle.",
    ],
  },
  {
    slug: "configure-integrations",
    title: "How to configure integrations",
    category: "Integrations",
    summary: "Connect Slack and Google Calendar from Settings > Integrations.",
    relatedPath: "/settings/integrations",
    body: [
      "Go to Settings > Integrations (/settings/integrations) to connect FlowDesk with other tools.",
      "Slack and Google Calendar are shown as toggle cards. Click \"Connect\" on a card to enable that integration (mocked — no real OAuth flow occurs), or \"Disconnect\" to remove it.",
      "The same page also hosts API keys and Webhooks management further down — see the related articles \"How to create API keys\" and \"How to configure webhooks\" for details on those sections.",
      "Integration state is saved instantly when you toggle a connection; a confirmation toast appears after each change.",
      "In a real deployment, connecting Slack would let FlowDesk post task and project updates to a chosen channel, and connecting Google Calendar would sync project due dates — this demo only models the on/off state.",
    ],
  },
  {
    slug: "create-api-keys",
    title: "How to create API keys",
    category: "Integrations",
    summary: "Generate a key to authenticate API requests.",
    relatedPath: "/settings/integrations",
    body: [
      "API keys let external tools authenticate to FlowDesk's API. Manage them from Settings > Integrations (/settings/integrations), in the \"API keys\" section.",
      "Click \"Generate new key\", give it a descriptive Name (for example, \"Production Server\"), and confirm. FlowDesk shows the full key value exactly once in a dialog — copy it now, because only a masked version (e.g. fd_live_••••••••••••ax92) is shown afterward in the list.",
      "Each key in the list shows its name, masked value, creation date, and last-used date. Use \"Revoke\" next to a key to permanently disable it; revoked keys are removed from the list immediately.",
      "Treat API keys like passwords: anyone with the key can act as your organization through the API. If a key is exposed, revoke it and generate a new one.",
      "This demo does not have a real API behind these keys — the flow demonstrates the UI and validation only.",
    ],
  },
  {
    slug: "configure-webhooks",
    title: "How to configure webhooks",
    category: "Integrations",
    summary: "Send event notifications to an external URL.",
    relatedPath: "/settings/integrations",
    body: [
      "Webhooks let FlowDesk notify an external system when events happen, such as a task being created or updated. Manage them from Settings > Integrations, in the \"Webhooks\" section.",
      "Click \"Add webhook\", enter a destination URL starting with http:// or https://, and select which events should trigger it (for example, task.created, task.updated).",
      "Click \"Add\" to save. FlowDesk validates that the URL is well-formed; an invalid URL shows an inline error and the webhook is not saved.",
      "Each configured webhook is listed with its URL, subscribed events, and an active/inactive state. Use \"Remove\" to delete a webhook you no longer need.",
      "In this demo, no requests are actually sent to the configured URL — the feature demonstrates configuration and validation only.",
    ],
  },
  {
    slug: "manage-team-roles",
    title: "How to manage team roles",
    category: "Team Management",
    summary: "Understand and change what each role (Owner, Admin, Member, Viewer) can do.",
    relatedPath: "/settings/team",
    body: [
      "FlowDesk has four roles: Owner, Admin, Member, and Viewer, each with different permissions.",
      "Owner has full control, including billing and team management, and there is typically one Owner per organization. Admin can manage the team, projects, and integrations, but has limited billing control. Member can create and edit projects, tasks, and customers. Viewer has read-only access and cannot create, edit, invite, or change settings.",
      "To change a team member's role, go to Team (/team) or Settings > Team (/settings/team), find their row, and choose a new role from the dropdown next to their name. The change applies immediately.",
      "Actions that require Admin or Owner (like inviting members, removing members, or changing billing) are disabled for Members and Viewers, and FlowDesk shows a clear \"Permission required\" message if a restricted action is attempted.",
      "Only an Owner can transfer ownership or remove another Owner in a real deployment; this demo models role assignment but keeps a single fixed Owner for the seeded account.",
    ],
  },
];

export function getDocArticle(slug: string): DocArticle | undefined {
  return docArticles.find((a) => a.slug === slug);
}
