import * as React from "react";

import { PortfolioSwitcher } from "@/components/portfolio-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { list_portfolios } from "@/features/portfolio";
import { LucideIcon } from "lucide-react";

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
  const [portfolios, setPortfolios] = React.useState<string[]>([]);

  React.useEffect(() => {
    list_portfolios().then((newPortfolios) => {
      setPortfolios(newPortfolios);
    });
  }, []);

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <PortfolioSwitcher
          portfolios={portfolios}
          defaultPortfolio={portfolios[0]}
        />
      </SidebarHeader>
      <SidebarContent>
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
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
