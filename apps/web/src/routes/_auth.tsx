import { ModeToggle } from "@/components/mode-toggle";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="absolute top-4 right-4">
        <ModeToggle />
      </div>
      <Outlet />
    </div>
  );
}
