import { test, expect } from "@playwright/test";
import { login } from "./helpers";

test.beforeEach(async ({ page }) => {
  await login(page);
});

test("creates a new project", async ({ page }) => {
  await page.goto("/projects");
  await page.getByTestId("new-project-button").click();
  await page.getByTestId("project-name-input").fill("Playwright Test Project");
  await page.getByTestId("project-description-input").fill("Created by an E2E test.");
  await page.getByTestId("project-due-date-input").fill("2026-12-31");
  await page.getByTestId("create-project-submit").click();
  await expect(page.getByTestId("toast")).toContainText(/project created/i);
  await expect(page.getByText("Playwright Test Project")).toBeVisible();
});

test("shows a validation error for a too-short project name", async ({ page }) => {
  await page.goto("/projects");
  await page.getByTestId("new-project-button").click();
  await page.getByTestId("project-name-input").fill("Ab");
  await page.getByTestId("project-due-date-input").fill("2026-12-31");
  await page.getByTestId("create-project-submit").click();
  await expect(page.getByTestId("project-form-error")).toBeVisible();
});

test("creates a new task", async ({ page }) => {
  await page.goto("/tasks");
  await page.getByTestId("new-task-button").click();
  await page.getByTestId("task-title-input").fill("Playwright Test Task");
  await page.getByTestId("task-due-date-input").fill("2026-12-31");
  await page.getByTestId("create-task-submit").click();
  await expect(page.getByTestId("toast")).toContainText(/task created/i);
  await expect(page.getByText("Playwright Test Task")).toBeVisible();
});

test("invites a new team member", async ({ page }) => {
  await page.goto("/team");
  await page.getByTestId("simulate-role-select").selectOption("Owner");
  await page.getByTestId("invite-member-button").click();
  const email = `invitee-${Date.now()}@example.com`;
  await page.getByTestId("invite-email-input").fill(email);
  await page.getByTestId("invite-role-input").selectOption("Member");
  await page.getByTestId("send-invite-submit").click();
  await expect(page.getByTestId("toast")).toContainText(/invitation sent/i);
  await expect(page.getByText(email)).toBeVisible();
});

test("shows permission-denied state for a Viewer trying to invite", async ({ page }) => {
  await page.goto("/team");
  await page.getByTestId("simulate-role-select").selectOption("Viewer");
  await expect(page.getByTestId("permission-denied")).toBeVisible();
  await expect(page.getByTestId("invite-member-button")).toBeDisabled();
});
