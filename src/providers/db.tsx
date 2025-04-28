import { DBContext } from "@/context/db";
import { journal, migrations } from "@/lib/db/migrations";
import { migrate } from "@/lib/db/migrator/browser-migrate";
import { drizzle, SQLJsDatabase } from "drizzle-orm/sql-js";
import { useEffect, useState } from "react";
import initSqlJs, { type Database, type SqlJsStatic } from "sql.js";

export function DBProvider({ children }: { children: React.ReactNode }) {
  const [file, setFile] = useState<File | null>(null);
  const [db, setDB] = useState<SQLJsDatabase | null>(null);
  const [sqlDb, setSqlDb] = useState<Database | null>(null);
  const [sql, setSql] = useState<SqlJsStatic>();

  useEffect(() => {
    if (process.env.NODE_ENV != "development") {
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
      const db = drizzle(newDb);

      await migrate(db, { journal, migrations });

      setDB(db);
      setSqlDb(newDb);
      setFile(null);
      console.log("Empty database created successfully");
    } catch (error) {
      console.error("Error creating empty database:", error);
    }
  };

  const exportDB = () => {
    if (!sqlDb) return;
    const data = sqlDb.export();
    const blob = new Blob([data], { type: "application/x-sqlite3" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "database.sqlite";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

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
      reader.onload = function () {
        if (!reader.result) {
          return;
        }
        const arrayBuffer = reader.result as ArrayBuffer;
        const uint8Array = new Uint8Array(arrayBuffer);
        try {
          const sqlDb = new sql.Database(uint8Array);
          const db = drizzle(sqlDb);
          setDB(db);
          setSqlDb(sqlDb);
          console.log("Database initialized successfully");
        } catch (error) {
          console.error("Error initializing database:", error);
          setDB(null);
          setSqlDb(null);
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      setDB(null);
    }
  }, [file, sql]);

  return (
    <DBContext.Provider value={{ setFile, db, exportDB, createEmptyDB }}>
      {children}
    </DBContext.Provider>
  );
}
