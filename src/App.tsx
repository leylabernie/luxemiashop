import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
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
import Sarees from "./pages/Sarees";
import Suits from "./pages/Suits";
import Menswear from "./pages/Menswear";
import Contact from "./pages/Contact";
import Shipping from "./pages/Shipping";
import Returns from "./pages/Returns";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import VirtualTryOn from "./pages/VirtualTryOn";
import Artisans from "./pages/Artisans";
import Sustainability from "./pages/Sustainability";
import Press from "./pages/Press";
import SizeGuide from "./pages/SizeGuide";
import CareGuide from "./pages/CareGuide";
import Accessories from "./pages/Accessories";
import FAQ from "./pages/FAQ";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
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
              <Route path="/sarees" element={<Sarees />} />
              <Route path="/suits" element={<Suits />} />
              <Route path="/menswear" element={<Menswear />} />
              <Route path="/our-story" element={<BrandStory />} />
              <Route path="/brand-story" element={<BrandStory />} />
              <Route path="/lookbook" element={<Lookbook />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/account" element={<Account />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/shipping" element={<Shipping />} />
              <Route path="/returns" element={<Returns />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/virtual-tryon" element={<VirtualTryOn />} />
              <Route path="/artisans" element={<Artisans />} />
              <Route path="/sustainability" element={<Sustainability />} />
              <Route path="/press" element={<Press />} />
              <Route path="/size-guide" element={<SizeGuide />} />
              <Route path="/care-guide" element={<CareGuide />} />
              <Route path="/accessories" element={<Accessories />} />
              <Route path="/faq" element={<FAQ />} />
              {/* Redirect missing pages to related content */}
              <Route path="/new-arrivals" element={<Lehengas />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
