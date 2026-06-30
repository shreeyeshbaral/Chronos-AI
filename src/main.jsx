import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "react-hot-toast";

import "./index.css";

import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { NeuroThemeProvider } from "./context/NeuroThemeContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <NeuroThemeProvider>
      <ThemeProvider>
        <AuthProvider>
          <App />

        <Toaster
          position="top-right"
          reverseOrder={false}
          toastOptions={{
            duration: 2500,
            style: {
              background: "#0f172a",
              color: "#fff",
              border: "1px solid #334155",
            },
          }}
        />
      </AuthProvider>
    </ThemeProvider>
    </NeuroThemeProvider>
  </StrictMode>
);