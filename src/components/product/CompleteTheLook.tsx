import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/stores/cartStore';
import { toast } from 'sonner';
import { getOptimizedImage } from '@/lib/imageUtils';
import { fetchProducts, type ShopifyProduct } from '@/lib/shopify';
import { formatCurrencyAmount } from '@/lib/formatCurrency';

interface CompleteTheLookProps {
  currentProductId: string;
  productType?: string;
}

const JEWELRY_TERMS = [
  'jewel',
  'necklace',
  'choker',
  'earring',
  'bangle',
  'bracelet',
  'ring',
  'maang tikka',
  'bridal set',
];

const OUTFIT_TERMS = [
  'lehenga',
  'saree',
  'sari',
  'suit',
  'salwar',
  'anarkali',
  'sharara',
  'gharara',
  'kurta',
  'sherwani',
  'indo-western',
  'gown',
  'dress',
  'blouse',
];

const includesAny = (value: string, terms: string[]) =>
  terms.some((term) => value.includes(term));

const searchableProductText = (product: ShopifyProduct) => [
  product.node.productType || '',
  product.node.title || '',
  ...(product.node.tags || []),
]
  .join(' ')
  .toLowerCase();

const isJewelryProduct = (product: ShopifyProduct): boolean =>
  includesAny(searchableProductText(product), JEWELRY_TERMS);

const isOutfitProduct = (product: ShopifyProduct): boolean => {
  const text = searchableProductText(product);
  return !includesAny(text, JEWELRY_TERMS) && includesAny(text, OUTFIT_TERMS);
};

const isPurchasable = (product: ShopifyProduct): boolean => {
  const variants = product.node.variants?.edges || [];
  return product.node.availableForSale === true
    && variants.some((variant) => variant.node.availableForSale === true);
};

const availableVariants = (product: ShopifyProduct) =>
  (product.node.variants?.edges || [])
    .map((edge) => edge.node)
    .filter((variant) => variant.availableForSale === true);

export const CompleteTheLook = ({ currentProductId, productType }: CompleteTheLookProps) => {
  const addItem = useCartStore((state) => state.addItem);
  const [liveProducts, setLiveProducts] = useState<ShopifyProduct[]>([]);

  const currentIsJewelry = includesAny((productType || '').toLowerCase(), JEWELRY_TERMS);

  useEffect(() => {
    let active = true;

    const fetchComplementaryProducts = async () => {
      try {
        // Fetch a sufficiently broad live Shopify pool, then apply deterministic
        // product-type filtering client-side. This avoids relying on inconsistent
        // legacy tags and guarantees every recommendation has a real product URL,
        // real variant ID, current price, and current publication state.
        const products = await fetchProducts(80);
        if (!active) return;

        const complementary = products.filter((product) => {
          if (product.node.id === currentProductId || !isPurchasable(product)) return false;
          return currentIsJewelry ? isOutfitProduct(product) : isJewelryProduct(product);
        });

        setLiveProducts(complementary);
      } catch (error) {
        if (!active) return;
        console.error('Unable to load optional related products:', error);
        setLiveProducts([]);
      }
    };

    void fetchComplementaryProducts();

    return () => {
      active = false;
    };
  }, [currentProductId, currentIsJewelry]);

  const recommendations = useMemo(
    // Storefront results are already newest-first. Keep the order stable so the
    // same product page does not show a different, unreviewed combination after
    // every render.
    () => liveProducts.slice(0, 4),
    [liveProducts],
  );

  const handleQuickAdd = (product: ShopifyProduct, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    const variants = availableVariants(product);
    // Never guess a customer's size, color, or finish. Quick add is available
    // only when exactly one purchasable variant exists; otherwise the card sends
    // the shopper to the product page to make an explicit selection.
    if (variants.length !== 1) return;

    const variant = variants[0];
    addItem({
      product,
      variantId: variant.id,
      variantTitle: variant.title,
      price: variant.price,
      quantity: 1,
      selectedOptions: variant.selectedOptions,
    });

    toast.success('Added to bag', {
      description: `${product.node.title} has been added.`,
    });
  };

  if (recommendations.length === 0) return null;

  const sectionTitle = 'Current Related Catalog';
  const sectionSubtitle = currentIsJewelry
    ? 'Current outfit records from Shopify; no compatibility or styling match is implied'
    : 'Current jewelry and accessory records from Shopify; no compatibility or styling match is implied';

  return (
    <section className="py-16 border-t border-border" aria-labelledby="complete-the-look-heading">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 id="complete-the-look-heading" className="text-2xl lg:text-3xl font-serif mb-2">
            {sectionTitle}
          </h2>
          <p className="text-muted-foreground">{sectionSubtitle}</p>
        </div>
        <Button variant="ghost" asChild className="hidden md:flex items-center gap-2 luxury-link">
          <Link to={currentIsJewelry ? '/collections' : '/jewelry'}>
            View All
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {recommendations.map((product, index) => {
          const variants = availableVariants(product);
          const canQuickAdd = variants.length === 1;
          const image = product.node.images.edges[0]?.node;

          return (
            <motion.div
              key={product.node.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <Link to={`/product/${product.node.handle}`}>
                <div className="relative aspect-[3/4] mb-4 overflow-hidden rounded-sm bg-card">
                  {image ? (
                    <img
                      src={getOptimizedImage(image.url, 'card')}
                      alt={image.altText || product.node.title}
                      width={300}
                      height={400}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted">
                      <span className="text-muted-foreground">No image</span>
                    </div>
                  )}

                  {canQuickAdd && (
                    <button
                      type="button"
                      aria-label={`Add ${product.node.title} to bag`}
                      onClick={(event) => handleQuickAdd(product, event)}
                      className="absolute bottom-4 right-4 p-3 bg-background/90 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-all duration-300 hover:bg-background hover:scale-110"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </Link>

              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  {product.node.productType || 'Collection'}
                </p>
                <h3 className="font-medium text-sm line-clamp-2">{product.node.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {formatCurrencyAmount(
                    product.node.priceRange.minVariantPrice.amount,
                    product.node.priceRange.minVariantPrice.currencyCode,
                  )}
                </p>
                {!canQuickAdd && (
                  <p className="text-xs text-muted-foreground">Select options on product page</p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};
