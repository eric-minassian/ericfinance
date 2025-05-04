import { ReactNode } from "react";

export interface ContentLayoutProps {
  header?: ReactNode;
  children?: ReactNode;
}

export function ContentLayout({ header, children }: ContentLayoutProps) {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
          {header && <div>{header}</div>}
          <main>{children}</main>
        </div>
      </div>
    </div>
  );
}
