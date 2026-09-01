// Idempotent seed script: upserts the exact deterministic data from
// lib/seed-data.ts into MongoDB by `id`, so re-running it (locally, in CI, or
// as Playwright globalSetup) always converges the database back to the same
// known state instead of duplicating documents.
//
// Usage: npm run db:seed
// Relative imports (not the "@/" tsconfig alias) so this file resolves
// identically whether run via tsx (`npm run db:seed`), Playwright's
// globalSetup, or any other runner that doesn't apply Next.js's path-alias
// resolution.
import { connectToDatabase } from "../lib/mongodb";
import {
  OrganizationModel,
  TeamMemberModel,
  ProjectModel,
  TaskModel,
  CustomerModel,
  AppNotificationModel,
  InvoiceModel,
  ApiKeyModel,
  WebhookModel,
  LoginHistoryEntryModel,
  ActiveSessionModel,
  IntegrationStateModel,
  NotificationPrefsModel,
  SINGLETON_ID,
} from "../lib/db/models";
import {
  seedOrganization,
  seedTeamMembers,
  seedProjects,
  seedTasks,
  seedCustomers,
  seedNotifications,
  seedInvoices,
  seedApiKeys,
  seedWebhooks,
  seedLoginHistory,
  seedActiveSessions,
  seedIntegrations,
  seedNotificationPrefs,
} from "../lib/seed-data";

async function upsertAll<T extends { id: string }>(
  model: { findOneAndUpdate: (filter: object, update: object, options: object) => Promise<unknown> },
  docs: T[]
) {
  await Promise.all(
    docs.map((doc) => model.findOneAndUpdate({ id: doc.id }, doc, { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }))
  );
}

export async function seedDatabase(): Promise<void> {
  await connectToDatabase();

  await Promise.all([
    OrganizationModel.findOneAndUpdate({ id: seedOrganization.id }, seedOrganization, { upsert: true, returnDocument: "after" }),
    upsertAll(TeamMemberModel, seedTeamMembers),
    upsertAll(ProjectModel, seedProjects),
    upsertAll(TaskModel, seedTasks),
    upsertAll(CustomerModel, seedCustomers),
    upsertAll(AppNotificationModel, seedNotifications),
    upsertAll(InvoiceModel, seedInvoices),
    upsertAll(ApiKeyModel, seedApiKeys),
    upsertAll(WebhookModel, seedWebhooks),
    upsertAll(LoginHistoryEntryModel, seedLoginHistory),
    upsertAll(ActiveSessionModel, seedActiveSessions),
    IntegrationStateModel.findOneAndUpdate({ id: SINGLETON_ID }, { id: SINGLETON_ID, ...seedIntegrations }, { upsert: true, returnDocument: "after" }),
    NotificationPrefsModel.findOneAndUpdate({ id: SINGLETON_ID }, { id: SINGLETON_ID, ...seedNotificationPrefs }, { upsert: true, returnDocument: "after" }),
  ]);
}

// Only run automatically when this file is executed directly (`npm run
// db:seed`), not when imported by e2e/global-setup.ts.
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log("FlowDesk database seeded successfully.");
      process.exit(0);
    })
    .catch((err) => {
      console.error("Failed to seed FlowDesk database:", err);
      process.exit(1);
    });
}
