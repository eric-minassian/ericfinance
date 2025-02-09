import { Check, ChevronsUpDown, Wallet } from "lucide-react";
import * as React from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  sidebarMenuButtonVariants,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

interface PortfolioSwitcherProps {
  portfolios: string[];
  defaultPortfolio: string;
}

export function PortfolioSwitcher({
  portfolios,
  defaultPortfolio,
}: PortfolioSwitcherProps) {
  const [selectedPortfolio, setSelectedPortfolio] =
    React.useState(defaultPortfolio);

  React.useEffect(() => {
    setSelectedPortfolio(defaultPortfolio);
  }, [defaultPortfolio]);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger className="w-full" asChild>
            <button
              className={cn(
                sidebarMenuButtonVariants({ size: "lg" }),
                "data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              )}
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <Wallet className="size-4" />
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-semibold">Portfolio</span>
                <span>{selectedPortfolio}</span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width]"
            align="start"
          >
            {portfolios.map((portfolio) => (
              <DropdownMenuItem
                key={portfolio}
                onSelect={() => setSelectedPortfolio(portfolio)}
              >
                {portfolio}
                {portfolio === selectedPortfolio && (
                  <Check className="ml-auto" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
