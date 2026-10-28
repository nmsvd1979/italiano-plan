import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/figtree";
import "./theme/tokens.css";
import "./theme/app.css";
import { App } from "./App";
import { registerServiceWorker } from "./app/updates";
import { primeVoices } from "./ui/speech";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

registerServiceWorker();
primeVoices();
