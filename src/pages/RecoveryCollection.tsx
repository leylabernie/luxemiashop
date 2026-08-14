import { CategoryListing } from '@/components/collections/CategoryListing';
import {
  getRecoveryCollectionConfig,
  type RecoveryCollectionHandle,
} from '@/config/recoveryCollectionConfig';

interface RecoveryCollectionProps {
  handle: RecoveryCollectionHandle;
}

const RecoveryCollection = ({ handle }: RecoveryCollectionProps) => (
  <CategoryListing config={getRecoveryCollectionConfig(handle)} />
);

export default RecoveryCollection;
