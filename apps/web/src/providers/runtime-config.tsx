import { RuntimeConfig, RuntimeConfigContext } from "@/context/runtime-config";
import { useQuery } from "@tanstack/react-query";
import React from "react";

export function RuntimeConfigProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data, error, isLoading } = useQuery({
    queryKey: ["runtime-config"],
    queryFn: async (): Promise<RuntimeConfig> => {
      const res = await fetch("/config.json", { cache: "no-store" });
      if (!res.ok) {
        throw new Error(`Failed to load runtime config: ${res.status}`);
      }
      return res.json();
    },
    staleTime: Infinity,
    retry: false,
  });

  return (
    <RuntimeConfigContext.Provider
      value={{ config: data, loading: isLoading, error }}
    >
      {children}
    </RuntimeConfigContext.Provider>
  );
}
