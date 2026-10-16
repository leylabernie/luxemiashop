import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import './DussehraEditorial.css';

/** Original LuxeMia product photographs, shown without garment alterations. */
export default function DussehraEditorial() {
  return (
    <div className="dussehra-editorial">
      <div className="dussehra-editorial__copy">
        <p className="dussehra-editorial__eyebrow">LuxeMia · The festive edit</p>
        <span className="dussehra-editorial__ornament" aria-hidden="true">✧</span>
        <h2>Celebrate<br /><em>Dussehra</em></h2>
        <p className="dussehra-editorial__subline">A celebration of new beginnings.</p>
        <p className="dussehra-editorial__detail">Discover festive lehengas in<br />beautiful colors and intricate detail.</p>
        <Link className="dussehra-editorial__cta" to="/collections/lehengas">Shop festive lehengas <ArrowUpRight size={16} aria-hidden="true" /></Link>
        <p className="dussehra-editorial__note">Shown styled. Explore stitching and sizing options on each product.</p>
      </div>
      <div className="dussehra-editorial__photographs">
        <img src="https://cdn.shopify.com/s/files/1/0746/4707/7035/files/luxemia-405942-1.jpg?v=1792095803&width=800" alt="Ivory organza embroidered lehenga choli with a rose-colored dupatta from LuxeMia" width={800} height={1100} loading="eager" fetchPriority="high" decoding="async" />
        <img src="https://cdn.shopify.com/s/files/1/0746/4707/7035/files/luxemia-405979-1.jpg?v=1792095738&width=800" alt="Coral red silk printed lehenga choli with a colorful dupatta from LuxeMia" width={800} height={1100} loading="eager" decoding="async" />
      </div>
    </div>
  );
}
