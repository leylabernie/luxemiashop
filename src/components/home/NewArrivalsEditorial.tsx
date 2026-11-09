import { Link } from 'react-router-dom';
import './NewArrivalsEditorial.css';

/** Current product photograph, unchanged; styling is not a promise of included pieces. */
export default function NewArrivalsEditorial({ pageHero = false }: { pageHero?: boolean }) {
  const Heading = pageHero ? 'h1' : 'h2';
  return <div className="arrivals-editorial">
    <div className="arrivals-editorial__copy">
      <p className="arrivals-editorial__eyebrow">LuxeMia · The latest edit</p>
      <Heading>New Arrivals</Heading>
      <p>Discover current Indian wedding and celebration styles. Review each listing for included pieces, sizing and delivery estimates.</p>
      {pageHero
        ? <a className="arrivals-editorial__cta" href="#new-arrivals-products">Explore the collection</a>
        : <Link className="arrivals-editorial__cta" to="/new-arrivals">Explore the collection</Link>}
      <p className="arrivals-editorial__note">Featured: unstitched grey georgette lehenga choli. Tailoring is required before wear.</p>
    </div>
    <Link className="arrivals-editorial__photo" to="/product/grey-georgette-embroidered-wedding-lehenga-choli" aria-label="View the featured unstitched grey georgette lehenga choli">
      <img src="https://cdn.shopify.com/s/files/1/0746/4707/7035/files/Grey-Georgette-Wedding-Wear-Embroidery-Work-Lehenga-Choli-4797-321-B_1.jpg?v=1793569611" alt="Grey embroidered lehenga with pink blouse and drape, shown on a model. Listing supplies unstitched material with dupatta." width={800} height={1100} decoding="async" loading="eager" fetchPriority="high" />
    </Link>
  </div>;
}
