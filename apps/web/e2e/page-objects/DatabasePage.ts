import type { Page } from "@playwright/test";

export class DatabasePage {
  constructor(public readonly page: Page) {}

  async createEncryptedDatabase(password: string) {
    await this.page
      .getByRole("button", { name: "Create Encrypted Database" })
      .click();

    await this.page.getByLabel("Password", { exact: true }).fill(password);
    await this.page
      .getByLabel("Confirm Password", { exact: true })
      .fill(password);
    await this.page.getByRole("button", { name: "Create" }).click();
  }

  async exportDatabase() {
    const downloadPromise = this.page.waitForEvent("download");

    await this.page.getByRole("button", { name: "Export Database" }).click();

    const download = await downloadPromise;
    return download.path();
  }

  async importDatabase(filePath: string, password: string) {
    const fileChooserPromise = this.page.waitForEvent("filechooser");

    await this.page.getByRole("button", { name: "Choose File" }).click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(filePath);

    await this.page.getByLabel("Password", { exact: true }).fill(password);
    await this.page.getByRole("button", { name: "Unlock" }).click();
  }
}
