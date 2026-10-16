import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import './NewArrivalsEditorial.css';

/** Original LuxeMia product photographs; no garment retouching or generated imagery. */
const photographs = [
  { src: 'https://cdn.shopify.com/s/files/1/0746/4707/7035/files/luxemia-406052-1.jpg?v=1792095199&width=800', alt: 'Teal and ivory embroidered silk lehenga choli from LuxeMia' },
  { src: 'https://cdn.shopify.com/s/files/1/0746/4707/7035/files/luxemia-406051-1.jpg?v=1792095304&width=800', alt: 'Purple and ivory embroidered silk lehenga choli from LuxeMia' },
];

export default function NewArrivalsEditorial({ pageHero = false }: { pageHero?: boolean }) {
  const Heading = pageHero ? 'h1' : 'h2';
  return (
    <div className="arrivals-editorial">
      <div className="arrivals-editorial__copy">
        <p className="arrivals-editorial__eyebrow">LuxeMia · The latest edit</p>
        <Heading>New Arrivals</Heading>
        <p className="arrivals-editorial__subline">A new season. <br />An unforgettable entrance.</p>
        <p className="arrivals-editorial__detail">Discover embroidered lehengas<br />for your next celebration.</p>
        {pageHero ? <a className="arrivals-editorial__cta" href="#new-arrivals-products">Explore the collection <ArrowUpRight size={16} aria-hidden="true" /></a> : <Link className="arrivals-editorial__cta" to="/new-arrivals">Shop new arrivals <ArrowUpRight size={16} aria-hidden="true" /></Link>}
        <p className="arrivals-editorial__note">Shown styled. Stitching and sizing options on each product.</p>
      </div>
      <div className="arrivals-editorial__photographs">
        {photographs.map(photo => <img key={photo.src} src={photo.src} alt={photo.alt} width={800} height={1100} decoding="async" loading="eager" />)}
      </div>
    </div>
  );
}
