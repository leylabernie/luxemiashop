import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/seo/SEOHead';
import { ProductGallery } from '@/components/product/ProductGallery';
import { ProductInfo } from '@/components/product/ProductInfo';
import { ProductTabs } from '@/components/product/ProductTabs';
import { CompleteTheLook } from '@/components/product/CompleteTheLook';
import { RecentlyViewed } from '@/components/product/RecentlyViewed';
import { useShopifyProduct } from '@/hooks/useShopifyProduct';
import { Skeleton } from '@/components/ui/skeleton';
import { enrichProductDescription, generateMetaDescription, sanitizeProductTitle } from '@/lib/productDescriptionEnrichment';
import { RETURN_POLICY_FAQ_ANSWER } from '@/lib/returnPolicyCopy';
import { Button } from '@/components/ui/button';
import { useRecentlyViewedStore } from '@/stores/recentlyViewedStore';
import { trackViewItem } from '@/hooks/useAnalytics';
import StickyAddToBag from '@/components/product/StickyAddToBag';
import {
  applyCustomizableProductDetails,
  getCustomizableProduct,
} from '@/lib/customizableProducts';
import { generateProductGroupSchema, getGoogleProductCategory, normalizeBrandName } from '@/lib/schema';
import { isProductSizeOptionName } from '@/lib/productOptionNames';

// Determine if a product type supports stitching options
const STITCHABLE_PRODUCT_TYPES = [
  'salwar kameez', 'salwar kameez suit', 'lehenga', 'lehenga choli', 'saree', 'sarees',
  'anarkali', 'sharara suit', 'pakistani suit', 'palazzo suit', 'gharara suit',
  'wedding suit',
];

const isStitchableProductType = (productType?: string): boolean => {
  if (!productType) return false;
  const lower = productType.toLowerCase();
  return STITCHABLE_PRODUCT_TYPES.some(t => lower.includes(t));
};

const JEWELRY_PRODUCT_TYPES = [
  'jewel', 'necklace', 'choker', 'earring', 'bangle', 'bracelet',
  'ring', 'maang tikka', 'anklet',
];

const isJewelryProductType = (productType?: string): boolean => {
  if (!productType) return false;
  const lower = productType.toLowerCase();
  return JEWELRY_PRODUCT_TYPES.some((type) => lower.includes(type));
};

const sanitizeSeoTitle = (value?: string | null): string => (value || '')
  .replace(/\s*\|\s*Handcrafted Indian Bridal Luxury/gi, '')
  .replace(/\s+/g, ' ')
  .trim();

const ProductDetail = () => {
  const { handle } = useParams<{ handle: string }>();
  const { product: shopifyProduct, isLoading: shopifyLoading, error: shopifyError } = useShopifyProduct(handle);
  const [selectedVariantImageUrl, setSelectedVariantImageUrl] = useState<string | null>(null);
  const addToRecentlyViewed = useRecentlyViewedStore((state) => state.addProduct);

  // CRITICAL FIX (June 2026): Removed the localProducts.ts fallback.
  //
  // Previously, if the Shopify Storefront API returned null for a handle (due
  // to rate limiting, network blip, or token expiry), the code fell back to
  // hardcoded product data from src/data/localProducts.ts — which contains
  // titles scraped from wholesalesalwar.com MONTHS ago. This is why product
  // titles appeared "stale" after CSV imports: Shopify HAD the new title, but
  // the React app was showing the old hardcoded title from localProducts.
  //
  // Now: ALWAYS use the live Shopify data. If Shopify returns null OR is
  // loading, show a loading skeleton or "Product not found" — never stale
  // hardcoded data. This eliminates the stale-title bug entirely, with no
  // Vercel setup or webhook configuration required.
  const product = useMemo(
    () => shopifyProduct
      ? applyCustomizableProductDetails({
          ...shopifyProduct,
          title: sanitizeProductTitle(shopifyProduct.title),
        })
      : shopifyProduct,
    [shopifyProduct],
  );
  const customizableProduct = getCustomizableProduct(product?.handle);
  const stylistConversationHref = product
    ? `https://wa.me/12153419990?text=${encodeURIComponent(
        `Hi LuxeMia, I would like help before ordering this product: ${product.title}\n${`https://luxemia.shop/product/${product.handle}`}\n\nMy preferred color: __\nMy ready-made size: __\nMy event date: __\n\nPlease help me confirm the listed options and delivery suitability.`,
      )}`
    : 'https://wa.me/12153419990?text=Hi%20LuxeMia%2C%20I%20need%20help%20with%20a%20product%20before%20ordering.';
  const isLoading = shopifyLoading;
  const error = shopifyError || (!shopifyLoading && !shopifyProduct ? 'Product not found' : null);

  // Track recently viewed and analytics
  useEffect(() => {
    if (product) {
      addToRecentlyViewed({
        id: product.id,
        handle: product.handle,
        title: product.title,
        price: product.priceRange.minVariantPrice.amount,
        currency: product.priceRange.minVariantPrice.currencyCode,
        imageUrl: product.images.edges[0]?.node.url || '',
      });
      
      // Track the actual default purchasable variant. The parent product ID is
      // retained separately for product-group reporting across color/size options.
      const defaultVariant = product.variants.edges.find((edge) => edge.node.availableForSale)
        || product.variants.edges[0];
      trackViewItem({
        id: defaultVariant?.node.id || product.id,
        name: product.title,
        price: parseFloat(defaultVariant?.node.price.amount || product.priceRange.minVariantPrice.amount),
        currency: defaultVariant?.node.price.currencyCode || product.priceRange.minVariantPrice.currencyCode,
        category: product.productType,
        variant: defaultVariant?.node.title !== 'Default Title' ? defaultVariant?.node.title : undefined,
        productGroupId: product.id,
        occasion: product.metadata?.occasion?.join(', ') || undefined,
      });
    }
  }, [product, addToRecentlyViewed]);

  // Get category URL from product type
  const getCategoryUrl = (productType?: string) => {
    if (!productType) return '/collections';
    const type = productType.toLowerCase();
    if (type.includes('lehenga')) return '/lehengas';
    if (type.includes('saree')) return '/sarees';
    if (type.includes('suit') || type.includes('salwar') || type.includes('anarkali')) return '/suits';
    if (type.includes('sherwani') || type.includes('kurta') || type.includes('menswear')) return '/menswear';
    if (isJewelryProductType(productType)) return '/jewelry';
    return '/collections';
  };

  const categoryUrl = customizableProduct
    ? '/collections/customizable-indian-outfits'
    : getCategoryUrl(product?.productType);
  const categoryName = customizableProduct
    ? 'Customizable Indian Outfits'
    : product?.productType || 'Collections';
  const productIsAvailable = product
    ? product.availableForSale === true || product.variants.edges.some((variant) => variant.node.availableForSale)
    : false;
  const schemaVariant = product?.variants.edges.find((variant) => variant.node.availableForSale)?.node
    || product?.variants.edges[0]?.node;

  // Enrich thin descriptions only with attributes supported by the listing.
  // Some legacy jewelry records contain garment option values (for example,
  // cotton or apparel colors), so omit an attribute unless the product's own
  // title or description also contains it.
  const isJewelryProduct = isJewelryProductType(product?.productType);
  const productText = `${product?.title || ''} ${product?.description || ''}`.toLowerCase();
  const rawProductColor = product?.options?.find((option) => option.name.toLowerCase() === 'color')?.values?.[0];
  const rawProductMaterial = product?.options?.find((option) =>
    ['fabric', 'material'].includes(option.name.toLowerCase()),
  )?.values?.[0];
  const productMetadata = product?.metadata;
  const productColor = productMetadata?.color || (rawProductColor && (!isJewelryProduct || productText.includes(rawProductColor.toLowerCase()))
    ? rawProductColor
    : undefined);
  const productMaterial = productMetadata?.material || productMetadata?.fabric || (rawProductMaterial && (!isJewelryProduct || productText.includes(rawProductMaterial.toLowerCase()))
    ? rawProductMaterial
    : undefined);
  const productOccasions = productMetadata?.occasion || [];
  const productBlouseFabric = productMetadata?.blouseFabric || undefined;
  const productComponents = productMetadata?.includedComponents || [];
  const productCare = productMetadata?.careInstructions || undefined;
  const productShopifyCategory = productMetadata?.shopifyCategory || undefined;
  const productGoogleCategory = productMetadata?.googleProductCategory || getGoogleProductCategory(product?.productType, product?.title);
  const productSchemaCategory = productShopifyCategory === 'Saris'
    ? 'Apparel & Accessories > Clothing > Traditional & Ceremonial Clothing > Saris & Lehengas > Saris'
    : product?.productType || 'Ethnic Wear';
  const productAdditionalProperties = [
    ['Fabric', productMaterial],
    ['Blouse Fabric', productBlouseFabric],
    ['Color', productColor],
    ['Occasion', productOccasions.join(', ') || undefined],
    ['Included Components', productComponents.join(', ') || undefined],
    ['Care Instructions', productCare],
    ['Product Style', productMetadata?.productStyle || undefined],
    ['Shopify Category', productShopifyCategory],
    ['Google Product Category', productGoogleCategory],
    ['Gender', productMetadata?.gender || (isJewelryProduct ? undefined : 'Female')],
    ['Condition', productMetadata?.condition || 'New'],
    ['Market', 'United States'],
  ].filter((entry): entry is [string, string] => Boolean(entry[1]));

  // Prefer Shopify admin "Search engine listing" (SEO) fields when present.
  // Falls back to the existing title template + generated meta description.
  // Note: `product.seo` is typed via ShopifyProduct['node'] in src/lib/shopify.ts.
  const seoTitle = sanitizeProductTitle(sanitizeSeoTitle(product?.seo?.title));
  // Historic Shopify SEO descriptions contain obsolete fulfillment and policy
  // copy. The field-backed generator below is the crawler and shopper source.
  const seoDescription = '';

  const enrichedDescription = useMemo(() => {
    if (!product) return '';
    return enrichProductDescription(
      product.description || '',
      product.productType || '',
      product.title,
      productMaterial,
      productColor,
    );
  }, [product, productMaterial, productColor]);

  const seoMetaDescription = useMemo(() => {
    if (!product) return '';
    return generateMetaDescription(
      product.description || '',
      product.productType || '',
      product.title,
      product?.priceRange?.minVariantPrice?.amount,
      productColor,
      productMaterial,
    );
  }, [product, productColor, productMaterial]);

  // Product-specific FAQs are also rendered visibly below, so the structured
  // data and on-page content remain consistent.
  const productSizeValues = product?.options
    ?.find((option) => isProductSizeOptionName(option.name))
    ?.values?.filter((value: string) => value && value.toLowerCase() !== 'default title') || [];
  const sizeAnswer = customizableProduct
    ? 'This design is made to order from measurements confirmed with LuxeMia. Contact LuxeMia before ordering if you need help taking or submitting them.'
    : productSizeValues.length > 0
    ? `Available choices shown for this listing are ${productSizeValues.join(', ')}. Select a size on the product page and review the Size Guide before ordering.`
    : 'Any available size or variant choices are shown on this product page. Contact LuxeMia before ordering if a listed option is unclear.';

  const productFaqs = product ? [
    ...(isJewelryProduct ? [{
      question: `What is included with the ${product.title}?`,
      answer: 'The included pieces, finish, colors, and measurements are the ones stated in Product Details and shown in the product images. Contact LuxeMia before ordering if the set contents are unclear.'
    }] : [{
      question: `What sizes are available for the ${product.title}?`,
      answer: sizeAnswer
    }]),
    ...(productComponents.length > 0 ? [{
      question: `What is included with the ${product.title}?`,
      answer: `This listing includes ${productComponents.join(', ')}. Review the images and Product Details before ordering.`,
    }] : []),
    ...(productOccasions.length > 0 ? [{
      question: `When can I wear the ${product.title}?`,
      answer: `This saree is listed for ${productOccasions.join(' and ')}.`,
    }] : []),
    {
      question: `Does LuxeMia ship the ${product.title} within the United States?`,
      answer: 'Yes. LuxeMia currently ships to United States addresses only. Standard shipping is $12 below $135 and free at $135 and above. Tracking details are emailed when the shipping label is created for dispatch.',
    },
    {
      question: `What is the delivery time for the ${product.title}?`,
      answer: customizableProduct
        ? 'The source listing carries an approximate 4–5 week total order window. LuxeMia confirms production time and carrier transit separately after the requested color, measurements, fabric availability, and delivery address are known. Contact LuxeMia before ordering for a fixed event date.'
        : 'Delivery timing depends on the item and selected options. Tracking details are emailed when the shipping label is created for dispatch. LuxeMia currently ships to United States addresses only.'
    },
    ...(customizableProduct ? [{
      question: `Can I request another color for the ${product.title}?`,
      answer: 'Yes. A custom color is available for this verified design. Contact LuxeMia with the product link and requested color so fabric availability can be confirmed before ordering. Other design changes are not promised unless LuxeMia confirms them in writing.',
    }] : []),
    {
      question: `Can I return the ${product.title}?`,
      answer: RETURN_POLICY_FAQ_ANSWER
    },
    {
      question: `How should I care for my ${categoryName.toLowerCase()}?`,
      answer: isJewelryProduct
        ? 'Keep jewelry away from water, perfume, lotion, and household chemicals. Wipe it gently after wear and store pieces separately in a soft pouch.'
        : productCare || 'Follow any product-specific care instructions in Product Details. Dry cleaning is recommended for embroidered or embellished ethnic wear; avoid ironing directly over decoration.'
    }
  ] : [];

  const productGroupSchema = useMemo(() => {
    if (!product || product.variants.edges.length < 2) return undefined;

    const canonicalUrl = `https://luxemia.shop/product/${product.handle}`;
    const schemaImages = product.images.edges
      .map((edge) => edge.node.url)
      .filter(Boolean);
    const material = productMaterial
      || (/\breal\s+chinon\b/i.test(`${product.title} ${product.description}`) ? 'Real Chinon' : undefined);
    const groupId = product.handle.length <= 50
      ? product.handle
      : `p${product.id.split('/').pop() || product.handle}`;
    const description = enrichedDescription || product.description || product.title;
    const variants = product.variants.edges.map(({ node: variant }) => {
      const color = variant.selectedOptions.find((option) => ['color', 'colour'].includes(option.name.toLowerCase()))?.value;
      const size = variant.selectedOptions.find((option) => isProductSizeOptionName(option.name))?.value;
      const variantId = variant.id.split('/').pop() || '';
      const optionLabel = variant.selectedOptions
        .filter((option) => option.name.toLowerCase() !== 'title' && option.value.toLowerCase() !== 'default title')
        .map((option) => option.value)
        .join(' / ');
      const variantUrl = variantId ? `${canonicalUrl}?variant=${encodeURIComponent(variantId)}` : canonicalUrl;

      return {
        id: variantId,
        name: optionLabel ? `${product.title} — ${optionLabel}` : product.title,
        description,
        url: variantUrl,
        image: variant.image?.url ? [variant.image.url] : schemaImages,
        sku: variant.sku,
        gtin: variant.barcode,
        mpn: normalizeBrandName(product.vendor) === 'LuxeMia' && variant.sku && !variant.barcode
          ? variant.sku
          : undefined,
        color,
        size,
        price: variant.price.amount,
        currency: variant.price.currencyCode,
        availability: variant.availableForSale ? 'InStock' as const : 'OutOfStock' as const,
      };
    });

    return generateProductGroupSchema({
      name: product.title,
      description,
      url: canonicalUrl,
      image: schemaImages,
      brand: normalizeBrandName(product.vendor),
      category: productSchemaCategory,
      googleProductCategory: productGoogleCategory,
      material,
      additionalProperties: productAdditionalProperties,
      productGroupId: groupId,
      variesBy: [
        ...(variants.some((variant) => variant.color) ? ['https://schema.org/color'] : []),
        ...(variants.some((variant) => variant.size) ? ['https://schema.org/size'] : []),
      ],
      variants,
    });
  }, [enrichedDescription, product, productMaterial]);

  return (
    <div className="min-h-screen bg-background">
      {product ? (
        <SEOHead
          title={seoTitle || `${product.title} | ${categoryName} | LuxeMia`}
          description={seoDescription || seoMetaDescription || (() => {
            return generateMetaDescription(
              '',
              product.productType || '',
              product.title,
              product?.priceRange?.minVariantPrice?.amount,
              productColor,
              productMaterial,
            );
          })()}
          canonical={`https://luxemia.shop/product/${product.handle}`}
          type="product"
          image={product.images.edges[0]?.node.url}
          product={{
            name: product.title,
            price: product.priceRange.minVariantPrice.amount,
            currency: product.priceRange.minVariantPrice.currencyCode,
            image: product.images.edges[0]?.node.url || '',
            description: enrichedDescription || product.description || '',
            availability: productIsAvailable ? 'InStock' : 'OutOfStock',
            sku: schemaVariant?.sku || '',
            gtin: schemaVariant?.barcode || undefined,
            mpn: normalizeBrandName(product.vendor) === 'LuxeMia' && schemaVariant?.sku && !schemaVariant?.barcode
              ? schemaVariant.sku
              : undefined,
            originalPrice: product.compareAtPriceRange?.maxVariantPrice?.amount,
            category: productSchemaCategory,
            brand: normalizeBrandName(product.vendor),
            color: productColor,
            material: productMaterial,
            sizes: isJewelryProduct ? [] : productSizeValues,
            additionalProperties: productAdditionalProperties,
            googleProductCategory: productGoogleCategory,
          }}
          structuredProduct={productGroupSchema}
          breadcrumbs={[
            { name: 'Home', url: '/' },
            { name: categoryName, url: categoryUrl },
            { name: product.title, url: `/product/${product.handle}` },
          ]}
          faqs={productFaqs}
        />
      ) : !isLoading ? (
        <SEOHead
          title="Product Not Found | LuxeMia"
          description="This product could not be found."
          noIndex={true}
        />
      ) : null}

      <Header />
      
      <main id="main-content" className="pt-[90px] lg:pt-[132px] pb-16">
        <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <Link to={categoryUrl} className="hover:text-foreground transition-colors">{categoryName}</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">{product?.title || 'Product'}</span>
          </nav>

          {isLoading ? (
            <ProductSkeleton />
          ) : error || !product ? (
            <div className="text-center py-20">
              <h2 className="text-2xl font-serif mb-4">Product Not Found</h2>
              <p className="text-muted-foreground mb-6">
                This product may have been removed or the link is incorrect.
              </p>
              <Button asChild>
                <Link to="/lehengas">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Browse Lehengas
                </Link>
              </Button>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {/* Product Grid */}
              <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 mb-16">
                {/* Gallery */}
                <ProductGallery 
                  images={product.images.edges}
                  videos={product.media?.edges}
                  productTitle={sanitizeProductTitle(product.title)}
                  selectedImageUrl={selectedVariantImageUrl}
                />
                
                {/* Product Info */}
                <ProductInfo
                  key={product.id}
                  product={{
                    ...product,
                    title: sanitizeProductTitle(product.title),
                    description: enrichedDescription || product.description,
                  }}
                  onSelectedVariantChange={(variant) => setSelectedVariantImageUrl(variant?.image?.url ?? null)}
                />
              </div>

              {/* Product Tabs */}
              <div className="mb-16">
                <ProductTabs 
                  description={enrichedDescription || product.description}
                  productType={product.productType}
                  isStitchable={isStitchableProductType(product.productType)}
                  tags={product.tags ?? undefined}
                />
              </div>

              {/* Visible FAQs — kept in sync with FAQ structured data above. */}
              {productFaqs.length > 0 && (
                <section className="mb-16" aria-labelledby="product-faq-heading">
                  <h2 id="product-faq-heading" className="text-2xl font-serif mb-6">
                    Product Questions
                  </h2>
                  <div className="divide-y divide-border border-y border-border">
                    {productFaqs.map((faq) => (
                      <div key={faq.question} className="py-5">
                        <h3 className="font-medium text-foreground">{faq.question}</h3>
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{faq.answer}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}


              {/* Product-specific WhatsApp consultation CTA */}
              <div className="mb-16 p-6 bg-secondary/30 border border-border rounded-lg text-center">
                <p className="text-sm font-medium text-foreground mb-1">Need a quick fit, color, or event-date check?</p>
                <p className="text-sm text-muted-foreground mb-3">Start a product-specific conversation with LuxeMia before you order.</p>
                <a
                  href={stylistConversationHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Start a Product Consultation
                </a>
              </div>

              {/* Complete the Look */}
              <CompleteTheLook 
                currentProductId={product.id}
                productType={product.productType}
              />

              {/* Recently Viewed */}
              <RecentlyViewed currentProductId={product.id} />
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
      {product && <StickyAddToBag product={product} />}
    </div>
  );
};

const ProductSkeleton = () => (
  <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
    <div className="space-y-4">
      <Skeleton className="aspect-[3/4] w-full rounded-sm" />
      <div className="flex gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="w-20 h-24 rounded-sm" />
        ))}
      </div>
    </div>
    <div className="space-y-6">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-10 w-3/4" />
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-20 w-full" />
      <div className="space-y-4">
        <Skeleton className="h-4 w-20" />
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-16" />
          ))}
        </div>
      </div>
      <Skeleton className="h-14 w-full" />
    </div>
  </div>
);

export default ProductDetail;
