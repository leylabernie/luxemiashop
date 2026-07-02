import { CategoryListing } from '@/components/collections/CategoryListing';
import { getCategoryConfig } from '@/config/categoryConfig';

const config = getCategoryConfig('jewelry')!;

const Jewelry = () => <CategoryListing config={config} />;

export default Jewelry;
