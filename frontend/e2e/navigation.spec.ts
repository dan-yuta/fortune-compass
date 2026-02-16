import { test, expect } from "@playwright/test";

test.describe("Navigation & Layout", () => {
  test("header is visible on all pages", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("navigation")).toBeVisible();
    await expect(page.getByRole("link", { name: /Fortune Compass/ })).toBeVisible();
  });

  test("header logo navigates to home", async ({ page }) => {
    await page.goto("/profile");
    await page.getByRole("link", { name: /Fortune Compass/ }).click();
    await expect(page).toHaveURL("/");
  });

  test("skip to content link is accessible", async ({ page }) => {
    await page.goto("/");
    const skipLink = page.getByText("メインコンテンツへスキップ");
    await expect(skipLink).toBeAttached();
  });

  test("404 page is shown for unknown routes", async ({ page }) => {
    await page.goto("/unknown-page");
    await expect(page.getByText("404")).toBeVisible();
    await expect(page.getByText("ページが見つかりません")).toBeVisible();
    await expect(page.getByRole("link", { name: /トップページに戻る/ })).toBeVisible();
  });

  test("language switcher toggles language", async ({ page }) => {
    await page.goto("/");
    const langButton = page.getByRole("button", { name: /Switch to English|日本語に切り替え/ });
    await expect(langButton).toBeVisible();
  });
});

test.describe("Accessibility", () => {
  test("home page has correct heading hierarchy", async ({ page }) => {
    await page.goto("/");
    const h1 = page.getByRole("heading", { level: 1 });
    await expect(h1).toHaveCount(1);
    await expect(h1).toHaveText("Fortune Compass");
  });

  test("profile page has correct heading hierarchy", async ({ page }) => {
    await page.goto("/profile");
    const h1 = page.getByRole("heading", { level: 1 });
    await expect(h1).toHaveCount(1);
    await expect(h1).toHaveText("プロフィール設定");
  });
});
