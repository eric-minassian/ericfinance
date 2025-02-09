import "./App.css";

import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import Import from "@/pages/Import";
import Transactions from "@/pages/Transactions";
import { ImportIcon, TableIcon } from "lucide-react";
import { useState } from "react";

const sidebarItems = [
  {
    title: "Transactions",
    icon: TableIcon,
    component: Transactions,
  },
  {
    title: "Import",
    icon: ImportIcon,
    component: Import,
  },
];

export default function App() {
  const [currentComponent, setCurrentComponent] = useState(
    sidebarItems[0].component
  );

  return (
    <SidebarProvider>
      <AppSidebar
        sidebarItems={sidebarItems}
        setCurrentComponent={setCurrentComponent}
      />

      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="text-lg font-semibold">EricFinance</h1>
        </header>
        <main className="flex-1 p-4 overflow-auto">{currentComponent}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}

{
  /* <Layout>
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          <div className="aspect-video rounded-xl bg-muted/50" />
          <div className="aspect-video rounded-xl bg-muted/50" />
          <div className="aspect-video rounded-xl bg-muted/50" />
        </div>
        <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
      </div>
    </Layout> */
}
