import { test as base, Page } from "@playwright/test";
import { AccountPage } from "./AccountPage";
import { DatabasePage } from "./DatabasePage";

type CustomFixtures = {
  databasePage: DatabasePage;
  accountPage: AccountPage;
};

export const test = base.extend<CustomFixtures, { page: Page }>({
  databasePage: async ({ page }, use) => await use(new DatabasePage(page)),
  accountPage: async ({ page }, use) => await use(new AccountPage(page)),
});

export { expect } from "@playwright/test";
