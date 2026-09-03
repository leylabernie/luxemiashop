import { Button } from '@/components/ui/button';

interface CatalogLoadErrorProps {
  retryHref: string;
  className?: string;
}

const CatalogLoadError = ({ retryHref, className = '' }: CatalogLoadErrorProps) => (
  <div
    className={`rounded-sm border border-destructive/30 bg-destructive/5 p-8 text-center ${className}`.trim()}
    role="alert"
  >
    <h2 className="font-serif text-xl">Current inventory could not be loaded</h2>
    <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
      Product availability is temporarily unavailable. Try this page again, or contact LuxeMia before relying on a specific option.
    </p>
    <Button asChild className="mt-5" variant="outline">
      <a href={retryHref}>Try again</a>
    </Button>
  </div>
);

export default CatalogLoadError;
