import { ReactNode } from "react";
import { Route, Switch } from "wouter";
import AccountsPage from "./pages/(dashboard)/accounts/page";
import DashboardPage from "./pages/(dashboard)/dashboard/page";
import DashboardLayout from "./pages/(dashboard)/layout";
import SiteLayout from "./pages/(site)/layout";
import IndexPage from "./pages/(site)/page";

const routes = [
  {
    path: "/",
    components: [SiteLayout, IndexPage],
  },
  {
    path: "/dashboard",
    components: [DashboardLayout, DashboardPage],
  },
  {
    path: "/accounts",
    components: [DashboardLayout, AccountsPage],
  },
  {
    path: "*",
    components: [<h1>404: No such page!</h1>],
  },
];

export default function App() {
  return (
    <Switch>
      {routes.map((route, index) => (
        <Route key={index} path={route.path}>
          {route.components.reduceRight(
            (children: ReactNode, Component) =>
              typeof Component === "function" ? (
                <Component>{children}</Component>
              ) : (
                Component
              ),
            null
          )}
        </Route>
      ))}
    </Switch>
  );
}
