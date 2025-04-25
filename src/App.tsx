import { useState } from "react";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { useDB } from "./hooks/db";

function App() {
  const { db, setFile, exportDB, createEmptyDB } = useDB();
  const [query, setQuery] = useState<string>("");

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            EricFinance
          </h1>
          <p className="text-muted-foreground">
            Your SQLite Database Management Tool
          </p>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                type="file"
                accept=".sqlite"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setFile(file);
                }}
                placeholder="Select a SQLite file"
                className="flex-1"
              />
              <Button variant="outline" onClick={createEmptyDB}>
                Create Empty DB
              </Button>
            </div>

            <div className="space-y-2">
              <Input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter SQL query"
              />
              <div className="flex gap-2">
                <Button
                  onClick={async () => {
                    if (!db) {
                      alert("Please select a SQLite file first.");
                      return;
                    }
                    try {
                      const result = db.select();
                      console.log("Query result:", result);
                    } catch (error) {
                      console.error("Error executing query:", error);
                    }
                  }}
                >
                  Execute Query
                </Button>
                <Button variant="secondary" onClick={exportDB} disabled={!db}>
                  Export Database
                </Button>
              </div>
            </div>

            {db && (
              <div className="mt-4 rounded border bg-muted/50 p-4">
                <pre className="text-sm text-muted-foreground whitespace-pre-wrap break-words">
                  {JSON.stringify(db, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
