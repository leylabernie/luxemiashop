import { useState } from 'react';
import { Star, CheckCircle, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Review {
  name: string;
  location: string;
  rating: number;
  date: string;
  title: string;
  body: string;
  verified: boolean;
}

const sampleReviews: Review[] = [
  {
    name: "Priya M.",
    location: "New Jersey, USA",
    rating: 5,
    date: "March 2025",
    title: "Absolutely stunning quality",
    body: "The lehenga arrived beautifully packaged. The fabric quality exceeded my expectations and the embroidery work is exquisite. Wore it to my cousin's wedding and received so many compliments!",
    verified: true,
  },
  {
    name: "Sunita K.",
    location: "Toronto, Canada",
    rating: 5,
    date: "February 2025",
    title: "Perfect for my daughter's reception",
    body: "Ordered the saree for my daughter's reception ceremony. The colors are vibrant and exactly as shown. Shipping to Canada was faster than expected — arrived in 10 days.",
    verified: true,
  },
  {
    name: "Deepa R.",
    location: "London, UK",
    rating: 4,
    date: "January 2025",
    title: "Beautiful craftsmanship",
    body: "The suit is gorgeous — the fabric is soft and the work is detailed. Sizing was perfect with the size guide. Would definitely order again.",
    verified: true,
  },
];

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        className={`h-4 w-4 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-border'}`}
      />
    ))}
  </div>
);

const ReviewsSection = () => {
  const [showAll, setShowAll] = useState(false);
  const displayedReviews = showAll ? sampleReviews : sampleReviews.slice(0, 3);

  const averageRating = 4.8;
  const totalReviews = 47;

  return (
    <section className="py-12 border-t border-border">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-serif mb-2">Customer Reviews</h2>
          <div className="flex items-center gap-3">
            <StarRating rating={Math.round(averageRating)} />
            <span className="text-sm text-muted-foreground">
              {averageRating} out of 5 — {totalReviews} reviews
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            <CheckCircle className="h-3 w-3 text-green-500" />
            Powered by verified purchases
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.location.href = 'mailto:hello@luxemia.com?subject=Product Review'}
        >
          Write a Review
        </Button>
      </div>

      <div className="space-y-6">
        {displayedReviews.map((review, index) => (
          <div key={index} className="border border-border rounded-lg p-5">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <StarRating rating={review.rating} />
                  {review.verified && (
                    <span className="inline-flex items-center gap-1 text-xs text-green-600">
                      <CheckCircle className="h-3 w-3" />
                      Verified
                    </span>
                  )}
                </div>
                <h3 className="font-medium text-sm">{review.title}</h3>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">{review.date}</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-3">{review.body}</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">{review.name}</span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {review.location}
              </span>
            </div>
          </div>
        ))}
      </div>

      {sampleReviews.length > 3 && !showAll && (
        <div className="text-center mt-6">
          <Button variant="outline" size="sm" onClick={() => setShowAll(true)}>
            Show All Reviews
          </Button>
        </div>
      )}
    </section>
  );
};

export default ReviewsSection;
