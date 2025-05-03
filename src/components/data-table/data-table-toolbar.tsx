"use no memo";

import { Table } from "@tanstack/react-table";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { DataTableFacetedFilter } from "./data-table-faceted-filter";
import { DataTableViewOptions } from "./data-table-view-options";

export interface FilterColumn<TData> {
  column: keyof TData;
  title: string;
  options: Array<{ value: string; label: string }>;
}

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  searchColumn?: keyof TData;
  filterColumns?: FilterColumn<TData>[];
}

export function DataTableToolbar<TData>({
  table,
  searchColumn,
  filterColumns = [],
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        {searchColumn && (
          <Input
            placeholder={`Search ${searchColumn as string}s...`}
            value={
              (table
                .getColumn(searchColumn as string)
                ?.getFilterValue() as string) ?? ""
            }
            onChange={(event) =>
              table
                .getColumn(searchColumn as string)
                ?.setFilterValue(event.target.value)
            }
            className="h-8 w-[150px] lg:w-[250px]"
          />
        )}
        {filterColumns.map((filterColumn) => (
          <DataTableFacetedFilter
            key={filterColumn.column as string}
            column={table.getColumn(filterColumn.column as string)}
            title={filterColumn.title}
            options={filterColumn.options}
          />
        ))}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <X />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  );
}
