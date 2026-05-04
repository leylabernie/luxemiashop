import { Star, ShieldCheck, Award, Truck, Clock, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const ReviewsSection = () => {
  return (
    <section className="py-12 border-t border-border">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-serif mb-2">Customer Reviews</h2>
          <p className="text-sm text-muted-foreground">
            We're a new store and we're building our reputation one order at a time.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.location.href = 'mailto:hello@luxemia.com?subject=Product Review'}
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          Write a Review
        </Button>
      </div>

      {/* Trust & Transparency Section - GMC Compliance */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <div className="flex items-start gap-3 p-4 bg-card border border-border/50 rounded-lg">
          <ShieldCheck className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium mb-1">Verified Business</h4>
            <p className="text-xs text-muted-foreground">
              LuxeMia Fashion Inc. is a registered business in Philadelphia, PA. 
              We operate transparently with verified contact information.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-4 bg-card border border-border/50 rounded-lg">
          <Award className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium mb-1">Quality Inspected</h4>
            <p className="text-xs text-muted-foreground">
              Every item undergoes quality inspection before dispatch from our facility in India. 
              We check stitching, fabric, and embellishments.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-4 bg-card border border-border/50 rounded-lg">
          <Truck className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium mb-1">Insured Shipping</h4>
            <p className="text-xs text-muted-foreground">
              All shipments are fully insured via DHL Express, USPS, or UPS with tracking 
              from dispatch to your door.
            </p>
          </div>
        </div>
      </div>

      {/* Review Prompt */}
      <div className="bg-secondary/30 rounded-lg p-8 text-center border border-border">
        <div className="flex justify-center gap-1 mb-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className="h-6 w-6 text-border"
            />
          ))}
        </div>
        <h3 className="font-serif text-lg text-foreground mb-2">Be One of Our First Reviewers</h3>
        <p className="text-muted-foreground max-w-md mx-auto mb-4">
          We'd love to hear about your experience with LuxeMia. Your honest feedback helps other shoppers 
          and helps us get better. Share your thoughts after receiving your order!
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <Button
            variant="default"
            size="sm"
            onClick={() => window.location.href = 'mailto:hello@luxemia.com?subject=Product Review'}
          >
            Share Your Experience
          </Button>
          <Link to="/contact" className="text-sm text-primary hover:underline">
            Contact our team
          </Link>
        </div>
      </div>

      {/* Business Transparency - GMC Compliance */}
      <div className="mt-8 p-5 bg-card border border-border/50 rounded-lg">
        <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          Our Commitment to Transparency
        </h4>
        <div className="grid sm:grid-cols-2 gap-3 text-xs text-muted-foreground">
          <div>
            <p className="font-medium text-foreground mb-1">Business Details</p>
            <p>LuxeMia Fashion Inc., 2208 Michener St, Philadelphia, PA 19115</p>
          </div>
          <div>
            <p className="font-medium text-foreground mb-1">Contact</p>
            <p>hello@luxemia.com | +1-215-341-9990 | Mon-Sat 10AM-7PM EST</p>
          </div>
          <div>
            <p className="font-medium text-foreground mb-1">Shipping</p>
            <p>$14.95/item flat rate, free over $300. Dispatch: 3-5 biz days (ready-made), 5-7 biz days (custom)</p>
          </div>
          <div>
            <p className="font-medium text-foreground mb-1">Returns</p>
            <p>All sales final. Only genuine shipping damage claims accepted within 7 days with evidence.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReviewsSection;
