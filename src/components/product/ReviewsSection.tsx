import { Star, MessageCircle, Shield, Truck, Lock, CreditCard, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ReviewsSection = () => {
  // NOTE: We do NOT add fabricated AggregateRating schema or fake review
  // testimonials here. Google Merchant Center penalizes stores with
  // unverifiable review counts or fabricated testimonials that cannot be
  // verified by an independent review platform (Google Customer Reviews,
  // Trustpilot, etc.). Real reviews must come from an accredited third party.
  // Once Google Customer Reviews or another verified platform is integrated,
  // we will add the corresponding AggregateRating schema with verified data.

  return (
    <section className="py-12 border-t border-border">
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
      </div>

      {/* Review CTA — honest, no fake testimonials */}
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
          and helps us improve. Share your thoughts after receiving your order!
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
