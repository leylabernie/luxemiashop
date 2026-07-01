import { CategoryListing } from '@/components/collections/CategoryListing';
import { getCategoryConfig } from '@/config/categoryConfig';

const config = getCategoryConfig('menswear')!;

const Menswear = () => <CategoryListing config={config} />;

export default Menswear;
