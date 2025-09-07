import type { Page } from "@playwright/test";

export class DashboardPage {
  constructor(public readonly page: Page) {}

  async goto() {
    await this.page.getByRole("link", { name: "Dashboard" }).click();
  }
}
