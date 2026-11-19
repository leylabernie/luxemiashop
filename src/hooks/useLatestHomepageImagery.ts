import { useEffect, useState } from 'react';
import latestSnapshot from '@/data/latestHomepageImagery.json';
import {
  LATEST_HOMEPAGE_IMAGERY_QUERY,
  selectLatestHomepageImagery,
} from '@/lib/selectLatestHomepageImagery.mjs';

export interface HomepageImageEntry {
  handle: string;
  title: string;
  price?: number;
  url: string;
  webpUrl: string;
  alt: string;
  width: number;
  height: number;
  createdAt?: string | null;
}

export type HeroSlideId =
  | 'wedding-edit'
  | 'new-arrivals'
  | 'sarees-edit'
  | 'lehengas-suits'
  | 'ready-to-ship';

export type CategorySlotId =
  | 'sarees'
  | 'lehengas'
  | 'suits'
  | 'indowestern'
  | 'menswear'
  | 'kids'
  | 'jewelry';

export type PromoSlotId = 'ready-to-ship' | 'bridal-party';

export interface LatestHomepageImagery {
  hero: Record<HeroSlideId, HomepageImageEntry | null>;
  categories: Record<CategorySlotId, HomepageImageEntry | null>;
  promos: Record<PromoSlotId, HomepageImageEntry | null>;
}

const INITIAL_IMAGERY = latestSnapshot as unknown as LatestHomepageImagery;
const CACHE_TTL_MS = 5 * 60 * 1000;

let cachedImagery: LatestHomepageImagery | null = null;
let cachedAt = 0;
let inflightRequest: Promise<LatestHomepageImagery | null> | null = null;

function mergeImagery(
  base: LatestHomepageImagery,
  next: LatestHomepageImagery | null,
): LatestHomepageImagery {
  if (!next) return base;
  return {
    hero: {
      'wedding-edit': next.hero['wedding-edit'] || base.hero['wedding-edit'],
      'new-arrivals': next.hero['new-arrivals'] || base.hero['new-arrivals'],
      'sarees-edit': next.hero['sarees-edit'] || base.hero['sarees-edit'],
      'lehengas-suits': next.hero['lehengas-suits'] || base.hero['lehengas-suits'],
      'ready-to-ship': next.hero['ready-to-ship'] || base.hero['ready-to-ship'],
    },
    categories: {
      sarees: next.categories.sarees || base.categories.sarees,
      lehengas: next.categories.lehengas || base.categories.lehengas,
      suits: next.categories.suits || base.categories.suits,
      indowestern: next.categories.indowestern || base.categories.indowestern,
      menswear: next.categories.menswear || base.categories.menswear,
      kids: next.categories.kids || base.categories.kids,
      jewelry: next.categories.jewelry || base.categories.jewelry,
    },
    promos: {
      'ready-to-ship': next.promos['ready-to-ship'] || base.promos['ready-to-ship'],
      'bridal-party': next.promos['bridal-party'] || base.promos['bridal-party'],
    },
  };
}

async function loadLiveLatestImagery(): Promise<LatestHomepageImagery | null> {
  if (cachedImagery && Date.now() - cachedAt < CACHE_TTL_MS) {
    return cachedImagery;
  }
  if (inflightRequest) return inflightRequest;

  inflightRequest = (async () => {
    try {
      const [{ storefrontApiRequest }, { default: archivedHandles }] = await Promise.all([
        import('@/lib/shopify'),
        import('@/data/reversiblyArchivedProductHandles.json'),
      ]);
      const response = await storefrontApiRequest<Record<string, unknown>>(
        LATEST_HOMEPAGE_IMAGERY_QUERY,
      );
      if (!response?.data) return null;
      const selected = selectLatestHomepageImagery(response.data, {
        archivedHandles,
      }) as LatestHomepageImagery | null;
      if (!selected) return null;
      const merged = mergeImagery(INITIAL_IMAGERY, selected);
      cachedImagery = merged;
      cachedAt = Date.now();
      return merged;
    } catch {
      return null;
    } finally {
      inflightRequest = null;
    }
  })();

  return inflightRequest;
}

/**
 * Returns the newest active Shopify product photography for the homepage hero,
 * category cards, and promo banners — seeded at build time for instant paint
 * and refreshed live from Shopify so newly published items appear automatically.
 */
export function useLatestHomepageImagery(): LatestHomepageImagery {
  const [imagery, setImagery] = useState<LatestHomepageImagery>(
    () => cachedImagery || INITIAL_IMAGERY,
  );

  useEffect(() => {
    let active = true;
    loadLiveLatestImagery().then((live) => {
      if (active && live) setImagery(live);
    });
    return () => {
      active = false;
    };
  }, []);

  return imagery;
}
