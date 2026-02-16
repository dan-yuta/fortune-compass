import { test, expect } from "@playwright/test";

test.describe("Profile Page", () => {
  test("displays profile form with all fields", async ({ page }) => {
    await page.goto("/profile");
    await expect(page.getByRole("heading", { name: "プロフィール設定" })).toBeVisible();
    await expect(page.getByLabel(/名前/)).toBeVisible();
    await expect(page.getByLabel(/フリガナ/)).toBeVisible();
    await expect(page.getByLabel("年", { exact: true })).toBeVisible();
    await expect(page.getByLabel("月", { exact: true })).toBeVisible();
    await expect(page.getByLabel("日", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "A", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "B", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "O", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "AB" })).toBeVisible();
  });

  test("shows validation errors when submitting empty form", async ({ page }) => {
    await page.goto("/profile");
    await page.getByRole("button", { name: "保存して占いをはじめる" }).click();
    await expect(page.getByText("名前を入力してください")).toBeVisible();
    await expect(page.getByText("フリガナを入力してください")).toBeVisible();
    await expect(page.getByText("生年月日を選択してください")).toBeVisible();
  });

  test("shows error for non-katakana input", async ({ page }) => {
    await page.goto("/profile");
    await page.getByLabel(/フリガナ/).fill("やまだ");
    await page.getByLabel(/フリガナ/).blur();
    await expect(page.getByText("カタカナで入力してください")).toBeVisible();
  });

  test("successfully saves profile and navigates to fortune", async ({ page }) => {
    await page.goto("/profile");
    await page.getByLabel(/名前/).first().fill("山田 太郎");
    await page.getByLabel(/フリガナ/).fill("ヤマダ タロウ");
    await page.getByLabel("年", { exact: true }).selectOption("1990");
    await page.getByLabel("月", { exact: true }).selectOption("3");
    await page.getByLabel("日", { exact: true }).selectOption("15");
    await page.getByRole("button", { name: "A", exact: true }).click();
    await page.getByRole("button", { name: "保存して占いをはじめる" }).click();
    await expect(page).toHaveURL("/fortune");
  });

  test("loads existing profile data", async ({ page }) => {
    await page.goto("/profile");
    await page.evaluate(() => {
      localStorage.setItem(
        "fortune-compass-profile",
        JSON.stringify({
          name: "鈴木 花子",
          nameKana: "スズキ ハナコ",
          nameRomaji: "suzuki hanako",
          birthday: "1985-07-20",
          bloodType: "B",
        })
      );
    });
    await page.goto("/profile");
    await expect(page.getByLabel(/名前/).first()).toHaveValue("鈴木 花子");
    await expect(page.getByLabel(/フリガナ/)).toHaveValue("スズキ ハナコ");
  });

  test("blood type toggle works correctly", async ({ page }) => {
    await page.goto("/profile");
    const buttonA = page.getByRole("button", { name: "A", exact: true });
    await buttonA.click();
    await expect(buttonA).toHaveAttribute("aria-pressed", "true");
    // Click again to deselect
    await buttonA.click();
    await expect(buttonA).toHaveAttribute("aria-pressed", "false");
  });
});
