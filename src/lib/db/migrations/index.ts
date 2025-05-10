import { MigrationJournal } from "../migrator/types";
import _journal from "./meta/_journal.json";

import Migration0 from "./0000_left_eternity.sql?raw";
import Migration1 from "./0001_early_gladiator.sql?raw";
import Migration2 from "./0002_parched_radioactive_man.sql?raw";

export const journal: MigrationJournal = _journal;

export const migrations: Record<string, string> = {
  "0000_left_eternity": Migration0,
  "0001_early_gladiator": Migration1,
  "0002_parched_radioactive_man": Migration2,
};
