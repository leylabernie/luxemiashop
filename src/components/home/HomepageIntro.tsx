import { Link } from 'react-router-dom';
import { ArrowRight, Heart, Sparkles, Truck } from 'lucide-react';
import { HOMEPAGE_HEADLINE, HOMEPAGE_VALUE_PROPOSITION, HOMEPAGE_TRUST_ITEMS, HOMEPAGE_WEDDING_COPY, HOMEPAGE_WEDDING_LINK } from '@/lib/homepageValueProposition';

const HERO_CATEGORIES = [
  {
    name: 'Sarees',
    subtitle: 'Ready-to-wear & silk',
    href: '/sarees',
    image: 'https://cdn.shopify.com/s/files/1/0746/4707/7035/files/ready-to-wear-satin-saree-light-pink-1.jpg?v=1794702063&width=640',
    alt: 'Light pink embroidered ready-to-wear satin saree',
    width: 640,
    height: 960,
    eager: true,
    highPriority: false,
  },
  {
    name: 'Lehengas',
    subtitle: 'Wedding & reception',
    href: '/lehengas',
    image: 'https://cdn.shopify.com/s/files/1/0746/4707/7035/files/Grey-Georgette-Wedding-Wear-Embroidery-Work-Lehenga-Choli-4797-321-B_1.jpg?v=1793569611',
    alt: 'Grey embroidered georgette wedding lehenga choli with pink dupatta',
    width: 800,
    height: 1100,
    eager: true,
    highPriority: true,
  },
  {
    name: 'Suits',
    subtitle: 'Anarkali & palazzo',
    href: '/suits',
    image: 'https://cdn.shopify.com/s/files/1/0746/4707/7035/files/anarkali-green-chinon-01_634e85ec-3bf4-4727-b966-0e704a8d9129.jpg?v=1791219948&width=640',
    alt: 'Green digital printed chinon Anarkali suit set',
    width: 640,
    height: 853,
    eager: false,
    highPriority: false,
  },
  {
    name: 'Menswear',
    subtitle: 'Kurta sets & jackets',
    href: '/menswear',
    image: 'https://cdn.shopify.com/s/files/1/0746/4707/7035/files/luxemia-navy-blue-embroidered-silk-kurta-pajama-with-jacket-navy-blue-1.jpg?v=1793034301&width=640',
    alt: 'Navy blue embroidered silk kurta pajama with jacket',
    width: 640,
    height: 880,
    eager: false,
    highPriority: false,
  },
] as const;

const QUICK_CATEGORY_LINKS = [
  { label: 'New Arrivals', href: '/new-arrivals' },
  { label: 'Sarees', href: '/sarees' },
  { label: 'Lehengas', href: '/lehengas' },
  { label: 'Suits', href: '/suits' },
  { label: 'Menswear', href: '/menswear' },
  { label: 'Ready to Ship', href: '/ready-to-ship' },
] as const;

export default function HomepageIntro() {
  const icons = [Sparkles, Truck, Heart];
  return <>
    <section aria-labelledby="homepage-heading" className="bg-[#f8f0e8] px-4 pt-5 pb-8 sm:px-8 sm:pt-8 sm:pb-12">
      <div className="mx-auto max-w-7xl">
        <div className="grid items-center gap-4 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-10">
          <div className="text-left lg:col-start-1 lg:row-start-1">
            <h1 id="homepage-heading" className="font-serif text-2xl leading-[1.12] tracking-[-0.02em] text-[#291f20] sm:text-4xl lg:text-[2.85rem]">
              {HOMEPAGE_HEADLINE}
            </h1>

            <nav aria-label="Shop top categories" className="mt-3 flex flex-wrap gap-1.5 sm:mt-4 sm:gap-2">
              {QUICK_CATEGORY_LINKS.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className="rounded-full border border-[#d6bfb8] bg-white/85 px-3 py-1.5 text-xs font-medium text-[#3b2a2d] transition-colors hover:border-[#3b2a2d] hover:bg-[#3b2a2d] hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:grid-cols-2 lg:gap-3.5" aria-label="Featured outfit categories">
            {HERO_CATEGORIES.map((cat) => (
              <Link
                key={cat.href}
                to={cat.href}
                className="group relative block aspect-[3/4] overflow-hidden rounded-sm bg-[#e7dfd9] shadow-sm lg:aspect-[4/5]"
              >
                <img
                  src={cat.image}
                  alt={cat.alt}
                  width={cat.width}
                  height={cat.height}
                  loading={cat.eager ? 'eager' : 'lazy'}
                  fetchPriority={cat.highPriority ? 'high' : undefined}
                  decoding="async"
                  className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#241618]/85 via-[#241618]/35 to-transparent px-3 pt-8 pb-2.5 text-white">
                  <span className="flex items-center justify-between font-serif text-base leading-tight sm:text-lg">
                    {cat.name}
                    <ArrowRight className="h-3.5 w-3.5 opacity-85 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                  </span>
                  <span className="mt-0.5 block text-[11px] text-white/85">{cat.subtitle}</span>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-left lg:col-start-1 lg:row-start-2 lg:self-start">
            <p className="max-w-xl text-xs leading-relaxed text-[#665a59] sm:text-sm sm:leading-6">
              {HOMEPAGE_VALUE_PROPOSITION}
            </p>

            <div className="mt-3.5 flex flex-wrap items-center gap-2.5 sm:mt-5 sm:gap-3">
              <Link
                to="/collections/wedding-guest-outfits"
                className="inline-flex items-center gap-2 rounded-full bg-[#3b2a2d] px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#624044] sm:px-6 sm:py-3.5 sm:text-sm"
              >
                Shop Wedding Guest Outfits <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Link>
              <Link
                to="/wedding-party-orders"
                className="rounded-full border border-[#a96f72] px-4 py-2.5 text-xs font-semibold text-[#4a3738] transition-colors hover:bg-white sm:px-5 sm:py-3.5 sm:text-sm"
              >
                Custom Group &amp; Bridal Party Orders
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
    <section aria-label="LuxeMia shopping promises" className="bg-[#3b2a2d] text-[#fff9f4]">
      <div className="mx-auto grid max-w-7xl divide-y divide-white/15 px-5 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:px-8">
        {HOMEPAGE_TRUST_ITEMS.map((item, i) => {
          const Icon = icons[i];
          return <div key={item.title} className="px-3 py-4 text-center sm:px-6 sm:py-6">
            <div className="flex items-center justify-center gap-2">
              <Icon className="h-4 w-4 shrink-0 text-[#e7afad]" aria-hidden="true" />
              <h2 className="font-serif text-base sm:text-lg">{item.title}</h2>
            </div>
            <p className="mt-1.5 text-xs leading-5 text-white/80 sm:mt-2 sm:text-sm sm:leading-6">{item.body}</p>
          </div>;
        })}
      </div>
    </section>
    <aside aria-label="Destination wedding coordination" className="border-b border-[#eaded6] bg-[#fffaf6] px-5 py-4 text-center">
      <p className="mx-auto max-w-5xl text-xs leading-6 text-[#665a59] sm:text-sm">
        {HOMEPAGE_WEDDING_COPY}{' '}
        <a href={HOMEPAGE_WEDDING_LINK} className="font-semibold text-[#4a3738] underline underline-offset-4">Explore CeremonyVerse India Wedding Sourcing</a>
      </p>
    </aside>
  </>;
}
