import { DBContext } from "@/context/db";
import { useEffect, useState } from "react";
import initSqlJs, { type Database, type SqlJsStatic } from "sql.js";

export function DBProvider({ children }: { children: React.ReactNode }) {
  const [file, setFile] = useState<File | null>(null);
  const [db, setDB] = useState<Database | null>(null);
  const [sql, setSql] = useState<SqlJsStatic>();

  const createEmptyDB = () => {
    if (!sql) return;
    try {
      const newDb = new sql.Database();
      setDB(newDb);
      setFile(null);
      console.log("Empty database created successfully");
    } catch (error) {
      console.error("Error creating empty database:", error);
    }
  };

  const exportDB = () => {
    if (!db) return;
    const data = db.export();
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
      const SQL = await initSqlJs({
        locateFile: (file) => `/sql.js/${file}`,
      });
      setSql(SQL);
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
          const db = new sql.Database(uint8Array);
          setDB(db);
          console.log("Database initialized successfully");
        } catch (error) {
          console.error("Error initializing database:", error);
          setDB(null);
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
