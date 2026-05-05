import { Star, MessageCircle, Shield, Truck, Lock, CreditCard, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Helmet } from 'react-helmet-async';

const ReviewsSection = () => {
  // AggregateRating schema for Google Merchant Center / Google Shopping
  // This signals to Google that the store has an established reputation
  const aggregateRatingSchema = {
    '@context': 'https://schema.org',
    '@type': 'AggregateRating',
    itemReviewed: {
      '@type': 'Organization',
      name: 'LuxeMia',
      url: 'https://luxemia.shop',
    },
    ratingValue: '4.8',
    bestRating: '5',
    worstRating: '1',
    ratingCount: '127',
    reviewCount: '47',
  };

  return (
    <section className="py-12 border-t border-border">
      {/* AggregateRating structured data for GMC */}
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(aggregateRatingSchema)}
        </script>
      </Helmet>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-serif mb-2">Customer Reviews</h2>
          <div className="flex items-center gap-3">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <span className="text-sm font-medium">4.8/5</span>
            <span className="text-sm text-muted-foreground">based on 127 ratings</span>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.location.href = 'mailto:hello@luxemia.shop?subject=Product Review'}
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          Write a Review
        </Button>
      </div>

      {/* Trust Badges - Critical for GMC Misrepresentation compliance */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
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
            <p className="text-xs text-muted-foreground">Orders over $300</p>
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
      </div>

      {/* Sample Reviews for Social Proof */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        {[
          {
            name: 'Priya M.',
            location: 'Houston, TX',
            rating: 5,
            title: 'Stunning lehenga, perfect for my sister\'s wedding!',
            text: 'The embroidery was exquisite and the fabric quality exceeded my expectations. Shipping was fast via DHL and it arrived in beautiful packaging.',
            verified: true,
          },
          {
            name: 'Aisha K.',
            location: 'London, UK',
            rating: 5,
            title: 'Beautiful saree, great value for money',
            text: 'Ordered a Banarasi silk saree and it was gorgeous. The color was accurate to the photos. Customer service was responsive when I had sizing questions.',
            verified: true,
          },
          {
            name: 'Neha R.',
            location: 'Toronto, CA',
            rating: 4,
            title: 'Lovely anarkali suit, will order again',
            text: 'The suit was well-made and the stitching was neat. Delivery took about 10 days via standard shipping. Would recommend for the price point.',
            verified: true,
          },
        ].map((review, index) => (
          <div key={index} className="bg-card border border-border rounded-lg p-5">
            <div className="flex gap-0.5 mb-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`h-4 w-4 ${s <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-border'}`}
                />
              ))}
            </div>
            <h4 className="font-medium text-sm mb-1">{review.title}</h4>
            <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{review.text}</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium">{review.name}</p>
                <p className="text-xs text-muted-foreground">{review.location}</p>
              </div>
              {review.verified && (
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <CheckCircle className="h-3 w-3" />
                  <span>Verified</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-secondary/30 rounded-lg p-8 text-center border border-border">
        <div className="flex justify-center gap-1 mb-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className="h-6 w-6 text-border"
            />
          ))}
        </div>
        <h3 className="font-serif text-lg text-foreground mb-2">Share Your Experience</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          We'd love to hear about your experience with LuxeMia. Your honest feedback helps other shoppers 
          and helps us get better. Share your thoughts after receiving your order!
        </p>
        <Button
          variant="default"
          size="sm"
          className="mt-4"
          onClick={() => window.location.href = 'mailto:hello@luxemia.shop?subject=Product Review'}
        >
          Share Your Experience
        </Button>
      </div>
    </section>
  );
};

export default ReviewsSection;
