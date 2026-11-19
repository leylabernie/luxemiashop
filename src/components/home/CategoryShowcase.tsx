import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { FEATURED_CATEGORY_PRODUCTS } from '@/config/featuredCategoryProducts';
import { canPromoteCollection } from '@/lib/collectionPromotion';

interface CategoryTile {
  name: string;
  subtitle: string;
  href: string;
  image: string;
  imageWebp: string;
  imageAlt: string;
}

const ALL_CATEGORIES: readonly CategoryTile[] = [
  {
    name: 'Sarees',
    subtitle: 'Banarasi, Silk & Drapes',
    href: '/sarees',
    image: FEATURED_CATEGORY_PRODUCTS.sarees.image,
    imageWebp: FEATURED_CATEGORY_PRODUCTS.sarees.imageWebp,
    imageAlt: FEATURED_CATEGORY_PRODUCTS.sarees.alt,
  },
  {
    name: 'Lehengas',
    subtitle: 'Bridal, Wedding & Festive',
    href: '/lehengas',
    image: FEATURED_CATEGORY_PRODUCTS.lehengas.image,
    imageWebp: FEATURED_CATEGORY_PRODUCTS.lehengas.imageWebp,
    imageAlt: FEATURED_CATEGORY_PRODUCTS.lehengas.alt,
  },
  {
    name: 'Salwar Suits',
    subtitle: 'Anarkali, Sharara & Palazzo',
    href: '/suits',
    image: FEATURED_CATEGORY_PRODUCTS.suits.image,
    imageWebp: FEATURED_CATEGORY_PRODUCTS.suits.imageWebp,
    imageAlt: FEATURED_CATEGORY_PRODUCTS.suits.alt,
  },
  {
    name: 'Indo-Western',
    subtitle: 'Contemporary Fusion',
    href: '/indowestern',
    image: FEATURED_CATEGORY_PRODUCTS.indowestern.image,
    imageWebp: FEATURED_CATEGORY_PRODUCTS.indowestern.imageWebp,
    imageAlt: FEATURED_CATEGORY_PRODUCTS.indowestern.alt,
  },
  {
    name: 'Menswear',
    subtitle: 'Kurtas, Jackets & Sherwanis',
    href: '/menswear',
    image: FEATURED_CATEGORY_PRODUCTS.menswear.image,
    imageWebp: FEATURED_CATEGORY_PRODUCTS.menswear.imageWebp,
    imageAlt: FEATURED_CATEGORY_PRODUCTS.menswear.alt,
  },
  {
    name: 'Kids',
    subtitle: 'Festive Kurta & Ethnic Sets',
    href: '/kids',
    image: FEATURED_CATEGORY_PRODUCTS.kids.image,
    imageWebp: FEATURED_CATEGORY_PRODUCTS.kids.imageWebp,
    imageAlt: FEATURED_CATEGORY_PRODUCTS.kids.alt,
  },
  {
    name: 'Jewelry',
    subtitle: 'Bridal & Festive Sets',
    href: '/jewelry',
    image: FEATURED_CATEGORY_PRODUCTS.jewelry.image,
    imageWebp: FEATURED_CATEGORY_PRODUCTS.jewelry.imageWebp,
    imageAlt: FEATURED_CATEGORY_PRODUCTS.jewelry.alt,
  },
];

const CategoryShowcase = () => {
  const categories = ALL_CATEGORIES.filter((cat) => canPromoteCollection(cat.href));

  return (
    <section aria-labelledby="shop-by-category-heading" className="border-b border-[#eaded6] bg-[#fcf8f4] py-10 sm:py-14 lg:py-16">
      <div className="container mx-auto max-w-7xl px-4 lg:px-8">
        {/* Utsav-style clean section header */}
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
          {categories.map((category) => (
            <Link
              key={category.href}
              to={category.href}
              aria-label={`Shop ${category.name} — ${category.subtitle}`}
              className="group w-[42vw] max-w-[210px] shrink-0 snap-start sm:w-auto sm:max-w-none"
            >
              <div className="relative aspect-[3/4] overflow-hidden rounded-sm border border-[#e6d7cf] bg-[#efe6df] shadow-sm transition-shadow duration-300 group-hover:shadow-md">
                <picture>
                  <source srcSet={category.imageWebp} type="image/webp" />
                  <img
                    src={category.image}
                    alt={category.imageAlt}
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
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryShowcase;
