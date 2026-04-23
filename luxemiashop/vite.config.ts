import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

let componentTagger: (() => any) | undefined;
try {
  componentTagger = (await import("lovable-tagger")).componentTagger;
} catch {
  // lovable-tagger is optional and only used in development
}

const isReplit = !!process.env.REPL_ID;

export default defineConfig(({ mode }) => ({
  server: {
    host: isReplit ? "0.0.0.0" : "localhost",
    port: isReplit ? 5000 : 8080,
    allowedHosts: isReplit ? (true as true) : undefined,
  },
  plugins: [react(), mode === "development" && componentTagger?.()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          "vendor-supabase": ["@supabase/supabase-js"],
          "vendor-query": ["@tanstack/react-query"],
          "vendor-motion": ["framer-motion"],
          "vendor-ui": [
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-select",
            "@radix-ui/react-toast",
            "@radix-ui/react-tooltip",
            "@radix-ui/react-popover",
            "@radix-ui/react-accordion",
          ],
        },
      },
    },
  },
}));
