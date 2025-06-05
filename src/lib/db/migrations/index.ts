import { MigrationJournal } from "../migrator/types";
import _journal from "./meta/_journal.json";

import Migration0 from "./0000_strong_roxanne_simpson.sql?raw";
import Migration1 from "./0001_dapper_mojo.sql?raw";
import Migration2 from "./0002_harsh_puff_adder.sql?raw";
import Migration3 from "./0003_messy_franklin_richards.sql?raw";
import Migration4 from "./0004_aberrant_hobgoblin.sql?raw";
import Migration5 from "./0005_mature_rachel_grey.sql?raw";

export const journal: MigrationJournal = _journal;

export const migrations: Record<string, string> = {
  "0000_strong_roxanne_simpson": Migration0,
  "0001_dapper_mojo": Migration1,
  "0002_harsh_puff_adder": Migration2,
  "0003_messy_franklin_richards": Migration3,
  "0004_aberrant_hobgoblin": Migration4,
  "0005_mature_rachel_grey": Migration5,
};
