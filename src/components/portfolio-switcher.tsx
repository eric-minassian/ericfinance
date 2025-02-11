import { Check, ChevronsUpDown, Plus, Wallet } from "lucide-react";
import * as React from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  sidebarMenuButtonVariants,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { list_portfolios } from "@/features/portfolio";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

export function PortfolioSwitcher({}) {
  const [portfolios, setPortfolios] = React.useState<string[]>([]);
  const [selectedPortfolio, setSelectedPortfolio] = React.useState<
    string | null
  >(null);

  React.useEffect(() => {
    list_portfolios().then((newPortfolios) => {
      setPortfolios(newPortfolios);
      setSelectedPortfolio(newPortfolios[0] || null);
    });
  }, []);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <Dialog>
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
                  {selectedPortfolio && <span>{selectedPortfolio}</span>}
                </div>
                <ChevronsUpDown className="ml-auto" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width]"
              align="start"
            >
              {portfolios.length ? (
                portfolios.map((portfolio) => (
                  <DropdownMenuItem
                    key={portfolio}
                    onSelect={() => setSelectedPortfolio(portfolio)}
                  >
                    {portfolio}
                    {portfolio === selectedPortfolio && (
                      <Check className="ml-auto" />
                    )}
                  </DropdownMenuItem>
                ))
              ) : (
                <DropdownMenuItem>No portfolios found</DropdownMenuItem>
              )}

              <DropdownMenuSeparator />
              <DialogTrigger asChild>
                <DropdownMenuItem className="gap-2 p-2">
                  <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                    <Plus className="size-4" />
                  </div>
                  <div className="font-medium text-muted-foreground">
                    Add portfolio
                  </div>
                </DropdownMenuItem>
              </DialogTrigger>
            </DropdownMenuContent>
          </DropdownMenu>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create new portfolio</DialogTitle>
              <DialogDescription>
                This action cannot be undone. This will permanently delete your
                account and remove your data from our servers.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
