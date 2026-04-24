import { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/stores/cartStore';
import { toast } from 'sonner';
import { getOptimizedImage } from '@/lib/imageUtils';
import { fetchProducts, type ShopifyProduct } from '@/lib/shopify';
import { jewelryProducts } from '@/data/jewelryProducts';

interface CompleteTheLookProps {
  currentProductId: string;
  productType?: string;
}

// Determine if the current product is jewellery
const isJewelleryProduct = (productType: string): boolean => {
  const type = productType.toLowerCase();
  return type.includes('jewel') || type.includes('necklace') || type.includes('earring') || type.includes('bangle') || type.includes('maang tikka') || type.includes('bridal set');
};

// Convert a jewelry product to ShopifyProduct format for display
const convertJewelryToShopify = (product: typeof jewelryProducts[0]): ShopifyProduct => ({
  node: {
    id: product.id,
    title: product.name,
    description: product.description,
    handle: product.id,
    productType: `Jewellery - ${product.category}`,
    tags: ['jewellery', product.category.toLowerCase()],
    priceRange: {
      minVariantPrice: {
        amount: product.price.toString(),
        currencyCode: 'USD',
      },
    },
    images: {
      edges: [
        {
          node: {
            url: product.image,
            altText: product.name,
          },
        },
      ],
    },
    variants: {
      edges: [
        {
          node: {
            id: `${product.id}-default`,
            title: 'Default',
            price: {
              amount: product.price.toString(),
              currencyCode: 'USD',
            },
            availableForSale: true,
            selectedOptions: [],
          },
        },
      ],
    },
    options: [],
  },
});

export const CompleteTheLook = ({ currentProductId, productType }: CompleteTheLookProps) => {
  const addItem = useCartStore((state) => state.addItem);
  const [shopifyRecs, setShopifyRecs] = useState<ShopifyProduct[]>([]);

  const isJewellery = productType ? isJewelleryProduct(productType) : false;

  // Fetch complementary products from Shopify
  useEffect(() => {
    const fetchRecs = async () => {
      try {
        if (isJewellery) {
          // Current product is jewellery — show outfits (lehengas, sarees)
          const products = await fetchProducts(12, 'tag:lehenga OR tag:saree');
          const filtered = products.filter(
            (p) => p.node.id !== currentProductId
          );
          setShopifyRecs(filtered);
        } else {
          // Current product is an outfit — show jewellery/accessories
          const products = await fetchProducts(12, 'tag:jewellery OR tag:jewelry');
          const filtered = products.filter(
            (p) => p.node.id !== currentProductId
          );
          setShopifyRecs(filtered);
        }
      } catch {
        // Silently fall back to local jewellery products
      }
    };

    fetchRecs();
  }, [currentProductId, isJewellery]);

  // Use Shopify products if available, otherwise fall back to local jewellery
  const recommendations = useMemo(() => {
    let pool: ShopifyProduct[] = shopifyRecs;

    if (pool.length === 0 && !isJewellery) {
      // Fallback: show local jewellery products as accessories
      pool = jewelryProducts.map(convertJewelryToShopify);
    }

    // Shuffle and take first 4
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 4);
  }, [shopifyRecs, isJewellery]);

  const handleQuickAdd = (product: ShopifyProduct, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const firstVariant = product.node.variants.edges[0]?.node;
    if (!firstVariant) return;

    addItem({
      product,
      variantId: firstVariant.id,
      variantTitle: firstVariant.title,
      price: firstVariant.price,
      quantity: 1,
      selectedOptions: firstVariant.selectedOptions,
    });

    toast.success('Added to bag', {
      description: `${product.node.title} has been added.`,
    });
  };

  const formatPrice = (amount: string, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(parseFloat(amount));
  };

  if (recommendations.length === 0) {
    return null;
  }

  const sectionTitle = isJewellery ? 'Pairs Well With' : 'Complete the Look';
  const sectionSubtitle = isJewellery
    ? 'Outfits that pair beautifully with this piece'
    : 'Accessories to complement your outfit';

  return (
    <section className="py-16 border-t border-border">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl lg:text-3xl font-serif mb-2">{sectionTitle}</h2>
          <p className="text-muted-foreground">{sectionSubtitle}</p>
        </div>
        <Button variant="ghost" asChild className="hidden md:flex items-center gap-2 luxury-link">
          <Link to={isJewellery ? '/collections' : '/jewelry'}>
            View All
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {recommendations.map((product, index) => (
          <motion.div
            key={product.node.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="group"
          >
            <Link to={`/product/${product.node.handle}`}>
              <div className="relative aspect-[3/4] mb-4 overflow-hidden rounded-sm bg-card">
                {product.node.images.edges[0] ? (
                  <img
                    src={getOptimizedImage(product.node.images.edges[0].node.url, 'card')}
                    alt={product.node.images.edges[0].node.altText || product.node.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                    <span className="text-muted-foreground">No image</span>
                  </div>
                )}

                {/* Quick Add Button */}
                <button
                  onClick={(e) => handleQuickAdd(product, e)}
                  className="absolute bottom-4 right-4 p-3 bg-background/90 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-background hover:scale-110"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </Link>

            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {product.node.productType || 'Collection'}
              </p>
              <h3 className="font-medium text-sm line-clamp-1">{product.node.title}</h3>
              <p className="text-sm text-muted-foreground">
                {formatPrice(
                  product.node.priceRange.minVariantPrice.amount,
                  product.node.priceRange.minVariantPrice.currencyCode
                )}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
