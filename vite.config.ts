import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

let componentTagger: (() => any) | undefined;
try {
  componentTagger = (await import("lovable-tagger")).componentTagger;
} catch {
  // lovable-tagger is optional and only used in development
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger?.()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
