/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "/italiano-plan/",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icons/apple-touch-icon.png", "icons/favicon-32.png"],
      workbox: {
        globPatterns: ["**/*.{js,css,html,woff2,png,mp3}"],
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
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
    }),
  ],
  test: {
    include: ["src/**/*.test.ts"],
  },
});
