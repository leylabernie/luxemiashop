import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "./hooks/useAuth";
import { usePageTracking } from "./hooks/useAnalytics";
import MobileBottomNav from "./components/layout/MobileBottomNav";
import WhatsAppButton from "./components/WhatsAppButton";
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

import Artisans from "./pages/Artisans";
import Sustainability from "./pages/Sustainability";
import Press from "./pages/Press";
import SizeGuide from "./pages/SizeGuide";
import CareGuide from "./pages/CareGuide";
import Jewelry from "./pages/Jewelry";
import FAQ from "./pages/FAQ";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import NotFound from "./pages/NotFound";
import WeddingSarees from "./pages/collections/WeddingSarees";
import BridalLehengas from "./pages/collections/BridalLehengas";
import ReceptionOutfits from "./pages/collections/ReceptionOutfits";
import FestiveWear from "./pages/collections/FestiveWear";
import Sitemap from "./pages/Sitemap";
import VirtualTryOn from "./pages/VirtualTryOn";
import AdminDashboard from "./pages/AdminDashboard";

const queryClient = new QueryClient();

// Component to handle page tracking inside router context
const PageTracker = ({ children }: { children: React.ReactNode }) => {
  usePageTracking();
  return <>{children}</>;
};

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner position="top-center" />
          <BrowserRouter>
            <PageTracker>
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
                
                <Route path="/artisans" element={<Artisans />} />
                <Route path="/sustainability" element={<Sustainability />} />
                <Route path="/press" element={<Press />} />
                <Route path="/size-guide" element={<SizeGuide />} />
                <Route path="/care-guide" element={<CareGuide />} />
                <Route path="/jewelry" element={<Jewelry />} />
                <Route path="/virtual-try-on" element={<VirtualTryOn />} />
                <Route path="/faq" element={<FAQ />} />
                {/* Occasion-based collection pages for SEO */}
                <Route path="/collections/wedding-sarees" element={<WeddingSarees />} />
                <Route path="/collections/bridal-lehengas" element={<BridalLehengas />} />
                <Route path="/collections/reception-outfits" element={<ReceptionOutfits />} />
                <Route path="/collections/festive-wear" element={<FestiveWear />} />
                <Route path="/sitemap" element={<Sitemap />} />
                <Route path="/admin" element={<AdminDashboard />} />
                {/* Blog */}
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogPost />} />
                {/* Redirect missing pages to related content */}
                <Route path="/new-arrivals" element={<Lehengas />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              <MobileBottomNav />
              <WhatsAppButton />
            </PageTracker>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
