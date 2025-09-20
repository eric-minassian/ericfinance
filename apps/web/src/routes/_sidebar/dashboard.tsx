import { Button } from "@/components/ui/button";
import { ContentLayout } from "@/components/ui/content-layout";
import { Header } from "@/components/ui/header";
import { DBContext } from "@/context/db";
import { useDB } from "@/hooks/db";
import { usePortfolioSync } from "@/hooks/use-portfolio-sync";
import { uploadLocalDatabase } from "@/lib/portfolio-sync";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
export const Route = createFileRoute("/_sidebar/dashboard")({
  component: RouteComponent,
});

function RouteComponent() {
  const { getRawDatabaseBytes, isEncrypted } =
    useDB() as unknown as React.ContextType<typeof DBContext>;
  const { client } = usePortfolioSync();
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    if (!client) {
      toast.error("Sync not configured");
      return;
    }
    const raw = getRawDatabaseBytes?.();
    if (!raw) {
      toast.error("No database loaded");
      return;
    }
    let password: string | null = null;
    if (isEncrypted) {
      // Ask password once (simple prompt). TODO: store in secure state provider.
      password =
        window.prompt("Enter your encryption password to sync") || null;
      if (!password) {
        toast.message("Sync cancelled");
        return;
      }
    } else {
      toast.error(
        "Remote sync requires encrypted database (create encrypted DB first)"
      );
      return;
    }
    try {
      setIsSyncing(true);
      await uploadLocalDatabase(raw, password!, client);
      toast.success("Portfolio uploaded");
    } catch (e) {
      const err = e as { message?: string; conflict?: unknown };
      if (err?.conflict) {
        toast.error("Conflict: remote changed. Download first.");
      } else {
        toast.error(err?.message || "Upload failed");
      }
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <ContentLayout
      header={
        <Header>
          <div className="flex items-center justify-between gap-4">
            <span>Dashboard</span>
            <Button
              size="sm"
              onClick={handleSync}
              disabled={isSyncing}
              variant="outline"
            >
              {isSyncing ? "Syncing..." : "Sync Now"}
            </Button>
          </div>
        </Header>
      }
    ></ContentLayout>
  );
}
