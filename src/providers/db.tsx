import { SimplePasswordDialog } from "@/components/password-dialog";
import { DBContext } from "@/context/db";
import {
  decryptDatabase,
  encryptDatabase,
  isEncryptedDatabase,
} from "@/lib/crypto";
import { journal, migrations } from "@/lib/db/migrations";
import { migrate } from "@/lib/db/migrator/browser-migrate";
import { schema } from "@/lib/db/schema";
import { drizzle, SQLJsDatabase } from "drizzle-orm/sql-js";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import initSqlJs, { type Database, type SqlJsStatic } from "sql.js";

export function DBProvider({ children }: { children: React.ReactNode }) {
  const [file, setFile] = useState<File | null>(null);
  const [db, setDB] = useState<SQLJsDatabase<typeof schema> | null>(null);
  const [sqlDb, setSqlDb] = useState<Database | null>(null);
  const [sql, setSql] = useState<SqlJsStatic>();
  const [password, setPassword] = useState<string | null>(null);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [passwordDialogType, setPasswordDialogType] = useState<
    "create" | "unlock" | "change" | "addEncryption" | null
  >(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        if (db) {
          e.preventDefault();
          e.returnValue = true;
        }
      };

      window.addEventListener("beforeunload", handleBeforeUnload);
      return () => {
        window.removeEventListener("beforeunload", handleBeforeUnload);
      };
    }
  }, [db]);

  const createEmptyDB = async () => {
    if (!sql) return;
    try {
      const newDb = new sql.Database();
      const db = drizzle(newDb, { schema: schema });

      await migrate(db, { journal, migrations });

      setDB(db);
      setSqlDb(newDb);
      setFile(null);
      setPassword(null);
      console.log("Empty database created successfully");
    } catch (error) {
      console.error("Error creating empty database:", error);
    }
  };

  const createEncryptedDB = async (dbPassword: string) => {
    if (!sql) return;
    try {
      const newDb = new sql.Database();
      const db = drizzle(newDb, { schema: schema });

      await migrate(db, { journal, migrations });

      setDB(db);
      setSqlDb(newDb);
      setFile(null);
      setPassword(dbPassword);
      console.log("Empty encrypted database created successfully");
      toast.success("Encrypted database created successfully");
    } catch (error) {
      console.error("Error creating encrypted database:", error);
      toast.error("Failed to create encrypted database");
    }
  };

  const exportDB = async () => {
    if (!sqlDb) return;

    try {
      const data = sqlDb.export();
      let exportData: Uint8Array;
      let filename: string;

      if (password) {
        // Encrypt the database if we have a password
        exportData = await encryptDatabase(data, password);
        filename = "database.enc";
      } else {
        // Export unencrypted
        exportData = data;
        filename = "database.db";
      }

      const blob = new Blob([exportData], {
        type: password ? "application/octet-stream" : "application/x-sqlite3",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(`Database exported successfully as ${filename}`);
    } catch (error) {
      console.error("Error exporting database:", error);
      toast.error("Failed to export database");
    }
  };

  // Handle password submission for unlocking encrypted databases
  const handlePasswordSubmit = async (enteredPassword: string) => {
    if (!pendingFile || !sql) {
      throw new Error("No pending file to decrypt");
    }

    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async function () {
        try {
          if (!reader.result) {
            throw new Error("Failed to read file");
          }

          const arrayBuffer = reader.result as ArrayBuffer;
          const uint8Array = new Uint8Array(arrayBuffer);

          let dbData: Uint8Array;

          if (isEncryptedDatabase(uint8Array)) {
            // Decrypt the database
            dbData = await decryptDatabase(uint8Array, enteredPassword);
            setPassword(enteredPassword); // Store password for future exports
          } else {
            dbData = uint8Array;
            setPassword(null); // No password for unencrypted databases
          }

          const sqlDb = new sql.Database(dbData);
          const db = drizzle(sqlDb, { schema: schema });

          await migrate(db, { journal, migrations });

          setDB(db);
          setSqlDb(sqlDb);
          setPendingFile(null);
          console.log("Database initialized successfully");
          toast.success("Database loaded successfully");
          resolve();
        } catch (error) {
          console.error("Error initializing database:", error);
          // Don't clear pendingFile on error, so user can retry
          setDB(null);
          setSqlDb(null);
          reject(error);
        }
      };

      reader.onerror = () => {
        reject(new Error("Failed to read file"));
      };

      reader.readAsArrayBuffer(pendingFile);
    });
  };

  // Handle new encrypted database creation
  const handleCreateEncryptedDB = async (enteredPassword: string) => {
    await createEncryptedDB(enteredPassword);
  };

  // Show dialog for creating encrypted database
  const showCreateEncryptedDialog = () => {
    setPasswordDialogType("create");
    setIsPasswordDialogOpen(true);
  };

  // Show dialog for changing password
  const changePassword = () => {
    setPasswordDialogType("change");
    setIsPasswordDialogOpen(true);
  };

  // Show dialog for adding encryption to unencrypted database
  const addEncryption = () => {
    setPasswordDialogType("addEncryption");
    setIsPasswordDialogOpen(true);
  };

  // Handle password change
  const handleChangePassword = async (newPassword: string) => {
    if (!sqlDb) {
      throw new Error("No database available");
    }

    try {
      setPassword(newPassword);
      toast.success("Password changed successfully");
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error("Failed to change password");
      throw error;
    }
  };

  // Handle adding encryption to unencrypted database
  const handleAddEncryption = async (newPassword: string) => {
    if (!sqlDb) {
      throw new Error("No database available");
    }

    try {
      setPassword(newPassword);
      toast.success("Encryption added successfully");
    } catch (error) {
      console.error("Error adding encryption:", error);
      toast.error("Failed to add encryption");
      throw error;
    }
  };

  // Determine if current database is encrypted
  const isEncrypted = password !== null;

  useEffect(() => {
    async function initializeDatabase() {
      const sqlPromise = await initSqlJs({
        locateFile: (file) => `/sql.js/${file}`,
      });
      setSql(sqlPromise);
    }

    initializeDatabase();
  }, []);

  useEffect(() => {
    if (file && sql) {
      const reader = new FileReader();
      reader.onload = async function () {
        if (!reader.result) {
          return;
        }
        const arrayBuffer = reader.result as ArrayBuffer;
        const uint8Array = new Uint8Array(arrayBuffer);

        try {
          if (isEncryptedDatabase(uint8Array)) {
            // This is an encrypted database, show password dialog
            setPendingFile(file);
            setPasswordDialogType("unlock");
            setIsPasswordDialogOpen(true);
            return;
          }

          // This is an unencrypted database, load directly
          const sqlDb = new sql.Database(uint8Array);
          const db = drizzle(sqlDb, { schema: schema });

          await migrate(db, { journal, migrations });

          setDB(db);
          setSqlDb(sqlDb);
          setPassword(null); // No password for unencrypted databases
          console.log("Database initialized successfully");
        } catch (error) {
          console.error("Error initializing database:", error);
          setDB(null);
          setSqlDb(null);
          toast.error("Failed to load database file");
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      setDB(null);
    }
  }, [file, sql]);

  return (
    <DBContext.Provider
      value={{
        setFile,
        db,
        exportDB,
        createEmptyDB,
        createEncryptedDB,
        showCreateEncryptedDialog,
        changePassword,
        addEncryption,
        isEncrypted,
      }}
    >
      {children}
      <SimplePasswordDialog
        isOpen={isPasswordDialogOpen}
        onClose={() => {
          setIsPasswordDialogOpen(false);
          setPasswordDialogType(null);
          setPendingFile(null); // Clear pending file when user explicitly closes dialog
        }}
        onSubmit={
          passwordDialogType === "create"
            ? handleCreateEncryptedDB
            : passwordDialogType === "change"
            ? handleChangePassword
            : passwordDialogType === "addEncryption"
            ? handleAddEncryption
            : handlePasswordSubmit
        }
        type={passwordDialogType || "unlock"}
      />
    </DBContext.Provider>
  );
}
