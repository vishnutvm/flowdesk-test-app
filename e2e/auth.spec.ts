import { test, expect } from "@playwright/test";
import { login, DEMO_EMAIL } from "./helpers";

test.describe("Login", () => {
  test("shows an error for invalid credentials", async ({ page }) => {
    await page.goto("/login");
    await page.getByTestId("login-email-input").fill(DEMO_EMAIL);
    await page.getByTestId("login-password-input").fill("WrongPassword1!");
    await page.getByTestId("login-submit").click();
    await expect(page.getByTestId("login-error")).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test("logs in successfully with demo credentials", async ({ page }) => {
    await login(page);
    await expect(page.getByTestId("stat-active-projects")).toBeVisible();
  });

  test("redirects unauthenticated users away from protected routes", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });

  test("logs out successfully", async ({ page }) => {
    await login(page);
    await page.getByTestId("user-menu-toggle").click();
    await page.getByTestId("user-menu-logout").click();
    await expect(page).toHaveURL(/\/login/);
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe("Signup", () => {
  test("creates a new account and can then log in", async ({ page }) => {
    const email = `pw-e2e-${Date.now()}@example.com`;
    await page.goto("/signup");
    await page.getByTestId("signup-name-input").fill("Playwright Tester");
    await page.getByTestId("signup-email-input").fill(email);
    await page.getByTestId("signup-password-input").fill("Abcdefg1!");
    await page.getByTestId("signup-confirm-password-input").fill("Abcdefg1!");
    await page.getByTestId("signup-submit").click();
    await expect(page.getByTestId("signup-success")).toBeVisible();

    await page.getByTestId("signup-go-to-login").click();
    await expect(page).toHaveURL(/\/login/);
    await page.getByTestId("login-email-input").fill(email);
    await page.getByTestId("login-password-input").fill("Abcdefg1!");
    await page.getByTestId("login-submit").click();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("rejects a duplicate email", async ({ page }) => {
    await page.goto("/signup");
    await page.getByTestId("signup-name-input").fill("Demo Duplicate");
    await page.getByTestId("signup-email-input").fill(DEMO_EMAIL);
    await page.getByTestId("signup-password-input").fill("Abcdefg1!");
    await page.getByTestId("signup-confirm-password-input").fill("Abcdefg1!");
    await page.getByTestId("signup-submit").click();
    await expect(page.getByTestId("signup-error")).toContainText(/already exists/i);
  });
});
