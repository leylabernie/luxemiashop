import { useState, useEffect } from 'react';
import { fetchProducts, type ShopifyProduct } from '@/lib/shopify';

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
    title: 'Wedding Season',
    subtitle: 'Bridal Elegance',
    description:
      'From the bride\'s grand lehenga to the groom\'s regal sherwani — curated ensembles for every wedding ceremony, from mehendi to reception.',
    query: 'tag:"lehenga-choli" OR tag:"Lehenga" OR tag:"Wedding Lehenga" OR tag:"sherwani" OR tag:"Sherwani"',
    maxProducts: 8,
  },
  {
    id: 'eid-collection',
    title: 'Eid Collection',
    subtitle: 'Festive Grace',
    description:
      'Celebrate in style with flowing shararas and elegant palazzo suits — graceful silhouettes in luxurious georgette, chinon, and net fabrics.',
    query: 'tag:"sharara" OR tag:"Sharara Set" OR tag:"palazzo" OR tag:"Palazzo Set"',
    maxProducts: 8,
  },
  {
    id: 'festive-favorites',
    title: 'Festive Favorites',
    subtitle: 'Season\'s Best',
    description:
      'A curated mix of our most-loved pieces across categories — versatile outfits that transition effortlessly from festive gatherings to celebrations.',
    query: 'tag:"salwar" OR tag:"anarkali" OR tag:"Anarkali Suit" OR tag:"Salwar Suit" OR tag:"lehenga-choli"',
    maxProducts: 8,
  },
  {
    id: 'his-and-hers',
    title: 'His & Hers',
    subtitle: 'Coordinated Style',
    description:
      'Perfectly paired looks for couples — elegant kurta pajamas and jodhpuri suits alongside complementing lehengas and sharara sets.',
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
            return { id: collection.id, products: data.slice(0, collection.maxProducts) };
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
