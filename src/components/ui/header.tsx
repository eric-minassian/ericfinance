import React from "react";

export interface HeaderProps {
  description?: React.ReactNode;
  actions?: React.ReactNode;
  children?: React.ReactNode;
}

export function Header({ description, actions, children }: HeaderProps) {
  return (
    <div>
      <div className="flex items-start justify-between flex-wrap gap-2">
        <h1 className="text-3xl font-bold tracking-tight">{children}</h1>
        {actions && <div>{actions}</div>}
      </div>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
