import { ReactNode } from "react";
import { Route, Switch } from "wouter";
import DashboardLayout from "./pages/(dashboard)/layout";
import DashboardPage from "./pages/(dashboard)/page";
import IndexPage from "./pages/(site)/page";

const routes = [
  {
    path: "/",
    components: [IndexPage],
  },
  {
    path: "/dashboard",
    components: [DashboardLayout, DashboardPage],
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
