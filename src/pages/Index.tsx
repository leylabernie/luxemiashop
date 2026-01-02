import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/home/HeroSection';
import CategoryShowcase from '@/components/home/CategoryShowcase';
import { NewArrivals } from '@/components/home/NewArrivals';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import LookbookTeaser from '@/components/home/LookbookTeaser';
import BrandValues from '@/components/home/BrandValues';
import NewVisitorPopup from '@/components/home/NewVisitorPopup';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-[104px] lg:pt-[120px]">
        <HeroSection />
        <CategoryShowcase />
        <NewArrivals />
        <FeaturedProducts />
        <LookbookTeaser />
        <BrandValues />
      </main>
      
      <Footer />
      <NewVisitorPopup />
    </div>
  );
};

export default Index;
