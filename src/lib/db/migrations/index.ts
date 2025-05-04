import { MigrationJournal } from "../migrator/types";
import _journal from "./meta/_journal.json";

import Migration0 from "./0000_left_eternity.sql?raw";

export const journal: MigrationJournal = _journal;

export const migrations: Record<string, string> = {
  "0000_left_eternity": Migration0,
};
