import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Direct bot requests receive build-time JSON-LD in prerendered HTML. Remove
// those temporary copies before React Helmet mounts the equivalent route schema
// so JavaScript-enabled crawlers never see duplicate FAQPage or HowTo blocks.
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
