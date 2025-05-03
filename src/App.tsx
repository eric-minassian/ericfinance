import { Route, Switch } from "wouter";
import AccountPage from "./pages/(dashboard)/accounts/[accountId]/page";
import CreateTransactionPage from "./pages/(dashboard)/accounts/[accountId]/transactions/create/page";
import AccountTransactionsPage from "./pages/(dashboard)/accounts/[accountId]/transactions/page";
import CreateAccountPage from "./pages/(dashboard)/accounts/create/page";
import AccountsPage from "./pages/(dashboard)/accounts/page";
import DashboardPage from "./pages/(dashboard)/dashboard/page";
import DashboardLayout from "./pages/(dashboard)/layout";
import SiteLayout from "./pages/(site)/layout";
import IndexPage from "./pages/(site)/page";

export default function App() {
  return (
    <Switch>
      <Route path="/">
        <SiteLayout>
          <IndexPage />
        </SiteLayout>
      </Route>

      <Route path="/dashboard">
        <DashboardLayout>
          <DashboardPage />
        </DashboardLayout>
      </Route>

      <Route path="/accounts">
        <DashboardLayout>
          <AccountsPage />
        </DashboardLayout>
      </Route>

      <Route path="/accounts/create">
        <DashboardLayout>
          <CreateAccountPage />
        </DashboardLayout>
      </Route>

      <Route path="/accounts/:accountId">
        {(params) => (
          <DashboardLayout>
            <AccountPage params={params} />
          </DashboardLayout>
        )}
      </Route>

      <Route path="/accounts/:accountId/transactions">
        {(params) => (
          <DashboardLayout>
            <AccountTransactionsPage params={params} />
          </DashboardLayout>
        )}
      </Route>

      <Route path="/accounts/:accountId/transactions/create">
        {(params) => (
          <DashboardLayout>
            <CreateTransactionPage params={params} />
          </DashboardLayout>
        )}
      </Route>

      <Route>
        <h1>404: No such page!</h1>
      </Route>
    </Switch>
  );
}
