import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Unregister any service workers left over from the old Lovable deployment.
// The site has migrated to Vercel; stale service workers can intercept requests
// and redirect to the defunct luxemiashop.lovable.app domain.
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(r => r.unregister());
  });
}

createRoot(document.getElementById("root")!).render(<App />);
