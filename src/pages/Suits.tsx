import { CategoryListing } from '@/components/collections/CategoryListing';
import { getCategoryConfig } from '@/config/categoryConfig';

const config = getCategoryConfig('suits')!;

const Suits = () => <CategoryListing config={config} />;

export default Suits;
