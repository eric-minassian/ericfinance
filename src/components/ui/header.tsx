import React from "react";

export interface HeaderProps {
  description?: React.ReactNode;
  actions?: React.ReactNode;
  children?: React.ReactNode;
}

export function Header({ description, actions, children }: HeaderProps) {
  return (
    <header className="flex items-center justify-between flex-wrap gap-2">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">{children}</h1>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && <div>{actions}</div>}
    </header>
  );
}
