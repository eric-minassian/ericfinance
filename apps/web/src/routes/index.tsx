import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { useDB } from "@/hooks/db";
import { Navigate, createFileRoute } from "@tanstack/react-router";
import { useRef } from "react";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { db, setFile, showCreateEncryptedDialog } = useDB();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (db) {
    return <Navigate to="/dashboard" />;
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFile(file);
    }
    e.target.value = "";
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="flex justify-end p-4">
        <ModeToggle />
      </header>
      <main className="flex flex-1 flex-col items-center justify-center gap-10 px-6 pb-16 text-center">
        <div className="max-w-lg space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight">
            Your private portfolio, on your terms
          </h1>
          <p className="text-sm text-muted-foreground">
            Start with a fresh encrypted database or bring your existing
            portfolio. All data stays on your device and is protected by your
            password.
          </p>
        </div>
        <div className="w-full max-w-sm space-y-3">
          <Button
            className="h-12 w-full"
            onClick={showCreateEncryptedDialog}
            size="lg"
          >
            Create encrypted portfolio
          </Button>
          <Button
            variant="secondary"
            className="h-12 w-full"
            onClick={handleUploadClick}
            size="lg"
          >
            Upload existing portfolio
          </Button>
          <p className="text-xs text-muted-foreground">
            New portfolios must be encrypted. Unencrypted files can still be
            imported and will remain local to your browser.
          </p>
        </div>
      </main>
      <input
        ref={fileInputRef}
        type="file"
        accept=".db,.enc"
        onChange={handleFileChange}
        className="sr-only"
      />
    </div>
  );
}
