import { Page, expect } from "@playwright/test";

export const DEMO_EMAIL = "demo@flowdesk.test";
export const DEMO_PASSWORD = "Demo@12345";

export async function login(page: Page) {
  await page.goto("/login");
  await page.getByTestId("login-email-input").fill(DEMO_EMAIL);
  await page.getByTestId("login-password-input").fill(DEMO_PASSWORD);
  await page.getByTestId("login-submit").click();
  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.getByTestId("dashboard-page")).toBeVisible();
}
