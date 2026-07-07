import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "@/App";
import { GovernanceProvider } from "@/context/GovernanceContext";
import { applyStoredTheme } from "@/lib/theme";
import "@/styles/globals.css";

applyStoredTheme();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <GovernanceProvider>
        <App />
      </GovernanceProvider>
    </BrowserRouter>
  </React.StrictMode>
);
