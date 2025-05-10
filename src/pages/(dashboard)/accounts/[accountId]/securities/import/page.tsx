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
import { importsTable } from "@/lib/db/schema/import";
import { securitiesTable, Security } from "@/lib/db/schema/security";
import { ParseResult } from "@/lib/parser";
import { parseCSV } from "@/lib/parser/csv";
import { eq } from "drizzle-orm";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface ImportSecuritiesPageProps {
  params: {
    accountId: string;
  };
}

export default function ImportSecuritiesPage({
  params,
}: ImportSecuritiesPageProps) {
  const { db } = useDB();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [data, setData] = useState<ParseResult | null>(null);
  const [dateKey, setDateKey] = useState<string | null>(null);
  const [amountKey, setAmountKey] = useState<string | null>(null);
  const [tickerKey, setTickerKey] = useState<string | null>(null);
  const [isInvertAmount, setIsInvertAmount] = useState(false);
  const [existingSecurities, setExistingSecurities] = useState<
    Pick<Security, "date" | "amount" | "ticker">[]
  >([]);
  const [securitiesPreview, setSecuritiesPreview] = useState<
    (Pick<Security, "date" | "amount" | "ticker" | "rawData"> & {
      duplicate: boolean;
    })[]
  >([]);

  useEffect(() => {
    async function fetchExistingSecurities() {
      if (!db) return;
      const securities = await db
        .select({
          date: securitiesTable.date,
          amount: securitiesTable.amount,
          ticker: securitiesTable.ticker,
        })
        .from(securitiesTable)
        .where(eq(securitiesTable.accountId, params.accountId));
      setExistingSecurities(securities);
    }
    fetchExistingSecurities();
  }, [db, params.accountId]);

  useEffect(() => {
    if (!data) return;
    if (!dateKey || !amountKey || !tickerKey) return;
    const preview = data.rows.map((row) => {
      const date = new Date(row[dateKey]);
      const amount = isInvertAmount
        ? parseFloat(row[amountKey]) * -1
        : parseFloat(row[amountKey]);
      const ticker = row[tickerKey].trim();

      const duplicate = existingSecurities.some((existing) => {
        return (
          existing.date.getTime() === date.getTime() &&
          existing.amount === amount &&
          existing.ticker === ticker
        );
      });

      return { date, amount, ticker, duplicate, rawData: row };
    });
    setSecuritiesPreview(preview);
  }, [data, dateKey, amountKey, tickerKey, isInvertAmount, existingSecurities]);

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
          [/(ticker|symbol|stock)/i, setTickerKey],
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
    if (!tickerKey) {
      toast.error("Please select a ticker column");
      return false;
    }

    return true;
  }

  async function handleImport() {
    if (!data || !db) return;

    if (!validateMappings()) return;

    try {
      const securitiesLength = await db.transaction(async (tx) => {
        const [importRecord] = await tx
          .insert(importsTable)
          .values({})
          .returning({ id: importsTable.id });

        const securities = securitiesPreview
          .filter((row) => !row.duplicate)
          .map((row) => {
            return {
              accountId: params.accountId,
              importId: importRecord.id,
              ...row,
            };
          });

        if (securities.length > 0) {
          await tx.insert(securitiesTable).values(securities);
        }

        return securities.length;
      });

      toast.success(`Successfully imported ${securitiesLength} securities`);
      resetForm();
    } catch (error) {
      console.error("Error importing securities:", error);
      toast.error("Failed to import securities");
    }
  }

  function resetForm() {
    setData(null);
    setDateKey(null);
    setAmountKey(null);
    setTickerKey(null);
    setIsInvertAmount(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  return (
    <ContentLayout
      header={
        <Header description="Import securities from a CSV file.">
          Import Securities
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
                  <Label>Ticker Column</Label>
                  <Select
                    value={tickerKey ?? "none"}
                    onValueChange={(value) =>
                      setTickerKey(value === "none" ? null : value)
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
                      securitiesPreview.filter((row) => row.duplicate).length
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
                        <TableHead>Ticker</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {securitiesPreview.map((row, rowIndex) => (
                        <TableRow
                          key={rowIndex}
                          className={row.duplicate ? "bg-accent" : ""}
                        >
                          <TableCell>
                            <Checkbox
                              checked={row.duplicate}
                              onCheckedChange={() =>
                                setSecuritiesPreview((prev) =>
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
                          <TableCell>{row.amount}</TableCell>
                          <TableCell>{row.ticker}</TableCell>
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
