import { accountsTable } from "./account";
import { importsTable } from "./import";
import { securitiesTable } from "./security";
import { transactionsTable } from "./transaction";

export const schema = {
  account: accountsTable,
  transaction: transactionsTable,
  import: importsTable,
  security: securitiesTable,
};
