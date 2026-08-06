import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Non-JavaScript crawlers receive complete route metadata and structured data
// from the prerendered HTML. Before React Helmet mounts, remove only the
// prerendered route-scoped copies so the hydrated page has one authoritative
// canonical, description, robots directive, social set, and route schema.
document.querySelectorAll([
  'link[rel="canonical"]',
  'link[rel="alternate"][hreflang]',
  'meta[name="description"]',
  'meta[name="robots"]',
  'meta[name="author"]',
  'meta[name^="twitter:"]',
  'meta[property^="og:"]',
  'meta[property^="product:"]',
].join(',')).forEach((element) => element.remove());

document
  .querySelectorAll('script[data-prerender-schema]')
  .forEach((schema) => schema.remove());

// Unregister stale service workers from previous deployments to prevent
// request interception and caching issues.
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(r => r.unregister());
  });
}

createRoot(document.getElementById("root")!).render(<App />);
