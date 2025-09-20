import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useDB } from "@/hooks/db";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { Link, Navigate, createFileRoute } from "@tanstack/react-router";
import { useCallback, useRef, useState } from "react";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { db, setFile, showCreateEncryptedDialog } = useDB();
  const { authStatus } = useAuthenticator((context) => [context.authStatus]);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files?.length) return;
      const file = files[0];
      setFile(file);
    },
    [setFile]
  );

  if (db || authStatus === "authenticated") {
    return <Navigate to="/dashboard" />;
  }

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

  return (
    <div className="relative min-h-svh w-full flex items-center justify-center p-4">
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <ModeToggle />
      </div>
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center border-b">
          <CardTitle className="text-xl">EricFinance</CardTitle>
          <CardDescription className="text-[11px]">
            Minimal portfolio manager. Local-first. Optional sync.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6 py-2">
          <div
            className={`group relative flex flex-col items-center justify-center rounded-md border border-dashed p-6 text-center transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring/50 ${
              isDragging
                ? "border-primary bg-primary/5"
                : "hover:border-primary/60"
            }`}
            tabIndex={0}
            role="button"
            aria-label="Select or drop a database file"
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
          >
            <input
              ref={inputRef}
              type="file"
              accept=".db,.enc"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="space-y-1">
              <p className="text-sm font-medium">Open or Drop File</p>
              <p className="text-[11px] text-muted-foreground">
                Supports .db (plain) / .enc (encrypted)
              </p>
            </div>
          </div>
          <div className="grid gap-2">
            <Button
              variant="outline"
              onClick={showCreateEncryptedDialog}
              className="w-full"
            >
              Create Encrypted Database
            </Button>
          </div>
          <div className="flex flex-col items-center gap-1 text-[11px] text-muted-foreground">
            <span>Want sync & multi-device access?</span>
            <div className="flex items-center gap-3">
              <Button
                asChild
                variant="link"
                size="sm"
                className="h-auto px-0 text-xs"
              >
                <Link to="/login">Sign In</Link>
              </Button>
              <span className="text-muted-foreground/40">•</span>
              <Button
                asChild
                variant="link"
                size="sm"
                className="h-auto px-0 text-xs"
              >
                <Link to="/signup">Create Account</Link>
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-1 pt-0">
          <p className="text-[10px] text-muted-foreground text-center w-full">
            Only encrypted databases can be created. You can still open existing
            plain (.db) or encrypted (.enc) files.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
