import { createContext } from "react";
import { Database } from "sql.js";

type DBContextType = {
  setFile: (file: File | null) => void;
  db: Database | null;
  exportDB: () => void;
  createEmptyDB: () => void;
};

export const DBContext = createContext<DBContextType>({
  setFile: () => null,
  db: null,
  exportDB: () => null,
  createEmptyDB: () => null,
});
