import Icon from "@/components/icon";
import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDB } from "@/hooks/db";
import { Account } from "@/lib/db/schema/accounts";
import { useState } from "react";

interface ImportTransactionsDialogProps {
  accountId: Account["id"];
}

export function ImportTransactionsDialog({
  accountId,
}: ImportTransactionsDialogProps) {
  const { db } = useDB();
  const [file, setFile] = useState<File | undefined>(undefined);

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Upload CSV</DialogTitle>
        <DialogDescription>
          Find out more about how to format your CSV for success{" "}
          <Button variant="link" size="icon" asChild>
            <a
              href="https://example.com/csv-format"
              target="_blank"
              rel="noopener noreferrer"
            >
              here
            </a>
          </Button>
          .
        </DialogDescription>
      </DialogHeader>
      {file ? (
        <div>{file.name}</div>
      ) : (
        <>
          <input
            id="file-upload"
            type="file"
            accept=".csv"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setFile(file);
              }
            }}
            className="hidden"
          />
          <label
            htmlFor="file-upload"
            className="h-32 cursor-pointer flex items-center justify-center rounded-md border-2 border-dashed border-muted-foreground text-muted-foreground hover:bg-muted"
          >
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center justify-center rounded-full border p-2.5">
                <Icon variant="upload" />
              </div>
              <p className="font-medium text-sm">
                Click to browse (max 1 file)
              </p>
            </div>
          </label>
        </>
      )}
      <DialogFooter></DialogFooter>
    </DialogContent>
  );
}
