import { useState, useEffect } from 'react';
import { fetchProducts, type ShopifyProduct } from '@/lib/shopify';
import { isProductExplicitlyOrderable } from '@/lib/orderability';

export interface LookbookCollection {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  query: string;
  maxProducts: number;
}

export const LOOKBOOK_COLLECTIONS: LookbookCollection[] = [
  {
    id: 'wedding-season',
    title: 'Wedding-Related Listings',
    subtitle: 'Catalog tag matches',
    description:
      'Current products returned by wedding, lehenga or sherwani catalog tags. Open the exact listing to verify its occasion, included pieces, material, size and fulfillment details.',
    query: 'tag:"lehenga-choli" OR tag:"Lehenga" OR tag:"Wedding Lehenga" OR tag:"sherwani" OR tag:"Sherwani"',
    maxProducts: 8,
  },
  {
    id: 'eid-collection',
    title: 'Sharara and Palazzo Listings',
    subtitle: 'Silhouette tag matches',
    description:
      'Current products returned by sharara or palazzo catalog tags. This grouping does not add an occasion, fabric, comfort or included-piece claim to an individual item.',
    query: 'tag:"sharara" OR tag:"Sharara Set" OR tag:"palazzo" OR tag:"Palazzo Set"',
    maxProducts: 8,
  },
  {
    id: 'festive-favorites',
    title: 'Suit and Lehenga Listings',
    subtitle: 'Current catalog matches',
    description:
      'A browsing group built from current salwar, Anarkali and lehenga-related tags. The selected product page controls every product and fulfillment fact.',
    query: 'tag:"salwar" OR tag:"anarkali" OR tag:"Anarkali Suit" OR tag:"Salwar Suit" OR tag:"lehenga-choli"',
    maxProducts: 8,
  },
  {
    id: 'his-and-hers',
    title: 'Menswear Listings',
    subtitle: 'Current catalog matches',
    description:
      'Current products returned by kurta, Jodhpuri or menswear-related tags. Products are not presented as a coordinated pair unless the exact listing says so.',
    query: 'tag:"kurta-pajama" OR tag:"jodhpuri" OR tag:"Jodhpuri" OR tag:"mens" OR tag:"Mens Ethnic Wear"',
    maxProducts: 8,
  },
];

interface LookbookProductsState {
  products: Record<string, ShopifyProduct[]>;
  isLoading: boolean;
  error: string | null;
}

export const useLookbookProducts = () => {
  const [state, setState] = useState<LookbookProductsState>({
    products: {},
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const loadAll = async () => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        const results = await Promise.all(
          LOOKBOOK_COLLECTIONS.map(async (collection) => {
            const data = await fetchProducts(collection.maxProducts, collection.query);
            const orderableProducts = data.filter(({ node }) => isProductExplicitlyOrderable(node));
            return { id: collection.id, products: orderableProducts.slice(0, collection.maxProducts) };
          })
        );

        const productMap: Record<string, ShopifyProduct[]> = {};
        for (const result of results) {
          productMap[result.id] = result.products;
        }

        setState({ products: productMap, isLoading: false, error: null });
      } catch (err) {
        console.error('Error fetching lookbook products:', err);
        setState({ products: {}, isLoading: false, error: 'Failed to load lookbook products' });
      }
    };

    loadAll();
  }, []);

  return state;
};
