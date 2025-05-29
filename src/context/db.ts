import { schema } from "@/lib/db/schema";
import { SQLJsDatabase } from "drizzle-orm/sql-js";
import { createContext } from "react";

type DBContextType = {
  setFile: (file: File | null) => void;
  db: SQLJsDatabase<typeof schema> | null;
  exportDB: () => void;
  createEmptyDB: () => Promise<void>;
  createEncryptedDB: (password: string) => Promise<void>;
  showCreateEncryptedDialog: () => void;
  changePassword: () => void;
  addEncryption: () => void;
  isEncrypted: boolean;
};

export const DBContext = createContext<DBContextType>({
  setFile: () => null,
  db: null,
  exportDB: () => null,
  createEmptyDB: () => Promise.resolve(),
  createEncryptedDB: () => Promise.resolve(),
  showCreateEncryptedDialog: () => null,
  changePassword: () => null,
  addEncryption: () => null,
  isEncrypted: false,
});
