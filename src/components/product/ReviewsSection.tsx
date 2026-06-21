import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Star, MessageCircle, Shield, Truck, Lock, CreditCard, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

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

// AGGREGATE RATING SCHEMA — This schema is only rendered when real verified
// data is passed via the `aggregateRating` prop. DO NOT fabricate values.
// Google Merchant Center penalizes stores with unverifiable review counts
// or fabricated testimonials that cannot be verified by an independent
// review platform (Google Customer Reviews, Trustpilot, etc.).
// Real reviews must come from an accredited third party.

const ReviewsSection = ({
  productName,
  productUrl,
  aggregateRating,
  reviews,
}: ReviewsSectionProps) => {
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');

  // Load Google Customer Reviews badge script
  useEffect(() => {
    if (!document.getElementById('gcr-badge-script')) {
      const script = document.createElement('script');
      script.id = 'gcr-badge-script';
      script.src = 'https://apis.google.com/js/platform.js?onload=renderBadge';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  }, []);

  // Only output review schema when real verified data is available
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
        publisher: {
          '@type': 'Organization',
          name: 'Google Customer Reviews',
        },
      }))
    })
  } : null;

  // NOTE: We do NOT add fabricated AggregateRating schema or fake review
  // testimonials here. Google Merchant Center penalizes stores with
  // unverifiable review counts or fabricated testimonials that cannot be
  // verified by an independent review platform (Google Customer Reviews,
  // Trustpilot, etc.). Real reviews must come from an accredited third party.
  // Once Google Customer Reviews or another verified platform is integrated,
  // we will add the corresponding AggregateRating schema with verified data.

  return (
    <section className="py-12 border-t border-border">
      {/* AggregateRating + Review Schema — only rendered with real verified data */}
      {reviewSchema && (
        <Helmet>
          <script type="application/ld+json">
            {JSON.stringify(reviewSchema)}
          </script>
        </Helmet>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-serif mb-2">Customer Reviews</h2>
          <p className="text-sm text-muted-foreground">
            We value our customers' feedback. Verified reviews are collected
            post-purchase through our review program.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const reviewSection = document.getElementById('write-review');
            reviewSection?.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          Write a Review
        </Button>
      </div>

      {/* Google Customer Reviews Badge */}
      <div className="mb-8 p-6 bg-card border border-border rounded-lg">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold">Google Customer Reviews</p>
              <p className="text-xs text-muted-foreground">
                Reviews collected through Google's verified post-purchase program
              </p>
            </div>
          </div>
          {/* Google Customer Reviews Badge — activated with merchant ID */}
          <div
            id="gcr-badge"
            data-merchant-id="5773333098"
            data-badge-class="gcr__badge"
            data-badge-position="INLINE"
          ></div>
          <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-full">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-xs font-medium text-muted-foreground">
              Merchant ID: 5773333098
            </span>
          </div>
        </div>
      </div>

      {/* Reviews Coming Soon — shown when no verified review data is available yet */}
      {!aggregateRating && (
        <div className="mb-8 p-6 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-lg text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <h3 className="text-lg font-serif text-amber-700 dark:text-amber-300">Reviews Coming Soon</h3>
          </div>
          <p className="text-sm text-amber-700/80 dark:text-amber-300/80 max-w-lg mx-auto">
            We're a growing store, and verified customer reviews are on their way! 
            Reviews are collected automatically through <strong>Google Customer Reviews</strong> after 
            purchase — this means every review you see will be from a real, verified buyer. 
            No fake reviews, ever.
          </p>
          <p className="text-xs text-amber-600/60 dark:text-amber-400/60 mt-3">
            After your purchase, you'll receive a survey invitation from Google to share your experience.
          </p>
        </div>
      )}

      {/* Trust Badges - Critical for GMC Misrepresentation compliance */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg">
          <Shield className="h-6 w-6 text-green-600 flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold text-green-700 dark:text-green-400">Verified Store</p>
            <p className="text-xs text-muted-foreground">SSL Secured</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg">
          <Truck className="h-6 w-6 text-green-600 flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold text-green-700 dark:text-green-400">Free Shipping</p>
            <p className="text-xs text-muted-foreground">Orders over $350</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg">
          <Lock className="h-6 w-6 text-green-600 flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold text-green-700 dark:text-green-400">Safe Checkout</p>
            <p className="text-xs text-muted-foreground">256-bit encrypted</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg">
          <CreditCard className="h-6 w-6 text-green-600 flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold text-green-700 dark:text-green-400">Shopify Pay</p>
            <p className="text-xs text-muted-foreground">Secure payments</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg">
          <CheckCircle className="h-6 w-6 text-blue-600 flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold text-blue-700 dark:text-blue-400">Google Verified Reviews</p>
            <p className="text-xs text-muted-foreground">Post-purchase verified</p>
          </div>
        </div>
      </div>

      {/* Write a Review Section */}
      <div id="write-review" className="bg-secondary/30 rounded-lg p-6 sm:p-8 border border-border">
        <h3 className="font-serif text-lg text-foreground mb-1">Share Your Experience</h3>
        <p className="text-sm text-muted-foreground mb-6">
          We'd love to hear about your experience with LuxeMia Boutique. Your honest feedback helps other shoppers
          and helps us improve.
        </p>

        {/* Star Rating Selector (visual only — for future integration) */}
        <div className="mb-4">
          <label className="text-sm font-medium text-foreground block mb-2">Your Rating</label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setSelectedRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-0.5 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary rounded"
                aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
              >
                <Star
                  className={`h-7 w-7 transition-colors ${
                    (hoverRating || selectedRating) >= star
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-border'
                  }`}
                />
              </button>
            ))}
            {selectedRating > 0 && (
              <span className="ml-2 text-sm text-muted-foreground self-center">
                {selectedRating} of 5
              </span>
            )}
          </div>
        </div>

        {/* Review Text Area */}
        <div className="mb-4">
          <label className="text-sm font-medium text-foreground block mb-2">Your Review</label>
          <Textarea
            placeholder="Tell us about your experience with your LuxeMia Boutique purchase..."
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            rows={4}
            className="resize-none"
          />
        </div>

        {/* Verified program note */}
        <div className="flex items-start gap-2 mb-6 p-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg">
          <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground">
            Reviews are collected through our verified post-purchase program. 
            This form is for feedback purposes — to submit an official verified review, 
            please respond to the Google Customer Reviews survey sent after your purchase.
          </p>
        </div>

        {/* Submit / Email fallback */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="default"
            size="sm"
            onClick={() => {
              const subject = encodeURIComponent('Product Review' + (selectedRating > 0 ? ` — ${selectedRating}/5 Stars` : ''));
              const body = encodeURIComponent(reviewText || '');
              window.location.href = `mailto:hello@luxemia.shop?subject=${subject}&body=${body}`;
            }}
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Share Your Experience
          </Button>
          <p className="text-xs text-muted-foreground self-center">
            Your review will be sent to our team via email.
          </p>
        </div>
      </div>
    </section>
  );
};

export default ReviewsSection;
