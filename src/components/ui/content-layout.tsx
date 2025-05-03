import { ReactNode } from "react";

export interface ContentLayoutProps {
  header?: ReactNode;
  children?: ReactNode;
}

export function ContentLayout({ header, children }: ContentLayoutProps) {
  return (
    <div className="p-4">
      {header && <div className="mb-4">{header}</div>}
      <main>{children}</main>
    </div>
  );
}
