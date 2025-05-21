import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { Toaster } from "./components/ui/sonner.tsx";
import "./index.css";
import { DBProvider } from "./providers/db.tsx";
import { QueryProvider } from "./providers/query.tsx";
import { ThemeProvider } from "./providers/theme.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <DBProvider>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <QueryProvider>
          <App />
          <Toaster richColors />
        </QueryProvider>
      </ThemeProvider>
    </DBProvider>
  </StrictMode>
);
