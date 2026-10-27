/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { readFileSync } from "node:fs";

const pkg = JSON.parse(readFileSync("package.json", "utf8")) as { version: string };

export default defineConfig({
  base: "/italiano-plan/",
  define: {
    // Se muestran en Ajustes para saber qué versión está corriendo (útil al comprobar la actualización).
    __APP_VERSION__: JSON.stringify(pkg.version),
    __BUILD_DATE__: JSON.stringify(new Date().toISOString()),
  },
  plugins: [
    react(),
    VitePWA({
      // "prompt": la actualización no se aplica sola; src/app/updates.ts la aplica al volver a Hoy (no con una sesión abierta).
      registerType: "prompt",
      includeAssets: ["icons/apple-touch-icon.png", "icons/favicon-32.png"],
      workbox: {
        // Solo la app (~0,7 MB): el audio se baja aparte con el gestor de descarga (src/app/offlineAudio.ts),
        // para que la instalación del service worker casi no pueda fallar. audio-index.json es la lista de ese gestor.
        globPatterns: ["**/*.{js,css,html,woff2,png,webmanifest}", "audio-index.json"],
        globIgnores: ["audio/**"],
        clientsClaim: true,
        runtimeCaching: [
          {
            // Cache con nombre fijo y distinto del precache: cleanupOutdatedCaches no la toca al actualizar. Sin `expiration`.
            urlPattern: ({ url }) => url.pathname.startsWith("/italiano-plan/audio/"),
            handler: "CacheFirst",
            options: {
              cacheName: "audio-v1",
              // Safari pide el audio con Range: sin esto el worker devolvería el archivo entero (200) y no se reproduciría.
              rangeRequests: true,
              cacheableResponse: { statuses: [200] },
            },
          },
        ],
      },
      manifest: {
        name: "Italiano — Plan de 24 unidades",
        short_name: "Italiano",
        description: "Plan adaptativo de 24 unidades para aprender italiano, con gramática, shadowing y pronunciación.",
        start_url: "/italiano-plan/",
        scope: "/italiano-plan/",
        display: "standalone",
        orientation: "portrait",
        background_color: "#fbf8f3",
        theme_color: "#fbf8f3",
        icons: [
          { src: "icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
          { src: "icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
    }),
  ],
  test: {
    include: ["src/**/*.test.ts"],
  },
});
