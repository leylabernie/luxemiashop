import { Link } from 'react-router-dom';
import './NewArrivalsEditorial.css';

/** Original campaign artwork; the model photograph and garment are unretouched. */
export default function NewArrivalsEditorial({ pageHero = false }: { pageHero?: boolean }) {
  const Heading = pageHero ? 'h1' : 'h2';
  const artwork = <>
    <Heading className="sr-only">New Arrivals</Heading>
    <picture>
      <source media="(min-width: 640px)" srcSet="/images/campaigns/luxemia-new-arrivals-2026-desktop.webp" type="image/webp" />
      <source media="(min-width: 640px)" srcSet="/images/campaigns/luxemia-new-arrivals-2026-desktop.jpg" type="image/jpeg" />
      <source srcSet="/images/campaigns/luxemia-new-arrivals-2026-mobile.webp" type="image/webp" />
      <img
        src="/images/campaigns/luxemia-new-arrivals-2026-mobile.jpg"
        alt="New Arrivals — New looks. Luminous celebrations. Explore the collection. Model in a magenta floral-embroidered velvet suit with ivory and plum festive artwork."
        width={1080} height={1620} decoding="async" loading="eager" fetchPriority="high"
      />
    </picture>
  </>;
  return (
    <div className="arrivals-editorial">
      {pageHero
        ? <a href="#new-arrivals-products" aria-label="New Arrivals — Explore the collection">{artwork}</a>
        : <Link to="/new-arrivals" aria-label="New Arrivals — Explore the collection">{artwork}</Link>}
    </div>
  );
}
