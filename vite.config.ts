/// <reference types="vitest" />
import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

/**
 * Rewrites the `<!-- api-preconnect-placeholder -->` in index.html into a real
 * <link rel="preconnect"> for whatever origin VITE_API_URL names, and widens
 * the CSP's connect-src/img-src to allow it. index.html stays deployment-
 * agnostic: pointing at a different API host is an env var, not a source edit.
 */
const apiOrigin = (apiUrl: string | undefined): string | undefined => {
  if (!apiUrl) return undefined;
  try {
    return new URL(apiUrl).origin;
  } catch {
    return undefined;
  }
};

const apiPreconnect = (apiUrl: string | undefined): Plugin => ({
  name: "api-preconnect",
  transformIndexHtml(html) {
    const origin = apiOrigin(apiUrl);
    if (!origin) return html;
    const withPreconnect = html.replace(
      "<!-- api-preconnect-placeholder -->",
      `<link rel="preconnect" href="${origin}" crossorigin>`
    );
    // index.html already lists the dev default; only widen the CSP when the
    // configured origin is something else, or it ends up listed twice.
    if (withPreconnect.includes(`connect-src 'self' ${origin}`)) return withPreconnect;
    // The API is both an XHR target and, when it serves uploaded images
    // itself, an image source.
    return withPreconnect
      .replace("connect-src 'self'", `connect-src 'self' ${origin}`)
      .replace("img-src 'self'", `img-src 'self' ${origin}`);
  },
});

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    apiPreconnect(env.VITE_API_URL),
    mode === "development" && componentTagger(),
  ].filter(Boolean) as Plugin[],
  resolve: {
    // Only the `@` alias. An earlier `@/integrations/supabase/client`
    // override redirected every SDK import to `cloudClient.ts`, which
    // threw at module load when its env var was missing (i.e. on Vercel,
    // where it should be) and bricked the whole bundle with a white
    // screen. The data layer is now `src/lib/api.ts`, talking to
    // VITE_API_URL directly; nothing else should be aliased here.
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
  };
});
