import { CategoryListing } from '@/components/collections/CategoryListing';
import { getCategoryConfig } from '@/config/categoryConfig';

const config = getCategoryConfig('lehengas')!;

const Lehengas = () => <CategoryListing config={config} />;

export default Lehengas;
