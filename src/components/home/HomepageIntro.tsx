import { Link } from 'react-router-dom';
import { ArrowRight, Heart, Sparkles, Truck } from 'lucide-react';
import { HOMEPAGE_HEADLINE, HOMEPAGE_VALUE_PROPOSITION, HOMEPAGE_TRUST_ITEMS, HOMEPAGE_WEDDING_COPY, HOMEPAGE_WEDDING_LINK } from '@/lib/homepageValueProposition';

export default function HomepageIntro() {
  const icons = [Sparkles, Truck, Heart];
  return <>
    <section aria-labelledby="homepage-heading" className="bg-[#f8f0e8] px-5 py-12 text-center sm:px-8 sm:py-16">
      <div className="mx-auto max-w-4xl">
        <h1 id="homepage-heading" className="font-serif text-4xl leading-tight text-[#291f20] sm:text-5xl lg:text-6xl">{HOMEPAGE_HEADLINE}</h1>
        <p className="mx-auto mt-6 max-w-3xl text-base leading-7 text-[#665a59] sm:text-lg">{HOMEPAGE_VALUE_PROPOSITION}</p>
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row sm:flex-wrap">
          <Link to="/collections/wedding-guest-outfits" className="inline-flex items-center gap-2 rounded-full bg-[#3b2a2d] px-6 py-4 text-sm font-semibold text-white hover:bg-[#624044]">Shop Wedding Guest Outfits <ArrowRight className="h-4 w-4" /></Link>
          <Link to="/wedding-party-orders" className="rounded-full border border-[#a96f72] px-6 py-4 text-sm font-semibold text-[#4a3738] hover:bg-white">Custom Group &amp; Bridal Party Orders</Link>
        </div>
      </div>
    </section>
    <section aria-label="LuxeMia shopping promises" className="bg-[#3b2a2d] text-[#fff9f4]">
      <div className="mx-auto grid max-w-7xl divide-y divide-white/15 px-5 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:px-8">
        {HOMEPAGE_TRUST_ITEMS.map((item, i) => {
          const Icon = icons[i];
          return <div key={item.title} className="px-4 py-7 text-center sm:px-6">
            <Icon className="mx-auto mb-3 h-5 w-5 text-[#e7afad]" aria-hidden="true" />
            <h2 className="font-serif text-xl">{item.title}</h2>
            <p className="mt-3 text-sm leading-6 text-white/85">{item.body}</p>
          </div>;
        })}
      </div>
    </section>
    <aside aria-label="Destination wedding coordination" className="border-b border-[#eaded6] bg-[#fffaf6] px-5 py-6 text-center">
      <p className="mx-auto max-w-4xl text-sm leading-7 text-[#665a59]">{HOMEPAGE_WEDDING_COPY}</p>
      <a href={HOMEPAGE_WEDDING_LINK} className="mt-2 inline-block text-sm font-semibold text-[#4a3738] underline underline-offset-4">Explore CeremonyVerse India Wedding Sourcing</a>
    </aside>
  </>;
}
