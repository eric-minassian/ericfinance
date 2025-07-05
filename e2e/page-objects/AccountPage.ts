import type { Page } from "@playwright/test";

export class AccountPage {
  constructor(public readonly page: Page) {}

  async goToAccounts() {
    await this.page.getByRole("link", { name: "Accounts" }).click();
  }

  async goToAccount(name: string) {
    await this.page.getByRole("link", { name }).click();
  }

  async createAccount(name: string) {
    await this.page.getByRole("button", { name: "Add Account" }).click();
    await this.page.getByLabel("Name").fill(name);
    await this.page.getByRole("button", { name: "Create Account" }).click();
  }

  async createTransaction(payee: string, amount: string) {
    await this.page.getByRole("button", { name: "Create Transaction" }).click();
    await this.page.getByLabel("Payee").fill(payee);
    await this.page.getByLabel("Amount").fill(amount);
    await this.page.getByRole("button", { name: "Create Transaction" }).click();
  }
}
