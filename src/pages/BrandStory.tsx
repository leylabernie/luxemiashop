import { Phone, Mail, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/seo/SEOHead';

const BrandStory = () => {
  return (
    <div className="min-h-screen bg-[#fffaf6] text-[#352629]">
      <SEOHead
        title="Our Story — Mini, Founder of LuxeMia"
        description="Hi, I'm Mini. I grew up in Gujarat, married into a Surat textile family, and started LuxeMia after outfitting two of my own sons' weddings. Read why I built this store."
        canonical="https://luxemia.shop/brand-story"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Our Story', url: '/brand-story' },
        ]}
      />
      <Header />

      <main className="pt-[88px] lg:pt-[124px]">
        {/* Hero — Mini's intro */}
        <section className="relative overflow-hidden bg-[radial-gradient(circle_at_11%_18%,rgba(229,185,179,0.44),transparent_29%),radial-gradient(circle_at_87%_79%,rgba(229,204,165,0.42),transparent_26%),#f7eee8] px-5 py-20 sm:px-8 sm:py-24 lg:py-32">
          <div className="mx-auto max-w-4xl text-center">
            <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#a96f72]">Hi, I&rsquo;m Mini</p>
            <h1 className="font-serif text-[clamp(3rem,7.5vw,6.5rem)] leading-[0.95] tracking-[-0.045em] text-[#352629]">
              I started this store because <em className="font-normal text-[#a96f72]">my friends kept asking me to shop for them.</em>
            </h1>
            <p className="mx-auto mt-8 max-w-2xl text-base leading-8 text-[#6f5d59] sm:text-lg">
              I&rsquo;m Bhamini &mdash; everyone calls me Mini. I grew up in Gujarat, married into a Surat textile family, and spent thirty years in America dressing up for every wedding and festival on the calendar. LuxeMia is the store I wished I had when my sons got married. This is the honest story of how it started.
            </p>
          </div>
        </section>

        {/* The full story — Mini's voice */}
        <section className="bg-[#fffaf6] px-5 py-16 sm:px-8 sm:py-20 lg:py-24">
          <div className="mx-auto grid max-w-7xl items-start gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:gap-20">
            {/* Photo column — REPLACE with Mini's real photo */}
            <div className="relative order-2 lg:order-1 lg:sticky lg:top-32">
              <div className="absolute -bottom-5 -left-5 h-full w-full border border-[#ca9690] sm:-bottom-7 sm:-left-7" aria-hidden="true" />
              <picture className="relative block aspect-[4/5] overflow-hidden bg-[#e7d8d0] shadow-[20px_24px_0_rgba(98,64,68,0.12)]">
                {/*
                  OWNER: Replace the image below with a real photo of Mini.
                  Phone selfie is fine. Head and shoulders, natural light, no filter.
                  Upload to /public/images/founder/mini-portrait.jpg (and .webp)
                  Then change the srcSet and src to:
                    srcSet="/images/founder/mini-portrait.webp"
                    src="/images/founder/mini-portrait.jpg"
                  alt="Mini, founder of LuxeMia"
                */}
                <img
                  src="/images/lookbook/chapter-1-dawn.jpg"
                  alt="Mini, founder of LuxeMia, in her Philadelphia studio"
                  width={680}
                  height={850}
                  loading="eager"
                  decoding="async"
                  className="h-full w-full object-cover object-top"
                />
              </picture>
              <p className="relative mt-6 text-center text-sm italic text-[#6f5d59]">
                &mdash; Mini, Founder of LuxeMia<br />Philadelphia, USA
              </p>
            </div>

            {/* Story text column */}
            <div className="order-1 max-w-2xl lg:order-2">
              <p className="mb-5 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#a96f72]">
                <span className="h-px w-9 bg-[#a96f72]" />
                Why LuxeMia
              </p>
              <h2 className="font-serif text-4xl leading-[0.96] tracking-[-0.025em] text-[#352629] sm:text-5xl">
                How this really started.
              </h2>
              <div className="mt-7 space-y-5 text-base leading-8 text-[#6f5d59] sm:text-lg">
                <p>
                  I grew up in Gujarat, in love with dressing up. Every wedding, every festival, every family function &mdash; I was the one paying attention to what people wore, how the fabric felt, what made one saree different from the next. It was just a hobby then.
                </p>
                <p>
                  When I got married, I moved into a family from Surat &mdash; a city known across India for its textile trade. My in-laws have been in the textile business for decades. The fabrics I loved as a girl weren&rsquo;t a hobby anymore. They were the family livelihood.
                </p>
                <p>
                  We came to America. Thirty years passed. I raised a family, lived the normal NRI life, and kept dressing up. Kept paying attention.
                </p>
                <p>
                  Then my son got married.
                </p>
                <p>
                  We went back to India to shop, and this time I saw the trip through the bride and groom&rsquo;s eyes. They had very specific demands &mdash; certain colors they wanted, certain styles, and a fixed budget. Nothing in the standard U.S. Indian boutiques was right. Everything in India was either too traditional, too expensive, or too custom to ship.
                </p>
                <p>
                  So we built it ourselves. I went to Kanchipuram for pure silk sarees for my son&rsquo;s wedding. I went to Banaras for my niece. I went to Bombay for bridal jewelry. I walked through Vadodara and Ahmedabad for ready-made outfits, and the pieces that weren&rsquo;t ready-made, I bought the fabric, had it dyed, and got it custom-stitched through my family&rsquo;s manufacturing connections.
                </p>
                <p>
                  It happened again when my second son got married &mdash; this time in Mexico. Same trip, same sourcing, same challenge.
                </p>
                <p>
                  After both weddings, my sons and daughters-in-law started telling their friends about it. Their friends were getting married, going to weddings, and they kept asking the same question: <em className="text-[#352629]">can Mini help us shop too?</em>
                </p>
                <p>
                  So I started helping. Friend after friend, family after family. And after a while, I started hearing the same stories over and over.
                </p>
                <p>
                  They told me about ordering online and being disappointed &mdash; what showed up at the door was nothing like the photos. They told me about emailing customer service and getting no reply for days, or getting a reply in broken English from someone who had never touched a saree. They told me about the language barrier &mdash; trying to explain in English what they wanted, to a seller who only spoke Hindi or Tamil, and ending up with the wrong thing.
                </p>
                <p>
                  I kept thinking: <em className="text-[#352629]">I can do this better. I know the fabrics. I know the families in Surat. I speak the language. And I&rsquo;m right here in the U.S.</em>
                </p>
                <p>
                  That&rsquo;s why LuxeMia exists.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* What Mini promises — replaces the generic "values" section */}
        <section className="bg-[#3b2a2d] px-5 py-16 text-[#fffaf6] sm:px-8 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-2xl">
              <p className="mb-5 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#f1bbb5]">
                <span className="h-px w-9 bg-[#f1bbb5]" />
                What I promise you
              </p>
              <h2 className="font-serif text-4xl leading-[0.96] tracking-[-0.025em] sm:text-5xl">
                You get me. Not a chatbot. Not a call center.
              </h2>
              <p className="mt-6 text-base leading-8 text-[#fffaf6]/80 sm:text-lg">
                I source through my own family connections in Surat, Kanchipuram, Banaras, and Gujarat. I don&rsquo;t carry everything &mdash; I carry what I would put my own family in. And when you have a question, you get me, on the phone, in English, Hindi, or Gujarati &mdash; whatever is easier for you.
              </p>
            </div>
            <div className="mt-12 grid gap-px overflow-hidden border border-white/15 bg-white/15 md:grid-cols-3">
              <article className="bg-[#443033] p-7 sm:p-9">
                <h3 className="font-serif text-2xl">Real fabrics, sourced by name</h3>
                <p className="mt-4 text-sm leading-7 text-[#fffaf6]/72">My in-laws have been in the Surat textile trade for decades. The Kanchipuram silks come from Kanchipuram. The Banarasi sarees come from Banaras. I won&rsquo;t carry a fabric I can&rsquo;t name for you.</p>
              </article>
              <article className="bg-[#443033] p-7 sm:p-9">
                <h3 className="font-serif text-2xl">No photo surprises</h3>
                <p className="mt-4 text-sm leading-7 text-[#fffaf6]/72">If you&rsquo;ve ever ordered online and had a totally different outfit show up, I understand &mdash; it happened to my friends too many times. Email me for real photos, real measurements, and real fit notes before you buy.</p>
              </article>
              <article className="bg-[#443033] p-7 sm:p-9">
                <h3 className="font-serif text-2xl">Call me in your language</h3>
                <p className="mt-4 text-sm leading-7 text-[#fffaf6]/72">English, Hindi, or Gujarati. If explaining what you want in English is hard, call me and we&rsquo;ll talk it through. I answer the phone myself during business hours.</p>
              </article>
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="bg-[radial-gradient(circle_at_18%_78%,rgba(223,177,170,0.34),transparent_24%),#f7eee8] px-5 py-16 sm:px-8 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#a96f72]">Talk to Mini directly</p>
            <h2 className="mt-5 font-serif text-4xl leading-[0.98] tracking-[-0.025em] text-[#352629] sm:text-5xl">
              Have a question about a product, a fit, or an occasion?
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-[#6f5d59] sm:text-lg">
              Email me or call me. I read every email and I answer the phone myself. Whether it&rsquo;s your daughter&rsquo;s wedding, your niece&rsquo;s, or your best friend&rsquo;s &mdash; tell me what you&rsquo;re looking for and I&rsquo;ll tell you honestly whether we have the right piece.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-4">
              <a
                href="tel:+12153419990"
                className="group inline-flex items-center gap-3 rounded-full bg-[#3b2a2d] px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#fffaf6] shadow-[0_12px_25px_rgba(59,42,45,0.18)] transition-colors hover:bg-[#a96f72]"
              >
                <Phone className="h-4 w-4" /> Call +1-215-341-9990
              </a>
              <a
                href="mailto:hello@luxemia.shop"
                className="inline-flex items-center gap-3 rounded-full border border-[#c99a94] px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#493235] transition-colors hover:bg-[#f3dcd6]"
              >
                <Mail className="h-4 w-4" /> hello@luxemia.shop
              </a>
              <Link
                to="/contact"
                className="inline-flex items-center gap-3 rounded-full border border-[#c99a94] px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#493235] transition-colors hover:bg-[#f3dcd6]"
              >
                <MessageCircle className="h-4 w-4" /> Send a message
              </Link>
            </div>
            <p className="mt-8 text-sm text-[#6f5d59]">
              Business hours: Mon&ndash;Sat 10&ndash;7 EST, Sun 11&ndash;5 EST
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default BrandStory;
