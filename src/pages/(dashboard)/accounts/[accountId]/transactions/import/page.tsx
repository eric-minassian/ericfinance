import { Button } from "@/components/ui/button";
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
import { transactionsTable } from "@/lib/db/schema/transaction";
import { ParseResult } from "@/lib/parser";
import { parseCSV } from "@/lib/parser/csv";
import { useState } from "react";
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
  const [data, setData] = useState<ParseResult | null>(null);
  const [dateKey, setDateKey] = useState<string | null>(null);
  const [amountKey, setAmountKey] = useState<string | null>(null);
  const [payeeKey, setPayeeKey] = useState<string | null>(null);
  const [notesKey, setNotesKey] = useState<string | null>(null);

  async function handleImport() {
    if (!data) return;
    if (!db) {
      alert("Database connection is not available.");
      return;
    }
    if (dateKey === null || amountKey === null) {
      alert("Please select date and amount columns.");
      return;
    }

    try {
      await db.transaction(async (tx) => {
        const [importRecord] = await tx
          .insert(importsTable)
          .values({})
          .returning({ id: importsTable.id });

        const transactions = data.rows.map((row) => {
          const date = new Date(row[dateKey!]);
          const amount = Math.round(parseFloat(row[amountKey!]) * 100);
          const payee = payeeKey !== null ? row[payeeKey!] : "";
          const notes = notesKey !== null ? row[notesKey!] : "";

          return {
            accountId: params.accountId,
            importId: importRecord.id,
            date,
            amount,
            payee,
            notes,
          };
        });

        await db.insert(transactionsTable).values(transactions);
      });
    } catch (error) {
      console.error("Error importing transactions:", error);
      toast.error(
        "Failed to import transactions. Please check the data format."
      );
      return;
    }

    setData(null);
    setDateKey(null);
    setAmountKey(null);
    setPayeeKey(null);
    setNotesKey(null);
    toast.success("Transactions imported successfully!");
  }

  return (
    <ContentLayout
      header={
        <Header description="Import transactions for this account.">
          Import Transactions
        </Header>
      }
    >
      <Label htmlFor="file" />
      <Input
        type="file"
        id="file"
        accept=".csv"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = async (event) => {
            const csv = event.target?.result as string;
            setData(await parseCSV(csv));
          };
          reader.readAsText(file);
        }}
      />
      {data && (
        <div>
          <div className="flex flex-row gap-4">
            <div>
              <Label>Date</Label>
              <Select defaultValue="none" onValueChange={setDateKey}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {data.headers.map((header, index) => (
                    <SelectItem key={index} value={header}>
                      {header}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Amount</Label>
              <Select defaultValue="none" onValueChange={setAmountKey}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {data.headers.map((header, index) => (
                    <SelectItem key={index} value={header}>
                      {header}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Payee</Label>
              <Select defaultValue="none" onValueChange={setPayeeKey}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {data.headers.map((header, index) => (
                    <SelectItem key={index} value={header}>
                      {header}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Notes</Label>
              <Select defaultValue="none" onValueChange={setNotesKey}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {data.headers.map((header, index) => (
                    <SelectItem key={index} value={header}>
                      {header}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleImport}
              className="mt-4"
              disabled={
                dateKey === null || amountKey === null || data.rows.length === 0
              }
            >
              Import
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                {data.headers.map((header, index) => (
                  <TableHead key={index}>{header}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.rows.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {data.headers.map((header, index) => (
                    <TableCell key={index}>{row[header] || "N/A"}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </ContentLayout>
  );
}
