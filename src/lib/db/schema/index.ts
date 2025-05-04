import { accountsTable } from "./account";
import { importsTable } from "./import";
import { transactionsTable } from "./transaction";

export const schema = {
  account: accountsTable,
  transaction: transactionsTable,
  import: importsTable,
};
