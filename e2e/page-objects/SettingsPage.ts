import type { Page } from "@playwright/test";

export class SettingsPage {
  constructor(public readonly page: Page) {}

  async goToSettings() {
    await this.page.getByRole("link", { name: "Settings" }).click();
  }

  async goToCategories() {
    await this.goToSettings();
    await this.page.getByRole("tab", { name: "Categories" }).click();
  }

  async createCategory(name: string) {
    await this.page.getByRole("button", { name: "Create Category" }).click();
    await this.page.getByLabel("Name").fill(name);
    await this.page.getByRole("button", { name: "Create" }).click();
  }

  categoryLocator(name: string) {
    return this.page
      .locator("main")
      .getByRole("listitem")
      .filter({ hasText: name });
  }
}
