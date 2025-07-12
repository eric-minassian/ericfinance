import { expect, type Page } from "@playwright/test";

export class AccountDetailPage {
  constructor(public readonly page: Page) {}

  async createTransaction(payee: string, amount: string) {
    await this.page.getByRole("button", { name: "Create Transaction" }).click();
    await this.page.getByLabel("Payee").fill(payee);
    await this.page.getByLabel("Amount").fill(amount);
    await this.page.getByRole("button", { name: "Create Transaction" }).click();
  }

  async createTransactions(transactions: { payee: string; amount: string }[]) {
    for (const transaction of transactions) {
      await this.createTransaction(transaction.payee, transaction.amount);
    }
  }

  async assignCategoryToTransaction(
    payee: string,
    amount: string,
    categoryName: string
  ) {
    this.transactionCategoryLocator(payee, amount).click();
    await this.page.getByRole("option", { name: categoryName }).click();
  }

  transactionRowLocator(payee: string, amount: string) {
    return this.page.getByRole("row", { name: `${payee} $${amount}` });
  }

  transactionCategoryLocator(payee: string, amount: string) {
    return this.transactionRowLocator(payee, amount).getByRole("combobox");
  }

  async expectTransactionsToBeVisible(
    transactions: {
      payee: string;
      amount: string;
    }[]
  ) {
    for (const transaction of transactions) {
      await expect(
        this.transactionRowLocator(transaction.payee, transaction.amount)
      ).toBeVisible();
    }
  }
  async expectTransactionsToBeHidden(
    transactions: {
      payee: string;
      amount: string;
    }[]
  ) {
    for (const transaction of transactions) {
      await expect(
        this.transactionRowLocator(transaction.payee, transaction.amount)
      ).toBeHidden();
    }
  }
}
