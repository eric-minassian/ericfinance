import { DBContext } from "@/context/db";
import { useContext } from "react";

export function useDB() {
  const context = useContext(DBContext);
  if (context === undefined) {
    throw new Error("useDB must be used within a DBProvider");
  }
  return context;
}
