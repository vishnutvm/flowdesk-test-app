# Chatbot Integration Test Plan

FlowDesk is a fictional SaaS application built **only** to serve as an
external integration/E2E testing target for a separate chatbot platform. This
document gives that chatbot platform everything it needs to point an AI agent
at FlowDesk, answer support questions correctly, and visually guide a user to
the right UI element.

---

## A. Test app URL

```
<TEST_APP_URL>   e.g. https://flowdesk-test-app.vercel.app
```

Replace with the actual Vercel deployment URL once deployed (see
`docs/DEPLOYMENT.md`). Locally: `http://localhost:3000`.

---

## B. Test credentials

| Field | Value |
|---|---|
| Email | `demo@flowdesk.test` |
| Password | `Demo@12345` |

These are seeded in `lib/seed-data.ts` and also shown directly on the
`/login` page and landing page (`data-testid="demo-credentials-hint"`).
Signup also works for creating additional throwaway accounts
(`/signup`) if a test needs a "new user" flow.

---

## C. Full route list

| Route | Auth required | Purpose |
|---|---|---|
| `/` | No | Marketing landing page |
| `/login` | No | Log in |
| `/signup` | No | Create account |
| `/forgot-password` | No | Request password reset |
| `/reset-password` | No | Set new password |
| `/dashboard` | Yes | Overview, stats, activity feed, quick actions |
| `/projects` | Yes | Project list, create project |
| `/projects/[id]` | Yes | Project detail, edit/delete, its tasks |
| `/tasks` | Yes | Task list, filters, create task |
| `/tasks/[id]` | Yes | Task detail, edit fields, delete |
| `/team` | Yes | Team member list, invite, roles |
| `/customers` | Yes | Customer CRUD list |
| `/notifications` | Yes | Notification feed, mark read |
| `/settings/profile` | Yes | Name, email, avatar, timezone |
| `/settings/security` | Yes | Password, 2FA, sessions, login history |
| `/settings/notifications` | Yes | Notification preference toggles |
| `/settings/billing` | Yes | Plan, payment method, invoices, upgrade |
| `/settings/team` | Yes | Same team management, under Settings |
| `/settings/integrations` | Yes | Slack, Google Calendar, API keys, webhooks |
| `/help` | Yes | Help center, grouped by category |
| `/docs` | Yes | Documentation index |
| `/docs/[slug]` | Yes | Individual doc article (15 slugs, section D) |

Unauthenticated visits to any "Yes" route redirect to `/login?redirected=1`.

---

## D. Knowledge / doc article URLs

All 15 required topics exist as real articles at `/docs/<slug>`, and are also
linked from `/help` grouped by category. Article content is written to match
the live UI exactly — copy in section G below is drawn directly from these
articles, not paraphrased.

| Slug | URL | Related UI page |
|---|---|---|
| `change-password` | `/docs/change-password` | `/settings/security` |
| `update-profile` | `/docs/update-profile` | `/settings/profile` |
| `invite-team-members` | `/docs/invite-team-members` | `/team` |
| `create-project` | `/docs/create-project` | `/projects` |
| `create-task` | `/docs/create-task` | `/tasks` |
| `change-task-status` | `/docs/change-task-status` | `/tasks` |
| `assign-task` | `/docs/assign-task` | `/tasks` |
| `upgrade-subscription` | `/docs/upgrade-subscription` | `/settings/billing` |
| `how-billing-works` | `/docs/how-billing-works` | `/settings/billing` |
| `configure-notifications` | `/docs/configure-notifications` | `/settings/notifications` |
| `enable-2fa` | `/docs/enable-2fa` | `/settings/security` |
| `configure-integrations` | `/docs/configure-integrations` | `/settings/integrations` |
| `create-api-keys` | `/docs/create-api-keys` | `/settings/integrations` |
| `configure-webhooks` | `/docs/configure-webhooks` | `/settings/integrations` |
| `manage-team-roles` | `/docs/manage-team-roles` | `/settings/team` |

Source of truth: `lib/docs-content.ts` (`docArticles` array).

---

## E. Important UI selectors — `data-testid`

Every important interactive element carries a stable `data-testid`. Static
(non-parameterized) ids observed in the codebase:

```
2fa-toggle, active-sessions-list, activity-item, add-webhook-button, add-webhook-form,
api-key-name-input, api-keys-list, auth-loading, back-to-docs, back-to-login,
back-to-projects, back-to-tasks, change-password-error, change-password-form,
change-plan-button, close-revealed-key, confirm-add-webhook,
confirm-delete-project, confirm-delete-task, confirm-generate-api-key,
confirm-password-input, confirm-plan-change, continue-plan-change, continue-to-reset,
create-customer-submit, create-project-submit, create-task-submit,
current-password-input, current-plan-name, customer-company-input,
customer-email-input, customer-form-error, customer-name-input,
customer-status-input, customers-page, dashboard-manage-billing, dashboard-page,
dashboard-view-all-activity, delete-project-button, delete-task-button,
demo-credentials-hint, doc-article-body, doc-article-page, doc-article-related-link,
doc-article-title, docs-index-page, edit-project-button,
edit-project-description-input, edit-project-due-date-input, edit-project-error,
edit-project-form, edit-project-name-input, edit-project-status-input,
empty-state-new-customer, empty-state-new-project, empty-state-new-task,
error-state-retry, forgot-password-email-input, forgot-password-error,
forgot-password-form, forgot-password-link, forgot-password-sent,
forgot-password-submit, generate-api-key-button, generate-api-key-form,
go-to-login, go-to-signup, google-calendar-connect-toggle, help-page,
invite-email-input, invite-member-button, invite-member-error, invite-member-form,
invite-role-input, invoices-table, landing-get-started, landing-login-link,
landing-signup-link, landing-try-demo, loading-skeleton, login-email-input,
login-error, login-form, login-history-list, login-password-input, login-submit,
main-content, mark-all-read-button, mobile-menu-close, mobile-menu-toggle,
modal-close, new-customer-button, new-customer-form, new-password-input,
new-project-button, new-project-form, new-task-button, new-task-form,
notifications-page, notifications-unread-badge, payment-method-display,
permission-denied, plan-change-confirmation, plan-usage-card,
profile-avatar-preview, profile-email-input, profile-form, profile-form-error,
profile-name-input, profile-timezone-input, project-description-input,
project-detail-name, project-detail-page, project-due-date-input,
project-form-error, project-name-input, project-new-task-link,
project-status-filter, project-status-input, projects-grid, projects-page,
quick-action-invite-member, quick-action-new-project, quick-action-new-task,
recent-activity-list, reset-password-confirm-input, reset-password-email-input,
reset-password-error, reset-password-form, reset-password-go-to-login,
reset-password-new-input, reset-password-submit, reset-password-success,
revealed-api-key, revealed-api-key-container, save-password, save-profile-button,
save-project-submit, send-invite-submit, session-expired-banner, settings-nav,
settings-page, sidebar-desktop, sidebar-mobile, signup-confirm-password-input,
signup-email-input, signup-error, signup-form, signup-go-to-login,
signup-name-input, signup-password-input, signup-submit, signup-success,
simulate-role-select, simulate-save-failure-toggle, slack-connect-toggle,
task-assignee-input, task-description-input, task-detail-assignee-select,
task-detail-description-input, task-detail-due-date-input, task-detail-page,
task-detail-priority-select, task-detail-status-select, task-detail-title-input,
task-due-date-input, task-form-error, task-priority-filter, task-priority-input,
task-project-filter, task-project-input, task-project-link, task-status-filter,
task-status-input, task-title-error, task-title-input, tasks-page, toast,
toast-container, topbar-notifications, user-menu, user-menu-logout,
user-menu-profile, user-menu-toggle, webhook-form-error, webhook-url-input,
webhooks-list
```

Parameterized (per-row / per-entity) `data-testid` patterns — substitute the
real entity id or value:

```
api-key-${id}                customer-row-${id}            docs-link-${slug}
download-invoice-${id}       help-article-link-${slug}     help-category-${category}
invoice-row-${id}            mark-read-${id}                member-role-select-${id}
notification-item-${id}      notifications-filter-${all|unread|read}
plan-option-${free|starter|pro|enterprise}
project-card-${id}           project-task-row-${id}        remove-customer-${id}
remove-member-${id}          remove-webhook-${id}          revoke-api-key-${id}
revoke-session-${id}         session-${id}                 task-link-${id}
task-row-${id}               task-status-select-${id}      team-row-${id}
webhook-${id}                webhook-event-${eventName}
```

---

## F. `data-ai-target` identifiers (semantic navigation targets)

Static identifiers:

```
2fa-toggle, add-webhook-button, api-key-name-input, change-plan-button,
confirm-add-webhook, confirm-generate-api-key,
confirm-password, create-customer-submit, create-project-submit,
create-task-submit, current-password, customer-company-input,
customer-email-input, customer-name-input, customer-status-input,
delete-project-button, delete-task-button, edit-project-button,
forgot-password-email, forgot-password-link, forgot-password-submit,
generate-api-key-button, go-to-login, go-to-signup,
google-calendar-connect-toggle, invite-email-input, invite-member-button,
invite-role-input, login-email, login-password, login-submit, logout-button,
mark-all-read-button, mark-notification-read, member-role-select,
mobile-menu-toggle, new-customer-button, new-password, new-project-button,
new-task-button, profile-email-input, profile-name-input,
profile-timezone-input, project-card, project-description-input,
project-due-date-input, project-name-input, project-status-filter,
project-status-input, quick-action-invite-member, quick-action-new-project,
quick-action-new-task, remove-member-button, reset-password-confirm,
reset-password-email, reset-password-new, reset-password-submit,
save-password, save-profile-button, send-invite-submit,
signup-confirm-password, signup-email, signup-name, signup-password,
signup-submit, simulate-role-select, simulate-save-failure-toggle,
slack-connect-toggle, task-assignee-input, task-description-input,
task-detail-assignee, task-detail-description, task-detail-due-date,
task-detail-priority, task-detail-status, task-detail-title,
task-due-date-input, task-priority-filter, task-priority-input,
task-project-filter, task-project-input, task-status-filter,
task-status-input, task-status-select, task-title-input, topbar-notifications,
user-menu-toggle, webhook-url-input,
sidebar-dashboard, sidebar-projects, sidebar-tasks, sidebar-team,
sidebar-customers, sidebar-notifications, sidebar-settings, sidebar-help,
settings-profile, settings-security, settings-notifications, settings-billing,
settings-team, settings-integrations
```

Parameterized identifiers:

```
docs-article-${slug}              help-article-${slug}
doc-article-related-${slug}       notifications-filter-${all|unread|read}
plan-radio-${free|starter|pro|enterprise}
```

---

## G/H/I/J. Expected chatbot Q&A, navigation paths, and visual guidance

For each row: the **question** a user might ask, the **answer** (verbatim
from the matching doc article in `lib/docs-content.ts`), the **navigation
path** the chatbot should take the user on, and the **element(s)** it should
highlight/point to (by `data-ai-target`).

### 1. "How do I change my password?"
- **Answer**: Go to Settings > Security. Enter your current password, new password, and confirm it. New passwords need 8+ characters with uppercase, lowercase, a number, and a symbol. Click Save password.
- **Navigation path**: Sidebar → Settings (`sidebar-settings`) → Security tab (`settings-security`) → `/settings/security`
- **Visual guidance**: `current-password` → `new-password` → `confirm-password` → `save-password`

### 2. "How do I update my profile / change my name?"
- **Answer**: Go to Settings > Profile. Edit Full name, Email, or Timezone, then click Save changes.
- **Navigation path**: `sidebar-settings` → `settings-profile` → `/settings/profile`
- **Visual guidance**: `profile-name-input` → `profile-email-input` → `profile-timezone-input` → `save-profile-button`

### 3. "How do I invite a team member?"
- **Answer**: Go to Team (or Settings > Team). Click Invite member, enter their email and choose a role (Owner/Admin/Member/Viewer), then click Send invite. Only Owners and Admins can invite.
- **Navigation path**: `sidebar-team` → `/team`
- **Visual guidance**: `invite-member-button` → `invite-email-input` → `invite-role-input` → `send-invite-submit`

### 4. "How do I create a project?"
- **Answer**: Go to Projects, click New project, fill in a name (3+ characters), description, status, and due date, then click Create project.
- **Navigation path**: `sidebar-projects` → `/projects`
- **Visual guidance**: `new-project-button` → `project-name-input` → `project-description-input` → `project-status-input` → `project-due-date-input` → `create-project-submit`

### 5. "How do I create a task?"
- **Answer**: Go to Tasks, click New task, choose the project, enter a title (required) and description, set status/priority/assignee, and a due date (required), then click Create task.
- **Navigation path**: `sidebar-tasks` → `/tasks`
- **Visual guidance**: `new-task-button` → `task-project-input` → `task-title-input` → `task-status-input` → `task-priority-input` → `task-assignee-input` → `task-due-date-input` → `create-task-submit`

### 6. "How do I change a task's status?"
- **Answer**: Open the task, or use the status dropdown inline on the Tasks list. Status can be Todo, In Progress, Review, or Completed, and can move in any direction.
- **Navigation path**: `sidebar-tasks` → `/tasks` (inline) or `/tasks/[id]` (detail)
- **Visual guidance**: `task-status-select` (list row) or `task-detail-status` (detail page)

### 7. "How do I assign a task to someone?"
- **Answer**: On the task detail page, use the Assignee dropdown to pick a team member, or leave it Unassigned. It can also be set when creating the task.
- **Navigation path**: `/tasks/[id]`
- **Visual guidance**: `task-detail-assignee`

### 8. "How do I upgrade my plan / subscription?"
- **Answer**: Go to Settings > Billing, click Change plan, choose a plan (Free/Starter/Pro/Enterprise), continue to the confirmation step, and confirm the upgrade. Only Owners/Admins can do this.
- **Navigation path**: `sidebar-settings` → `settings-billing` → `/settings/billing`
- **Visual guidance**: `change-plan-button` → `plan-radio-${plan}` → `confirm-generate-api-key`-style confirm button (`confirm-plan-change` testid)

### 9. "How does billing work? What plans are there?"
- **Answer**: FlowDesk has Free, Starter, Pro, and Enterprise plans billed Monthly or Annually. Each period generates an invoice (date, amount, status: Paid/Due) on the Billing page. The payment method shown is a mocked card for display only.
- **Navigation path**: `sidebar-settings` → `settings-billing` → `/settings/billing`
- **Visual guidance**: `current-plan-name`, invoices table (`invoices-table` testid)

### 10. "How do I turn on/off email or push notifications?"
- **Answer**: Go to Settings > Notifications and toggle Email, Push, Task updates, or Weekly report. Each toggle saves immediately.
- **Navigation path**: `sidebar-settings` → `settings-notifications` → `/settings/notifications`
- **Visual guidance**: notification toggle testids `notif-toggle-email`, `notif-toggle-push`, `notif-toggle-task-updates`, `notif-toggle-weekly-report`

### 11. "How do I enable two-factor authentication?"
- **Answer**: Go to Settings > Security and toggle Two-factor authentication on. It's mocked in this demo (no real authenticator app needed).
- **Navigation path**: `sidebar-settings` → `settings-security` → `/settings/security`
- **Visual guidance**: `2fa-toggle`

### 12. "How do I connect Slack or Google Calendar?"
- **Answer**: Go to Settings > Integrations and click Connect on the Slack or Google Calendar card. Click Disconnect to remove it.
- **Navigation path**: `sidebar-settings` → `settings-integrations` → `/settings/integrations`
- **Visual guidance**: `slack-connect-toggle`, `google-calendar-connect-toggle`

### 13. "How do I create an API key?"
- **Answer**: Go to Settings > Integrations, find API keys, click Generate new key, name it, and confirm. The full key is shown once — copy it immediately, since only a masked version is shown afterward.
- **Navigation path**: `sidebar-settings` → `settings-integrations` → `/settings/integrations`
- **Visual guidance**: `generate-api-key-button` → `api-key-name-input` → `confirm-generate-api-key`

### 14. "How do I set up a webhook?"
- **Answer**: Go to Settings > Integrations, find Webhooks, click Add webhook, enter a valid http(s) URL and choose events, then click Add.
- **Navigation path**: `sidebar-settings` → `settings-integrations` → `/settings/integrations`
- **Visual guidance**: `add-webhook-button` → `webhook-url-input` → `confirm-add-webhook`

### 15. "What can each team role do? How do I change someone's role?"
- **Answer**: Owner has full control; Admin manages team/projects/integrations; Member can create/edit projects, tasks and customers; Viewer is read-only. Change a role from the dropdown next to a member's name on Team or Settings > Team.
- **Navigation path**: `sidebar-team` → `/team` (or `settings-team` → `/settings/team`)
- **Visual guidance**: `member-role-select`
