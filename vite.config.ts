/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          // Heavy libs split into their own chunks so they can be cached
          // independently and loaded only by the routes that need them.
          if (id.includes("maplibre-gl") || id.includes("mapbox-gl")) return "maps";
          if (id.includes("@react-google-maps")) return "maps";
          if (id.includes("framer-motion")) return "motion";
          if (id.includes("@supabase")) return "supabase";
          if (id.includes("@tanstack/react-query")) return "query";
          if (id.includes("recharts") || id.includes("d3-")) return "charts";
          if (id.includes("embla-carousel") || id.includes("vaul") || id.includes("cmdk"))
            return "ui-extras";
          if (
            id.includes("@radix-ui") ||
            id.includes("lucide-react") ||
            id.includes("sonner") ||
            id.includes("react-hook-form") ||
            id.includes("zod")
          )
            return "ui";
          if (id.includes("react-router") || id.includes("react-dom") || id.includes("/react/")) {
            return "react";
          }
        },
      },
    },
  },
  // Strip console logs and debugger statements in production for security
  esbuild: {
    drop: mode === "production" ? ["console", "debugger"] : [],
  },
  test: {
    // jsdom because several helpers touch window / localStorage.
    environment: "jsdom",
    globals: true,
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    css: false,
  },
}));
