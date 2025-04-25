import { SQLJsDatabase } from "drizzle-orm/sql-js";
import { createContext } from "react";

type DBContextType = {
  setFile: (file: File | null) => void;
  db: SQLJsDatabase | null;
  exportDB: () => void;
  createEmptyDB: () => void;
};

export const DBContext = createContext<DBContextType>({
  setFile: () => null,
  db: null,
  exportDB: () => null,
  createEmptyDB: () => null,
});
