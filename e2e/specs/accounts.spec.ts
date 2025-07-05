import { expect, test } from "../fixtures";

test.describe("Accounts", () => {
  const accountName = "Eric's Account";
  const databasePassword = "testpassword";

  test.beforeEach(async ({ page, databasePage, accountPage }) => {
    await page.goto("/");
    await databasePage.createEncryptedDatabase(databasePassword);
    await accountPage.goToAccounts();
  });

  test("create account", async ({
    page,
    accountPage,
    databasePage,
    dashboardPage,
  }) => {
    const accountRow = page.getByRole("link", { name: accountName });
    await expect(accountRow).toBeHidden();

    await accountPage.createAccount(accountName);

    await expect(page.getByRole("heading", { name: "Accounts" })).toBeVisible();
    await expect(accountRow).toBeVisible();
    await expect(accountRow.getByText("$0.00")).toBeVisible();
    await accountRow.click();

    await expect(
      page.getByRole("heading", { name: accountName })
    ).toBeVisible();

    await dashboardPage.goto();
    await accountPage.goToAccounts();
    await expect(accountRow).toBeVisible();

    const path = await databasePage.exportDatabase();
    await page.reload();
    await databasePage.importDatabase(path, databasePassword);
    await accountPage.goToAccounts();
    await expect(accountRow).toBeVisible();
  });

  test("delete account", async ({
    page,
    accountPage,
    databasePage,
    dashboardPage,
  }) => {
    await accountPage.createAccount(accountName);

    const accountRow = page.getByRole("link", { name: accountName });
    await accountRow.click();

    page.on("dialog", (dialog) => dialog.accept());
    await page.getByRole("button", { name: "Edit" }).click();
    await page.getByRole("menuitem", { name: "Delete account" }).click();
    await expect(page.getByRole("heading", { name: "Accounts" })).toBeVisible();
    await expect(accountRow).toBeHidden();

    await dashboardPage.goto();
    await accountPage.goToAccounts();
    await expect(accountRow).toBeHidden();

    const path = await databasePage.exportDatabase();
    await page.reload();
    await databasePage.importDatabase(path, databasePassword);
    await accountPage.goToAccounts();
    await expect(accountRow).toBeHidden();
  });

  test("create transaction", async ({
    page,
    accountPage,
    databasePage,
    dashboardPage,
  }) => {
    await accountPage.createAccount(accountName);
    await page.getByRole("link", { name: accountName }).click();

    const transactionRow = page.getByRole("row", {
      name: "Test Payee $100.00",
    });
    await expect(transactionRow).toBeHidden();
    await accountPage.createTransaction("Test Payee", "100.00");
    await expect(transactionRow).toBeVisible();

    await dashboardPage.goto();
    await accountPage.goToAccounts();
    await accountPage.goToAccount(accountName);
    expect(transactionRow).toBeVisible();

    const path = await databasePage.exportDatabase();
    await page.reload();
    await databasePage.importDatabase(path, databasePassword);

    await accountPage.goToAccounts();
    await accountPage.goToAccount(accountName);
    await expect(transactionRow).toBeVisible();
  });
});
