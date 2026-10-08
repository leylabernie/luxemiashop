import { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/seo/SEOHead';
import ProductCard from '@/components/ui/ProductCard';
import { Button } from '@/components/ui/button';
import { useShopifyProducts } from '@/hooks/useShopifyProducts';
import { sortProducts } from '@/lib/productFilters';

export default function CatalogCategory({ category }: { category: 'blouses' | 'couple-outfits' }) {
  const { products, isLoading } = useShopifyProducts(category);
  const [visibleCount, setVisibleCount] = useState(24);
  const ordered = useMemo(() => sortProducts(products, 'newest'), [products]);
  useEffect(() => setVisibleCount(24), [category]);
  const name = category === 'blouses' ? 'Blouses' : 'Couple Sets';
  return <div className="min-h-screen bg-background">
    <SEOHead title={`${name} | LuxeMia`} description={`Browse current ${name.toLowerCase()} at LuxeMia.`}
      canonical={`https://luxemia.shop/collections/${category}`} noIndexFollow />
    <Header />
    <main className="container mx-auto px-4 pt-[132px] pb-16 lg:px-8">
      <Link to="/collections" className="text-sm text-muted-foreground">All Collections</Link>
      <h1 className="mt-6 mb-4 font-serif text-4xl">{name}</h1>
      {isLoading ? <p>Loading styles…</p> : <>
        <p className="mb-6 text-muted-foreground">{ordered.length} styles</p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {ordered.slice(0, visibleCount).map((product, index) =>
            <ProductCard key={product.node.id} product={product} index={index % 24} />)}
        </div>
        {visibleCount < ordered.length && <div className="mt-8 text-center">
          <Button variant="outline" onClick={() => setVisibleCount(count => count + 24)}>Load More</Button>
        </div>}
      </>}
    </main>
    <Footer />
  </div>;
}
