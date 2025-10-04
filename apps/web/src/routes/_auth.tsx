import { ModeToggle } from "@/components/mode-toggle";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="absolute top-4 right-4">
        <ModeToggle />
      </div>

      <div className="w-full max-w-sm">
        <Outlet />
      </div>
    </div>
  );
}
