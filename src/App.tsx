import "./App.css";

import { AppSidebar } from "@/components/app-sidebar";
import { PortfolioSelect } from "@/components/portfolio-select";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { usePortfolioStore } from "@/lib/stores/portfolio-store";
import Import from "@/pages/Import";
import Transactions from "@/pages/Transactions";
import { ImportIcon, SettingsIcon, TableIcon } from "lucide-react";
import { useState } from "react";
import { ModeToggle } from "./components/mode-toggle";
import { ThemeProvider } from "./components/theme-provider";
import { Toaster } from "./components/ui/sonner";
import Settings from "./pages/Settings";

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
  {
    title: "Settings",
    icon: SettingsIcon,
    component: Settings,
  },
];

export default function App() {
  const [currentComponent, setCurrentComponent] = useState(
    sidebarItems[0].component
  );
  const selectedPortfolio = usePortfolioStore(
    (state) => state.selectedPortfolio
  );

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      {selectedPortfolio ? (
        <SidebarProvider>
          <AppSidebar
            sidebarItems={sidebarItems}
            setCurrentComponent={setCurrentComponent}
          />

          <SidebarInset>
            <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <h1 className="text-lg font-semibold">
                {selectedPortfolio} - EricFinance
              </h1>
              <div className="flex-1" />
              <ModeToggle />
            </header>
            <main className="flex-1 p-4 overflow-auto">
              {currentComponent}
              <Toaster richColors />
            </main>
          </SidebarInset>
        </SidebarProvider>
      ) : (
        <>
          <PortfolioSelect />
          <Toaster richColors />
        </>
      )}
    </ThemeProvider>
  );
}
