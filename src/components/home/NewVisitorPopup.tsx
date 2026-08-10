import { useState } from 'react';
import { Check, Mail } from 'lucide-react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';

const emailSchema = z
  .string()
  .trim()
  .min(1, 'Email is required')
  .max(255, 'Email must be less than 255 characters')
  .email('Please enter a valid email address');

interface NewVisitorPopupProps {
  onDismiss: () => void;
}

interface SignupResponse {
  success?: boolean;
  error?: string;
  deliveryStatus?: 'accepted' | 'not_configured' | 'failed';
}

const NewVisitorPopup = ({ onDismiss }: NewVisitorPopupProps) => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validation = emailSchema.safeParse(email);
    if (!validation.success) {
      setEmailError(validation.error.issues[0]?.message || 'Please enter a valid email address');
      return;
    }

    setEmailError(null);
    setIsSubmitting(true);

    try {
      // Keep the Supabase client out of the initial page bundle. The signup
      // function is only loaded after a visitor actively submits the form.
      const { supabase } = await import('@/integrations/supabase/client');
      const { data, error } = await supabase.functions.invoke<SignupResponse>('submit-email', {
        body: {
          email: validation.data.toLowerCase(),
          type: 'newsletter',
          source: 'welcome_popup_10_percent',
        },
      });

      if (error || data?.success !== true || data.deliveryStatus !== 'accepted') {
        throw new Error(data?.error || 'We could not email your code just now. Please try again.');
      }

      setIsSuccess(true);
    } catch (error) {
      setEmailError(
        error instanceof Error
          ? error.message
          : 'We could not email your code just now. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onDismiss(); }}>
      <DialogContent className="w-[calc(100%-1.5rem)] max-w-2xl overflow-hidden border-0 p-0 shadow-2xl sm:grid sm:grid-cols-[0.9fr_1.1fr]">
        <div className="relative hidden min-h-[430px] overflow-hidden bg-muted sm:block">
          <img
            src="/images/popup-image.webp"
            alt="LuxeMia Indian ethnic wear collection"
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
            fetchPriority="low"
            decoding="async"
            width={768}
            height={768}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
          <p className="absolute bottom-6 left-6 right-6 font-serif text-2xl leading-tight text-white">
            Premium Indian occasionwear, thoughtfully selected for your celebrations.
          </p>
        </div>

        <div className="flex min-h-[410px] flex-col justify-center px-6 py-10 sm:min-h-[430px] sm:px-9">
          {!isSuccess ? (
            <>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                A welcome from LuxeMia
              </p>
              <DialogTitle className="font-serif text-3xl font-medium leading-tight sm:text-4xl">
                Unlock 10% off your first luxury order.
              </DialogTitle>
              <DialogDescription className="mt-3 text-base leading-relaxed text-foreground/70">
                Enter your email to receive your exclusive code.
              </DialogDescription>

              <form onSubmit={handleSubmit} className="mt-7 space-y-3" noValidate>
                <div>
                  <label htmlFor="welcome-email" className="sr-only">Email address</label>
                  <div className="relative">
                    <Mail
                      aria-hidden="true"
                      className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                    />
                    <input
                      id="welcome-email"
                      type="email"
                      value={email}
                      onChange={(event) => {
                        setEmail(event.target.value);
                        if (emailError) setEmailError(null);
                      }}
                      placeholder="you@example.com"
                      required
                      disabled={isSubmitting}
                      maxLength={255}
                      autoComplete="email"
                      inputMode="email"
                      aria-invalid={Boolean(emailError)}
                      aria-describedby={emailError ? 'welcome-email-error' : 'welcome-offer-terms'}
                      className="h-12 w-full rounded-md border border-border bg-background pl-10 pr-4 text-base outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
                    />
                  </div>
                  {emailError ? (
                    <p id="welcome-email-error" role="alert" className="mt-2 text-sm text-destructive">
                      {emailError}
                    </p>
                  ) : null}
                </div>

                <Button type="submit" variant="luxury" size="lg" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Sending your code…' : 'Email me my 10% code'}
                </Button>
              </form>

              <p id="welcome-offer-terms" className="mt-4 text-xs leading-relaxed text-muted-foreground">
                For customers with no prior LuxeMia purchase. One use per customer; cannot be combined with other discounts. By signing up, you agree to receive LuxeMia emails. Unsubscribe anytime.
              </p>
            </>
          ) : (
            <div className="text-center">
              <span className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Check aria-hidden="true" className="h-7 w-7" />
              </span>
              <DialogTitle className="font-serif text-3xl font-medium">Your welcome code is on its way.</DialogTitle>
              <DialogDescription className="mt-3 text-base leading-relaxed">
                Check your inbox for your 10% first-order code, then return to LuxeMia to shop.
              </DialogDescription>
              <Button asChild variant="luxury" size="lg" className="mt-7 w-full">
                <a href="/collections" onClick={onDismiss}>Shop the collection</a>
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewVisitorPopup;
