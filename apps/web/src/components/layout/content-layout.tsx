import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export interface ContentLayoutProps {
  header: ReactNode;
  children?: ReactNode;
  className?: string;
}

export function ContentLayout({
  header,
  children,
  className,
}: ContentLayoutProps) {
  return (
    <>
      {header}
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <main
            className={cn(
              "flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6",
              className
            )}
          >
            {children}
          </main>
        </div>
      </div>
    </>
  );
}
