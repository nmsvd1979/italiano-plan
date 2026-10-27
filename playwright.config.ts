import { defineConfig, devices } from "@playwright/test";

// Prueba el build real (service worker incluido) con `vite preview`. Usa `npm run test:e2e`.
export default defineConfig({
  testDir: "e2e",
  timeout: 90_000,
  workers: 1,
  reporter: "list",
  use: { baseURL: "http://localhost:4173", ...devices["Desktop Chrome"] },
  projects: [{ name: "chromium", use: { channel: undefined } }],
  webServer: {
    command: "npm run build && npx vite preview --port 4173 --strictPort",
    url: "http://localhost:4173/italiano-plan/",
    timeout: 180_000,
    reuseExistingServer: !process.env.CI,
  },
});
