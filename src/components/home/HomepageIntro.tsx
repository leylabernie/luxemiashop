import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, Heart, Pause, Play, Sparkles, Truck } from 'lucide-react';
import {
  useLatestHomepageImagery,
  type HeroSlideId,
} from '@/hooks/useLatestHomepageImagery';
import {
  HOMEPAGE_HEADLINE,
  HOMEPAGE_TRUST_ITEMS,
  HOMEPAGE_VALUE_PROPOSITION,
  HOMEPAGE_WEDDING_COPY,
  HOMEPAGE_WEDDING_LINK,
} from '@/lib/homepageValueProposition';

interface HeroSlide {
  id: HeroSlideId;
  eyebrow: string;
  heading: string;
  description: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  theme: 'ivory' | 'plum';
  isPrimaryH1?: boolean;
}

const SLIDE_INTERVAL_MS = 5500;
const SWIPE_THRESHOLD_PX = 44;

const HERO_SLIDES: readonly HeroSlide[] = [
  {
    id: 'wedding-edit',
    eyebrow: 'Wedding & Celebration Edit',
    heading: HOMEPAGE_HEADLINE,
    description: HOMEPAGE_VALUE_PROPOSITION,
    primaryCta: { label: 'Shop Wedding Guest Outfits', href: '/collections/wedding-guest-outfits' },
    secondaryCta: { label: 'Bridal Party & Group Orders', href: '/wedding-party-orders' },
    theme: 'ivory',
    isPrimaryH1: true,
  },
  {
    id: 'new-arrivals',
    eyebrow: 'Just Dropped · Latest Styles',
    heading: 'New Arrivals for Weddings & Celebrations',
    description:
      'Discover newly added sarees, lehengas, stitched suits, and festive ensembles. Review each product page for exact fabric, included pieces, sizing, and delivery estimates.',
    primaryCta: { label: 'Shop New Arrivals', href: '/new-arrivals' },
    secondaryCta: { label: 'Browse All Collections', href: '/collections' },
    theme: 'plum',
  },
  {
    id: 'sarees-edit',
    eyebrow: 'Timeless Drapes · Woven & Embroidered',
    heading: 'Banarasi, Silk & Wedding Sarees',
    description:
      'Shop woven Banarasi drapes, embroidered celebration sarees, and pre-draped styles, with optional blouse stitching and saree finishing where shown on the listing.',
    primaryCta: { label: 'Shop All Sarees', href: '/sarees' },
    secondaryCta: { label: 'Explore Banarasi Sarees', href: '/collections/banarasi-sarees' },
    theme: 'ivory',
  },
  {
    id: 'lehengas-suits',
    eyebrow: 'Sangeet · Reception · Festive',
    heading: 'Designer Lehengas & Salwar Suits',
    description:
      'Compare embroidered wedding lehengas alongside Anarkali, sharara, and palazzo three-piece suits with clear listing-specific size details.',
    primaryCta: { label: 'Shop Lehengas', href: '/lehengas' },
    secondaryCta: { label: 'Shop Salwar Suits', href: '/suits' },
    theme: 'plum',
  },
  {
    id: 'ready-to-ship',
    eyebrow: 'Need It Sooner · Tracked Dispatch',
    heading: 'Ready-to-Ship Ethnic Wear',
    description:
      'Ready-stock styles dispatch within 3–4 business days with tracked delivery from India to seven supported countries. Optional stitching and alterations add processing time.',
    primaryCta: { label: 'Shop Ready to Ship', href: '/ready-to-ship' },
    secondaryCta: { label: 'View Shipping Rates', href: '/shipping' },
    theme: 'ivory',
  },
];

export default function HomepageIntro() {
  const latestImagery = useLatestHomepageImagery();
  const [activeIndex, setActiveIndex] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const [interactionPaused, setInteractionPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const icons = [Sparkles, Truck, Heart];

  const totalSlides = HERO_SLIDES.length;
  const goTo = useCallback(
    (index: number) => {
      setActiveIndex(((index % totalSlides) + totalSlides) % totalSlides);
    },
    [totalSlides],
  );
  const goNext = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);
  const goPrev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setPrefersReducedMotion(media.matches);
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    if (userPaused || interactionPaused || prefersReducedMotion) return;
    const timer = window.setInterval(() => {
      if (typeof document !== 'undefined' && document.hidden) return;
      setActiveIndex((prev) => (prev + 1) % totalSlides);
    }, SLIDE_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [activeIndex, userPaused, interactionPaused, prefersReducedMotion, totalSlides]);

  const activeSlide = HERO_SLIDES[activeIndex];
  const isPlumDesktop = activeSlide.theme === 'plum';

  return (
    <>
      <section
        role="region"
        aria-roledescription="carousel"
        aria-label="Featured LuxeMia collections"
        onMouseEnter={() => setInteractionPaused(true)}
        onMouseLeave={() => setInteractionPaused(false)}
        onFocusCapture={() => setInteractionPaused(true)}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            setInteractionPaused(false);
          }
        }}
        onKeyDown={(event) => {
          if (event.key === 'ArrowLeft') {
            event.preventDefault();
            goPrev();
          } else if (event.key === 'ArrowRight') {
            event.preventDefault();
            goNext();
          }
        }}
        onTouchStart={(event) => {
          const touch = event.touches[0];
          if (touch) touchStartRef.current = { x: touch.clientX, y: touch.clientY };
        }}
        onTouchEnd={(event) => {
          const start = touchStartRef.current;
          const end = event.changedTouches[0];
          touchStartRef.current = null;
          if (!start || !end) return;
          const deltaX = end.clientX - start.x;
          const deltaY = end.clientY - start.y;
          if (Math.abs(deltaX) >= SWIPE_THRESHOLD_PX && Math.abs(deltaX) > Math.abs(deltaY)) {
            if (deltaX < 0) goNext();
            else goPrev();
          }
        }}
        className={`relative overflow-hidden border-b border-[#e5d5cc] transition-colors duration-500 ${
          isPlumDesktop ? 'bg-[#2f1f23]' : 'bg-[#f6ece4]'
        }`}
      >
        <div className="relative mx-auto h-[470px] max-w-[1520px] sm:h-[510px] lg:h-[540px] xl:h-[570px]">
          {HERO_SLIDES.map((slide, index) => {
            const isActive = index === activeIndex;
            const slideIsPlum = slide.theme === 'plum';
            const HeadingTag = slide.isPrimaryH1 ? 'h1' : 'h2';

            return (
              <div
                key={slide.id}
                aria-hidden={!isActive}
                className={`absolute inset-0 grid h-full w-full lg:grid-cols-[1.06fr_0.94fr] transition-opacity duration-500 ease-out ${
                  isActive ? 'z-10 opacity-100' : 'pointer-events-none z-0 opacity-0'
                }`}
              >
                {/* Text column — overlays bottom gradient on mobile, sits cleanly left on desktop */}
                <div className="relative z-20 flex flex-col justify-end px-5 pb-14 pt-6 sm:px-10 sm:pb-16 lg:justify-center lg:py-12 lg:pl-16 lg:pr-10 xl:pl-20">
                  <p
                    className={`mb-2.5 inline-flex items-center gap-2.5 text-[10px] font-semibold uppercase tracking-[0.22em] sm:mb-3.5 sm:text-[11px] ${
                      slideIsPlum ? 'text-[#f2c6b6]' : 'text-[#f2c6b6] lg:text-link'
                    }`}
                  >
                    <span
                      className={`h-px w-7 ${
                        slideIsPlum ? 'bg-[#e3b982]' : 'bg-[#e3b982] lg:bg-link'
                      }`}
                      aria-hidden="true"
                    />
                    {slide.eyebrow}
                  </p>

                  <HeadingTag
                    id={slide.isPrimaryH1 ? 'homepage-heading' : undefined}
                    className={`max-w-xl font-serif text-[1.65rem] leading-[1.1] tracking-[-0.02em] sm:text-4xl lg:text-[2.75rem] xl:text-[3.15rem] ${
                      slideIsPlum ? 'text-[#fff9f4]' : 'text-[#fff9f4] lg:text-[#291f20]'
                    }`}
                  >
                    {slide.heading}
                  </HeadingTag>

                  <p
                    className={`mt-2.5 line-clamp-3 max-w-lg text-xs leading-relaxed sm:mt-4 sm:line-clamp-none sm:text-sm sm:leading-6 lg:text-[15px] ${
                      slideIsPlum ? 'text-[#fff9f4]/85' : 'text-[#fff9f4]/90 lg:text-[#5c4f4e]'
                    }`}
                  >
                    {slide.description}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-2.5 sm:mt-6 sm:gap-3.5">
                    <Link
                      to={slide.primaryCta.href}
                      tabIndex={isActive ? 0 : -1}
                      className={`group inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.1em] transition-colors sm:px-6 sm:py-3 ${
                        slideIsPlum
                          ? 'bg-[#fff9f4] text-[#2f1f23] hover:bg-[#f2dbd4]'
                          : 'bg-[#fff9f4] text-[#2f1f23] hover:bg-[#f2dbd4] lg:bg-[#3b2a2d] lg:text-[#fff9f4] lg:hover:bg-[#7a2837]'
                      }`}
                    >
                      {slide.primaryCta.label}
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                    </Link>
                    <Link
                      to={slide.secondaryCta.href}
                      tabIndex={isActive ? 0 : -1}
                      className={`inline-flex items-center rounded-full border px-4 py-2.5 text-xs font-semibold transition-colors sm:px-5 sm:py-3 ${
                        slideIsPlum
                          ? 'border-[#fff9f4]/60 text-[#fff9f4] hover:bg-[#fff9f4]/15'
                          : 'border-[#fff9f4]/70 text-[#fff9f4] hover:bg-[#fff9f4]/15 lg:border-[#3b2a2d]/35 lg:text-[#3b2a2d] lg:hover:border-[#3b2a2d] lg:hover:bg-white/70'
                      }`}
                    >
                      {slide.secondaryCta.label}
                    </Link>
                  </div>

                  {latestImagery.hero[slide.id]?.title && (
                    <p
                      className={`mt-3 hidden max-w-lg text-[11px] leading-relaxed lg:block ${
                        slideIsPlum ? 'text-[#fff9f4]/65' : 'text-[#6e605e]'
                      }`}
                    >
                      Shown: {latestImagery.hero[slide.id]?.title}
                    </p>
                  )}
                </div>

                {/* Image column — full-bleed backdrop on mobile, crisp right editorial frame on desktop */}
                <div className="absolute inset-0 z-10 overflow-hidden lg:relative lg:h-full">
                  {(() => {
                    const media = latestImagery.hero[slide.id];
                    if (!media) return null;
                    return (
                      <picture className="block h-full w-full">
                        {media.webpUrl && <source srcSet={media.webpUrl} type="image/webp" />}
                        <img
                          src={media.url}
                          alt={media.alt}
                          width={media.width}
                          height={media.height}
                          loading={index === 0 ? 'eager' : 'lazy'}
                          fetchPriority={index === 0 ? 'high' : undefined}
                          decoding="async"
                          className="h-full w-full object-cover object-top"
                        />
                      </picture>
                    );
                  })()}
                  {/* Mobile legibility scrim — leaves top of garment & face clear */}
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-[#1f1315]/90 via-[#1f1315]/45 to-transparent lg:hidden"
                    aria-hidden="true"
                  />
                  {/* Desktop soft inner edge blend into copy column */}
                  <div
                    className={`hidden lg:block absolute inset-y-0 left-0 w-24 bg-gradient-to-r to-transparent ${
                      slideIsPlum ? 'from-[#2f1f23]' : 'from-[#f6ece4]'
                    }`}
                    aria-hidden="true"
                  />
                </div>
              </div>
            );
          })}

          {/* Prev / Next Carousel Arrows */}
          <button
            type="button"
            onClick={goPrev}
            aria-label="Previous slide"
            className="absolute left-2.5 top-1/2 z-30 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-foreground/15 bg-background/90 text-foreground shadow-md transition-colors hover:bg-background focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 sm:flex lg:left-4 lg:h-11 lg:w-11"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label="Next slide"
            className="absolute right-2.5 top-1/2 z-30 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-foreground/15 bg-background/90 text-foreground shadow-md transition-colors hover:bg-background focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 sm:flex lg:right-4 lg:h-11 lg:w-11"
          >
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>

          {/* Bottom Controls: Slide Dots + Mobile Arrows + Pause/Play */}
          <div className="absolute inset-x-0 bottom-3 z-30 flex items-center justify-between px-5 sm:bottom-4 sm:px-10 lg:justify-start lg:gap-4 lg:pl-16 xl:pl-20">
            <div className="flex items-center gap-2" role="group" aria-label="Choose a banner slide">
              {HERO_SLIDES.map((slide, index) => {
                const isActive = index === activeIndex;
                return (
                  <button
                    key={slide.id}
                    type="button"
                    onClick={() => goTo(index)}
                    aria-label={`Slide ${index + 1} of ${totalSlides}: ${slide.eyebrow}`}
                    aria-current={isActive ? 'true' : undefined}
                    className="group flex h-6 items-center justify-center px-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                  >
                    <span
                      className={`block h-1.5 rounded-full transition-all duration-300 ${
                        isActive
                          ? isPlumDesktop
                            ? 'w-7 bg-[#fff9f4]'
                            : 'w-7 bg-[#fff9f4] lg:bg-[#3b2a2d]'
                          : isPlumDesktop
                          ? 'w-2 bg-[#fff9f4]/45 group-hover:bg-[#fff9f4]/75'
                          : 'w-2 bg-[#fff9f4]/50 group-hover:bg-[#fff9f4]/80 lg:bg-[#3b2a2d]/30 lg:group-hover:bg-[#3b2a2d]/60'
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={goPrev}
                aria-label="Previous slide"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/30 bg-black/35 text-white sm:hidden"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={goNext}
                aria-label="Next slide"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/30 bg-black/35 text-white sm:hidden"
              >
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => setUserPaused((current) => !current)}
                aria-label={userPaused ? 'Resume banner rotation' : 'Pause banner rotation'}
                aria-pressed={userPaused}
                className={`flex h-8 w-8 items-center justify-center rounded-full border transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                  isPlumDesktop
                    ? 'border-white/30 bg-black/25 text-white hover:bg-black/40'
                    : 'border-white/30 bg-black/35 text-white lg:border-[#3b2a2d]/25 lg:bg-white/75 lg:text-[#3b2a2d] lg:hover:bg-white'
                }`}
              >
                {userPaused ? (
                  <Play className="h-3.5 w-3.5" aria-hidden="true" />
                ) : (
                  <Pause className="h-3.5 w-3.5" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Single Utsav-style Shopping Promise Ribbon */}
      <section aria-label="LuxeMia shopping promises" className="bg-[#3b2a2d] text-[#fff9f4]">
        <div className="mx-auto grid max-w-7xl divide-y divide-white/15 px-4 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:px-8">
          {HOMEPAGE_TRUST_ITEMS.map((item, i) => {
            const Icon = icons[i];
            return (
              <div key={item.title} className="px-3 py-3.5 text-center sm:px-5 sm:py-4">
                <div className="flex items-center justify-center gap-2">
                  <Icon className="h-4 w-4 shrink-0 text-[#e7c28e]" aria-hidden="true" />
                  <h2 className="font-serif text-sm font-medium sm:text-base">{item.title}</h2>
                </div>
                <p className="mt-1 hidden text-xs leading-5 text-white/75 md:block">{item.body}</p>
              </div>
            );
          })}
        </div>
      </section>

      <aside
        aria-label="Destination wedding coordination"
        className="border-b border-[#eaded6] bg-[#fffaf6] px-4 py-2.5 text-center"
      >
        <p className="mx-auto max-w-5xl text-xs leading-5 text-[#665a59]">
          {HOMEPAGE_WEDDING_COPY}{' '}
          <a
            href={HOMEPAGE_WEDDING_LINK}
            className="font-semibold text-link underline underline-offset-4 hover:text-link/80"
          >
            Explore CeremonyVerse India Wedding Sourcing
          </a>
        </p>
      </aside>
    </>
  );
}
