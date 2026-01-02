import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import Index from "./pages/Index";
import ProductDetail from "./pages/ProductDetail";
import Collections from "./pages/Collections";
import BrandStory from "./pages/BrandStory";
import Lookbook from "./pages/Lookbook";
import Wishlist from "./pages/Wishlist";
import Auth from "./pages/Auth";
import Account from "./pages/Account";
import Lehengas from "./pages/Lehengas";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/product/:handle" element={<ProductDetail />} />
            <Route path="/collections" element={<Collections />} />
            <Route path="/lehengas" element={<Lehengas />} />
            <Route path="/our-story" element={<BrandStory />} />
            <Route path="/lookbook" element={<Lookbook />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/account" element={<Account />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
