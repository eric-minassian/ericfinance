import { DataTable } from "@/components/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { ContentLayout } from "@/components/ui/content-layout";
import { Header } from "@/components/ui/header";
import { useDB } from "@/hooks/db";
import { Import, importsTable } from "@/lib/db/schema/import";
import { ColumnDef } from "@tanstack/react-table";
import { useEffect, useState } from "react";

export default function ImportsPage() {
  const { db } = useDB();
  const [imports, setImports] = useState<Import[]>([]);

  useEffect(() => {
    const fetchImports = async () => {
      const data = await db!.select().from(importsTable);
      setImports(data);
    };

    fetchImports();
  }, [db]);

  const columns: ColumnDef<Import>[] = [
    {
      accessorKey: "id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="ID" />
      ),
    },

    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created At" />
      ),
    },
  ];

  return (
    <ContentLayout
      header={
        <Header description="View and manage your imports.">Imports</Header>
      }
    >
      <DataTable data={imports} columns={columns} />
    </ContentLayout>
  );
}
