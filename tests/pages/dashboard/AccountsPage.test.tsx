import { beforeEach, describe, expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";
import { DBContext } from "../../../src/context/db";
import "../../../src/index.css";
import { accountsTable } from "../../../src/lib/db/schema/accounts";
import AccountsPage from "../../../src/pages/(dashboard)/accounts/page";
import { QueryProvider } from "../../../src/providers/query";
import { createMockDBContext, createTestDB } from "../../utils/db-mock";

vi.mock("../../../src/hooks/db", () => ({
  useDB: () => vi.mocked(mockDBContext),
}));

let mockDBContext: ReturnType<typeof createMockDBContext>;
let mockDB: Awaited<ReturnType<typeof createTestDB>>;

describe("AccountsPage", () => {
  beforeEach(async () => {
    mockDB = await createTestDB();
    mockDBContext = createMockDBContext(mockDB);
  });

  test("renders account list", async () => {
    await mockDB.insert(accountsTable).values([
      { id: "acc-1", name: "Test Account 1", variant: "transactions" },
      { id: "acc-2", name: "Test Account 2", variant: "securities" },
      { id: "acc-3", name: "Test Account 3", variant: "transactions" },
    ]);

    const container = render(
      <QueryProvider>
        <DBContext.Provider value={mockDBContext}>
          <AccountsPage />
        </DBContext.Provider>
      </QueryProvider>
    );

    await expect
      .poll(() => container.getByText("Test Account 1"))
      .toBeVisible();
    await expect
      .poll(() => container.getByText("Test Account 2"))
      .toBeVisible();
    await expect
      .poll(() => container.getByText("Test Account 3"))
      .toBeVisible();
  });
});
