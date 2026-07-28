import { Helmet } from 'react-helmet-async';

interface ReviewsSectionProps {
  productName?: string;
  productUrl?: string;
  aggregateRating?: {
    ratingValue: string;
    reviewCount: string;
    bestRating?: string;
  };
  reviews?: Array<{
    author: string;
    datePublished: string;
    reviewBody: string;
    ratingValue: string;
  }>;
}

const ReviewsSection = ({
  productName,
  productUrl,
  aggregateRating,
  reviews,
}: ReviewsSectionProps) => {
  const hasReviews = Boolean(aggregateRating || (reviews && reviews.length > 0));

  // TODO(owner): connect a review platform, or remove this component
  if (!hasReviews) return null;

  const reviewSchema = aggregateRating ? {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: productName,
    url: productUrl,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: aggregateRating.ratingValue,
      reviewCount: aggregateRating.reviewCount,
      bestRating: aggregateRating.bestRating || '5',
    },
    ...(reviews && reviews.length > 0 && {
      review: reviews.map(r => ({
        '@type': 'Review',
        author: { '@type': 'Person', name: r.author },
        datePublished: r.datePublished,
        reviewBody: r.reviewBody,
        reviewRating: {
          '@type': 'Rating',
          ratingValue: r.ratingValue,
          bestRating: '5',
        },
      })),
    }),
  } : null;

  return (
    <section className="py-12 border-t border-border">
      {reviewSchema && (
        <Helmet>
          <script type="application/ld+json">
            {JSON.stringify(reviewSchema)}
          </script>
        </Helmet>
      )}

      <div className="mb-6">
        <h2 className="text-2xl font-serif mb-2">Customer Reviews</h2>
        {aggregateRating && (
          <p className="text-sm text-muted-foreground">
            Rated {aggregateRating.ratingValue} out of {aggregateRating.bestRating || '5'} from {aggregateRating.reviewCount} verified reviews.
          </p>
        )}
      </div>

      {reviews && reviews.length > 0 && (
        <div className="space-y-4">
          {reviews.map((review, index) => (
            <article key={`${review.author}-${index}`} className="p-4 bg-card border border-border rounded-lg">
              <div className="flex items-center justify-between gap-4 mb-2">
                <h3 className="font-medium text-sm">{review.author}</h3>
                <p className="text-xs text-muted-foreground">{review.datePublished}</p>
              </div>
              <p className="text-xs text-muted-foreground mb-2">Rating: {review.ratingValue}/5</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{review.reviewBody}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default ReviewsSection;
