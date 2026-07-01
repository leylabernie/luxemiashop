import { CategoryListing } from '@/components/collections/CategoryListing';
import { getCategoryConfig } from '@/config/categoryConfig';

const config = getCategoryConfig('sarees')!;

const Sarees = () => <CategoryListing config={config} />;

export default Sarees;
