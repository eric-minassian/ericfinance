import { ModeToggle } from "@/components/mode-toggle";
import { PasswordDialog } from "@/components/password-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/auth";
import { useDB } from "@/hooks/db";
import { usePortfolioSync } from "@/hooks/use-portfolio-sync";
import { DownloadResponse } from "@/lib/portfolio-sync";
import { cn } from "@/lib/utils";
import { Link, Navigate, createFileRoute } from "@tanstack/react-router";
import {
  ChevronRight,
  Cloud,
  HardDrive,
  Lock,
  RefreshCw,
  UploadCloud,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  const auth = useAuth();
  const isAuthenticated = auth?.data;
  const authLoading = auth?.isLoading;

  const { db, setFile, showCreateEncryptedDialog, importDecryptedDatabase } =
    useDB();
  const { client: portfolioClient } = usePortfolioSync();
  const [remoteState, setRemoteState] = useState<{
    data: DownloadResponse | null;
    loading: boolean;
    error: string | null;
  }>({ data: null, loading: false, error: null });
  const [unlockDialogOpen, setUnlockDialogOpen] = useState(false);
  const [unlockTarget, setUnlockTarget] = useState<DownloadResponse | null>(
    null
  );
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const remoteMeta = useMemo(() => {
    if (!remoteState.data) {
      return {
        updated: null as string | null,
        updatedRelative: null as string | null,
        size: null as string | null,
        cipher: null as string | null,
      };
    }
    const cipher = remoteState.data.metadata?.cipher;
    return {
      updated: formatFullTimestamp(remoteState.data.lastModified),
      updatedRelative: formatRelativeTime(remoteState.data.lastModified),
      size: formatFileSize(remoteState.data.sizeBytes),
      cipher: cipher ? cipher.toUpperCase() : null,
    };
  }, [remoteState.data]);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files?.length) return;
      setFile(files[0]);
    },
    [setFile]
  );

  const fetchRemote = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!portfolioClient) return;
      setRemoteState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const data = await portfolioClient.checkRemote();
        setRemoteState({ data, loading: false, error: null });
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to load synced portfolios";
        setRemoteState({ data: null, loading: false, error: message });
        if (!options?.silent) {
          toast.error("Unable to reach sync service");
        }
      }
    },
    [portfolioClient]
  );

  useEffect(() => {
    if (isAuthenticated && portfolioClient) {
      fetchRemote({ silent: true });
    } else {
      setRemoteState({ data: null, loading: false, error: null });
    }
  }, [fetchRemote, isAuthenticated, portfolioClient]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    if (!isDragging) setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const openUnlockDialog = () => {
    if (!remoteState.data?.exists) {
      toast.info("No synced portfolio found yet");
      return;
    }
    setUnlockTarget(remoteState.data);
    setUnlockDialogOpen(true);
  };

  const handleUnlockSubmit = async (password: string) => {
    if (!portfolioClient) {
      throw new Error("Sync unavailable");
    }
    const decrypted = await portfolioClient.downloadAndDecrypt(password);
    if (!decrypted) {
      throw new Error("No synced portfolio available");
    }
    await importDecryptedDatabase(decrypted, password);
    toast.success("Synced portfolio unlocked");
    await fetchRemote({ silent: true });
  };

  const unlockDescription = useMemo(() => {
    if (!unlockTarget) {
      return "Enter the password you used to encrypt this portfolio.";
    }
    const parts: string[] = [];
    const updatedLabel = formatUpdatedTimestamp(unlockTarget.lastModified);
    const sizeLabel = formatFileSize(unlockTarget.sizeBytes);
    if (updatedLabel) parts.push(`Last updated ${updatedLabel}`);
    if (sizeLabel) parts.push(sizeLabel);
    if (parts.length === 0)
      return "Enter the password you used to encrypt this portfolio.";
    return `Enter the password to unlock this portfolio (${parts.join(
      " • "
    )}).`;
  }, [unlockTarget]);

  if (db) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="relative flex min-h-svh flex-col bg-gradient-to-b from-background via-background to-background/80">
      <div className="absolute right-4 top-4 z-10 flex items-center gap-2">
        <ModeToggle />
      </div>
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 pb-12 pt-16">
        <section className="space-y-4">
          <div className="space-y-3">
            <div className="text-xs font-medium uppercase tracking-[0.4em] text-muted-foreground">
              EricFinance
            </div>
            <h1 className="text-3xl font-semibold tracking-tight">
              Your portfolio, encrypted and in sync.
            </h1>
            <p className="text-sm text-muted-foreground">
              Load an offline database or unlock your cloud backup. Everything
              stays client-side, so only your password can decrypt it.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {authLoading ? (
              <Skeleton className="h-7 w-40" />
            ) : isAuthenticated ? (
              <Badge variant="secondary" className="gap-1">
                <Lock className="h-3 w-3" /> Signed in
                {auth?.data?.userId ? ` as ${auth.data.userId}` : ""}
              </Badge>
            ) : (
              <div className="flex items-center gap-2">
                <Button size="sm" asChild>
                  <Link to="/login">Sign in</Link>
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <Link to="/signup">Create account</Link>
                </Button>
              </div>
            )}
          </div>
        </section>

        <div className="flex flex-col gap-5">
          <Card className="border-border/60 bg-card/80 shadow-sm backdrop-blur">
            <CardHeader className="flex flex-row items-start justify-between gap-3">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                  <Cloud className="h-4 w-4" /> Synced portfolios
                </CardTitle>
                <CardDescription>
                  Unlock an encrypted backup saved to your account.
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="mt-1"
                onClick={() => fetchRemote()}
                disabled={
                  !isAuthenticated || !portfolioClient || remoteState.loading
                }
              >
                <RefreshCw
                  className={cn(
                    "h-4 w-4",
                    remoteState.loading && "animate-spin"
                  )}
                />
                <span className="sr-only">Refresh synced portfolios</span>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {!isAuthenticated ? (
                <p className="text-sm text-muted-foreground">
                  Sign in to see and unlock your synced portfolios.
                </p>
              ) : !portfolioClient ? (
                <p className="text-sm text-muted-foreground">
                  Sync service is still configuring. Try refreshing in a few
                  seconds.
                </p>
              ) : remoteState.loading ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ) : remoteState.error ? (
                <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {remoteState.error}
                </div>
              ) : remoteState.data?.exists ? (
                <button
                  type="button"
                  onClick={openUnlockDialog}
                  className="flex w-full items-center gap-3 rounded-lg border border-border/60 bg-muted/30 px-4 py-3 text-left transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2"
                >
                  <div className="flex flex-1 flex-col gap-1">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      Encrypted portfolio
                      <Badge variant="outline" className="gap-1 text-[11px]">
                        <Lock className="h-3 w-3" />
                        {remoteMeta.cipher ?? "ENCRYPTED"}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      {remoteMeta.updated && (
                        <span>Updated {remoteMeta.updated}</span>
                      )}
                      {remoteMeta.updatedRelative && (
                        <span className="text-muted-foreground/60">
                          {remoteMeta.updatedRelative}
                        </span>
                      )}
                      {remoteMeta.size && <span>{remoteMeta.size}</span>}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No synced portfolio yet. Upload your encrypted database to
                  back it up securely.
                </p>
              )}
              {remoteState.data?.exists && (
                <p className="text-[11px] text-muted-foreground">
                  You&rsquo;ll need the password you chose when encrypting.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/80 shadow-sm backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <HardDrive className="h-4 w-4" /> Open from your device
              </CardTitle>
              <CardDescription>
                Drop an encrypted (.enc) or plain (.db) portfolio to start.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                className={cn(
                  "group flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border border-dashed px-5 py-6 text-center text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                  isDragging
                    ? "border-primary bg-primary/5"
                    : "border-border/70 bg-muted/20 hover:border-primary/60"
                )}
                role="button"
                tabIndex={0}
                onClick={() => inputRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    inputRef.current?.click();
                  }
                }}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                aria-label="Select or drop a portfolio file"
              >
                <UploadCloud className="h-6 w-6 text-primary" />
                <div className="space-y-1">
                  <p className="font-medium">Tap to choose or drop a file</p>
                  <p className="text-xs text-muted-foreground">
                    We&rsquo;ll ask for the password if it&rsquo;s encrypted.
                  </p>
                </div>
                <input
                  ref={inputRef}
                  type="file"
                  accept=".db,.enc,.sqlite"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-[11px] text-muted-foreground">
                Need a fresh start? Create an encrypted blank portfolio.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={showCreateEncryptedDialog}
              >
                Create new
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>

      <PasswordDialog
        open={unlockDialogOpen}
        onOpenChange={setUnlockDialogOpen}
        title="Unlock synced portfolio"
        description={unlockDescription}
        onSubmit={handleUnlockSubmit}
      />
    </div>
  );
}

function formatFileSize(size?: number | null) {
  if (!size || Number.isNaN(size)) {
    return null;
  }
  const units = ["bytes", "KB", "MB", "GB", "TB"] as const;
  let value = size;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  const decimals = value >= 10 || unitIndex === 0 ? 0 : 1;
  return `${value.toFixed(decimals)} ${units[unitIndex]}`;
}

function formatFullTimestamp(iso?: string) {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatRelativeTime(iso?: string) {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  const diffSeconds = (date.getTime() - Date.now()) / 1000;
  const absSeconds = Math.round(Math.abs(diffSeconds));
  const formatter = new Intl.RelativeTimeFormat(undefined, {
    numeric: "auto",
  });
  if (absSeconds < 60) {
    return formatter.format(Math.round(diffSeconds), "second");
  }
  if (absSeconds < 3600) {
    return formatter.format(Math.round(diffSeconds / 60), "minute");
  }
  if (absSeconds < 86400) {
    return formatter.format(Math.round(diffSeconds / 3600), "hour");
  }
  if (absSeconds < 604800) {
    return formatter.format(Math.round(diffSeconds / 86400), "day");
  }
  if (absSeconds < 2629800) {
    return formatter.format(Math.round(diffSeconds / 604800), "week");
  }
  if (absSeconds < 31557600) {
    return formatter.format(Math.round(diffSeconds / 2629800), "month");
  }
  return formatter.format(Math.round(diffSeconds / 31557600), "year");
}

function formatUpdatedTimestamp(iso?: string) {
  const full = formatFullTimestamp(iso);
  const relative = formatRelativeTime(iso);
  if (full && relative) {
    return `${full} (${relative})`;
  }
  return full || relative || null;
}
