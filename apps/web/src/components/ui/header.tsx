import React from "react";
import { Separator } from "./separator";
import { SidebarTrigger } from "./sidebar";

export interface HeaderProps {
  description?: React.ReactNode;
  actions?: React.ReactNode;
  children?: React.ReactNode;
}

export function Header({ description, actions, children }: HeaderProps) {
  return (
    <header className="flex h-16 shrink-0 border-b items-center justify-between gap-2">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-xl font-semibold tracking-tight">{children}</h1>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && <div>{actions}</div>}
    </header>
  );
}
