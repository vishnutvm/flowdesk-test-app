import { test, expect } from "@playwright/test";
import { login } from "./helpers";

test("landing page renders with login/signup links", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("landing-login-link")).toBeVisible();
  await expect(page.getByTestId("landing-signup-link")).toBeVisible();
});

test("main navigation reaches every primary route", async ({ page }) => {
  await login(page);

  const routes: [string, string][] = [
    ["nav-projects", "projects-page"],
    ["nav-tasks", "tasks-page"],
    ["nav-team", "team-page"],
    ["nav-customers", "customers-page"],
    ["nav-notifications", "notifications-page"],
  ];

  for (const [navTestId, pageTestId] of routes) {
    await page.getByTestId(navTestId).click();
    await expect(page.getByTestId(pageTestId)).toBeVisible();
  }
});

test("help center links to a doc article that matches its route", async ({ page }) => {
  await login(page);
  await page.goto("/help");
  await page.getByTestId("help-article-link-change-password").click();
  await expect(page.getByTestId("doc-article-title")).toHaveText(/change your password/i);
  await page.getByTestId("doc-article-related-link").click();
  await expect(page).toHaveURL(/\/settings\/security/);
});

test("mobile viewport shows the mobile menu toggle", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await login(page);
  await expect(page.getByTestId("mobile-menu-toggle")).toBeVisible();
  await page.getByTestId("mobile-menu-toggle").click();
  await expect(page.getByTestId("sidebar-mobile")).toBeVisible();
});
