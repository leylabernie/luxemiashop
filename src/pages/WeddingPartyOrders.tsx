import { useState } from 'react';
import { CheckCircle, Loader2, Users } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/seo/SEOHead';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { trackConsultationSubmission } from '@/hooks/useAnalytics';

const WeddingPartyOrders = () => {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get('name') || '');
    const email = String(form.get('email') || '');
    const phone = String(form.get('phone') || '');
    const country = String(form.get('country') || '');
    const role = String(form.get('role') || '');
    const groupSize = String(form.get('groupSize') || '');
    const preferredDate = String(form.get('eventDate') || '');
    const budget = String(form.get('budget') || '');
    const details = String(form.get('details') || '');

    setSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke('submit-consultation', {
        body: {
          name, email, phone, country, preferredDate, budget,
          occasion: `Wedding Party / Group Order — ${role}`,
          requirements: `Group size: ${groupSize}\n${details}`,
        },
      });
      if (error) throw error;
      trackConsultationSubmission({ name, email, phone, country, occasion: 'wedding_party_group_order', budget });
      setSubmitted(true);
      toast({ title: 'Enquiry received', description: 'LuxeMia will review your requirements and contact you shortly.' });
    } catch (error) {
      console.error('Group order enquiry failed:', error);
      toast({ title: 'Could not send enquiry', description: 'Please try again or contact hello@luxemia.shop.', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Indian Wedding Party & Group Outfit Orders | LuxeMia"
        description="Coordinate Indian wedding outfits for bridesmaids, groomsmen and family groups. Tell LuxeMia your event date, palette, sizes and budget."
        canonical="https://luxemia.shop/wedding-party-orders"
      />
      <Header />
      <main className="pt-[88px] lg:pt-[130px]">
        <section className="bg-primary/5 py-14 lg:py-20">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <Users className="h-9 w-9 mx-auto mb-5 text-primary" />
            <h1 className="font-serif text-4xl lg:text-5xl mb-5">Wedding Party & Group Orders</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Coordinate outfits for bridesmaids, groomsmen and family across multiple sizes, colors and wedding events.</p>
          </div>
        </section>

        <section className="py-14 lg:py-20">
          <div className="container mx-auto px-4 max-w-5xl grid lg:grid-cols-[0.85fr_1.15fr] gap-12">
            <div>
              <h2 className="font-serif text-3xl mb-6">How we can help</h2>
              <ul className="space-y-4 text-muted-foreground">
                {['Bridesmaid and groomsmen outfit coordination', 'Color and style direction across both families', 'Mixed sizing and fit-option guidance', 'Wedding-event planning for mehendi, sangeet and reception', 'Product availability and timeline review before ordering'].map(item => (
                  <li key={item} className="flex gap-3"><CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" /><span>{item}</span></li>
                ))}
              </ul>
              <p className="mt-7 text-sm text-muted-foreground">Availability, pricing, production time and fit options depend on the selected products. We will confirm details before you place an order.</p>
            </div>

            <form onSubmit={handleSubmit} className="border bg-card p-6 lg:p-8 space-y-5">
              <h2 className="font-serif text-3xl">Tell us about your wedding</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div><Label htmlFor="name">Name</Label><Input id="name" name="name" required /></div>
                <div><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" required /></div>
                <div><Label htmlFor="phone">Phone / WhatsApp</Label><Input id="phone" name="phone" required /></div>
                <div><Label htmlFor="country">Country</Label><Input id="country" name="country" required /></div>
                <div><Label htmlFor="role">Your role</Label><Input id="role" name="role" placeholder="Bride, planner, family…" required /></div>
                <div><Label htmlFor="groupSize">Approximate group size</Label><Input id="groupSize" name="groupSize" type="number" min="2" required /></div>
                <div><Label htmlFor="eventDate">Event date</Label><Input id="eventDate" name="eventDate" type="date" /></div>
                <div><Label htmlFor="budget">Budget</Label><Input id="budget" name="budget" placeholder="Per person or total" /></div>
              </div>
              <div><Label htmlFor="details">Colors, events, garments and other details</Label><textarea id="details" name="details" required rows={5} className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" /></div>
              <Button type="submit" className="w-full" disabled={submitting || submitted}>
                {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}{submitted ? 'Enquiry sent' : 'Request group-order help'}
              </Button>
            </form>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default WeddingPartyOrders;
