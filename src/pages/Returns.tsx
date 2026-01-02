import { motion } from 'framer-motion';
import { RotateCcw, CheckCircle, XCircle, HelpCircle } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const Returns = () => {
  return (
    <div className="min-h-screen bg-background">
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
                Hassle-Free Returns
              </p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif mb-6">Returns & Exchanges</h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                We want you to love your LuxeMia pieces. If something isn't quite right, we're here to help.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Policy Overview */}
        <section className="py-16">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
            <div className="grid md:grid-cols-3 gap-6 mb-16">
              {[
                { icon: RotateCcw, title: '15-Day Returns', desc: 'Return within 15 days of delivery' },
                { icon: CheckCircle, title: 'Free Exchanges', desc: 'Exchange for a different size at no cost' },
                { icon: HelpCircle, title: 'Easy Process', desc: 'Simple online return request' },
              ].map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="text-center p-6 bg-card border border-border/50 rounded-sm"
                >
                  <item.icon className="h-8 w-8 mx-auto mb-3 text-primary" />
                  <h3 className="font-medium mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </motion.div>
              ))}
            </div>

            {/* Eligible / Not Eligible */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="grid md:grid-cols-2 gap-6 mb-16"
            >
              <div className="p-6 bg-card border border-border/50 rounded-sm">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <h3 className="font-medium">Eligible for Return</h3>
                </div>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Unworn items with original tags attached</li>
                  <li>• Items in original packaging</li>
                  <li>• Products returned within 15 days</li>
                  <li>• Defective or damaged items</li>
                  <li>• Wrong item received</li>
                </ul>
              </div>

              <div className="p-6 bg-card border border-border/50 rounded-sm">
                <div className="flex items-center gap-2 mb-4">
                  <XCircle className="h-5 w-5 text-destructive" />
                  <h3 className="font-medium">Not Eligible for Return</h3>
                </div>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Worn, washed, or altered items</li>
                  <li>• Items without original tags</li>
                  <li>• Custom or made-to-order pieces</li>
                  <li>• Intimate apparel (blouses, petticoats)</li>
                  <li>• Sale items marked as final sale</li>
                </ul>
              </div>
            </motion.div>

            {/* How to Return */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-16"
            >
              <h2 className="text-2xl font-serif mb-8 text-center">How to Return</h2>
              
              <div className="space-y-4">
                {[
                  { step: '1', title: 'Initiate Return', desc: 'Email hello@luxemia.com with your order number and reason for return.' },
                  { step: '2', title: 'Receive Label', desc: "We'll send you a prepaid return shipping label within 24 hours." },
                  { step: '3', title: 'Pack & Ship', desc: 'Pack items securely in original packaging and drop off at any shipping location.' },
                  { step: '4', title: 'Refund Processed', desc: 'Once received and inspected, refund will be processed within 5-7 business days.' },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4 p-4 bg-card border border-border/50 rounded-sm">
                    <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-medium flex-shrink-0">
                      {item.step}
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* FAQ */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <h2 className="text-2xl font-serif mb-8 text-center">Frequently Asked Questions</h2>
              
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>How long do I have to return an item?</AccordionTrigger>
                  <AccordionContent>
                    You have 15 days from the date of delivery to initiate a return. The item must be unworn, with all tags attached, and in its original packaging.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>Can I exchange for a different size?</AccordionTrigger>
                  <AccordionContent>
                    Yes! We offer free exchanges for different sizes within the US. Simply email us with your order number and the size you need.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger>How long does it take to get my refund?</AccordionTrigger>
                  <AccordionContent>
                    Once we receive and inspect your return, refunds are processed within 5-7 business days. It may take an additional 3-5 days for the refund to appear on your statement.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4">
                  <AccordionTrigger>What if I received a defective item?</AccordionTrigger>
                  <AccordionContent>
                    We're sorry to hear that! Please contact us immediately with photos of the defect. We'll arrange a free return and send a replacement or full refund.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Returns;
