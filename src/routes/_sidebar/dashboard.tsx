import { createFileRoute } from '@tanstack/react-router'
export const Route = createFileRoute('/_sidebar/dashboard')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_sidebar/dashboard"!</div>;
}
