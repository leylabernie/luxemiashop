import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Unregister stale service workers from previous deployments to prevent
// request interception and caching issues.
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(r => r.unregister());
  });
}

createRoot(document.getElementById("root")!).render(<App />);
