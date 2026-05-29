import { useEffect, lazy, Suspense } from "react";
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

// Eagerly loaded: Homepage is the most visited page
import Index from "./pages/Index";

// Lazy loaded: all other pages — reduces initial JS bundle by ~60%
// This is the single biggest FCP/LCP improvement for SPA architectures
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Collections = lazy(() => import("./pages/Collections"));
const BrandStory = lazy(() => import("./pages/BrandStory"));
const Wishlist = lazy(() => import("./pages/Wishlist"));
const Auth = lazy(() => import("./pages/Auth"));
const Account = lazy(() => import("./pages/Account"));
const Lehengas = lazy(() => import("./pages/Lehengas"));
const LehengaCholi = lazy(() => import("./pages/LehengaCholi"));
const BridalLehengas = lazy(() => import("./pages/BridalLehengas"));
const WeddingLehengas = lazy(() => import("./pages/WeddingLehengas"));
const DesignerLehengas = lazy(() => import("./pages/DesignerLehengas"));
const WeddingSarees = lazy(() => import("./pages/WeddingSarees"));
const ReceptionOutfits = lazy(() => import("./pages/ReceptionOutfits"));
const PartyWearLehengas = lazy(() => import("./pages/PartyWearLehengas"));
const DesignerSarees = lazy(() => import("./pages/DesignerSarees"));
const SilkSarees = lazy(() => import("./pages/SilkSarees"));
const SareeGowns = lazy(() => import("./pages/SareeGowns"));
const WeddingGuestDresses = lazy(() => import("./pages/WeddingGuestDresses"));
const IndianWeddingDresses = lazy(() => import("./pages/IndianWeddingDresses"));
const PakistaniWeddingDresses = lazy(() => import("./pages/PakistaniWeddingDresses"));
const PakistaniSuits = lazy(() => import("./pages/PakistaniSuits"));
const AnarkaliSuits = lazy(() => import("./pages/AnarkaliSuits"));
const AnarkaliGowns = lazy(() => import("./pages/AnarkaliGowns"));
const SalwarKameez = lazy(() => import("./pages/SalwarKameez"));
const PalazzoSuits = lazy(() => import("./pages/PalazzoSuits"));
const ShararaSuits = lazy(() => import("./pages/ShararaSuits"));
const GhararaSuits = lazy(() => import("./pages/GhararaSuits"));
const IndoWesternDresses = lazy(() => import("./pages/IndoWesternDresses"));
const KurtaSets = lazy(() => import("./pages/KurtaSets"));
const Sarees = lazy(() => import("./pages/Sarees"));
const Suits = lazy(() => import("./pages/Suits"));
const Menswear = lazy(() => import("./pages/Menswear"));
const Contact = lazy(() => import("./pages/Contact"));
const Shipping = lazy(() => import("./pages/Shipping"));
const Returns = lazy(() => import("./pages/Returns"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const NewArrivals = lazy(() => import("./pages/NewArrivals"));
const Bestsellers = lazy(() => import("./pages/Bestsellers"));
const Indowestern = lazy(() => import("./pages/Indowestern"));
const Artisans = lazy(() => import("./pages/Artisans"));
const Sustainability = lazy(() => import("./pages/Sustainability"));
const Press = lazy(() => import("./pages/Press"));
const SizeGuide = lazy(() => import("./pages/SizeGuide"));
const CareGuide = lazy(() => import("./pages/CareGuide"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Sitemap = lazy(() => import("./pages/Sitemap"));
const Lookbook = lazy(() => import("./pages/Lookbook"));
const VirtualTryOn = lazy(() => import("./pages/VirtualTryOn"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const StyleConsultation = lazy(() => import("./pages/StyleConsultation"));
const StyleQuiz = lazy(() => import("./pages/StyleQuiz"));
const OrderConfirmation = lazy(() => import("./pages/OrderConfirmation"));
const USA = lazy(() => import("./pages/nri/USA"));
const Canada = lazy(() => import("./pages/nri/Canada"));
const NRIGeneral = lazy(() => import("./pages/nri/NRIGeneral"));
// Occasion landing pages — high buyer-intent SEO collection pages
const DiwaliOutfits = lazy(() => import("./pages/DiwaliOutfits"));
const WeddingGuestOutfits = lazy(() => import("./pages/WeddingGuestOutfits"));
const MehendiOutfits = lazy(() => import("./pages/MehendiOutfits"));
const EidOutfits = lazy(() => import("./pages/EidOutfits"));
const NavratriOutfits = lazy(() => import("./pages/NavratriOutfits"));

// Minimal loading fallback — prevents CLS from layout shift during lazy load
const PageLoader = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="animate-pulse text-muted-foreground text-sm">Loading…</div>
  </div>
);

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
                <Route path="/product/:handle" element={<Suspense fallback={<PageLoader />}><ProductDetail /></Suspense>} />
                <Route path="/collections" element={<Suspense fallback={<PageLoader />}><Collections /></Suspense>} />
                <Route path="/lehengas" element={<Suspense fallback={<PageLoader />}><Lehengas /></Suspense>} />
                <Route path="/sarees" element={<Suspense fallback={<PageLoader />}><Sarees /></Suspense>} />
                <Route path="/suits" element={<Suspense fallback={<PageLoader />}><Suits /></Suspense>} />
                <Route path="/menswear" element={<Suspense fallback={<PageLoader />}><Menswear /></Suspense>} />
                <Route path="/our-story" element={<Navigate to="/brand-story" replace />} />
                <Route path="/about-us" element={<Navigate to="/brand-story" replace />} />
                <Route path="/about" element={<Navigate to="/brand-story" replace />} />
                <Route path="/brand-story" element={<Suspense fallback={<PageLoader />}><BrandStory /></Suspense>} />
                <Route path="/lookbook" element={<Suspense fallback={<PageLoader />}><Lookbook /></Suspense>} />
                <Route path="/wishlist" element={<Suspense fallback={<PageLoader />}><Wishlist /></Suspense>} />
                <Route path="/auth" element={<Suspense fallback={<PageLoader />}><Auth /></Suspense>} />
                <Route path="/account" element={<Suspense fallback={<PageLoader />}><Account /></Suspense>} />
                <Route path="/contact" element={<Suspense fallback={<PageLoader />}><Contact /></Suspense>} />
                <Route path="/shipping" element={<Suspense fallback={<PageLoader />}><Shipping /></Suspense>} />
                <Route path="/returns" element={<Suspense fallback={<PageLoader />}><Returns /></Suspense>} />
                <Route path="/privacy" element={<Suspense fallback={<PageLoader />}><Privacy /></Suspense>} />
                <Route path="/privacy-policy" element={<Navigate to="/privacy" replace />} />
                <Route path="/terms" element={<Suspense fallback={<PageLoader />}><Terms /></Suspense>} />
                <Route path="/terms-of-service" element={<Navigate to="/terms" replace />} />
                
                <Route path="/artisans" element={<Suspense fallback={<PageLoader />}><Artisans /></Suspense>} />
                <Route path="/sustainability" element={<Suspense fallback={<PageLoader />}><Sustainability /></Suspense>} />
                <Route path="/press" element={<Suspense fallback={<PageLoader />}><Press /></Suspense>} />
                <Route path="/size-guide" element={<Suspense fallback={<PageLoader />}><SizeGuide /></Suspense>} />
                <Route path="/care-guide" element={<Suspense fallback={<PageLoader />}><CareGuide /></Suspense>} />
                <Route path="/jewelry" element={<Navigate to="/collections" replace />} />
                <Route path="/virtual-try-on" element={<Suspense fallback={<PageLoader />}><VirtualTryOn /></Suspense>} />
                <Route path="/faq" element={<Suspense fallback={<PageLoader />}><FAQ /></Suspense>} />
                {/* Redirects for /collections/* URLs — keeps SEO equity & prevents 404s */}
                <Route path="/collections/festive-wear" element={<Navigate to="/collections" replace />} />
                <Route path="/collections/sarees" element={<Navigate to="/sarees" replace />} />
                <Route path="/collections/suits" element={<Navigate to="/suits" replace />} />
                <Route path="/collections/menswear" element={<Navigate to="/menswear" replace />} />
                <Route path="/collections/lehengas" element={<Navigate to="/lehengas" replace />} />
                <Route path="/collections/indo-western" element={<Navigate to="/indowestern" replace />} />
                <Route path="/collections/bridesmaid-dresses" element={<Navigate to="/sarees" replace />} />
                <Route path="/collections/groomsman-outfits" element={<Navigate to="/menswear" replace />} />
                {/* Occasion landing pages */}
                <Route path="/collections/bridal-lehengas" element={<Suspense fallback={<PageLoader />}><BridalLehengas /></Suspense>} />
                <Route path="/collections/wedding-lehengas" element={<Suspense fallback={<PageLoader />}><WeddingLehengas /></Suspense>} />
                <Route path="/collections/lehenga-choli" element={<Suspense fallback={<PageLoader />}><LehengaCholi /></Suspense>} />
                <Route path="/collections/designer-lehengas" element={<Suspense fallback={<PageLoader />}><DesignerLehengas /></Suspense>} />
                <Route path="/collections/wedding-sarees" element={<Suspense fallback={<PageLoader />}><WeddingSarees /></Suspense>} />
                <Route path="/collections/reception-outfits" element={<Suspense fallback={<PageLoader />}><ReceptionOutfits /></Suspense>} />
                <Route path="/collections/party-wear-lehengas" element={<Suspense fallback={<PageLoader />}><PartyWearLehengas /></Suspense>} />
                <Route path="/collections/designer-sarees" element={<Suspense fallback={<PageLoader />}><DesignerSarees /></Suspense>} />
                <Route path="/collections/silk-sarees" element={<Suspense fallback={<PageLoader />}><SilkSarees /></Suspense>} />
                <Route path="/collections/saree-gowns" element={<Suspense fallback={<PageLoader />}><SareeGowns /></Suspense>} />
                <Route path="/collections/wedding-guest-dresses" element={<Suspense fallback={<PageLoader />}><WeddingGuestDresses /></Suspense>} />
                <Route path="/collections/indian-wedding-dresses" element={<Suspense fallback={<PageLoader />}><IndianWeddingDresses /></Suspense>} />
                <Route path="/collections/pakistani-wedding-dresses" element={<Suspense fallback={<PageLoader />}><PakistaniWeddingDresses /></Suspense>} />
                <Route path="/collections/pakistani-suits" element={<Suspense fallback={<PageLoader />}><PakistaniSuits /></Suspense>} />
                <Route path="/collections/anarkali-suits" element={<Suspense fallback={<PageLoader />}><AnarkaliSuits /></Suspense>} />
                <Route path="/collections/anarkali-gowns" element={<Suspense fallback={<PageLoader />}><AnarkaliGowns /></Suspense>} />
                <Route path="/collections/salwar-kameez" element={<Suspense fallback={<PageLoader />}><SalwarKameez /></Suspense>} />
                <Route path="/collections/palazzo-suits" element={<Suspense fallback={<PageLoader />}><PalazzoSuits /></Suspense>} />
                <Route path="/collections/sharara-suits" element={<Suspense fallback={<PageLoader />}><ShararaSuits /></Suspense>} />
                <Route path="/collections/gharara-suits" element={<Suspense fallback={<PageLoader />}><GhararaSuits /></Suspense>} />
                <Route path="/collections/indo-western-dresses" element={<Suspense fallback={<PageLoader />}><IndoWesternDresses /></Suspense>} />
                <Route path="/collections/kurta-sets" element={<Suspense fallback={<PageLoader />}><KurtaSets /></Suspense>} />
                <Route path="/collections/diwali-outfits" element={<Suspense fallback={<PageLoader />}><DiwaliOutfits /></Suspense>} />
                <Route path="/collections/wedding-guest-outfits" element={<Suspense fallback={<PageLoader />}><WeddingGuestOutfits /></Suspense>} />
                <Route path="/collections/mehendi-outfits" element={<Suspense fallback={<PageLoader />}><MehendiOutfits /></Suspense>} />
                <Route path="/collections/eid-outfits" element={<Suspense fallback={<PageLoader />}><EidOutfits /></Suspense>} />
                <Route path="/collections/navratri-outfits" element={<Suspense fallback={<PageLoader />}><NavratriOutfits /></Suspense>} />

                <Route path="/sitemap" element={<Suspense fallback={<PageLoader />}><Sitemap /></Suspense>} />
                <Route path="/style-consultation" element={<Suspense fallback={<PageLoader />}><StyleConsultation /></Suspense>} />
                <Route path="/style-quiz" element={<Suspense fallback={<PageLoader />}><StyleQuiz /></Suspense>} />
                {/* Order Confirmation — Google Customer Reviews opt-in */}
                <Route path="/order-confirmation" element={<Suspense fallback={<PageLoader />}><OrderConfirmation /></Suspense>} />
                {/* NRI Landing Pages for SEO */}
                <Route path="/nri" element={<Suspense fallback={<PageLoader />}><NRIGeneral /></Suspense>} />
                <Route path="/nri/usa" element={<Suspense fallback={<PageLoader />}><USA /></Suspense>} />
                <Route path="/nri/canada" element={<Suspense fallback={<PageLoader />}><Canada /></Suspense>} />
                <Route path="/indian-ethnic-wear-usa" element={<Suspense fallback={<PageLoader />}><USA /></Suspense>} />
                <Route path="/indian-ethnic-wear-canada" element={<Suspense fallback={<PageLoader />}><Canada /></Suspense>} />
                {/* UK pages redirect to /nri (no longer targeted) */}
                <Route path="/nri/uk" element={<Navigate to="/nri" replace />} />
                <Route path="/indian-ethnic-wear-uk" element={<Navigate to="/nri" replace />} />
                <Route path="/uk-indian-clothing" element={<Navigate to="/nri" replace />} />
                <Route path="/uk-designer-sarees" element={<Navigate to="/nri" replace />} />
                <Route path="/admin" element={<Suspense fallback={<PageLoader />}><AdminDashboard /></Suspense>} />
                {/* Blog */}
                <Route path="/blog" element={<Suspense fallback={<PageLoader />}><Blog /></Suspense>} />
                <Route path="/blog/:slug" element={<Suspense fallback={<PageLoader />}><BlogPost /></Suspense>} />
                <Route path="/new-arrivals" element={<Suspense fallback={<PageLoader />}><NewArrivals /></Suspense>} />
                <Route path="/bestsellers" element={<Suspense fallback={<PageLoader />}><Bestsellers /></Suspense>} />
                <Route path="/indowestern" element={<Suspense fallback={<PageLoader />}><Indowestern /></Suspense>} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<Suspense fallback={<PageLoader />}><NotFound /></Suspense>} />
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
