import { test as base, Page } from "@playwright/test";
import { AccountDetailPage } from "../page-objects/AccountDetailPage";
import { AccountPage } from "../page-objects/AccountPage";
import { DashboardPage } from "../page-objects/DashboardPage";
import { DatabasePage } from "../page-objects/DatabasePage";
import { SettingsPage } from "../page-objects/SettingsPage";

type CustomFixtures = {
  databasePage: DatabasePage;
  accountPage: AccountPage;
  accountDetailPage: AccountDetailPage;
  settingsPage: SettingsPage;
  dashboardPage: DashboardPage;
};

export const test = base.extend<CustomFixtures, { page: Page }>({
  databasePage: async ({ page }, use) => await use(new DatabasePage(page)),
  accountPage: async ({ page }, use) => await use(new AccountPage(page)),
  accountDetailPage: async ({ page }, use) =>
    await use(new AccountDetailPage(page)),
  settingsPage: async ({ page }, use) => await use(new SettingsPage(page)),
  dashboardPage: async ({ page }, use) => await use(new DashboardPage(page)),
});

export { expect } from "@playwright/test";
