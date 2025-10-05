import { schema } from "@/lib/db/schema";
import { SQLJsDatabase } from "drizzle-orm/sql-js";
import { createContext } from "react";

type DBContextType = {
  setFile: (file: File | null) => void;
  db: SQLJsDatabase<typeof schema> | null;
  exportDB: () => void;
  createEncryptedDB: (password: string) => Promise<void>;
  showCreateEncryptedDialog: () => void;
  changePassword: () => void;
  addEncryption: () => void;
  isEncrypted: boolean;
  importDecryptedDatabase: (
    bytes: Uint8Array,
    password: string | null
  ) => Promise<void>;
  getRawDatabaseBytes: () => Uint8Array | null;
};

export const DBContext = createContext<DBContextType>({
  setFile: () => null,
  db: null,
  exportDB: () => null,
  createEncryptedDB: () => Promise.resolve(),
  showCreateEncryptedDialog: () => null,
  changePassword: () => null,
  addEncryption: () => null,
  isEncrypted: false,
  importDecryptedDatabase: () => Promise.resolve(),
  getRawDatabaseBytes: () => null,
});
