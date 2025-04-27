import { useDB } from "@/hooks/db";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export function DBSelect() {
  const { setFile, createEmptyDB } = useDB();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFile(file);
    }
  };

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="space-y-4 text-center">
          <h1 className="text-2xl font-bold">Welcome to EricFinance</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Select your database file to get started
          </p>
        </div>
        <div className="space-y-2">
          <Input type="file" accept=".db" onChange={handleFileChange} />
          <div className="text-center">
            <p className="text-sm text-muted-foreground my-2">or</p>
            <Button
              variant="outline"
              onClick={createEmptyDB}
              className="w-full"
            >
              Create New Database
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
