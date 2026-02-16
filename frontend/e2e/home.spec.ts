import { test, expect } from "@playwright/test";

test.describe("Home Page", () => {
  test("displays hero section with title and CTA", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Fortune Compass" })).toBeVisible();
    await expect(page.getByText("あなたの運命を照らす")).toBeVisible();
    await expect(page.getByRole("button", { name: "占いをはじめる" })).toBeVisible();
  });

  test("displays four fortune type features", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("星座占い")).toBeVisible();
    await expect(page.getByText("数秘術")).toBeVisible();
    await expect(page.getByText("血液型占い")).toBeVisible();
    await expect(page.getByText("タロット")).toBeVisible();
  });

  test("navigates to profile page when no profile exists", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "占いをはじめる" }).click();
    await expect(page).toHaveURL("/profile");
  });

  test("navigates to fortune page when profile exists", async ({ page }) => {
    // Set profile in localStorage before navigating
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.setItem(
        "fortune-compass-profile",
        JSON.stringify({
          name: "テスト太郎",
          nameKana: "テストタロウ",
          nameRomaji: "tesutotarou",
          birthday: "1990-01-15",
          bloodType: "A",
        })
      );
    });
    await page.goto("/");
    await page.getByRole("button", { name: "占いをはじめる" }).click();
    await expect(page).toHaveURL("/fortune");
  });
});
