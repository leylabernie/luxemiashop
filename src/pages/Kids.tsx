import { CategoryListing } from '@/components/collections/CategoryListing';
import { getCategoryConfig } from '@/config/categoryConfig';

const config = getCategoryConfig('kids')!;

const Kids = () => <CategoryListing config={config} />;

export default Kids;
