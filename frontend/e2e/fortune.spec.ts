import { test, expect } from "@playwright/test";

const TEST_PROFILE = {
  name: "テスト太郎",
  nameKana: "テストタロウ",
  nameRomaji: "tesutotarou",
  birthday: "1990-03-15",
  bloodType: "A",
};

test.describe("Fortune Selection Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate((profile) => {
      localStorage.setItem("fortune-compass-profile", JSON.stringify(profile));
    }, TEST_PROFILE);
  });

  test("displays greeting with user name", async ({ page }) => {
    await page.goto("/fortune");
    await expect(page.getByText("こんにちは、テスト太郎さん")).toBeVisible();
  });

  test("displays all fortune type cards", async ({ page }) => {
    await page.goto("/fortune");
    await expect(page.getByText("星座占い")).toBeVisible();
    await expect(page.getByText("数秘術")).toBeVisible();
    await expect(page.getByText("血液型占い")).toBeVisible();
    await expect(page.getByText("タロット占い")).toBeVisible();
  });

  test("navigates to zodiac fortune", async ({ page }) => {
    await page.goto("/fortune");
    await page.locator('a[href="/fortune/zodiac"]').click({ force: true });
    await expect(page).toHaveURL("/fortune/zodiac");
  });

  test("navigates to numerology fortune", async ({ page }) => {
    await page.goto("/fortune");
    await page.locator('a[href="/fortune/numerology"]').click({ force: true });
    await expect(page).toHaveURL("/fortune/numerology");
  });

  test("navigates to tarot fortune", async ({ page }) => {
    await page.goto("/fortune");
    await page.locator('a[href="/fortune/tarot"]').click({ force: true });
    await expect(page).toHaveURL("/fortune/tarot");
  });

  test("has profile edit link", async ({ page }) => {
    await page.goto("/fortune");
    await expect(page.getByText("プロフィール編集")).toBeVisible();
  });

  test("redirects to profile when no profile exists", async ({ page }) => {
    await page.evaluate(() => localStorage.clear());
    await page.goto("/fortune");
    await expect(page).toHaveURL("/profile");
  });
});

test.describe("Fortune Selection - Blood Type disabled", () => {
  test("disables blood type card when blood type is not set", async ({ page }) => {
    const profileWithoutBlood = { ...TEST_PROFILE, bloodType: null };
    await page.goto("/");
    await page.evaluate((profile) => {
      localStorage.setItem("fortune-compass-profile", JSON.stringify(profile));
    }, profileWithoutBlood);
    await page.goto("/fortune");
    await expect(page.getByText("血液型が未設定です")).toBeVisible();
  });
});
