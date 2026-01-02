import { motion } from 'framer-motion';
import { RotateCcw, CheckCircle, XCircle, AlertTriangle, Video, Ruler, Clock, Shield } from 'lucide-react';
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
                Our Commitment to You
              </p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif mb-6">Returns & Exchange Policy</h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                We take great care in crafting and delivering your pieces. Please read our return and exchange 
                policy carefully before making a purchase.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Critical Notices */}
        <section className="py-8 bg-destructive/5 border-y border-destructive/20">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
            <div className="space-y-4">
              {/* Video Requirement */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-4 p-4 bg-card border border-destructive/30 rounded-lg"
              >
                <Video className="h-6 w-6 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">⚠️ MANDATORY: Package Opening Video Required</h3>
                  <p className="text-sm text-muted-foreground">
                    Returns and exchanges are <strong className="text-foreground">ONLY accepted with an unedited video 
                    recording of you opening the package</strong>. This video must clearly show the sealed package, the 
                    opening process, and any defects or issues. Without this video, no return or exchange claims will be processed.
                  </p>
                </div>
              </motion.div>

              {/* Measurement Disclaimer */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-start gap-4 p-4 bg-card border border-border rounded-lg"
              >
                <Ruler className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">📏 Measurement Responsibility</h3>
                  <p className="text-sm text-muted-foreground">
                    All measurements are provided by the customer and are their <strong className="text-foreground">full 
                    responsibility</strong>. We create garments exactly as per the measurements submitted. 
                    <strong className="text-destructive"> Size/fit issues due to incorrect measurements are NOT covered </strong> 
                    under our return or exchange policy. Please refer to our Size Guide and measure carefully before ordering.
                  </p>
                </div>
              </motion.div>

              {/* Cancellation */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-start gap-4 p-4 bg-card border border-border rounded-lg"
              >
                <Clock className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">⏰ 24-Hour Cancellation Window</h3>
                  <p className="text-sm text-muted-foreground">
                    Order cancellations are <strong className="text-foreground">only permitted within 24 hours</strong> of 
                    placing your order. After this period, your order enters production and cannot be cancelled.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Policy Overview */}
        <section className="py-16">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
            <div className="grid md:grid-cols-3 gap-6 mb-16">
              {[
                { icon: RotateCcw, title: '7-Day Window', desc: 'Return/exchange within 7 days of delivery' },
                { icon: Shield, title: 'Defect Coverage', desc: 'Manufacturing defects fully covered' },
                { icon: Video, title: 'Video Required', desc: 'Unboxing video mandatory for all claims' },
              ].map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="text-center p-6 bg-card border border-border/50 rounded-lg"
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
              <div className="p-6 bg-card border border-green-500/30 rounded-lg">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <h3 className="font-semibold">Eligible for Return/Exchange</h3>
                </div>
                <ul className="text-sm text-muted-foreground space-y-3">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✓</span>
                    <span>Manufacturing defects (stitching issues, fabric flaws, embroidery defects)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✓</span>
                    <span>Wrong item sent (different product than ordered)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✓</span>
                    <span>Wrong color/size shipped (different from order confirmation)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✓</span>
                    <span>Damaged during shipping (with unboxing video proof)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✓</span>
                    <span>Missing items from order (with unboxing video proof)</span>
                  </li>
                </ul>
                <p className="text-xs text-muted-foreground mt-4 p-2 bg-secondary/50 rounded">
                  <strong>Note:</strong> All claims require unedited unboxing video showing the issue
                </p>
              </div>

              <div className="p-6 bg-card border border-destructive/30 rounded-lg">
                <div className="flex items-center gap-2 mb-4">
                  <XCircle className="h-5 w-5 text-destructive" />
                  <h3 className="font-semibold">NOT Eligible for Return/Exchange</h3>
                </div>
                <ul className="text-sm text-muted-foreground space-y-3">
                  <li className="flex items-start gap-2">
                    <span className="text-destructive">✗</span>
                    <span><strong>Size/fit issues due to customer-provided measurements</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive">✗</span>
                    <span>Claims without unboxing video</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive">✗</span>
                    <span>Items worn, washed, altered, or with tags removed</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive">✗</span>
                    <span>Custom/made-to-order pieces (unless defective)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive">✗</span>
                    <span>Intimate apparel (blouses, petticoats, shapewear)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive">✗</span>
                    <span>Items marked as "Final Sale" or "Non-Returnable"</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive">✗</span>
                    <span>Returns requested after 7 days of delivery</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive">✗</span>
                    <span>Color variations due to monitor/screen settings</span>
                  </li>
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
              <h2 className="text-2xl font-serif mb-8 text-center">How to Request a Return/Exchange</h2>
              
              <div className="space-y-4">
                {[
                  { 
                    step: '1', 
                    title: 'Record Unboxing Video', 
                    desc: 'BEFORE opening your package, start recording a continuous, unedited video showing: the sealed package with visible shipping labels, the opening process, all items inside, and any defects or issues. This video is MANDATORY for all claims.'
                  },
                  { 
                    step: '2', 
                    title: 'Submit Return Request', 
                    desc: 'Within 7 days of delivery, email returns@shringaar.com with: your order number, description of the issue, clear photos of the defect, and upload link to your unboxing video (Google Drive, Dropbox, WeTransfer, etc.).'
                  },
                  { 
                    step: '3', 
                    title: 'Await Approval', 
                    desc: 'Our quality team will review your claim within 2-3 business days. If approved, we will provide return shipping instructions and a return authorization number.'
                  },
                  { 
                    step: '4', 
                    title: 'Ship Item Back', 
                    desc: 'Pack the item securely in original packaging with all tags attached. Ship using the provided instructions. Return shipping costs are covered for defective items; customer pays for other approved returns.'
                  },
                  { 
                    step: '5', 
                    title: 'Refund/Exchange Processed', 
                    desc: 'Once received and inspected (3-5 business days), we will process your refund to the original payment method or ship the exchange item. Refunds may take 5-10 additional business days to appear in your account.'
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

            {/* Video Guidelines */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mb-16"
            >
              <h2 className="text-2xl font-serif mb-6 text-center">Unboxing Video Requirements</h2>
              
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3 text-green-600">✓ Video MUST Include:</h3>
                    <ul className="text-sm text-muted-foreground space-y-2">
                      <li>• Clear view of sealed/intact package before opening</li>
                      <li>• Visible shipping labels with order details</li>
                      <li>• Complete, unedited recording of opening process</li>
                      <li>• All items removed and shown individually</li>
                      <li>• Close-up of any defects or issues claimed</li>
                      <li>• Good lighting to clearly see details</li>
                      <li>• Continuous recording (no cuts or edits)</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-3 text-destructive">✗ Video Will Be REJECTED If:</h3>
                    <ul className="text-sm text-muted-foreground space-y-2">
                      <li>• Video starts after package is already open</li>
                      <li>• Video has cuts, edits, or gaps</li>
                      <li>• Package appears tampered with before recording</li>
                      <li>• Defect/issue is not clearly visible in video</li>
                      <li>• Video quality is too poor to verify claims</li>
                      <li>• Shipping labels are not visible</li>
                      <li>• Video is suspected to be staged or manipulated</li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Refund Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mb-16"
            >
              <h2 className="text-2xl font-serif mb-6 text-center">Refund Information</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-card border border-border rounded-lg p-6">
                  <h3 className="font-semibold mb-3">Refund Method</h3>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>• Refunds are issued to original payment method only</li>
                    <li>• Credit/debit card refunds: 5-10 business days</li>
                    <li>• PayPal refunds: 3-5 business days</li>
                    <li>• Store credit (optional): Issued within 24 hours</li>
                  </ul>
                </div>
                
                <div className="bg-card border border-border rounded-lg p-6">
                  <h3 className="font-semibold mb-3">Refund Deductions</h3>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>• <strong>Defective items:</strong> Full refund including shipping</li>
                    <li>• <strong>Wrong item sent:</strong> Full refund including shipping</li>
                    <li>• <strong>Other approved returns:</strong> Original shipping cost deducted</li>
                    <li>• <strong>Restocking fee:</strong> None for eligible returns</li>
                  </ul>
                </div>
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
                  <AccordionTrigger>Why is an unboxing video required?</AccordionTrigger>
                  <AccordionContent>
                    The unboxing video protects both you and us. It provides clear evidence of the package's condition 
                    upon arrival and helps us quickly verify and process legitimate claims. Unfortunately, this policy 
                    was implemented due to fraudulent claims. The video ensures honest customers receive swift resolution.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>What if I didn't record an unboxing video?</AccordionTrigger>
                  <AccordionContent>
                    Without an unboxing video, we cannot process return or exchange requests. This policy applies to 
                    all claims without exception. We strongly recommend recording ALL package openings as a standard 
                    practice for high-value purchases.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger>The garment doesn't fit - can I return it?</AccordionTrigger>
                  <AccordionContent>
                    If you provided your own measurements, fit issues are not covered under our return policy. We 
                    create garments exactly as per the measurements submitted, and this responsibility lies with the 
                    customer. We strongly recommend consulting our Size Guide and getting professionally measured 
                    before ordering. For standard sizes, please refer to our size chart carefully.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4">
                  <AccordionTrigger>Can I cancel my order after 24 hours?</AccordionTrigger>
                  <AccordionContent>
                    No. Once 24 hours have passed, your order enters our production and fulfillment process and 
                    cannot be cancelled. For custom pieces, work may have already begun on your garment. Please 
                    review your order carefully before placing it.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-5">
                  <AccordionTrigger>Do you offer alterations for fit issues?</AccordionTrigger>
                  <AccordionContent>
                    We do not offer free alterations for fit issues resulting from customer-provided measurements. 
                    However, you may send the garment back for paid alterations. Contact us for a quote. We recommend 
                    having alterations done locally for faster turnaround.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-6">
                  <AccordionTrigger>What if I received a different color than expected?</AccordionTrigger>
                  <AccordionContent>
                    If you received a completely different color than ordered (e.g., ordered red, received blue), 
                    this is eligible for return/exchange with unboxing video. However, if the color appears different 
                    due to monitor settings, photography lighting, or fabric variations, this is not covered. We 
                    recommend viewing our products on multiple devices before ordering.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-7">
                  <AccordionTrigger>How long do I have to return an item?</AccordionTrigger>
                  <AccordionContent>
                    You have 7 days from the date of delivery to initiate a return or exchange request. Claims 
                    submitted after this window will not be accepted. The delivery date is based on carrier 
                    tracking confirmation.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </motion.div>
          </div>
        </section>

        {/* Contact */}
        <section className="py-12 bg-secondary/30">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <p className="text-muted-foreground mb-2">
              For return and exchange requests, email us at{" "}
              <span className="text-primary font-medium">returns@shringaar.com</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Include your order number, issue description, photos, and unboxing video link
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Returns;
