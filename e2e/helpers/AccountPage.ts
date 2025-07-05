import type { Page } from "@playwright/test";

export class AccountPage {
  constructor(public readonly page: Page) {}

  async goToAccounts() {
    await this.page.getByRole("link", { name: "Accounts" }).click();
  }

  async createAccount(name: string) {
    await this.page.getByRole("button", { name: "Add Account" }).click();
    await this.page.getByLabel("Name").fill(name);
    await this.page.getByRole("button", { name: "Create Account" }).click();
  }
}
