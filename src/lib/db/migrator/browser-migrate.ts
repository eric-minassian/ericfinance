// https://github.com/drizzle-team/drizzle-orm/blob/main/drizzle-orm/src/sqlite-proxy/migrator.ts

import { sql } from "drizzle-orm";
import { SQLJsDatabase } from "drizzle-orm/sql-js";
import { readMigrationFiles } from "./read-migration-files";
import { MigrationConfig } from "./types";

export async function migrate<TSchema extends Record<string, unknown>>(
  db: SQLJsDatabase<TSchema>,
  config: MigrationConfig
) {
  const migrations = await readMigrationFiles(config);

  const migrationTableCreate = sql`
		CREATE TABLE IF NOT EXISTS "__drizzle_migrations" (
			id SERIAL PRIMARY KEY,
			hash text NOT NULL,
			created_at numeric
		)
	`;

  db.run(migrationTableCreate);

  const dbMigrations = db.values<[number, string, string]>(
    sql`SELECT id, hash, created_at FROM "__drizzle_migrations" ORDER BY created_at DESC LIMIT 1`
  );

  const lastDbMigration = dbMigrations[0] ?? undefined;

  const queriesToRun: string[] = [];
  for (const migration of migrations) {
    if (
      !lastDbMigration ||
      Number(lastDbMigration[2])! < migration.folderMillis
    ) {
      queriesToRun.push(
        ...migration.sql,
        `INSERT INTO "__drizzle_migrations" ("hash", "created_at") VALUES('${migration.hash}', '${migration.folderMillis}')`
      );
    }
  }

  for (const query of queriesToRun) {
    db.run(sql.raw(query));
  }
}
