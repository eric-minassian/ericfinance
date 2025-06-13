export const Route = createFileRoute({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_sidebar/accounts/$accountId"!</div>;
}
