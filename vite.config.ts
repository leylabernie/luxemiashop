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

// Vite plugin: make CSS links non-render-blocking using the media="print" trick.
// PageSpeed flags <link rel="stylesheet"> as render-blocking. This plugin
// transforms Vite's CSS <link> tags to use media="print" onload, which
// allows the browser to continue rendering while the CSS downloads.
// The CSS is applied immediately once loaded (no flash of unstyled content
// because the critical CSS is inlined in index.html <style> tags).
function deferCssPlugin(): import('vite').Plugin {
  return {
    name: 'defer-css-bundle',
    enforce: 'post',
    transformIndexHtml(html: string) {
      // Match Vite-injected CSS stylesheet links: <link rel="stylesheet" ... href="/assets/...css">
      return html.replace(
        /<link rel="stylesheet"([^>]*)href="(\/assets\/[^"\s]+\.css)"([^>]*)>/g,
        (_match, before, href, after) => {
          // Build the non-blocking version with media="print" trick
          return `<link rel="stylesheet"${before}href="${href}"${after} media="print" onload="this.media='all'">
<noscript><link rel="stylesheet"${before}href="${href}"${after}></noscript>`;
        }
      );
    },
  };
}

export default defineConfig(({ mode }) => ({
  server: {
    host: isReplit ? "0.0.0.0" : "localhost",
    port: isReplit ? 5000 : 8080,
    allowedHosts: isReplit ? (true as true) : undefined,
  },
  plugins: [react(), mode === "development" && componentTagger?.(), deferCssPlugin()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Target modern browsers for smaller/faster builds
    target: 'es2020',
    // Enable CSS code splitting for smaller initial load
    cssCodeSplit: true,
    // Smaller chunk size warning threshold
    chunkSizeWarningLimit: 800,
    // Module preload policy (SEO audit 2026-07-09 Item #17 + PageSpeed 2026-07-14):
    // Vite by default emits <link rel="modulepreload"> for every chunk in
    // the import graph, including those reachable only via dynamic import().
    // That defeated the lazy-loading of @supabase/supabase-js (169 kB /
    // 44 kB gzip) — the browser was preloading it on every page even
    // though it's only used for auth/account/admin. The filter below
    // excludes the supabase chunk from preload hints, so the browser
    // only fetches it when getSupabase() is actually called (after first
    // paint, inside useEffect).
    //
    // PageSpeed 2026-07-14: also exclude vendor-motion (41 kB gzip),
    // vendor-forms (22 kB gzip), and vendor-query (12 kB gzip) from
    // modulepreload. These are only needed AFTER first paint (animations,
    // form interactions, data fetching) — preloading them delays FCP/LCP
    // by ~75 kB gzip on every page. They'll still be fetched on demand
    // when the components that need them hydrate.
    modulePreload: {
      polyfill: true,
      resolveDependencies: (_, deps) => deps.filter((d) =>
        !d.includes('supabase') &&
        !d.includes('vendor-motion') &&
        !d.includes('vendor-forms') &&
        !d.includes('vendor-query') &&
        !d.includes('vendor-ui-extra')
      ),
    },
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          // @supabase/supabase-js kept as a named manualChunk so it stays
          // in its own file and can be lazy-loaded. On 2026-07-09 (SEO
          // audit Item #17) we also converted useAuth.tsx to use
          // `import('@/integrations/supabase/client')` (dynamic import),
          // which means Vite will NO LONGER emit a <link rel="modulepreload">
          // for this chunk in index.html — the browser will fetch it on
          // demand only when auth state is checked (after first paint).
          // Net effect: ~169 kB (44 kB gzip) removed from initial load on
          // every route. Previously Vite preloaded it because the static
          // import graph reached it; now the dynamic import breaks that edge.
          "vendor-supabase": ["@supabase/supabase-js"],
          "vendor-query": ["@tanstack/react-query"],
          "vendor-motion": ["framer-motion"],
          "vendor-ui-core": [
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-select",
            "@radix-ui/react-toast",
          ],
          "vendor-ui-extra": [
            "@radix-ui/react-tooltip",
            "@radix-ui/react-accordion",
          ],
          "vendor-helmet": ["react-helmet-async"],
          // recharts removed from manualChunks on 2026-07-09 (SEO audit
          // Item #17). It's only used by AdminDashboard, which is already
          // lazy-loaded via React.lazy() in App.tsx. Letting Rollup
          // code-split it naturally means the chart library only loads
          // when /admin is visited.
          "vendor-forms": ["react-hook-form", "@hookform/resolvers", "zod"],
        },
      },
    },
    // Enable minification for production
    minify: 'esbuild',
    // Set a reasonable sourcemap for debugging without bloating build
    sourcemap: false,
  },
}));
