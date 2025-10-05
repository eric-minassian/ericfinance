import { Download } from "lucide-react";
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
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="data-[slot=sidebar-menu-button]:!p-1.5">
              <span className="text-base font-semibold">EricFinance</span>
            </SidebarMenuButton>
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
                    <SidebarMenuButton isActive={isActive} size="sm" asChild>
                      <Link
                        to="/accounts/$accountId"
                        params={{ accountId: account.id }}
                      >
                        <div className="size-1.5 rounded-full bg-green-400" />
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
