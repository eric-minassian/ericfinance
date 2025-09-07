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
import { DateString } from "@/lib/date";
import { Account } from "@/lib/db/schema/accounts";
import { Security } from "@/lib/db/schema/securities";
import { Transaction } from "@/lib/db/schema/transactions";
import { ParseResult } from "@/lib/parser";
import { parseCSV } from "@/lib/parser/csv";
import { useCreateSecurities } from "@/lib/services/securities/create-securities";
import { useListSecurities } from "@/lib/services/securities/list-securities";
import { useCreateTransactions } from "@/lib/services/transactions/create-transactions";
import { useListTransactions } from "@/lib/services/transactions/list-transactions";
import { formatCurrency } from "@/lib/utils";
import currency from "currency.js";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface ImportDialogProps {
  accountId: Account["id"];
  accountVariant: Account["variant"];
  setDialogOpen: (open: boolean) => void;
}

export function ImportDialog({
  accountId,
  accountVariant,
  setDialogOpen,
}: ImportDialogProps) {
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
        accountVariant === "transactions" ? (
          <ImportTransactions
            parseResult={data}
            accountId={accountId}
            setData={setData}
            setDialogOpen={setDialogOpen}
          />
        ) : (
          <ImportSecurities
            parseResult={data}
            accountId={accountId}
            setData={setData}
            setDialogOpen={setDialogOpen}
          />
        )
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
  const { data: existingTransactions } = useListTransactions({ accountId });
  const createTransactionsMutation = useCreateTransactions();

  const [dateKey, setDateKey] = useState<string | null>(null);
  const [amountKey, setAmountKey] = useState<string | null>(null);
  const [payeeKey, setPayeeKey] = useState<string | null>(null);
  const [isInvertAmount, setIsInvertAmount] = useState(false);

  const [transactionsPreview, setTransactionsPreview] = useState<
    Array<
      Pick<Transaction, "amount" | "payee"> & {
        date: DateString;
        isDuplicate: boolean;
      }
    >
  >([]);

  const columns = [
    { label: "Date", value: dateKey, setKey: setDateKey },
    { label: "Amount", value: amountKey, setKey: setAmountKey },
    { label: "Payee", value: payeeKey, setKey: setPayeeKey },
  ];

  useEffect(() => {
    const headerMap = new Map([
      [/(date|when|time)/i, setDateKey],
      [/(amount|sum|price|total)/i, setAmountKey],
      [/(payee|recipient|vendor|merchant|description)/i, setPayeeKey],
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

      const isDuplicate = existingTransactions?.some(
        (transaction) =>
          transaction.date.equals(date) &&
          transaction.amount === amount &&
          transaction.payee === payee
      );

      return {
        date,
        amount,
        payee,
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
    isInvertAmount,
    existingTransactions,
  ]);

  async function handleImport() {
    await createTransactionsMutation.mutateAsync(
      transactionsPreview
        .filter((transaction) => !transaction.isDuplicate)
        .map((transaction) => ({
          ...transaction,
          accountId,
        }))
    );

    toast.success("Transactions imported successfully");

    setData(null);
    setTransactionsPreview([]);
    setDateKey(null);
    setAmountKey(null);
    setPayeeKey(null);
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

      <ImportPreview
        type="transactions"
        data={transactionsPreview}
        setData={setTransactionsPreview}
      />

      <DialogFooter>
        <Button onClick={handleImport}>Import</Button>
      </DialogFooter>
    </>
  );
}

interface ImportSecuritiesProps {
  parseResult: ParseResult;
  accountId: Account["id"];
  setData: React.Dispatch<React.SetStateAction<ParseResult | null>>;
  setDialogOpen: (open: boolean) => void;
}

function ImportSecurities({
  parseResult,
  accountId,
  setData,
  setDialogOpen,
}: ImportSecuritiesProps) {
  const { data: existingSecurities } = useListSecurities({ accountId });
  const createSecuritiesMutation = useCreateSecurities();

  const [dateKey, setDateKey] = useState<string | null>(null);
  const [amountKey, setAmountKey] = useState<string | null>(null);
  const [tickerKey, setTickerKey] = useState<string | null>(null);

  const [securitiesPreview, setSecuritiesPreview] = useState<
    Array<
      Pick<Security, "amount" | "ticker"> & {
        date: DateString;
        isDuplicate: boolean;
      }
    >
  >([]);

  const columns = [
    { label: "Date", value: dateKey, setKey: setDateKey },
    { label: "Shares", value: amountKey, setKey: setAmountKey },
    { label: "Ticker", value: tickerKey, setKey: setTickerKey },
  ];

  useEffect(() => {
    const headerMap = new Map([
      [/(date|when|time)/i, setDateKey],
      [/(amount|shares|quantity)/i, setAmountKey],
      [/(ticker|symbol|stock)/i, setTickerKey],
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
    if (!dateKey || !amountKey || !tickerKey) return;

    const securities = parseResult.rows.map((row) => {
      const date = DateString.fromString(row[dateKey]);
      const amount = parseFloat(row[amountKey]);
      const ticker = row[tickerKey];

      const isDuplicate = existingSecurities?.some(
        (security) =>
          security.date.equals(date) &&
          security.amount === amount &&
          security.ticker === ticker
      );

      return {
        date,
        amount,
        ticker,
        isDuplicate: !!isDuplicate,
        rawData: row,
      };
    });

    setSecuritiesPreview(securities);
  }, [parseResult, dateKey, amountKey, tickerKey, existingSecurities]);

  async function handleImport() {
    await createSecuritiesMutation.mutateAsync(
      securitiesPreview
        .filter((security) => !security.isDuplicate)
        .map((security) => ({
          ...security,
          accountId,
        }))
    );

    toast.success("Securities imported successfully");

    setData(null);
    setSecuritiesPreview([]);
    setDateKey(null);
    setAmountKey(null);
    setTickerKey(null);
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
      </div>

      <ImportPreview
        type="securities"
        data={securitiesPreview}
        setData={setSecuritiesPreview}
      />

      <DialogFooter>
        <Button onClick={handleImport}>Import</Button>
      </DialogFooter>
    </>
  );
}

interface ImportPreviewProps<
  T extends { date: DateString; amount: number } & (
    | Pick<Transaction, "payee">
    | Pick<Security, "ticker">
  )
> {
  type: "transactions" | "securities";
  data: Array<T & { isDuplicate: boolean }>;
  setData: React.Dispatch<
    React.SetStateAction<Array<T & { isDuplicate: boolean }>>
  >;
}

function ImportPreview<
  T extends { date: DateString; amount: number } & (
    | Pick<Transaction, "payee">
    | Pick<Security, "ticker">
  )
>({ type, data, setData }: ImportPreviewProps<T>) {
  return (
    <div className="max-h-[60vh] overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Duplicate</TableHead>
            <TableHead>Date</TableHead>
            {type === "transactions" ? (
              <>
                <TableHead>Amount</TableHead>
                <TableHead>Payee</TableHead>
              </>
            ) : (
              <>
                <TableHead>Shares</TableHead>
                <TableHead>Ticker</TableHead>
              </>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, rowIdx) => (
            <TableRow key={rowIdx}>
              <TableCell>
                <Checkbox
                  checked={item.isDuplicate}
                  onCheckedChange={() =>
                    setData((prev) =>
                      prev.map((r, i) =>
                        i === rowIdx ? { ...r, isDuplicate: !r.isDuplicate } : r
                      )
                    )
                  }
                />
              </TableCell>
              <TableCell>{item.date.toMDYString()}</TableCell>
              <TableCell>
                {type === "transactions"
                  ? formatCurrency(item.amount)
                  : item.amount.toFixed(4)}
              </TableCell>
              <TableCell>
                {type === "transactions"
                  ? (item as Pick<Transaction, "payee">).payee
                  : (item as Pick<Security, "ticker">).ticker}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
