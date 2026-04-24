import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Video, MessageCircle, Mail, Clock, Globe, Sparkles, Loader2, CheckCircle } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/seo/SEOHead';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { trackConsultationSubmission, trackConsultationBookingAttempt } from '@/hooks/useAnalytics';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const occasionOptions = [
  'Wedding (Bride)',
  'Wedding (Guest)',
  'Reception',
  'Engagement',
  'Sangeet / Mehendi',
  'Eid',
  'Diwali / Festive',
  'Party / Evening',
  'Casual / Everyday',
  'Other',
];

const budgetOptions = [
  'Under $100',
  '$100 - $250',
  '$250 - $500',
  '$500 - $1,000',
  'Over $1,000',
  'Not sure yet',
];

const StyleConsultation = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    country: '',
    occasion: '',
    preferredDate: '',
    budget: '',
    requirements: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    // Track page view for consultation page
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'page_view', {
        page_path: '/style-consultation',
        page_title: 'Personal Styling Consultation',
      });
    }
  }, []);

  const submitConsultationLead = async () => {
    try {
      setIsSubmitting(true);
      
      // Call the edge function to save the lead
      const { data, error } = await supabase.functions.invoke('submit-consultation', {
        body: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          country: formData.country,
          occasion: formData.occasion,
          preferredDate: formData.preferredDate,
          budget: formData.budget,
          requirements: formData.requirements,
        },
      });

      if (error) throw error;

      // Track the lead submission in GA4
      trackConsultationSubmission({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        country: formData.country,
        occasion: formData.occasion,
        budget: formData.budget,
      });

      setSubmitSuccess(true);
      toast({
        title: 'Success!',
        description: 'Your consultation request has been received. We\'ll contact you shortly.',
      });

      // Reset form after 3 seconds
      setTimeout(() => {
        setFormData({
          name: '',
          email: '',
          phone: '',
          country: '',
          occasion: '',
          preferredDate: '',
          budget: '',
          requirements: '',
        });
        setSubmitSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Error submitting consultation:', err);
      toast({
        title: 'Error',
        description: 'Failed to submit your request. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Track the booking attempt
    trackConsultationBookingAttempt('whatsapp');
    
    // First save to database
    await submitConsultationLead();
    
    // Then open WhatsApp
    const message = encodeURIComponent(
      `Hi LuxeMia! I'd like to book a styling consultation.\n\n` +
      `Name: ${formData.name}\n` +
      `Email: ${formData.email}\n` +
      `Phone: ${formData.phone}\n` +
      `Country: ${formData.country}\n` +
      `Occasion: ${formData.occasion}\n` +
      `Preferred Date: ${formData.preferredDate}\n` +
      `Budget: ${formData.budget}\n` +
      `Requirements: ${formData.requirements}`
    );
    window.open(`https://wa.me/12153419990?text=${message}`, '_blank');
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Track the booking attempt
    trackConsultationBookingAttempt('email');
    
    // First save to database
    await submitConsultationLead();
    
    // Then open email
    const subject = encodeURIComponent('Styling Consultation Request');
    const body = encodeURIComponent(
      `Hi LuxeMia,\n\nI'd like to book a styling consultation.\n\n` +
      `Name: ${formData.name}\n` +
      `Email: ${formData.email}\n` +
      `Phone: ${formData.phone}\n` +
      `Country: ${formData.country}\n` +
      `Occasion: ${formData.occasion}\n` +
      `Preferred Date: ${formData.preferredDate}\n` +
      `Budget: ${formData.budget}\n` +
      `Requirements: ${formData.requirements}`
    );
    window.location.href = `mailto:hello@luxemia.com?subject=${subject}&body=${body}`;
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Personal Styling Consultation | Book a Session | LuxeMia"
        description="Book a free 30-minute virtual styling consultation with LuxeMia's expert stylists. Get personalized recommendations for Indian ethnic wear — sarees, lehengas, suits & more."
        canonical="https://luxemia.shop/style-consultation"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Style Consultation', url: '/style-consultation' },
        ]}
      />
      <Header />

      <main className="pt-[90px] lg:pt-[132px] pb-16">
        {/* Hero */}
        <section className="py-16 lg:py-24 bg-gradient-to-b from-secondary to-background">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-sm tracking-luxury uppercase text-muted-foreground mb-4">
                Personalized Service
              </p>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif mb-6">
                Personal Styling Consultation
              </h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Book a complimentary 30-minute video call with our styling team.
                Get expert advice on choosing the perfect outfit for your occasion — from anywhere in the world.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Features */}
        <section className="py-12 border-b border-border">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { icon: Video, title: 'Video Call', desc: '30-minute session via Zoom or WhatsApp' },
                { icon: Globe, title: 'Worldwide', desc: 'Available in all time zones' },
                { icon: Sparkles, title: 'Personalized', desc: 'Curated picks for your occasion' },
                { icon: Clock, title: 'Flexible', desc: 'Book at your convenience' },
              ].map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="text-center p-4"
                >
                  <item.icon className="h-8 w-8 mx-auto mb-3 text-primary" />
                  <h3 className="font-medium text-sm mb-1">{item.title}</h3>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Booking Form */}
        <section className="py-16">
          <div className="container mx-auto px-4 lg:px-8 max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-2xl font-serif text-center mb-8">Book Your Session</h2>

              {submitSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3"
                >
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-green-900">Request Received!</h3>
                    <p className="text-sm text-green-700 mt-1">Our styling team will contact you shortly to confirm your consultation.</p>
                  </div>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      required
                      value={formData.name}
                      onChange={(e) => updateField('name', e.target.value)}
                      placeholder="Your name"
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => updateField('email', e.target.value)}
                      placeholder="your@email.com"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone / WhatsApp *</Label>
                    <Input
                      id="phone"
                      required
                      value={formData.phone}
                      onChange={(e) => updateField('phone', e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country *</Label>
                    <Input
                      id="country"
                      required
                      value={formData.country}
                      onChange={(e) => updateField('country', e.target.value)}
                      placeholder="e.g. USA, UK, Canada"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="occasion">Occasion</Label>
                    <Select onValueChange={(value) => updateField('occasion', value)} disabled={isSubmitting}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select occasion" />
                      </SelectTrigger>
                      <SelectContent>
                        {occasionOptions.map((option) => (
                          <SelectItem key={option} value={option}>{option}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="budget">Budget Range</Label>
                    <Select onValueChange={(value) => updateField('budget', value)} disabled={isSubmitting}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select budget" />
                      </SelectTrigger>
                      <SelectContent>
                        {budgetOptions.map((option) => (
                          <SelectItem key={option} value={option}>{option}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preferredDate">Preferred Date & Time</Label>
                  <Input
                    id="preferredDate"
                    value={formData.preferredDate}
                    onChange={(e) => updateField('preferredDate', e.target.value)}
                    placeholder="e.g. March 15, afternoon EST"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="requirements">Any Special Requirements</Label>
                  <textarea
                    id="requirements"
                    value={formData.requirements}
                    onChange={(e) => updateField('requirements', e.target.value)}
                    placeholder="Tell us about the event, your style preferences, colors you love, etc."
                    className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    type="submit" 
                    size="lg" 
                    className="flex-1 gap-2"
                    disabled={isSubmitting || submitSuccess}
                  >
                    {submitSuccess ? (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        Request Submitted
                      </>
                    ) : isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <MessageCircle className="h-4 w-4" />
                        Book via WhatsApp
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="flex-1 gap-2"
                    onClick={handleEmailSubmit}
                    disabled={isSubmitting || submitSuccess}
                  >
                    {submitSuccess ? (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        Request Submitted
                      </>
                    ) : isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Mail className="h-4 w-4" />
                        Book via Email
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        </section>

        {/* How it Works */}
        <section className="py-16 bg-secondary/30">
          <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
            <h2 className="text-2xl font-serif text-center mb-10">How It Works</h2>
            <div className="space-y-6">
              {[
                { step: '1', title: 'Fill out the form', desc: 'Tell us about your occasion, preferences, and budget.' },
                { step: '2', title: 'We schedule your call', desc: 'Our styling team will confirm a time that works for you.' },
                { step: '3', title: 'Get personalized picks', desc: 'During the video call, we\'ll curate outfit options tailored to you.' },
                { step: '4', title: 'Order with confidence', desc: 'Place your order knowing exactly what will look perfect on you.' },
              ].map((item) => (
                <div key={item.step} className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-semibold text-primary">{item.step}</span>
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default StyleConsultation;
