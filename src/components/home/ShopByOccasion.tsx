import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { canPromoteCollection } from '@/lib/collectionPromotion';

const OCCASIONS = [
  {
    label: 'Bridal',
    sublabel: 'Ceremony & wedding-day styles',
    href: '/collections/bridal-lehengas',
  },
  {
    label: 'Wedding Guest',
    sublabel: 'Celebration-ready guest edits',
    href: '/collections/wedding-guest-outfits',
  },
  {
    label: 'Reception & Sangeet',
    sublabel: 'Embroidered evening glamour',
    href: '/collections/party-wear-lehengas',
  },
  {
    label: 'Haldi',
    sublabel: 'Sunshine & marigold hues',
    href: '/collections/haldi-outfits',
  },
  {
    label: 'Mehendi',
    sublabel: 'Vibrant pre-wedding ensembles',
    href: '/collections/mehendi-outfits',
  },
  {
    label: 'Bridal Party & Groups',
    sublabel: 'Coordinated family & squad orders',
    href: '/wedding-party-orders',
  },
] as const;

const ShopByOccasion = () => {
  const activeOccasions = OCCASIONS.filter((occ) => canPromoteCollection(occ.href));

  return (
    <section aria-labelledby="shop-by-occasion-heading" className="border-b border-[#eaded6] bg-[#fffaf6] py-12 lg:py-16">
      <div className="container mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4 sm:mb-9">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-link">
              The Wedding Calendar
            </p>
            <h2 id="shop-by-occasion-heading" className="mt-1 font-serif text-2xl text-[#291f20] sm:text-3xl lg:text-4xl">
              Shop by Occasion
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 lg:gap-4">
          {activeOccasions.map((occ) => (
            <Link
              key={occ.label}
              to={occ.href}
              data-testid={`occasion-${occ.label.toLowerCase().replace(/\s+/g, '-')}`}
              className="group flex flex-col justify-between rounded-sm border border-[#e3d2c8] bg-[#f8f0e8] p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#3b2a2d] hover:bg-[#3b2a2d] hover:text-[#fff9f4] hover:shadow-md sm:p-5"
            >
              <div>
                <h3 className="font-serif text-base font-medium text-[#291f20] transition-colors group-hover:text-[#fff9f4] sm:text-lg">
                  {occ.label}
                </h3>
                <p className="mt-1 text-xs leading-snug text-[#6e605e] transition-colors group-hover:text-[#fff9f4]/80">
                  {occ.sublabel}
                </p>
              </div>
              <span className="mt-4 inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-link transition-colors group-hover:text-[#f2c6b6]">
                Explore
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ShopByOccasion;
