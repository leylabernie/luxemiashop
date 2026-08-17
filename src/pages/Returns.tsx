import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/seo/SEOHead';

const Returns = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Returns, Refunds & Cancellations | LuxeMia"
        description="LuxeMia's U.S. return window, customer-paid buyer-remorse return shipping, and no-cost resolution process for verified covered order issues."
        canonical="https://luxemia.shop/returns"
      />
      <Header />

      <main className="pt-[90px] lg:pt-[132px] pb-16">
        <section className="py-16 lg:py-24 bg-gradient-to-b from-secondary to-background">
          <div className="container mx-auto px-4 lg:px-8 max-w-3xl text-center">
            <p className="text-sm tracking-luxury uppercase text-muted-foreground mb-4">Returns</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif mb-6">Returns Policy</h1>
            <p className="text-muted-foreground leading-relaxed">
              Eligible U.S. standard-stock items may be returned within 30 calendar days of delivery. Customers pay return shipping for
              buyer-remorse returns. LuxeMia covers standard return shipping for verified damaged, incorrect or missing-item claims when a return is required.
            </p>
          </div>
        </section>

        <section className="container mx-auto px-4 lg:px-8 max-w-3xl py-12">
          <div className="prose prose-neutral max-w-none text-muted-foreground">
            <h2 className="text-foreground">Eligible U.S. returns</h2>
            <p>
              LuxeMia accepts return requests for eligible U.S. standard-stock items made within 30 calendar days of delivery. To be eligible,
              an item must be unworn, unwashed, unaltered, and returned with its original tags and packaging.
            </p>

            <h2 className="text-foreground">Items not eligible for buyer-remorse returns</h2>
            <p>
              Customised, altered, made-to-order, and clearly identified final-sale items are not eligible for buyer-remorse returns.
              International orders are final sale for buyer-remorse purposes, subject to consumer rights or remedies that cannot legally be excluded
              in the customer&apos;s jurisdiction.
            </p>

            <h2 className="text-foreground">Return shipping cost and method</h2>
            <p>
              For an eligible U.S. buyer-remorse return, the customer is responsible for securely packaging the item and purchasing tracked return shipping.
              LuxeMia does not charge a restocking fee for an eligible U.S. standard-stock return. Email us before sending an item back; LuxeMia will confirm
              eligibility and provide return instructions. Do not send a return until those instructions have been provided.
            </p>

            <h2 className="text-foreground">Covered order issues</h2>
            <p>
              If an item arrives damaged, is incorrect, or is missing, contact LuxeMia within 48 hours of delivery. Provide clear photos and a continuous
              unboxing/opening video showing the unopened package, shipping label, opening process, contents, and item condition. If LuxeMia confirms a covered
              issue and a return is required, LuxeMia will provide a prepaid standard return label or another reasonable return method at no cost to the customer.
              Depending on the circumstances, LuxeMia may offer a replacement or a full refund instead of requiring a return.
            </p>

            <h2 className="text-foreground">How to start a return or report an issue</h2>
            <p>
              Email <a href="mailto:hello@luxemia.shop">hello@luxemia.shop</a> with your order number, item name, and return reason. For a covered order issue,
              include the required photos and continuous video. Keep the item and all packaging until LuxeMia reviews the request.
            </p>

            <h2 className="text-foreground">Refunds</h2>
            <p>
              After LuxeMia receives and inspects an eligible return, approved refunds are issued to the original payment method within 10 business days.
              Original outbound shipping, express shipping, customs duties, import taxes, brokerage, and carrier charges are not refundable unless required by law
              or the issue is a confirmed LuxeMia error.
            </p>

            <h2 className="text-foreground">Order cancellations</h2>
            <p>
              Cancellation requests must be made within 24 hours of order placement. After that window, cancellation requests are not accepted.
              Email hello@luxemia.shop immediately with your order number.
            </p>

            <h2 className="text-foreground">Mandatory rights</h2>
            <p>Nothing in this policy limits consumer rights or remedies that cannot legally be excluded in the customer&apos;s jurisdiction.</p>

            <h2 className="text-foreground">Questions</h2>
            <p>
              For return questions, email <a href="mailto:hello@luxemia.shop">hello@luxemia.shop</a> or call{' '}
              <a href="tel:+12153419990">+1 215-341-9990</a>.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Returns;
