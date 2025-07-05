import { expect, test } from "../fixtures";

test.describe("Database", () => {
  const databasePassword = "testpassword";

  test("create encrypted database", async ({ page }) => {
    await page.goto("/");

    await page
      .getByRole("button", { name: "Create Encrypted Database" })
      .click();

    await expect(
      page.getByRole("heading", { name: "Create Encrypted Database" })
    ).toBeVisible();

    await page.getByLabel("Password", { exact: true }).fill(databasePassword);
    await page
      .getByLabel("Confirm Password", { exact: true })
      .fill("wrongpassword");
    await page.getByRole("button", { name: "Create" }).click();

    await expect(page.getByText("Passwords do not match")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Create Encrypted Database" })
    ).toBeVisible();

    await page
      .getByLabel("Confirm Password", { exact: true })
      .fill(databasePassword);
    await page.getByRole("button", { name: "Create" }).click();

    await expect(
      page.getByRole("heading", { name: "Dashboard" })
    ).toBeVisible();
  });

  test("export & import encrypted database", async ({ page, databasePage }) => {
    await page.goto("/");

    await databasePage.createEncryptedDatabase(databasePassword);
    const path = await databasePage.exportDatabase();
    expect(path).toBeDefined();

    await page.reload();

    const fileChooserPromise = page.waitForEvent("filechooser");
    await page.getByRole("button", { name: "Choose File" }).click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(path);

    await expect(
      page.getByRole("heading", { name: "Unlock Database" })
    ).toBeVisible();
    await page.getByLabel("Password", { exact: true }).fill("testpassword1");
    await page.getByRole("button", { name: "Unlock" }).click();
    await expect(page.getByText("Incorrect password")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Unlock Database" })
    ).toBeVisible();
    await page.getByLabel("Password", { exact: true }).fill(databasePassword);
    await page.getByRole("button", { name: "Unlock" }).click();

    await expect(
      page.getByRole("heading", { name: "Dashboard" })
    ).toBeVisible();
  });
});
