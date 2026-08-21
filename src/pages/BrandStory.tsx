import { ArrowRight, Heart, Sparkles, HandHeart } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/seo/SEOHead';
import { FEATURED_CATEGORY_PRODUCTS } from '@/config/featuredCategoryProducts';

const values = [
  {
    icon: Heart,
    title: 'A sense of belonging',
    description:
      'We believe the clothes you choose for a celebration should carry more than colour and craft. They should help you feel present, connected, and entirely yourself.',
  },
  {
    icon: Sparkles,
    title: 'Beauty, thoughtfully chosen',
    description:
      'From quiet family gatherings to wedding weekends, LuxeMia brings together expressive Indian silhouettes for the moments people remember long after the music fades.',
  },
  {
    icon: HandHeart,
    title: 'A more personal way to choose',
    description:
      'We make room for the questions that matter. Explore each piece at your own pace, and reach out when you would like a helping hand with a detail, fit, or occasion.',
  },
];

const BrandStory = () => {
  return (
    <div className="min-h-screen bg-[#fffaf6] text-[#352629]">
      <SEOHead
        title="Our Story — LuxeMia"
        description="Discover LuxeMia: Indian occasionwear chosen for weddings, festivals, and meaningful celebrations in the United States."
        canonical="https://luxemia.shop/brand-story"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Our Story', url: '/brand-story' },
        ]}
      />
      <Header />

      <main className="pt-[88px] lg:pt-[124px]">
        <section className="relative overflow-hidden bg-[radial-gradient(circle_at_11%_18%,rgba(229,185,179,0.44),transparent_29%),radial-gradient(circle_at_87%_79%,rgba(229,204,165,0.42),transparent_26%),#f7eee8] px-5 py-20 sm:px-8 sm:py-24 lg:py-32">
          <div className="mx-auto max-w-4xl text-center">
            <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#a96f72]">Our story</p>
            <h1 className="font-serif text-[clamp(3.2rem,8vw,7rem)] leading-[0.9] tracking-[-0.045em] text-[#352629]">
              Dressing for the moments that <em className="font-normal text-[#a96f72]">stay with you.</em>
            </h1>
            <p className="mx-auto mt-8 max-w-2xl text-base leading-8 text-[#6f5d59] sm:text-lg">
              Every celebration has its own rhythm: a familiar song, a hallway full of voices, a photograph you will keep returning to. LuxeMia is here for the feeling of stepping into those moments with grace, colour, and a little more of home.
            </p>
          </div>
        </section>

        <section className="bg-[#fffaf6] px-5 py-16 sm:px-8 sm:py-20 lg:py-24">
          <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:gap-20">
            <div className="relative order-2 lg:order-1">
              <div className="absolute -bottom-5 -left-5 h-full w-full border border-[#ca9690] sm:-bottom-7 sm:-left-7" aria-hidden="true" />
              <picture className="relative block aspect-[4/5] overflow-hidden bg-[#e7d8d0] shadow-[20px_24px_0_rgba(98,64,68,0.12)]">
                <source srcSet={FEATURED_CATEGORY_PRODUCTS.sarees.imageWebp} type="image/webp" />
                <img
                  src={FEATURED_CATEGORY_PRODUCTS.sarees.image}
                  alt={FEATURED_CATEGORY_PRODUCTS.sarees.alt}
                  width={680}
                  height={850}
                  loading="eager"
                  decoding="async"
                  className="h-full w-full object-cover object-top"
                />
              </picture>
            </div>

            <div className="order-1 max-w-2xl lg:order-2">
              <p className="mb-5 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#a96f72]">
                <span className="h-px w-9 bg-[#a96f72]" />
                Why LuxeMia
              </p>
              <h2 className="font-serif text-4xl leading-[0.96] tracking-[-0.025em] text-[#352629] sm:text-5xl">
                Occasionwear that meets you where life is happening.
              </h2>
              <div className="mt-7 space-y-5 text-base leading-8 text-[#6f5d59] sm:text-lg">
                <p>
                  A saree can bring back the warmth of a mother&rsquo;s wardrobe. A lehenga can turn a long-awaited wedding into the entrance you imagined. A beautifully chosen suit can make a festival dinner feel like a return to something familiar.
                </p>
                <p>
                  LuxeMia was created for those feelings. We celebrate the colour, movement, texture, and ceremony of Indian dressing while making it easier to find a piece that feels right for your own story in the United States.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#3b2a2d] px-5 py-16 text-[#fffaf6] sm:px-8 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-2xl">
              <p className="mb-5 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#f1bbb5]">
                <span className="h-px w-9 bg-[#f1bbb5]" />
                What guides us
              </p>
              <h2 className="font-serif text-4xl leading-[0.96] tracking-[-0.025em] sm:text-5xl">A boutique should feel considered from the first look.</h2>
            </div>
            <div className="mt-12 grid gap-px overflow-hidden border border-white/15 bg-white/15 md:grid-cols-3">
              {values.map((value) => {
                const Icon = value.icon;
                return (
                  <article key={value.title} className="bg-[#443033] p-7 sm:p-9">
                    <Icon className="h-5 w-5 text-[#f1bbb5]" strokeWidth={1.5} />
                    <h3 className="mt-8 font-serif text-2xl">{value.title}</h3>
                    <p className="mt-4 text-sm leading-7 text-[#fffaf6]/72">{value.description}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="bg-[radial-gradient(circle_at_18%_78%,rgba(223,177,170,0.34),transparent_24%),#f7eee8] px-5 py-16 sm:px-8 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#a96f72]">For your next celebration</p>
            <h2 className="mt-5 font-serif text-4xl leading-[0.98] tracking-[-0.025em] text-[#352629] sm:text-5xl">Find the piece that feels like it was waiting for you.</h2>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-[#6f5d59] sm:text-lg">
              Begin with a fresh edit of sarees, lehengas, suits, menswear, and jewelry for the celebrations on your calendar. For selected made-to-measure pieces and custom colour possibilities, begin with our custom options.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-4">
              <Link to="/collections/customizable-indian-outfits" className="group inline-flex items-center gap-3 rounded-full bg-[#3b2a2d] px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#fffaf6] shadow-[0_12px_25px_rgba(59,42,45,0.18)] transition-colors hover:bg-[#a96f72]">
                Discover custom options <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link to="/new-arrivals" className="inline-flex items-center rounded-full border border-[#c99a94] px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#493235] transition-colors hover:bg-[#f3dcd6]">
                Explore new arrivals
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default BrandStory;
