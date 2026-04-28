import { Star, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
        <p className="text-muted-foreground max-w-md mx-auto">
          We'd love to hear about your experience with LuxeMia. Your honest feedback helps other shoppers 
          and helps us get better. Share your thoughts after receiving your order!
        </p>
        <Button
          variant="default"
          size="sm"
          className="mt-4"
          onClick={() => window.location.href = 'mailto:hello@luxemia.com?subject=Product Review'}
        >
          Share Your Experience
        </Button>
      </div>
    </section>
  );
};

export default ReviewsSection;
