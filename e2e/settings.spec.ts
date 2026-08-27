import { test, expect } from "@playwright/test";
import { login } from "./helpers";

test.beforeEach(async ({ page }) => {
  await login(page);
});

test("changes password successfully", async ({ page }) => {
  await page.goto("/settings/security");
  await page.getByTestId("current-password-input").fill("Demo@12345");
  await page.getByTestId("new-password-input").fill("NewPass1!");
  await page.getByTestId("confirm-password-input").fill("NewPass1!");
  await page.getByTestId("save-password").click();
  await expect(page.getByTestId("toast")).toContainText(/password changed/i);
});

test("shows an error when current password is wrong", async ({ page }) => {
  await page.goto("/settings/security");
  await page.getByTestId("current-password-input").fill("WrongCurrent1!");
  await page.getByTestId("new-password-input").fill("NewPass1!");
  await page.getByTestId("confirm-password-input").fill("NewPass1!");
  await page.getByTestId("save-password").click();
  await expect(page.getByTestId("change-password-error")).toContainText(/incorrect/i);
});

test("updates profile successfully", async ({ page }) => {
  await page.goto("/settings/profile");
  await page.getByTestId("profile-name-input").fill("Jordan Updated");
  await page.getByTestId("save-profile-button").click();
  await expect(page.getByTestId("toast")).toContainText(/profile updated/i);
  await expect(page.getByTestId("profile-name-input")).toHaveValue("Jordan Updated");
});

test("shows an error state when save is simulated to fail", async ({ page }) => {
  await page.goto("/settings/profile");
  await page.getByTestId("simulate-save-failure-toggle").check();
  await page.getByTestId("profile-name-input").fill("Should Not Save");
  await page.getByTestId("save-profile-button").click();
  await expect(page.getByTestId("profile-form-error")).toBeVisible();
});

test("configures notification preferences", async ({ page }) => {
  await page.goto("/settings/notifications");
  const toggle = page.getByTestId("notif-toggle-weekly-report");
  const before = await toggle.getAttribute("aria-checked");
  await toggle.click();
  await expect(toggle).not.toHaveAttribute("aria-checked", before ?? "");
});

test("enables two-factor authentication", async ({ page }) => {
  await page.goto("/settings/security");
  const toggle = page.getByTestId("2fa-toggle");
  await expect(toggle).toHaveAttribute("aria-checked", "false");
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-checked", "true");
});

test("upgrades the subscription plan", async ({ page }) => {
  await page.goto("/settings/billing");
  await expect(page.getByTestId("current-plan-name")).toHaveText("Pro");
  await page.getByTestId("change-plan-button").click();
  await page.getByTestId("plan-option-enterprise").click();
  await page.getByTestId("continue-plan-change").click();
  await page.getByTestId("confirm-plan-change").click();
  await expect(page.getByTestId("toast")).toContainText(/upgraded to Enterprise/i);
  await expect(page.getByTestId("current-plan-name")).toHaveText("Enterprise");
});

test("generates a new API key and reveals it once", async ({ page }) => {
  await page.goto("/settings/integrations");
  await page.getByTestId("generate-api-key-button").click();
  await page.getByTestId("api-key-name-input").fill("Playwright Test Key");
  await page.getByTestId("confirm-generate-api-key").click();
  await expect(page.getByTestId("revealed-api-key")).toBeVisible();
  await page.getByTestId("close-revealed-key").click();
  await expect(page.getByText("Playwright Test Key")).toBeVisible();
});
