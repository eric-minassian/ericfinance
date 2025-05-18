import { MigrationJournal } from "../migrator/types";
import _journal from "./meta/_journal.json";

import Migration0 from "./0000_strong_roxanne_simpson.sql?raw";

export const journal: MigrationJournal = _journal;

export const migrations: Record<string, string> = {
  "0000_strong_roxanne_simpson": Migration0,
};
