import { expect, test } from "../fixtures";

test.describe("Account Detail Page", () => {
  const accountName = "Test Account";
  const databasePassword = "testpassword";
  const categoryName = "Test Category";
  const transactions = [
    { payee: "Grocery Store", amount: "150.00" },
    { payee: "Gas Station", amount: "-75.50" },
    { payee: "Coffee Shop", amount: "12.95" },
  ];
  const transactionsTotal = "87.45";

  test.beforeEach(async ({ page, databasePage }) => {
    await page.goto("/");
    await databasePage.createEncryptedDatabase(databasePassword);
  });

  test("create transactions", async ({
    page,
    accountDetailPage,
    accountPage,
    dashboardPage,
    databasePage,
    settingsPage,
  }) => {
    await settingsPage.goToCategories();
    await settingsPage.createCategory(categoryName);

    await accountPage.goToAccounts();
    await accountPage.createAccount(accountName);

    await expect(page.getByRole("heading", { name: `$0.00` })).toBeVisible();
    await accountPage.goToAccount(accountName);
    await expect(page.getByRole("heading", { name: `$0.00` })).toBeVisible();

    await accountDetailPage.expectTransactionsToBeHidden(transactions);
    await accountDetailPage.createTransactions(transactions);
    await accountDetailPage.expectTransactionsToBeVisible(transactions);
    await expect(
      page.getByRole("heading", { name: `$${transactionsTotal}` })
    ).toBeVisible();

    await expect(
      accountDetailPage.transactionCategoryLocator(
        transactions[0].payee,
        transactions[0].amount
      )
    ).not.toContainText(categoryName);
    await accountDetailPage.assignCategoryToTransaction(
      transactions[0].payee,
      transactions[0].amount,
      categoryName
    );
    await expect(
      accountDetailPage.transactionCategoryLocator(
        transactions[0].payee,
        transactions[0].amount
      )
    ).toContainText(categoryName);

    await dashboardPage.goto();
    await accountPage.goToAccounts();
    await accountPage.goToAccount(accountName);
    await accountDetailPage.expectTransactionsToBeVisible(transactions);
    await expect(
      page.getByRole("heading", { name: `$${transactionsTotal}` })
    ).toBeVisible();
    await expect(
      accountDetailPage.transactionCategoryLocator(
        transactions[0].payee,
        transactions[0].amount
      )
    ).toContainText(categoryName);

    const path = await databasePage.exportDatabase();
    await page.reload();
    await databasePage.importDatabase(path, databasePassword);

    await accountPage.goToAccounts();
    await accountPage.goToAccount(accountName);
    await accountDetailPage.expectTransactionsToBeVisible(transactions);
    await expect(
      page.getByRole("heading", { name: `$${transactionsTotal}` })
    ).toBeVisible();
    await expect(
      accountDetailPage.transactionCategoryLocator(
        transactions[0].payee,
        transactions[0].amount
      )
    ).toContainText(categoryName);
  });
});
