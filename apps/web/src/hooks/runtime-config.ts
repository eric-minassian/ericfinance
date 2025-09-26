import { useQuery } from "@tanstack/react-query";

interface RuntimeConfig {
  userPoolId: string;
  userPoolClientId: string;
  portfolioApiUrl: string;
}

export function useRuntimeConfig() {
  const query = useQuery({
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

  return query;
}
