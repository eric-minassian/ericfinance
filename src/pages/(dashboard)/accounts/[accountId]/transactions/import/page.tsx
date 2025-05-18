import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ContentLayout } from "@/components/ui/content-layout";
import { Header } from "@/components/ui/header";
import { Input } from "@/components/ui/input";
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
import { importsTable } from "@/lib/db/schema/imports";
import { Transaction, transactionsTable } from "@/lib/db/schema/transactions";
import { ParseResult } from "@/lib/parser";
import { parseCSV } from "@/lib/parser/csv";
import { formatCurrency } from "@/lib/utils";
import currency from "currency.js";
import { eq } from "drizzle-orm";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface ImportTransactionsPageProps {
  params: {
    accountId: string;
  };
}

export default function ImportTransactionsPage({
  params,
}: ImportTransactionsPageProps) {
  const { db } = useDB();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [data, setData] = useState<ParseResult | null>(null);
  const [dateKey, setDateKey] = useState<string | null>(null);
  const [amountKey, setAmountKey] = useState<string | null>(null);
  const [payeeKey, setPayeeKey] = useState<string | null>(null);
  const [notesKey, setNotesKey] = useState<string | null>(null);
  const [isInvertAmount, setIsInvertAmount] = useState<boolean>(false);
  const [existingTransactions, setExistingTransactions] = useState<
    Pick<Transaction, "date" | "amount" | "payee" | "notes">[]
  >([]);
  const [transactionsPreview, setTransactionsPreview] = useState<
    (Pick<Transaction, "date" | "amount" | "payee" | "notes" | "rawData"> & {
      duplicate: boolean;
    })[]
  >([]);

  useEffect(() => {
    async function fetchExistingTransactions() {
      if (!db) return;
      const transactions = await db
        .select({
          date: transactionsTable.date,
          amount: transactionsTable.amount,
          payee: transactionsTable.payee,
          notes: transactionsTable.notes,
        })
        .from(transactionsTable)
        .where(eq(transactionsTable.accountId, params.accountId));
      setExistingTransactions(transactions);
    }
    fetchExistingTransactions();
  }, [db, params.accountId]);

  useEffect(() => {
    if (!data) return;
    if (!dateKey || !amountKey || !payeeKey) return;
    const preview = data.rows.map((row) => {
      const date = new Date(row[dateKey]);
      const amount = (
        isInvertAmount
          ? currency(row[amountKey]).multiply(-1)
          : currency(row[amountKey])
      ).intValue;
      const payee = row[payeeKey].trim();
      const notes = notesKey !== null ? row[notesKey].trim() : null;

      const duplicate = existingTransactions.some((existing) => {
        return (
          existing.date.getTime() === date.getTime() &&
          existing.amount === amount &&
          existing.payee === payee &&
          existing.notes === notes
        );
      });

      return { date, amount, payee, notes, duplicate, rawData: row };
    });
    setTransactionsPreview(preview);
  }, [
    data,
    dateKey,
    amountKey,
    payeeKey,
    notesKey,
    isInvertAmount,
    existingTransactions,
  ]);

  async function handleFileChange(file: File | null) {
    if (!file) return;
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const csv = event.target?.result as string;
        const result = parseCSV(csv);
        setData(result);
        // Try to auto-detect columns
        const headerMap = new Map([
          [/(date|when|time)/i, setDateKey],
          [/(amount|sum|price|total)/i, setAmountKey],
          [/(payee|recipient|vendor|merchant|description)/i, setPayeeKey],
          [/(notes|memo|details|comment)/i, setNotesKey],
        ]);

        result.headers.forEach((header) => {
          for (const [pattern, setter] of headerMap) {
            if (pattern.test(header)) {
              setter(header);
              break;
            }
          }
        });
      };
      reader.readAsText(file);
    } catch (error) {
      console.error("Error processing file:", error);
      toast.error("Failed to process file. Please check the format.");
    }
  }

  function validateMappings(): boolean {
    if (!dateKey) {
      toast.error("Please select a date column");
      return false;
    }
    if (!amountKey) {
      toast.error("Please select an amount column");
      return false;
    }
    if (!payeeKey) {
      toast.error("Please select a payee column");
      return false;
    }

    return true;
  }

  async function handleImport() {
    if (!data || !db) return;

    if (!validateMappings()) return;

    try {
      const transactionsLength = await db.transaction(async (tx) => {
        const [importRecord] = await tx
          .insert(importsTable)
          .values({})
          .returning({ id: importsTable.id });

        const transactions = transactionsPreview
          .filter((row) => !row.duplicate)
          .map((row) => {
            return {
              accountId: params.accountId,
              importId: importRecord.id,
              ...row,
            };
          });

        if (transactions.length > 0) {
          await tx.insert(transactionsTable).values(transactions);
        }

        return transactions.length;
      });

      toast.success(`Successfully imported ${transactionsLength} transactions`);
      resetForm();
    } catch (error) {
      console.error("Error importing transactions:", error);
      toast.error("Failed to import transactions");
    }
  }

  function resetForm() {
    setData(null);
    setDateKey(null);
    setAmountKey(null);
    setPayeeKey(null);
    setNotesKey(null);
    setIsInvertAmount(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  return (
    <ContentLayout
      header={
        <Header description="Import transactions from a CSV file.">
          Import Transactions
        </Header>
      }
    >
      <Card>
        <CardHeader>
          <CardTitle>Upload CSV File</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="file">Choose CSV File</Label>
            <Input
              ref={fileInputRef}
              type="file"
              id="file"
              accept=".csv"
              onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
            />
          </div>

          {data && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date Column</Label>
                  <Select
                    value={dateKey ?? "none"}
                    onValueChange={(value) =>
                      setDateKey(value === "none" ? null : value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Select column</SelectItem>
                      {data.headers.map((header) => (
                        <SelectItem key={header} value={header}>
                          {header}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Amount Column</Label>
                  <Select
                    value={amountKey ?? "none"}
                    onValueChange={(value) =>
                      setAmountKey(value === "none" ? null : value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Select column</SelectItem>
                      {data.headers.map((header) => (
                        <SelectItem key={header} value={header}>
                          {header}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Payee Column</Label>
                  <Select
                    value={payeeKey ?? "none"}
                    onValueChange={(value) =>
                      setPayeeKey(value === "none" ? null : value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Select column</SelectItem>
                      {data.headers.map((header) => (
                        <SelectItem key={header} value={header}>
                          {header}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Notes Column</Label>
                  <Select
                    value={notesKey ?? "none"}
                    onValueChange={(value) =>
                      setNotesKey(value === "none" ? null : value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Select column</SelectItem>
                      {data.headers.map((header) => (
                        <SelectItem key={header} value={header}>
                          {header}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={isInvertAmount}
                  onCheckedChange={(checked) =>
                    checked !== "indeterminate" && setIsInvertAmount(checked)
                  }
                />
                <Label>Invert amount values</Label>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Preview</CardTitle>
                  <CardDescription>
                    {data.rows.length} transactions found
                    <br />
                    {
                      transactionsPreview.filter((row) => row.duplicate).length
                    }{" "}
                    duplicate transactions found
                  </CardDescription>
                </CardHeader>
                <CardContent className="max-h-96 overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Duplicate</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Amount </TableHead>
                        <TableHead>Payee</TableHead>
                        <TableHead>Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactionsPreview.map((row, rowIndex) => (
                        <TableRow
                          key={rowIndex}
                          className={row.duplicate ? "bg-accent" : ""}
                        >
                          <TableCell>
                            <Checkbox
                              checked={row.duplicate}
                              onCheckedChange={() =>
                                setTransactionsPreview((prev) =>
                                  prev.map((r, i) =>
                                    i === rowIndex
                                      ? { ...r, duplicate: !r.duplicate }
                                      : r
                                  )
                                )
                              }
                              className="cursor-pointer"
                            />
                          </TableCell>
                          <TableCell>{row.date.toLocaleDateString()}</TableCell>
                          <TableCell>
                            {formatCurrency(row.amount / 100)}
                          </TableCell>
                          <TableCell>{row.payee}</TableCell>
                          <TableCell>{row.notes}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={resetForm}>
                  Reset
                </Button>
                <Button onClick={handleImport}>Import</Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </ContentLayout>
  );
}
