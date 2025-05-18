import { Download } from "lucide-react";
import * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useDB } from "@/hooks/db";
import { Link, useLocation } from "wouter";
import Icon from "./icon";

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: <Icon variant="home" />,
    },
    {
      title: "Transactions",
      url: "/transactions",
      icon: <Icon variant="card" />,
    },
    {
      title: "Accounts",
      url: "/accounts",
      icon: <Icon variant="bank" />,
    },
    {
      title: "Imports",
      url: "/imports",
      icon: <Icon variant="import" />,
    },
    {
      title: "Settings",
      url: "/settings",
      icon: <Icon variant="settings" />,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [location] = useLocation();
  const { exportDB } = useDB();

  const handleExportDB = () => {
    exportDB();
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem className="flex gap-2">
            <SidebarMenuButton
              className="group-data-[collapsible=icon]:hidden"
              asChild
            >
              <Link href="/">
                <Icon variant="logo" />
                EricFinance
              </Link>
            </SidebarMenuButton>
            <SidebarMenuButton className="w-min" asChild>
              <SidebarTrigger />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.navMain.map((item) => {
                const isActive = location === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton isActive={isActive} asChild>
                      <Link href={item.url}>
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
