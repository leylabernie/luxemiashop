import { motion } from 'framer-motion';
import { Truck, Clock, Globe, Package } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const shippingInfo = [
  {
    region: 'United States',
    standard: '5-7 business days',
    express: '2-3 business days',
    standardCost: '$12.95',
    expressCost: '$24.95',
  },
  {
    region: 'Canada',
    standard: '7-10 business days',
    express: '3-5 business days',
    standardCost: '$18.95',
    expressCost: '$34.95',
  },
  {
    region: 'United Kingdom',
    standard: '10-14 business days',
    express: '5-7 business days',
    standardCost: '$24.95',
    expressCost: '$49.95',
  },
  {
    region: 'Australia & New Zealand',
    standard: '14-21 business days',
    express: '7-10 business days',
    standardCost: '$29.95',
    expressCost: '$54.95',
  },
  {
    region: 'Europe',
    standard: '10-14 business days',
    express: '5-7 business days',
    standardCost: '$24.95',
    expressCost: '$49.95',
  },
  {
    region: 'Rest of World',
    standard: '21-28 business days',
    express: '10-14 business days',
    standardCost: '$34.95',
    expressCost: '$64.95',
  },
];

const Shipping = () => {
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
                Delivery Information
              </p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif mb-6">Shipping</h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                We ship worldwide from our fulfillment centers. All orders are carefully packaged to ensure your pieces arrive in perfect condition.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Key Features */}
        <section className="py-12 border-b border-border">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { icon: Globe, title: 'Worldwide Shipping', desc: 'Delivering to 50+ countries' },
                { icon: Package, title: 'Secure Packaging', desc: 'Gift-ready presentation' },
                { icon: Truck, title: 'Tracking Provided', desc: 'Track your order live' },
                { icon: Clock, title: 'Processing Time', desc: '1-2 business days' },
              ].map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="text-center p-6"
                >
                  <item.icon className="h-8 w-8 mx-auto mb-3 text-primary" />
                  <h3 className="font-medium mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Shipping Rates Table */}
        <section className="py-16">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-2xl font-serif mb-8 text-center">Shipping Rates & Delivery Times</h2>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-4 px-4 font-medium">Region</th>
                      <th className="text-left py-4 px-4 font-medium">Standard</th>
                      <th className="text-left py-4 px-4 font-medium">Express</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shippingInfo.map((row) => (
                      <tr key={row.region} className="border-b border-border/50">
                        <td className="py-4 px-4 font-medium">{row.region}</td>
                        <td className="py-4 px-4">
                          <span className="text-muted-foreground">{row.standard}</span>
                          <br />
                          <span className="font-medium">{row.standardCost}</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-muted-foreground">{row.express}</span>
                          <br />
                          <span className="font-medium">{row.expressCost}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-8 p-6 bg-card border border-border/50 rounded-sm space-y-4">
                <h3 className="font-medium">Important Notes</h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Processing time is 1-2 business days for ready-to-ship items.</li>
                  <li>• Custom and made-to-order pieces may require 2-3 weeks for creation.</li>
                  <li>• Delivery times are estimates and may vary during peak seasons.</li>
                  <li>• Import duties and taxes are the responsibility of the customer.</li>
                  <li>• You will receive tracking information via email once your order ships.</li>
                </ul>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Shipping;
