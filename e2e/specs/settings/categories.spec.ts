import { expect, test } from "../../fixtures";

test.describe("Categories", () => {
  const categoryName = "Test Category";

  test.beforeEach(async ({ page, databasePage, settingsPage }) => {
    await page.goto("/");
    await databasePage.createEncryptedDatabase("testpassword");
    await settingsPage.goToCategories();
  });

  test("create category", async ({ page, settingsPage }) => {
    const categoryLocator = settingsPage.categoryLocator(categoryName);
    await expect(categoryLocator).toBeHidden();

    await settingsPage.createCategory(categoryName);

    await expect(categoryLocator).toBeVisible();
  });

  test("delete category", async ({ page, settingsPage }) => {
    const categoryLocator = settingsPage.categoryLocator(categoryName);

    await settingsPage.createCategory(categoryName);
    await expect(categoryLocator).toBeVisible();

    await categoryLocator.getByRole("button").click();
    await expect(categoryLocator).toBeHidden();
  });
});
