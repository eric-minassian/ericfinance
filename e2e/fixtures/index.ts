import { test as base, Page } from "@playwright/test";
import { AccountPage } from "../page-objects/AccountPage";
import { DatabasePage } from "../page-objects/DatabasePage";
import { SettingsPage } from "../page-objects/SettingsPage";

type CustomFixtures = {
  databasePage: DatabasePage;
  accountPage: AccountPage;
  settingsPage: SettingsPage;
};

export const test = base.extend<CustomFixtures, { page: Page }>({
  databasePage: async ({ page }, use) => await use(new DatabasePage(page)),
  accountPage: async ({ page }, use) => await use(new AccountPage(page)),
  settingsPage: async ({ page }, use) => await use(new SettingsPage(page)),
});

export { expect } from "@playwright/test";
