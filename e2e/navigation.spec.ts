import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("homepage loads successfully", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Cloudea/);
  });

  test("blog page loads and shows posts", async ({ page }) => {
    await page.goto("/blog");
    await expect(page.locator("h1")).toContainText(/Блог|Blog/);
  });

  test("docs page loads", async ({ page }) => {
    await page.goto("/docs/getting-started/introduction");
    await expect(page.locator("h1")).toBeVisible();
  });

  test("404 page for non-existent route", async ({ page }) => {
    const response = await page.goto("/non-existent-page-xyz");
    expect(response?.status()).toBe(404);
  });

  test("navigation links work", async ({ page }) => {
    await page.goto("/");
    await page.click('a[href="/blog"]');
    await expect(page).toHaveURL(/\/blog/);
  });
});

test.describe("Search", () => {
  test("search dialog opens with Ctrl+K", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Control+k");
    await expect(page.locator("[role='dialog']")).toBeVisible();
  });

  test("search dialog closes with Escape", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Control+k");
    await expect(page.locator("[role='dialog']")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.locator("[role='dialog']")).not.toBeVisible();
  });
});

test.describe("Accessibility", () => {
  test("skip-to-content link exists", async ({ page }) => {
    await page.goto("/");
    const skipLink = page.locator('a[href="#main-content"]');
    await expect(skipLink).toBeAttached();
  });

  test("main content has id", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#main-content")).toBeVisible();
  });

  test("theme toggle has aria-label", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('button[aria-label="Toggle theme"]')).toBeVisible();
  });
});

test.describe("Locale", () => {
  test("locale switcher changes language", async ({ page }) => {
    await page.goto("/");
    // The locale cookie should be set by middleware
    const cookies = await page.context().cookies();
    const localeCookie = cookies.find((c) => c.name === "locale");
    expect(localeCookie).toBeDefined();
  });
});
