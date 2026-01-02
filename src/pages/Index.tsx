import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/home/HeroSection';
import CategoryShowcase from '@/components/home/CategoryShowcase';
import { NewArrivals } from '@/components/home/NewArrivals';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import LookbookTeaser from '@/components/home/LookbookTeaser';
import BrandValues from '@/components/home/BrandValues';
import NewVisitorPopup from '@/components/home/NewVisitorPopup';
import SEOHead from '@/components/seo/SEOHead';
import ServiceHighlights from '@/components/home/ServiceHighlights';
import QuickLinks from '@/components/home/QuickLinks';
import CustomerStories from '@/components/home/CustomerStories';
import TrendingNow from '@/components/home/TrendingNow';
import SEOFooterContent from '@/components/seo/SEOFooterContent';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="LuxeMia | Luxury Indian Ethnic Wear - Sarees, Lehengas & Bridal Couture"
        description="Discover exquisite handcrafted Indian ethnic wear at LuxeMia. Shop designer sarees, bridal lehengas, anarkali suits, and wedding collections. Worldwide shipping. Premium quality assured."
      />
      <Header />
      
      <main className="pt-[104px] lg:pt-[120px]">
        <HeroSection />
        <ServiceHighlights />
        <QuickLinks />
        <CategoryShowcase />
        <NewArrivals />
        <TrendingNow />
        <FeaturedProducts />
        <CustomerStories />
        <LookbookTeaser />
        <BrandValues />
        <SEOFooterContent />
      </main>
      
      <Footer />
      <NewVisitorPopup />
    </div>
  );
};

export default Index;
