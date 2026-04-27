import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "./hooks/useAuth";
import { usePageTracking, trackShopifyOrderFromURL } from "./hooks/useAnalytics";
import MobileBottomNav from "./components/layout/MobileBottomNav";
import WhatsAppButton from "./components/WhatsAppButton";
import Index from "./pages/Index";
import ProductDetail from "./pages/ProductDetail";
import Collections from "./pages/Collections";
import BrandStory from "./pages/BrandStory";
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

import NewArrivals from "./pages/NewArrivals";
import Bestsellers from "./pages/Bestsellers";
import Indowestern from "./pages/Indowestern";
import Artisans from "./pages/Artisans";
import Sustainability from "./pages/Sustainability";
import Press from "./pages/Press";
import SizeGuide from "./pages/SizeGuide";
import CareGuide from "./pages/CareGuide";
import FAQ from "./pages/FAQ";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import NotFound from "./pages/NotFound";

import Sitemap from "./pages/Sitemap";
import VirtualTryOn from "./pages/VirtualTryOn";
import AdminDashboard from "./pages/AdminDashboard";
import StyleConsultation from "./pages/StyleConsultation";
import StyleQuiz from "./pages/StyleQuiz";
import USA from "./pages/nri/USA";
import UK from "./pages/nri/UK";
import Canada from "./pages/nri/Canada";
import NRIGeneral from "./pages/nri/NRIGeneral";

const queryClient = new QueryClient();

// Component to handle page tracking inside router context
const PageTracker = ({ children }: { children: React.ReactNode }) => {
  usePageTracking();

  // Check for Shopify order confirmation in URL (conversion tracking)
  useEffect(() => {
    trackShopifyOrderFromURL();
  }, []);

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
                <Route path="/our-story" element={<Navigate to="/brand-story" replace />} />
                <Route path="/brand-story" element={<BrandStory />} />
                <Route path="/lookbook" element={<Navigate to="/collections" replace />} />
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
                <Route path="/jewelry" element={<Navigate to="/collections" replace />} />
                <Route path="/virtual-try-on" element={<VirtualTryOn />} />
                <Route path="/faq" element={<FAQ />} />
                {/* Redirects for /collections/* URLs — keeps SEO equity & prevents 404s */}
                <Route path="/collections/wedding-sarees" element={<Navigate to="/sarees" replace />} />
                <Route path="/collections/bridal-lehengas" element={<Navigate to="/lehengas" replace />} />
                <Route path="/collections/reception-outfits" element={<Navigate to="/collections" replace />} />
                <Route path="/collections/festive-wear" element={<Navigate to="/collections" replace />} />
                <Route path="/collections/sarees" element={<Navigate to="/sarees" replace />} />
                <Route path="/collections/salwar-kameez" element={<Navigate to="/suits" replace />} />
                <Route path="/collections/suits" element={<Navigate to="/suits" replace />} />
                <Route path="/collections/menswear" element={<Navigate to="/menswear" replace />} />
                <Route path="/collections/lehengas" element={<Navigate to="/lehengas" replace />} />
                <Route path="/collections/indo-western" element={<Navigate to="/indowestern" replace />} />
                <Route path="/collections/bridesmaid-dresses" element={<Navigate to="/sarees" replace />} />
                <Route path="/collections/groomsman-outfits" element={<Navigate to="/menswear" replace />} />

                <Route path="/sitemap" element={<Sitemap />} />
                <Route path="/style-consultation" element={<StyleConsultation />} />
                <Route path="/style-quiz" element={<StyleQuiz />} />
                {/* NRI Landing Pages for SEO */}
                <Route path="/nri" element={<NRIGeneral />} />
                <Route path="/indian-ethnic-wear-usa" element={<USA />} />
                <Route path="/indian-ethnic-wear-uk" element={<UK />} />
                <Route path="/indian-ethnic-wear-canada" element={<Canada />} />
                <Route path="/admin" element={<AdminDashboard />} />
                {/* Blog */}
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogPost />} />
                <Route path="/new-arrivals" element={<NewArrivals />} />
                <Route path="/bestsellers" element={<Bestsellers />} />
                <Route path="/indowestern" element={<Indowestern />} />
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
