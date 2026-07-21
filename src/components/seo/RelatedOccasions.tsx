import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface RelatedOccasionsProps {
  currentOccasion: string;
}

const OCCASIONS = [
  { slug: 'haldi', label: 'Haldi Ceremony', path: '/collections/haldi-outfits' },
  { slug: 'mehendi', label: 'Mehendi Ceremony', path: '/collections/mehendi-outfits' },
  { slug: 'wedding-guest', label: 'Wedding Guest', path: '/collections/wedding-guest-outfits' },
  { slug: 'diwali', label: 'Diwali', path: '/collections/diwali-outfits' },
  { slug: 'eid', label: 'Eid', path: '/collections/eid-outfits' },
  { slug: 'navratri', label: 'Navratri', path: '/collections/navratri-outfits' },
];

export const RelatedOccasions = ({ currentOccasion }: RelatedOccasionsProps) => {
  const currentIndex = OCCASIONS.findIndex(o => o.slug === currentOccasion);
  if (currentIndex === -1) return null;

  const previous = currentIndex > 0 ? OCCASIONS[currentIndex - 1] : null;
  const next = currentIndex < OCCASIONS.length - 1 ? OCCASIONS[currentIndex + 1] : null;

  const related = OCCASIONS.filter(o => o.slug !== currentOccasion);

  return (
    <section className="border-t border-border bg-card/30 py-14">
      <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
        <h2 className="font-serif text-2xl mb-8 text-center">Related Occasions</h2>

        {/* Next / Previous navigation */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {previous && (
            <Link
              to={previous.path}
              className="group flex items-center gap-2 px-5 py-3 border border-border rounded-lg hover:border-primary/50 transition-colors bg-background"
            >
              <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                &larr; {previous.label}
              </span>
            </Link>
          )}
          {next && (
            <Link
              to={next.path}
              className="group flex items-center gap-2 px-5 py-3 border border-border rounded-lg hover:border-primary/50 transition-colors bg-background"
            >
              <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                {next.label} <ArrowRight className="inline w-4 h-4" />
              </span>
            </Link>
          )}
        </div>

        {/* Full list of related occasions */}
        <div className="grid sm:grid-cols-2 gap-3">
          {related.map(occasion => (
            <Link
              key={occasion.slug}
              to={occasion.path}
              className="group flex items-center justify-between p-4 border border-border rounded-lg hover:border-primary/50 hover:bg-background transition-all"
            >
              <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                {occasion.label} Outfits
              </span>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RelatedOccasions;
