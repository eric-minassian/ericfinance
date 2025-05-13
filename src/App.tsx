import { Route, Switch } from "wouter";
import AccountPage from "./pages/(dashboard)/accounts/[accountId]/page";
import ImportSecuritiesPage from "./pages/(dashboard)/accounts/[accountId]/securities/import/page";
import AccountSecuritiesPage from "./pages/(dashboard)/accounts/[accountId]/securities/page";
import CreateTransactionPage from "./pages/(dashboard)/accounts/[accountId]/transactions/create/page";
import ImportTransactionsPage from "./pages/(dashboard)/accounts/[accountId]/transactions/import/page";
import AccountTransactionsPage from "./pages/(dashboard)/accounts/[accountId]/transactions/page";
import CreateAccountPage from "./pages/(dashboard)/accounts/create/page";
import AccountsPage from "./pages/(dashboard)/accounts/page";
import DashboardPage from "./pages/(dashboard)/dashboard/page";
import ImportsPage from "./pages/(dashboard)/imports/page";
import DashboardLayout from "./pages/(dashboard)/layout";
import SettingsPage from "./pages/(dashboard)/settings/page";
import TransactionsPage from "./pages/(dashboard)/transactions/page";
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

      <Route path="/transactions">
        <DashboardLayout>
          <TransactionsPage />
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

      <Route path="/accounts/:accountId/transactions/import">
        {(params) => (
          <DashboardLayout>
            <ImportTransactionsPage params={params} />
          </DashboardLayout>
        )}
      </Route>

      <Route path="/accounts/:accountId/securities">
        {(params) => (
          <DashboardLayout>
            <AccountSecuritiesPage params={params} />
          </DashboardLayout>
        )}
      </Route>

      <Route path="/accounts/:accountId/securities/import">
        {(params) => (
          <DashboardLayout>
            <ImportSecuritiesPage params={params} />
          </DashboardLayout>
        )}
      </Route>

      <Route path="/imports">
        <DashboardLayout>
          <ImportsPage />
        </DashboardLayout>
      </Route>

      <Route path="/settings">
        <DashboardLayout>
          <SettingsPage />
        </DashboardLayout>
      </Route>

      <Route>
        <h1>404: No such page!</h1>
      </Route>
    </Switch>
  );
}
