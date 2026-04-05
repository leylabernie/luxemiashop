import { motion } from 'framer-motion';
import { XCircle, AlertTriangle, Video, Ruler, Clock, Shield, CheckCircle } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/seo/SEOHead';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const Returns = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Returns & Exchanges — LuxeMia"
        description="LuxeMia returns and exchange policy. Learn about our hassle-free return process for Indian ethnic wear purchases."
        canonical="https://luxemia.shop/returns"
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
                Important Information
              </p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif mb-6">No Returns Policy</h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                All sales are final. Please read our policy carefully before making a purchase to understand 
                our commitment to quality and customer satisfaction.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Critical Notice */}
        <section className="py-8 bg-destructive/5 border-y border-destructive/20">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-4 p-6 bg-card border border-destructive/30 rounded-lg"
            >
              <AlertTriangle className="h-8 w-8 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-foreground text-lg mb-2">⚠️ ALL SALES ARE FINAL</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Due to the nature of our handcrafted, made-to-order products and international shipping logistics, 
                  <strong className="text-foreground"> we do not accept returns or offer refunds</strong>. Each piece 
                  is crafted specifically for you based on your measurements and selections.
                </p>
                <p className="text-sm text-muted-foreground">
                  Please review all product details, measurements, and sizing information carefully before placing 
                  your order. We are happy to answer any questions before purchase.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Policy Details */}
        <section className="py-16">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
            {/* Key Points */}
            <div className="grid md:grid-cols-3 gap-6 mb-16">
              {[
                { icon: XCircle, title: 'No Returns', desc: 'All sales are final - no returns accepted', color: 'text-destructive' },
                { icon: Ruler, title: 'Measure Carefully', desc: 'Use our size guide for accurate measurements' },
                { icon: Shield, title: 'Quality Assured', desc: 'Rigorous quality checks before shipping' },
              ].map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="text-center p-6 bg-card border border-border/50 rounded-lg"
                >
                  <item.icon className={`h-8 w-8 mx-auto mb-3 ${item.color || 'text-primary'}`} />
                  <h3 className="font-medium mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </motion.div>
              ))}
            </div>

            {/* Why No Returns */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-16"
            >
              <h2 className="text-2xl font-serif mb-8 text-center">Why We Have This Policy</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-6 bg-card border border-border rounded-lg">
                  <h3 className="font-semibold mb-4">Made-to-Order Craftsmanship</h3>
                  <ul className="text-sm text-muted-foreground space-y-3">
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>Each piece is handcrafted by skilled artisans specifically for your order</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>Custom measurements and sizing make pieces unique to you</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>Production begins immediately upon order confirmation</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>Traditional techniques require significant time and expertise</span>
                    </li>
                  </ul>
                </div>
                
                <div className="p-6 bg-card border border-border rounded-lg">
                  <h3 className="font-semibold mb-4">International Logistics</h3>
                  <ul className="text-sm text-muted-foreground space-y-3">
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>Products ship from India to destinations worldwide</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>International customs and duties make returns impractical</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>Return shipping costs would exceed product value</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>Delicate fabrics risk damage during multiple transits</span>
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>

            {/* What We Do Guarantee */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-16"
            >
              <h2 className="text-2xl font-serif mb-8 text-center">What We Do Guarantee</h2>
              
              <div className="p-6 bg-card border border-green-500/30 rounded-lg">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <h3 className="font-semibold">Our Commitment to You</h3>
                </div>
                <ul className="text-sm text-muted-foreground space-y-3">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✓</span>
                    <span><strong>Quality Assurance:</strong> Every piece undergoes rigorous quality checks before shipping</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✓</span>
                    <span><strong>Accurate Descriptions:</strong> Product photos and descriptions accurately represent what you'll receive</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✓</span>
                    <span><strong>Secure Packaging:</strong> Premium packaging protects your purchase during transit</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✓</span>
                    <span><strong>Customer Support:</strong> We answer questions promptly before you order</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✓</span>
                    <span><strong>Defect Resolution:</strong> Manufacturing defects are addressed on a case-by-case basis with photo evidence</span>
                  </li>
                </ul>
              </div>
            </motion.div>

            {/* Exception for Defects */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mb-16"
            >
              <h2 className="text-2xl font-serif mb-6 text-center">Manufacturing Defects</h2>
              
              <div className="bg-card border border-border rounded-lg p-6">
                <p className="text-sm text-muted-foreground mb-4">
                  While we do not accept returns, we take manufacturing defects seriously. If you receive an item 
                  with a genuine manufacturing defect (not sizing issues or buyer's remorse), please contact us 
                  within 48 hours of delivery with:
                </p>
                <ul className="text-sm text-muted-foreground space-y-2 mb-4">
                  <li>• Your order number</li>
                  <li>• Clear photos of the defect</li>
                  <li>• An unboxing video showing the package being opened (recommended)</li>
                </ul>
                <p className="text-sm text-muted-foreground">
                  Our team will review your case and work with you to find a resolution. This may include 
                  repair, replacement of the defective component, or other appropriate remedies at our discretion.
                </p>
              </div>
            </motion.div>

            {/* Tips for Success */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mb-16"
            >
              <h2 className="text-2xl font-serif mb-8 text-center">Tips for a Successful Purchase</h2>
              
              <div className="space-y-4">
                {[
                  { 
                    step: '1', 
                    title: 'Use the Size Guide', 
                    desc: 'Take accurate measurements using our detailed size guide. When in doubt, contact us before ordering.'
                  },
                  { 
                    step: '2', 
                    title: 'Read Product Details', 
                    desc: 'Review all product information including fabric type, care instructions, and what\'s included in the set.'
                  },
                  { 
                    step: '3', 
                    title: 'Ask Questions First', 
                    desc: 'Contact our customer service with any questions about products, sizing, or customization before placing your order.'
                  },
                  { 
                    step: '4', 
                    title: 'Allow for Production Time', 
                    desc: 'Handcrafted pieces require 2-3 weeks for production plus shipping time. Order well in advance for events.'
                  },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4 p-4 bg-card border border-border/50 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold flex-shrink-0">
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
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <h2 className="text-2xl font-serif mb-8 text-center">Frequently Asked Questions</h2>
              
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>Can I cancel my order?</AccordionTrigger>
                  <AccordionContent>
                    Order cancellations may be possible within 24 hours of placing your order, before production 
                    begins. Contact us immediately at support@luxemia.com. After production starts, cancellations 
                    are not possible.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>What if the item doesn't fit?</AccordionTrigger>
                  <AccordionContent>
                    We encourage using our detailed size guide and contacting us with questions before ordering. 
                    Sizing issues due to incorrect measurements are the customer's responsibility. We recommend 
                    visiting a local tailor for alterations if needed.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger>What qualifies as a manufacturing defect?</AccordionTrigger>
                  <AccordionContent>
                    Manufacturing defects include: significant stitching errors, fabric flaws present before wearing, 
                    missing embellishments, or wrong item shipped. This does NOT include: minor variations in handwork 
                    (expected with artisanal pieces), color variations from screen display, fit issues, or damage 
                    caused after receipt.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4">
                  <AccordionTrigger>How do I ensure I'm ordering the right size?</AccordionTrigger>
                  <AccordionContent>
                    Use our detailed Size Guide with measuring instructions. For custom-sized pieces, have someone 
                    else take your measurements for accuracy. Consider ordering a size larger if you're between 
                    sizes, as alterations to reduce size are easier. Contact us with your measurements and we can 
                    advise on the best size for you.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-5">
                  <AccordionTrigger>Why don't you offer returns like other stores?</AccordionTrigger>
                  <AccordionContent>
                    Our pieces are handcrafted in India by skilled artisans, often made-to-order with your 
                    specifications. The combination of custom production, international shipping costs, customs 
                    duties, and the delicate nature of our fabrics makes returns logistically impractical and 
                    economically unfeasible. This policy allows us to offer competitive pricing and maintain 
                    artisan partnerships.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </motion.div>
          </div>
        </section>

        {/* Contact */}
        <section className="py-12 bg-secondary/30">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl text-center">
            <h2 className="text-2xl font-serif mb-4">Questions Before Ordering?</h2>
            <p className="text-muted-foreground mb-6">
              We're here to help! Contact us with any questions about products, sizing, or customization 
              before you place your order.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a 
                href="mailto:support@luxemia.com" 
                className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-sm hover:bg-primary/90 transition-colors"
              >
                Email Us
              </a>
              <a 
                href="/contact" 
                className="inline-flex items-center justify-center px-6 py-3 border border-foreground/20 rounded-sm hover:bg-secondary transition-colors"
              >
                Contact Page
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Returns;
