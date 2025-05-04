import Papa from "papaparse";
import { ParseResult } from ".";

export function parseCSV(csv: string): ParseResult {
  const result = Papa.parse(csv.trim(), {
    header: true,
    skipEmptyLines: true,
  });

  return {
    headers: result.meta.fields || [],
    rows: result.data as Record<string, string>[],
  };
}
