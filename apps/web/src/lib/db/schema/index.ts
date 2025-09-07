import { accountsTable } from "./accounts";
import { categoriesTable } from "./categories";
import { importsTable } from "./imports";
import { securitiesTable } from "./securities";
import { transactionsTable } from "./transactions";

export const schema = {
  account: accountsTable,
  transaction: transactionsTable,
  import: importsTable,
  security: securitiesTable,
  category: categoriesTable,
};
