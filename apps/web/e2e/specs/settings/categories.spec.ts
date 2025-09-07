import { expect, test } from "../../fixtures";

test.describe("Categories", () => {
  const categoryName = "Test Category";
  const databasePassword = "testpassword";

  test.beforeEach(async ({ page, databasePage, settingsPage }) => {
    await page.goto("/");
    await databasePage.createEncryptedDatabase(databasePassword);
    await settingsPage.goToCategories();
  });

  test("create category", async ({
    page,
    settingsPage,
    databasePage,
    dashboardPage,
  }) => {
    const categoryLocator = settingsPage.categoryLocator(categoryName);
    await expect(categoryLocator).toBeHidden();

    await settingsPage.createCategory(categoryName);
    await expect(categoryLocator).toBeVisible();

    await dashboardPage.goto();
    await settingsPage.goToCategories();
    await expect(categoryLocator).toBeVisible();

    const path = await databasePage.exportDatabase();
    await page.reload();
    await databasePage.importDatabase(path, databasePassword);
    await settingsPage.goToCategories();
    await expect(categoryLocator).toBeVisible();
  });

  test("delete category", async ({
    page,
    settingsPage,
    databasePage,
    dashboardPage,
  }) => {
    const categoryLocator = settingsPage.categoryLocator(categoryName);

    await settingsPage.createCategory(categoryName);
    await expect(categoryLocator).toBeVisible();

    await categoryLocator.getByRole("button").click();
    await expect(categoryLocator).toBeHidden();

    await dashboardPage.goto();
    await settingsPage.goToCategories();
    await expect(categoryLocator).toBeHidden();

    const path = await databasePage.exportDatabase();
    await page.reload();
    await databasePage.importDatabase(path, databasePassword);
    await settingsPage.goToCategories();
    await expect(categoryLocator).toBeHidden();
  });
});
