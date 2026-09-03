import { useLayoutEffect, lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigationType } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "./hooks/useAuth";
import { usePageTracking } from "./hooks/useAnalytics";
import MobileBottomNav from "./components/layout/MobileBottomNav";
import WhatsAppButton from "./components/WhatsAppButton";
import NewVisitorPopup from "./components/home/NewVisitorPopup";
import AnalyticsConsent from "./components/privacy/AnalyticsConsent";
// Eagerly loaded: Homepage is the most visited page
import Index from "./pages/Index";

// Lazy loaded: all other pages — reduces initial JS bundle by ~60%
// This is the single biggest FCP/LCP improvement for SPA architectures
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Collections = lazy(() => import("./pages/Collections"));
const About = lazy(() => import("./pages/About"));
const Wishlist = lazy(() => import("./pages/Wishlist"));
const Auth = lazy(() => import("./pages/Auth"));
const Account = lazy(() => import("./pages/Account"));
const Lehengas = lazy(() => import("./pages/Lehengas"));
const Sarees = lazy(() => import("./pages/Sarees"));
const Suits = lazy(() => import("./pages/Suits"));
const Menswear = lazy(() => import("./pages/Menswear"));
const Jewelry = lazy(() => import("./pages/Jewelry"));
const Contact = lazy(() => import("./pages/Contact"));
const Shipping = lazy(() => import("./pages/Shipping"));
const ShippingCustoms = lazy(() => import("./pages/ShippingCustoms"));
const Returns = lazy(() => import("./pages/Returns"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const NewArrivals = lazy(() => import("./pages/NewArrivals"));
const ReadyToShip = lazy(() => import("./pages/ReadyToShip"));
const Indowestern = lazy(() => import("./pages/Indowestern"));
const Press = lazy(() => import("./pages/Press"));
const SizeGuide = lazy(() => import("./pages/SizeGuide"));
const SizingMeasurementsGuide = lazy(() => import("./pages/SizingMeasurementsGuide"));
const CareGuide = lazy(() => import("./pages/CareGuide"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const BlogCategory = lazy(() => import("./pages/BlogCategory"));
const AuthorBio = lazy(() => import("./pages/AuthorBio"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Sitemap = lazy(() => import("./pages/Sitemap"));
const Lookbook = lazy(() => import("./pages/Lookbook"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const WeddingPartyOrders = lazy(() => import("./pages/WeddingPartyOrders"));
const StyleQuiz = lazy(() => import("./pages/StyleQuiz"));
const OrderConfirmation = lazy(() => import("./pages/OrderConfirmation"));
const USA = lazy(() => import("./pages/nri/USA"));
const NRIGeneral = lazy(() => import("./pages/nri/NRIGeneral"));
// Occasion landing pages — high buyer-intent SEO collection pages
const DiwaliOutfits = lazy(() => import("./pages/DiwaliOutfits"));
const WeddingGuestOutfits = lazy(() => import("./pages/WeddingGuestOutfits"));
const MehendiOutfits = lazy(() => import("./pages/MehendiOutfits"));
const EidOutfits = lazy(() => import("./pages/EidOutfits"));
const NavratriOutfits = lazy(() => import("./pages/NavratriOutfits"));
const HaldiOutfits = lazy(() => import("./pages/HaldiOutfits"));
const ShopifyCollection = lazy(() => import("./pages/ShopifyCollection"));
const CustomizableOutfits = lazy(() => import("./pages/CustomizableOutfits"));
const CommercialCollectionLanding = lazy(() => import("./pages/CommercialCollectionLanding"));
const InventoryBackedCollection = lazy(() => import("./pages/InventoryBackedCollection"));
const SemanticCommercePage = lazy(() => import("./pages/SemanticCommercePage"));

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
  const location = useLocation();
  const navigationType = useNavigationType();

  // React Router keeps the previous document scroll position during client-side
  // navigation. Always reset product routes before paint so every product open —
  // including direct loads and browser back/forward — starts at the image gallery.
  // Preserve history restoration and explicit anchor navigation on other routes.
  useLayoutEffect(() => {
    const isProductRoute = location.pathname.startsWith('/product/');
    if (!isProductRoute && (navigationType === 'POP' || location.hash)) return;

    const resetScroll = () => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    };

    resetScroll();

    // Browser history restoration can run after layout effects on POP
    // navigation. Reset once more on the next frame so reopening a product
    // through Back/Forward cannot restore an old product-page scroll offset.
    const animationFrame = window.requestAnimationFrame(resetScroll);
    return () => window.cancelAnimationFrame(animationFrame);
  }, [location.hash, location.key, location.pathname, navigationType]);


  return <>{children}</>;
};

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner position="top-center" />
          <AnalyticsConsent />
          <BrowserRouter>
            <PageTracker>
              <Routes>
                <Route path="/" element={<Index />} />
                {/* Verified retired product with no exact replacement. Full requests receive
                    a 410 from middleware; SPA navigation must not soft-redirect to a category. */}
                <Route path="/product/ws-art-silk-off-white-wedding-wear-thread-work-readymade-indo-western-sherwani-391809" element={<Suspense fallback={<PageLoader />}><NotFound /></Suspense>} />
                {/* Internal billing support: never expose a standalone customer product page. */}
                <Route path="/product/luxemia-tailoring-saree-finishing-add-ons" element={<Suspense fallback={<PageLoader />}><NotFound /></Suspense>} />
                <Route path="/product/custom-order-balance-payment" element={<Suspense fallback={<PageLoader />}><NotFound /></Suspense>} />
                <Route path="/product/:handle" element={<Suspense fallback={<PageLoader />}><ProductDetail /></Suspense>} />
                <Route path="/collections" element={<Suspense fallback={<PageLoader />}><Collections /></Suspense>} />
                <Route path="/lehengas" element={<Suspense fallback={<PageLoader />}><Lehengas /></Suspense>} />
                <Route path="/sarees" element={<Suspense fallback={<PageLoader />}><Sarees /></Suspense>} />
                <Route path="/suits" element={<Suspense fallback={<PageLoader />}><Suits /></Suspense>} />
                <Route path="/menswear" element={<Suspense fallback={<PageLoader />}><Menswear /></Suspense>} />
                <Route path="/jewelry" element={<Suspense fallback={<PageLoader />}><Jewelry /></Suspense>} />
                <Route path="/our-story" element={<Navigate to="/about" replace />} />
                <Route path="/about-us" element={<Navigate to="/about" replace />} />
                <Route path="/about" element={<Suspense fallback={<PageLoader />}><About /></Suspense>} />
                <Route path="/us-support" element={<Suspense fallback={<PageLoader />}><SemanticCommercePage /></Suspense>} />
                <Route path="/editorial-policy" element={<Suspense fallback={<PageLoader />}><SemanticCommercePage /></Suspense>} />
                <Route path="/review-policy" element={<Suspense fallback={<PageLoader />}><SemanticCommercePage /></Suspense>} />
                <Route path="/brand-story" element={<Navigate to="/about" replace />} />
                <Route path="/lookbook" element={<Suspense fallback={<PageLoader />}><Lookbook /></Suspense>} />
                <Route path="/wishlist" element={<Suspense fallback={<PageLoader />}><Wishlist /></Suspense>} />
                <Route path="/auth" element={<Suspense fallback={<PageLoader />}><Auth /></Suspense>} />
                <Route path="/account" element={<Suspense fallback={<PageLoader />}><Account /></Suspense>} />
                <Route path="/contact" element={<Suspense fallback={<PageLoader />}><Contact /></Suspense>} />
                <Route path="/shipping" element={<Suspense fallback={<PageLoader />}><Shipping /></Suspense>} />
                <Route path="/shipping/united-states" element={<Suspense fallback={<PageLoader />}><SemanticCommercePage /></Suspense>} />
                <Route path="/shipping/canada" element={<Suspense fallback={<PageLoader />}><SemanticCommercePage /></Suspense>} />
                <Route path="/shipping/united-kingdom" element={<Suspense fallback={<PageLoader />}><SemanticCommercePage /></Suspense>} />
                <Route path="/shipping/australia" element={<Suspense fallback={<PageLoader />}><SemanticCommercePage /></Suspense>} />
                <Route path="/shipping/new-zealand" element={<Suspense fallback={<PageLoader />}><SemanticCommercePage /></Suspense>} />
                <Route path="/shipping/south-africa" element={<Suspense fallback={<PageLoader />}><SemanticCommercePage /></Suspense>} />
                <Route path="/shipping/mauritius" element={<Suspense fallback={<PageLoader />}><SemanticCommercePage /></Suspense>} />
                <Route path="/pages/shipping-customs" element={<Suspense fallback={<PageLoader />}><ShippingCustoms /></Suspense>} />
                <Route path="/shipping-customs" element={<Navigate to="/pages/shipping-customs" replace />} />
                <Route path="/customs" element={<Navigate to="/pages/shipping-customs" replace />} />
                <Route path="/returns" element={<Suspense fallback={<PageLoader />}><Returns /></Suspense>} />
                <Route path="/privacy" element={<Suspense fallback={<PageLoader />}><Privacy /></Suspense>} />
                <Route path="/privacy-policy" element={<Navigate to="/privacy" replace />} />
                <Route path="/terms" element={<Suspense fallback={<PageLoader />}><Terms /></Suspense>} />
                <Route path="/terms-of-service" element={<Navigate to="/terms" replace />} />
                
                <Route path="/artisans" element={<Navigate to="/about" replace />} />
                <Route path="/sustainability" element={<Navigate to="/about" replace />} />
                <Route path="/press" element={<Suspense fallback={<PageLoader />}><Press /></Suspense>} />
                <Route path="/size-guide" element={<Suspense fallback={<PageLoader />}><SizeGuide /></Suspense>} />
                <Route path="/sizing-measurements-guide" element={<Suspense fallback={<PageLoader />}><SizingMeasurementsGuide /></Suspense>} />
                <Route path="/care-guide" element={<Suspense fallback={<PageLoader />}><CareGuide /></Suspense>} />
                <Route path="/faq" element={<Suspense fallback={<PageLoader />}><FAQ /></Suspense>} />
                {/* Redirects for /collections/* URLs — keeps SEO equity & prevents 404s */}
                <Route path="/collections/wedding-sarees" element={<Suspense fallback={<PageLoader />}><CommercialCollectionLanding landing="wedding-sarees" /></Suspense>} />
                <Route path="/collections/banarasi-sarees" element={<Suspense fallback={<PageLoader />}><CommercialCollectionLanding landing="banarasi-sarees" /></Suspense>} />
                <Route path="/collections/bridal-lehengas" element={<Suspense fallback={<PageLoader />}><CommercialCollectionLanding landing="bridal-lehengas" /></Suspense>} />
                <Route path="/collections/reception-outfits" element={<Suspense fallback={<PageLoader />}><InventoryBackedCollection landing="reception-outfits" /></Suspense>} />
                <Route path="/collections/wedding-guest-lehengas" element={<Suspense fallback={<PageLoader />}><InventoryBackedCollection landing="wedding-guest-lehengas" /></Suspense>} />
                <Route path="/collections/wedding-guest-kurta-sets" element={<Suspense fallback={<PageLoader />}><InventoryBackedCollection landing="wedding-guest-kurta-sets" /></Suspense>} />
                <Route path="/collections/diwali-womenswear" element={<Suspense fallback={<PageLoader />}><InventoryBackedCollection landing="diwali-womenswear" /></Suspense>} />
                <Route path="/collections/diwali-menswear" element={<Suspense fallback={<PageLoader />}><InventoryBackedCollection landing="diwali-menswear" /></Suspense>} />
                <Route path="/collections/festive-wear" element={<Navigate to="/collections" replace />} />
                <Route path="/collections/sarees" element={<Navigate to="/sarees" replace />} />
                <Route path="/collections/salwar-kameez" element={<Navigate to="/suits" replace />} />
                <Route path="/collections/suits" element={<Navigate to="/suits" replace />} />
                <Route path="/collections/menswear" element={<Navigate to="/menswear" replace />} />
                <Route path="/collections/lehengas" element={<Navigate to="/lehengas" replace />} />
                <Route path="/collections/sharara-suits" element={<Suspense fallback={<PageLoader />}><CommercialCollectionLanding landing="sharara-suits" /></Suspense>} />
                <Route path="/collections/gharara-suits" element={<Suspense fallback={<PageLoader />}><CommercialCollectionLanding landing="gharara-suits" /></Suspense>} />
                <Route path="/collections/anarkali-suits" element={<Suspense fallback={<PageLoader />}><CommercialCollectionLanding landing="anarkali-suits" /></Suspense>} />
                <Route path="/collections/palazzo-suits" element={<Suspense fallback={<PageLoader />}><CommercialCollectionLanding landing="palazzo-suits" /></Suspense>} />
                <Route path="/collections/sherwani-for-groom" element={<Suspense fallback={<PageLoader />}><CommercialCollectionLanding landing="sherwani-for-groom" /></Suspense>} />
                <Route path="/collections/pakistani-suits" element={<Navigate to="/suits" replace />} />
                <Route path="/collections/party-wear-lehengas" element={<Suspense fallback={<PageLoader />}><CommercialCollectionLanding landing="party-wear-lehengas" /></Suspense>} />
                <Route path="/collections/wedding-lehengas" element={<Navigate to="/lehengas" replace />} />
                <Route path="/collections/lehenga-choli" element={<Navigate to="/lehengas" replace />} />
                <Route path="/collections/earrings" element={<Navigate to="/jewelry" replace />} />
                <Route path="/collections/evening-gowns" element={<Navigate to="/collections" replace />} />
                <Route path="/collections/frontpage" element={<Navigate to="/" replace />} />
                <Route path="/collections/jacket-sets" element={<Navigate to="/suits" replace />} />
                <Route path="/collections/kurta-pajama-vest" element={<Navigate to="/menswear" replace />} />
                <Route path="/collections/manthrakodi-sarees" element={<Navigate to="/sarees" replace />} />
                <Route path="/collections/saree-gowns" element={<Navigate to="/sarees" replace />} />
                <Route path="/collections/navratri-garba-outfits-2026" element={<Navigate to="/collections/navratri-outfits" replace />} />
                <Route path="/collections/:handle" element={<Suspense fallback={<PageLoader />}><ShopifyCollection /></Suspense>} />
                <Route path="/collections/designer-sarees" element={<Suspense fallback={<PageLoader />}><CommercialCollectionLanding landing="designer-sarees" /></Suspense>} />
                <Route path="/blog/designer-wedding-dress-under-50000" element={<Suspense fallback={<PageLoader />}><NotFound /></Suspense>} />
                <Route path="/collections/indo-western" element={<Navigate to="/indowestern" replace />} />
                <Route path="/collections/bridesmaid-dresses" element={<Navigate to="/sarees" replace />} />
                <Route path="/collections/groomsman-outfits" element={<Navigate to="/menswear" replace />} />
                <Route path="/collections/customizable-indian-outfits" element={<Suspense fallback={<PageLoader />}><CustomizableOutfits /></Suspense>} />
                {/* Occasion landing pages */}
                <Route path="/collections/diwali-outfits" element={<Suspense fallback={<PageLoader />}><DiwaliOutfits /></Suspense>} />
                <Route path="/collections/wedding-guest-outfits" element={<Suspense fallback={<PageLoader />}><WeddingGuestOutfits /></Suspense>} />
                <Route path="/collections/mehendi-outfits" element={<Suspense fallback={<PageLoader />}><MehendiOutfits /></Suspense>} />
                <Route path="/collections/eid-outfits" element={<Suspense fallback={<PageLoader />}><EidOutfits /></Suspense>} />
                <Route path="/collections/navratri-outfits" element={<Suspense fallback={<PageLoader />}><NavratriOutfits /></Suspense>} />
                <Route path="/collections/haldi-outfits" element={<Suspense fallback={<PageLoader />}><HaldiOutfits /></Suspense>} />
                <Route path="/collections/navratri-chaniya-choli" element={<Suspense fallback={<PageLoader />}><InventoryBackedCollection landing="navratri-chaniya-choli" /></Suspense>} />
                <Route path="/collections/garba-outfits" element={<Suspense fallback={<PageLoader />}><InventoryBackedCollection landing="garba-outfits" /></Suspense>} />
                <Route path="/collections/groomsmen-outfits" element={<Suspense fallback={<PageLoader />}><InventoryBackedCollection landing="groomsmen-outfits" /></Suspense>} />
                <Route path="/collections/sangeet-outfits" element={<Suspense fallback={<PageLoader />}><InventoryBackedCollection landing="sangeet-outfits" /></Suspense>} />
                <Route path="/festive-wear" element={<Suspense fallback={<PageLoader />}><SemanticCommercePage /></Suspense>} />
                <Route path="/indian-wedding-guest-outfits" element={<Suspense fallback={<PageLoader />}><SemanticCommercePage /></Suspense>} />
                <Route path="/wedding-events" element={<Suspense fallback={<PageLoader />}><SemanticCommercePage /></Suspense>} />
                <Route path="/shop-by-fulfillment" element={<Suspense fallback={<PageLoader />}><SemanticCommercePage /></Suspense>} />
                <Route path="/shop-by-fulfillment/ready-to-ship" element={<Suspense fallback={<PageLoader />}><SemanticCommercePage /></Suspense>} />
                <Route path="/shop-by-fulfillment/made-to-order" element={<Suspense fallback={<PageLoader />}><SemanticCommercePage /></Suspense>} />
                <Route path="/shop-by-fulfillment/customizable-outfits" element={<Suspense fallback={<PageLoader />}><SemanticCommercePage /></Suspense>} />
                <Route path="/ready-to-ship" element={<Suspense fallback={<PageLoader />}><ReadyToShip /></Suspense>} />
                <Route path="/collections/ready-to-ship" element={<Navigate to="/ready-to-ship" replace />} />

                <Route path="/sitemap" element={<Suspense fallback={<PageLoader />}><Sitemap /></Suspense>} />
                <Route path="/style-consultation" element={<Navigate to="/contact" replace />} />
                <Route path="/wedding-party-orders" element={<Suspense fallback={<PageLoader />}><WeddingPartyOrders /></Suspense>} />
                <Route path="/style-quiz" element={<Suspense fallback={<PageLoader />}><StyleQuiz /></Suspense>} />
                {/* Public post-checkout return page; no unverified order or review-survey data */}
                <Route path="/order-confirmation" element={<Suspense fallback={<PageLoader />}><OrderConfirmation /></Suspense>} />
                {/* NRI Landing Pages for SEO */}
                <Route path="/nri" element={<Suspense fallback={<PageLoader />}><NRIGeneral /></Suspense>} />
                <Route path="/nri/usa" element={<Navigate to="/indian-ethnic-wear-usa" replace />} />
                <Route path="/nri/canada" element={<Navigate to="/nri" replace />} />
                <Route path="/indian-ethnic-wear-usa" element={<Suspense fallback={<PageLoader />}><USA /></Suspense>} />
                <Route path="/indian-ethnic-wear-canada" element={<Navigate to="/nri" replace />} />
                {/* Legacy regional pages redirect to /nri (no longer targeted) */}
                <Route path="/nri/uk" element={<Navigate to="/nri" replace />} />
                <Route path="/indian-ethnic-wear-uk" element={<Navigate to="/nri" replace />} />
                <Route path="/uk-indian-clothing" element={<Navigate to="/nri" replace />} />
                <Route path="/uk-designer-sarees" element={<Navigate to="/nri" replace />} />
                <Route path="/admin" element={<Suspense fallback={<PageLoader />}><AdminDashboard /></Suspense>} />
                {/* Blog */}
                <Route path="/blog" element={<Suspense fallback={<PageLoader />}><Blog /></Suspense>} />
                {/* Utsavpedia-style blog category hub routes — MUST come before /blog/:slug to avoid route collision */}
                <Route path="/blog/attires" element={<Navigate to="/blog/indian-wedding-guest-attire" replace />} />
                <Route path="/blog/motifs-embroideries" element={<Navigate to="/blog/indian-textiles-and-embroidery" replace />} />
                <Route path="/blog/how-to-care" element={<Navigate to="/blog/fit-sizing-and-garment-care" replace />} />
                <Route path="/blog/indian-wedding-guest-attire" element={<Suspense fallback={<PageLoader />}><BlogCategory /></Suspense>} />
                <Route path="/blog/indian-textiles-and-embroidery" element={<Suspense fallback={<PageLoader />}><BlogCategory /></Suspense>} />
                <Route path="/blog/weddings-festivals" element={<Suspense fallback={<PageLoader />}><BlogCategory /></Suspense>} />
                <Route path="/blog/fit-sizing-and-garment-care" element={<Suspense fallback={<PageLoader />}><BlogCategory /></Suspense>} />
                <Route path="/blog/designer-profiles" element={<Suspense fallback={<PageLoader />}><BlogCategory /></Suspense>} />
                <Route path="/blog/cultural-context" element={<Suspense fallback={<PageLoader />}><BlogCategory /></Suspense>} />
                {/* Verified retired designer-profile URL: redirect to the live designer category. */}
                <Route path="/blog/jj-valaya-royal-couture-house-of-valaya" element={<Suspense fallback={<PageLoader />}><NotFound /></Suspense>} />
                <Route path="/blog/:slug" element={<Suspense fallback={<PageLoader />}><BlogPost /></Suspense>} />
                {/* Public author information is organizational and verifiable. */}
                <Route path="/authors/:slug" element={<Suspense fallback={<PageLoader />}><AuthorBio /></Suspense>} />
                <Route path="/new-arrivals" element={<Suspense fallback={<PageLoader />}><NewArrivals /></Suspense>} />
                <Route path="/bestsellers" element={<Navigate to="/new-arrivals" replace />} />
                <Route path="/indowestern" element={<Suspense fallback={<PageLoader />}><Indowestern /></Suspense>} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<Suspense fallback={<PageLoader />}><NotFound /></Suspense>} />
              </Routes>
              <MobileBottomNav />
              <WhatsAppButton />
              <NewVisitorPopup />
            </PageTracker>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
