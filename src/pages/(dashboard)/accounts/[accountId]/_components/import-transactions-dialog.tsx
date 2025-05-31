import Icon from "@/components/icon";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDB } from "@/hooks/db";
import { DateString } from "@/lib/date";
import { Account } from "@/lib/db/schema/accounts";
import { Transaction } from "@/lib/db/schema/transactions";
import { ParseResult } from "@/lib/parser";
import { parseCSV } from "@/lib/parser/csv";
import { createTransactions } from "@/lib/services/transactions/create-transactions";
import { listTransactions } from "@/lib/services/transactions/list-transactions";
import { formatCurrency } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import currency from "currency.js";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface ImportTransactionsDialogProps {
  accountId: Account["id"];
  setDialogOpen: (open: boolean) => void;
}

export function ImportTransactionsDialog({
  accountId,
  setDialogOpen,
}: ImportTransactionsDialogProps) {
  const [data, setData] = useState<ParseResult | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const csv = event.target?.result as string;
      const result = parseCSV(csv);
      setData(result);
    };
    reader.readAsText(selectedFile);
  }

  return (
    <DialogContent className="min-w-9/12 max-w-3xl">
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
      {data ? (
        <ImportTransactions
          parseResult={data}
          accountId={accountId}
          setData={setData}
          setDialogOpen={setDialogOpen}
        />
      ) : (
        <>
          <input
            id="file-upload"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
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
    </DialogContent>
  );
}

interface ImportTransactionsProps {
  parseResult: ParseResult;
  accountId: Account["id"];
  setData: React.Dispatch<React.SetStateAction<ParseResult | null>>;
  setDialogOpen: (open: boolean) => void;
}

function ImportTransactions({
  parseResult,
  accountId,
  setData,
  setDialogOpen,
}: ImportTransactionsProps) {
  const { db } = useDB();
  const { data: existingTransactions } = useQuery({
    queryKey: ["listTransactions", accountId],
    queryFn: () => listTransactions({ db: db!, accountId }),
  });

  const [dateKey, setDateKey] = useState<string | null>(null);
  const [amountKey, setAmountKey] = useState<string | null>(null);
  const [payeeKey, setPayeeKey] = useState<string | null>(null);
  const [notesKey, setNotesKey] = useState<string | null>(null);
  const [isInvertAmount, setIsInvertAmount] = useState(false);

  const [transactionsPreview, setTransactionsPreview] = useState<
    Array<
      Pick<Transaction, "amount" | "payee" | "notes"> & {
        date: DateString;
        isDuplicate: boolean;
      }
    >
  >([]);

  const columns = [
    { label: "Date", value: dateKey, setKey: setDateKey },
    { label: "Amount", value: amountKey, setKey: setAmountKey },
    { label: "Payee", value: payeeKey, setKey: setPayeeKey },
    { label: "Notes", value: notesKey, setKey: setNotesKey },
  ];

  useEffect(() => {
    const headerMap = new Map([
      [/(date|when|time)/i, setDateKey],
      [/(amount|sum|price|total)/i, setAmountKey],
      [/(payee|recipient|vendor|merchant|description)/i, setPayeeKey],
      [/(notes|memo|details|comment)/i, setNotesKey],
    ]);

    parseResult.headers.forEach((header) => {
      for (const [pattern, setter] of headerMap) {
        if (pattern.test(header)) {
          setter(header);
          break;
        }
      }
    });
  }, [parseResult]);

  useEffect(() => {
    if (!parseResult.rows.length) return;
    if (!dateKey || !amountKey || !payeeKey) return;

    const transactions = parseResult.rows.map((row) => {
      const date = DateString.fromString(row[dateKey]);
      const amount = (
        isInvertAmount
          ? currency(row[amountKey]).multiply(-1)
          : currency(row[amountKey])
      ).intValue;
      const payee = row[payeeKey];
      const notes = notesKey !== null ? row[notesKey].trim() : null;

      const isDuplicate = existingTransactions?.some(
        (transaction) =>
          transaction.date.equals(date) &&
          transaction.amount === amount &&
          transaction.payee === payee &&
          transaction.notes === notes
      );

      return {
        date,
        amount,
        payee,
        notes,
        isDuplicate: !!isDuplicate,
        rawData: row,
      };
    });

    setTransactionsPreview(transactions);
  }, [
    parseResult,
    dateKey,
    amountKey,
    payeeKey,
    notesKey,
    isInvertAmount,
    existingTransactions,
  ]);

  async function handleImport() {
    await createTransactions({
      db: db!,
      accountId,
      transactions: transactionsPreview.filter(
        (transaction) => !transaction.isDuplicate
      ),
    });

    toast.success("Transactions imported successfully");

    setData(null);
    setTransactionsPreview([]);
    setDateKey(null);
    setAmountKey(null);
    setPayeeKey(null);
    setNotesKey(null);
    setIsInvertAmount(false);
    setDialogOpen(false);
  }

  return (
    <>
      <div className="flex gap-4">
        {columns.map((column, i) => (
          <div key={i} className="space-y-1">
            <Label htmlFor={column.label}>{column.label}</Label>
            <Select
              value={column.value ?? "none"}
              onValueChange={(value) =>
                column.setKey(value === "none" ? null : value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Select column</SelectItem>
                {parseResult.headers.map((header) => (
                  <SelectItem key={header} value={header}>
                    {header}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}

        <div className="flex items-center space-x-2">
          <Checkbox
            checked={isInvertAmount}
            onCheckedChange={(checked) =>
              checked !== "indeterminate" && setIsInvertAmount(checked)
            }
          />
          <Label>Invert amount values</Label>
        </div>
      </div>

      <ImportTransactionsPreview
        transactions={transactionsPreview}
        setTransactions={setTransactionsPreview}
      />

      <DialogFooter>
        <Button onClick={handleImport}>Import</Button>
      </DialogFooter>
    </>
  );
}

interface ImportTransactionsPreviewProps {
  transactions: Array<
    Pick<Transaction, "amount" | "payee" | "notes"> & {
      date: DateString;
      isDuplicate: boolean;
    }
  >;
  setTransactions: React.Dispatch<
    React.SetStateAction<
      Array<
        Pick<Transaction, "amount" | "payee" | "notes"> & {
          date: DateString;
          isDuplicate: boolean;
        }
      >
    >
  >;
}

function ImportTransactionsPreview({
  transactions,
  setTransactions,
}: ImportTransactionsPreviewProps) {
  return (
    <div className="max-h-[60vh] overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Duplicate</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Payee</TableHead>
            <TableHead>Notes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction, rowIdx) => (
            <TableRow key={rowIdx}>
              <TableCell>
                <Checkbox
                  checked={transaction.isDuplicate}
                  onCheckedChange={() =>
                    setTransactions((prev) =>
                      prev.map((r, i) =>
                        i === rowIdx ? { ...r, isDuplicate: !r.isDuplicate } : r
                      )
                    )
                  }
                />
              </TableCell>
              <TableCell>{transaction.date.toMDYString()}</TableCell>
              <TableCell>{formatCurrency(transaction.amount)}</TableCell>
              <TableCell>{transaction.payee}</TableCell>
              <TableCell>{transaction.notes}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
