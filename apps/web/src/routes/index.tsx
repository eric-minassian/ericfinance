import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDB } from "@/hooks/db";
import { Navigate, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { db, setFile, createEmptyDB, showCreateEncryptedDialog } = useDB();

  if (db) {
    return <Navigate to="/dashboard" />;
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFile(file);
    }
  };

  return (
    <div className="relative min-h-svh w-full">
      <div className="absolute top-4 right-4 z-10">
        <ModeToggle />
      </div>
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <div className="space-y-4 text-center mb-6">
            <h1 className="text-2xl font-bold">Welcome to EricFinance</h1>
            <p className="text-sm text-muted-foreground">
              Select your database file to get started
            </p>
          </div>
          <div className="space-y-2">
            <Input type="file" accept=".db,.enc" onChange={handleFileChange} />
            <div className="text-center my-2">
              <p className="text-sm text-muted-foreground">or</p>
            </div>
            <div className="space-y-2">
              <Button
                variant="outline"
                onClick={createEmptyDB}
                className="w-full"
              >
                Create New Database
              </Button>
              <Button
                variant="outline"
                onClick={showCreateEncryptedDialog}
                className="w-full"
              >
                Create Encrypted Database
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
