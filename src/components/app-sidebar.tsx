import * as React from "react";

import { PortfolioSwitcher } from "@/components/portfolio-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { LucideIcon } from "lucide-react";

import type { JSX } from "react";

interface SidebarItem {
  title: string;
  icon: LucideIcon;
  isActive?: boolean;
  component: React.ComponentType;
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  sidebarItems: SidebarItem[];
  setCurrentComponent: React.Dispatch<React.SetStateAction<JSX.Element>>;
}

export function AppSidebar({
  sidebarItems,
  setCurrentComponent,
  ...props
}: AppSidebarProps) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <PortfolioSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {sidebarItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  isActive={item.isActive}
                  onClick={() => setCurrentComponent(<item.component />)}
                >
                  <item.icon />
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
