import { expect, test } from "./helpers/fixtures";

test.describe("Accounts", () => {
  const accountName = "Eric's Account";

  test("create account", async ({ page, databasePage, accountPage }) => {
    await page.goto("/");

    await databasePage.createEncryptedDatabase("testpassword");

    const accountRow = page.getByRole("link", { name: accountName });
    await page.getByRole("link", { name: "Accounts" }).click();
    await expect(accountRow).toBeHidden();

    await accountPage.createAccount(accountName);

    await expect(page.getByRole("heading", { name: "Accounts" })).toBeVisible();
    await expect(accountRow).toBeVisible();
    await expect(accountRow.getByText("$0.00")).toBeVisible();
    await accountRow.click();

    await expect(
      page.getByRole("heading", { name: accountName })
    ).toBeVisible();
  });

  test("delete account", async ({ page, databasePage, accountPage }) => {
    await page.goto("/");

    await databasePage.createEncryptedDatabase("testpassword");

    await accountPage.goToAccounts();
    await accountPage.createAccount(accountName);

    const accountRow = page.getByRole("link", { name: accountName });
    await accountRow.click();

    page.on("dialog", (dialog) => dialog.accept());
    await page.getByRole("button", { name: "Edit" }).click();
    await page.getByRole("menuitem", { name: "Delete account" }).click();
    await expect(page.getByRole("heading", { name: "Accounts" })).toBeVisible();
    await expect(accountRow).toBeHidden();
  });
});
