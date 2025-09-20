import { RuntimeConfigContext } from "@/context/runtime-config";
import { useContext } from "react";

export function useRuntimeConfig() {
  const ctx = useContext(RuntimeConfigContext);
  if (!ctx)
    throw new Error(
      "useRuntimeConfig must be used within RuntimeConfigProvider"
    );
  return ctx;
}
