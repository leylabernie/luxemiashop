import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, Clock, Send } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/seo/SEOHead';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success('Message sent!', {
      description: "We'll get back to you within 24-48 hours.",
    });
    
    setFormData({ name: '', email: '', subject: '', message: '' });
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Contact Us — LuxeMia"
        description="Get in touch with LuxeMia. Questions about orders, sizing, or custom tailoring? Reach us via email, phone, or WhatsApp."
        canonical="https://luxemia.shop/contact"
      />
      <Header />
      
      <main className="pt-24 pb-16">
        {/* Hero */}
        <section className="py-16 lg:py-24 bg-gradient-to-b from-secondary to-background">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-sm tracking-luxury uppercase text-muted-foreground mb-4">
                Get in Touch
              </p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif mb-6">Contact Us</h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Have questions about an order, need styling advice, or want to learn more about our artisans? We're here to help.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
              {/* Contact Info */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-2xl font-serif mb-6">We'd Love to Hear From You</h2>
                  <p className="text-muted-foreground">
                    Our customer care team is available to assist you with any inquiries. Reach out through any of the channels below.
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-secondary rounded-sm">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Email</h3>
                      <a href="mailto:hello@luxemia.com" className="text-muted-foreground hover:text-foreground transition-colors">
                        hello@luxemia.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-secondary rounded-sm">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Phone</h3>
                      <a href="tel:+1-215-341-9990" className="text-muted-foreground hover:text-foreground transition-colors">
                        +1-215-341-9990
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-secondary rounded-sm">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Business Hours</h3>
                      <p className="text-muted-foreground">
                        Monday - Friday: 9AM - 6PM PST<br />
                        Saturday: 10AM - 4PM PST<br />
                        Sunday: Closed
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Contact Form */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <div className="bg-card border border-border/50 rounded-sm p-6 lg:p-8">
                  <h2 className="text-xl font-serif mb-6">Send Us a Message</h2>
                  
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label htmlFor="name" className="text-sm font-medium mb-2 block">
                        Your Name
                      </label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        placeholder="Enter your name"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="text-sm font-medium mb-2 block">
                        Email Address
                      </label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        placeholder="Enter your email"
                      />
                    </div>

                    <div>
                      <label htmlFor="subject" className="text-sm font-medium mb-2 block">
                        Subject
                      </label>
                      <Input
                        id="subject"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        required
                        placeholder="How can we help?"
                      />
                    </div>

                    <div>
                      <label htmlFor="message" className="text-sm font-medium mb-2 block">
                        Message
                      </label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        required
                        placeholder="Tell us more..."
                        rows={5}
                      />
                    </div>

                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? (
                        'Sending...'
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
