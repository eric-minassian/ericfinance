import {
  Check,
  ChevronsUpDown,
  Download,
  GalleryVerticalEnd,
} from "lucide-react";
import * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useDB } from "@/hooks/db";
import { useListAccounts } from "@/lib/services/accounts/list-accounts";
import { Link, useLocation } from "@tanstack/react-router";
import Icon from "./icon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: <Icon variant="home" />,
    },
    {
      title: "Accounts",
      url: "/accounts",
      icon: <Icon variant="bank" />,
    },
    {
      title: "Transactions",
      url: "/",
      icon: <Icon variant="card" />,
    },

    {
      title: "Imports",
      url: "/",
      icon: <Icon variant="import" />,
    },
    {
      title: "Settings",
      url: "/settings",
      icon: <Icon variant="settings" />,
    },
  ],
} as const;

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const listAccountsQuery = useListAccounts();

  const { pathname } = useLocation();
  const { exportDB } = useDB();

  const handleExportDB = () => {
    exportDB();
  };

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        {/* <SidebarMenu>
          <SidebarMenuItem className="flex gap-2">
            <SidebarMenuButton asChild>
              <Link to="/">
                <Icon variant="logo" />
                EricFinance
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu> */}
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                    <GalleryVerticalEnd className="size-4" />
                  </div>
                  <div className="flex flex-col gap-0.5 leading-none">
                    <span className="font-medium">Documentation</span>
                    <span className="">v12</span>
                  </div>
                  <ChevronsUpDown className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-(--radix-dropdown-menu-trigger-width)"
                align="start"
              >
                {[].map((version) => (
                  <DropdownMenuItem key={version}>
                    v{version} {version === 12 && <Check className="ml-auto" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.navMain.map((item) => {
                const isActive = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton isActive={isActive} asChild>
                      <Link to={item.url}>
                        {item.icon && item.icon}
                        {item.title}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Accounts</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {listAccountsQuery.data?.map((account) => {
                const isActive = pathname === `/accounts/${account.id}`;
                return (
                  <SidebarMenuItem key={account.id}>
                    <SidebarMenuButton isActive={isActive} asChild>
                      <Link
                        to="/accounts/$accountId"
                        params={{ accountId: account.id }}
                      >
                        <Icon variant="bank" />
                        {account.name}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleExportDB}
              tooltip="Export Database"
            >
              <Download />
              Export Database
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
