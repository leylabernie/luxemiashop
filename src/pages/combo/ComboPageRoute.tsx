import ComboPage from '@/components/combo/ComboPage';
import { comboPages } from '@/data/comboPages';

/**
 * Dynamic combo page wrapper.
 * Each route /:slug maps to a ComboPage config from comboPages.ts.
 *
 * Routes are explicitly defined in App.tsx for SEO/prerendering clarity.
 * This component looks up the config by slug.
 */

interface ComboPageRouteProps {
  slug: string;
}

const ComboPageRoute = ({ slug }: ComboPageRouteProps) => {
  const config = comboPages.find(p => p.slug === slug);

  if (!config) {
    // Fallback — should never happen if routes are configured correctly
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Collection not found.</p>
      </div>
    );
  }

  return <ComboPage config={config} />;
};

export default ComboPageRoute;
