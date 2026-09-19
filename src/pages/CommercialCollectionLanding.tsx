import { CategoryListing } from '@/components/collections/CategoryListing';
import {
  getCommercialLandingConfig,
  getCommercialLandingSubcategory,
  type CommercialLandingSlug,
} from '@/config/commercialLandingPages';

interface CommercialCollectionLandingProps {
  landing: CommercialLandingSlug;
}

const CommercialCollectionLanding = ({ landing }: CommercialCollectionLandingProps) => {
  const config = getCommercialLandingConfig(landing);
  const defaultSubcategory = getCommercialLandingSubcategory(landing);

  return <CategoryListing config={config} defaultSubcategory={defaultSubcategory} />;
};

export default CommercialCollectionLanding;
