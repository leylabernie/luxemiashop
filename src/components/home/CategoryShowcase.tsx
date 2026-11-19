import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { FEATURED_CATEGORY_PRODUCTS } from '@/config/featuredCategoryProducts';
import {
  useLatestHomepageImagery,
  type CategorySlotId,
} from '@/hooks/useLatestHomepageImagery';
import { canPromoteCollection } from '@/lib/collectionPromotion';

interface CategoryTile {
  slot: CategorySlotId;
  name: string;
  subtitle: string;
  href: string;
  fallbackImage: string;
  fallbackWebp: string;
  fallbackAlt: string;
}

const ALL_CATEGORIES: readonly CategoryTile[] = [
  {
    slot: 'sarees',
    name: 'Sarees',
    subtitle: 'Banarasi, Silk & Drapes',
    href: '/sarees',
    fallbackImage: FEATURED_CATEGORY_PRODUCTS.sarees.image,
    fallbackWebp: FEATURED_CATEGORY_PRODUCTS.sarees.imageWebp,
    fallbackAlt: FEATURED_CATEGORY_PRODUCTS.sarees.alt,
  },
  {
    slot: 'lehengas',
    name: 'Lehengas',
    subtitle: 'Bridal, Wedding & Festive',
    href: '/lehengas',
    fallbackImage: FEATURED_CATEGORY_PRODUCTS.lehengas.image,
    fallbackWebp: FEATURED_CATEGORY_PRODUCTS.lehengas.imageWebp,
    fallbackAlt: FEATURED_CATEGORY_PRODUCTS.lehengas.alt,
  },
  {
    slot: 'suits',
    name: 'Salwar Suits',
    subtitle: 'Anarkali, Sharara & Palazzo',
    href: '/suits',
    fallbackImage: FEATURED_CATEGORY_PRODUCTS.suits.image,
    fallbackWebp: FEATURED_CATEGORY_PRODUCTS.suits.imageWebp,
    fallbackAlt: FEATURED_CATEGORY_PRODUCTS.suits.alt,
  },
  {
    slot: 'indowestern',
    name: 'Indo-Western',
    subtitle: 'Contemporary Fusion',
    href: '/indowestern',
    fallbackImage: FEATURED_CATEGORY_PRODUCTS.indowestern.image,
    fallbackWebp: FEATURED_CATEGORY_PRODUCTS.indowestern.imageWebp,
    fallbackAlt: FEATURED_CATEGORY_PRODUCTS.indowestern.alt,
  },
  {
    slot: 'menswear',
    name: 'Menswear',
    subtitle: 'Kurtas, Jackets & Sherwanis',
    href: '/menswear',
    fallbackImage: FEATURED_CATEGORY_PRODUCTS.menswear.image,
    fallbackWebp: FEATURED_CATEGORY_PRODUCTS.menswear.imageWebp,
    fallbackAlt: FEATURED_CATEGORY_PRODUCTS.menswear.alt,
  },
  {
    slot: 'kids',
    name: 'Kids',
    subtitle: 'Festive Kurta & Ethnic Sets',
    href: '/kids',
    fallbackImage: FEATURED_CATEGORY_PRODUCTS.kids.image,
    fallbackWebp: FEATURED_CATEGORY_PRODUCTS.kids.imageWebp,
    fallbackAlt: FEATURED_CATEGORY_PRODUCTS.kids.alt,
  },
  {
    slot: 'jewelry',
    name: 'Jewelry',
    subtitle: 'Bridal & Festive Sets',
    href: '/jewelry',
    fallbackImage: FEATURED_CATEGORY_PRODUCTS.jewelry.image,
    fallbackWebp: FEATURED_CATEGORY_PRODUCTS.jewelry.imageWebp,
    fallbackAlt: FEATURED_CATEGORY_PRODUCTS.jewelry.alt,
  },
];

const CategoryShowcase = () => {
  const latestImagery = useLatestHomepageImagery();
  const categories = ALL_CATEGORIES.filter((cat) => canPromoteCollection(cat.href));

  return (
    <section aria-labelledby="shop-by-category-heading" className="border-b border-[#eaded6] bg-[#fcf8f4] py-10 sm:py-14 lg:py-16">
      <div className="container mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mb-6 flex items-end justify-between gap-4 sm:mb-8">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-link">
              Curated Departments
            </p>
            <h2 id="shop-by-category-heading" className="mt-1 font-serif text-2xl text-[#291f20] sm:text-3xl lg:text-4xl">
              Shop by Category
            </h2>
          </div>
          <Link
            to="/collections"
            className="group inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-link underline underline-offset-4 hover:text-link/80"
          >
            All Collections
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        </div>

        {/* Single-appearance category row: swipeable strip on mobile, single row on desktop */}
        <div className="-mx-4 flex snap-x snap-mandatory gap-3.5 overflow-x-auto px-4 pb-2 scrollbar-hide sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-6 lg:gap-5">
          {categories.map((category) => {
            const live = latestImagery.categories[category.slot];
            const imageSrc = live?.url || category.fallbackImage;
            const imageWebp = live?.webpUrl || category.fallbackWebp;
            const imageAlt = live?.alt || category.fallbackAlt;
            return (
              <Link
                key={category.href}
                to={category.href}
                aria-label={`Shop ${category.name} — ${category.subtitle}`}
                className="group w-[42vw] max-w-[210px] shrink-0 snap-start sm:w-auto sm:max-w-none"
              >
                <div className="relative aspect-[3/4] overflow-hidden rounded-sm border border-[#e6d7cf] bg-[#efe6df] shadow-sm transition-shadow duration-300 group-hover:shadow-md">
                  <picture>
                    <source srcSet={imageWebp} type="image/webp" />
                    <img
                      src={imageSrc}
                      alt={imageAlt}
                      width={360}
                      height={480}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                  </picture>
                </div>
                <div className="mt-2.5 text-center">
                  <h3 className="font-serif text-base font-medium text-[#291f20] transition-colors group-hover:text-link sm:text-lg">
                    {category.name}
                  </h3>
                  <p className="mt-0.5 text-[11px] text-[#756664] line-clamp-1">
                    {category.subtitle}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoryShowcase;
