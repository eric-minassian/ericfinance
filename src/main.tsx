import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { SidebarProvider } from "./components/ui/sidebar.tsx";
import "./index.css";
import { DBProvider } from "./providers/db.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <DBProvider>
      <SidebarProvider>
        <App />
      </SidebarProvider>
    </DBProvider>
  </StrictMode>
);
