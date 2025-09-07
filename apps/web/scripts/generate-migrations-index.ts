import fs from "node:fs";
import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { MigrationJournal } from "../src/lib/db/migrator/types";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const MIGRATIONS_DIR = path.join(__dirname, "../src/lib/db/migrations");
const INDEX_PATH = path.join(MIGRATIONS_DIR, "index.ts");
const JOURNAL_PATH = path.join(MIGRATIONS_DIR, "meta/_journal.json");

async function generateMigrationsIndex() {
  try {
    const journalAsString = fs.readFileSync(JOURNAL_PATH).toString();
    const journal = JSON.parse(journalAsString) as MigrationJournal;

    const imports = journal.entries.map((entry) => {
      const { idx, tag } = entry;
      const importName = `Migration${idx}`;
      return `import ${importName} from "./${tag}.sql?raw";`;
    });

    const migrationMappings = journal.entries.map((entry) => {
      const { idx, tag } = entry;
      const importName = `Migration${idx}`;
      return `  "${tag}": ${importName},`;
    });

    const indexContent = `import { MigrationJournal } from "../migrator/types";
import _journal from "./meta/_journal.json";

${imports.join("\n")}

export const journal: MigrationJournal = _journal;

export const migrations: Record<string, string> = {
${migrationMappings.join("\n")}
};
`;

    fs.writeFileSync(INDEX_PATH, indexContent);
    console.log("✅ Migrations index.ts successfully generated");
  } catch (error) {
    console.error("Error generating migrations index:", error);
    process.exit(1);
  }
}

generateMigrationsIndex();
