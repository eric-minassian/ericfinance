import { drizzle, SQLJsDatabase } from "drizzle-orm/sql-js";
import initSqlJs from "sql.js";
import { journal, migrations } from "../../src/lib/db/migrations";
import { migrate } from "../../src/lib/db/migrator/browser-migrate";
import { schema } from "../../src/lib/db/schema";

let sqlJs: Awaited<ReturnType<typeof initSqlJs>> | null = null;

export async function createTestDB(): Promise<SQLJsDatabase<typeof schema>> {
  // Initialize SQL.js if not already done
  if (!sqlJs) {
    sqlJs = await initSqlJs({
      locateFile: (file) => `/sql.js/${file}`,
    });
  }

  // Create a new in-memory database
  const sqlDb = new sqlJs.Database();
  const db = drizzle(sqlDb, { schema });

  // Run migrations
  await migrate(db, { journal, migrations });

  return db;
}

export function createMockDBContext(db: SQLJsDatabase<typeof schema>) {
  return {
    setFile: () => null,
    db,
    exportDB: () => null,
    createEmptyDB: () => Promise.resolve(),
    createEncryptedDB: () => Promise.resolve(),
    showCreateEncryptedDialog: () => null,
    changePassword: () => null,
    addEncryption: () => null,
    isEncrypted: false,
  };
}
