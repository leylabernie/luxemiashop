import { Truck, RefreshCw, Ruler, ShieldCheck, Clock, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const services = [
  {
    icon: Truck,
    title: 'Tracked U.S. Shipping',
    description: 'United States addresses only',
  },
  {
    icon: ShieldCheck,
    title: 'Secure Checkout',
    description: 'Checkout is handled through Shopify',
  },
  {
    icon: Ruler,
    title: 'Listing-Specific Sizing',
    description: 'Available sizes are shown on each product',
  },
  {
    icon: Clock,
    title: 'Tracking After Dispatch',
    description: 'Tracking is sent by email after dispatch',
  },
  {
    icon: RefreshCw,
    title: '24-Hour Cancellation',
    description: 'Contact support within 24 hours of ordering',
  },
  {
    icon: Sparkles,
    title: 'U.S.-Based Support',
    description: 'Product and sizing help before ordering',
  },
];

const ServiceHighlights = () => {
  return (
    <section className="border-y border-[#e3cfca] bg-[#f4e8e3]">
      <div className="container mx-auto px-4">
        {/* Scrolling banner on mobile, grid on desktop */}
        <div className="hidden lg:block py-5">
          <div className="grid grid-cols-6 gap-6">
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                viewport={{ once: true }}
                className="group flex cursor-default items-center gap-3"
              >
                <div className="flex-shrink-0 rounded-full bg-[#fffaf6] p-2 text-[#a96f72] transition-colors group-hover:bg-[#f9dcd6]">
                  <service.icon className="h-4 w-4 text-[#a96f72]" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="text-sm font-medium leading-tight text-[#493235]">
                    {service.title}
                  </h3>
                  <p className="text-xs font-light text-[#806d69]">
                    {service.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Mobile: Horizontal scroll */}
        <div className="lg:hidden py-4 -mx-4 px-4 overflow-x-auto scrollbar-hide">
          <div className="flex min-w-max gap-6">
            {services.slice(0, 4).map((service) => (
              <div
                key={service.title}
                className="flex items-center gap-2.5 text-[#493235]"
              >
                <div className="flex-shrink-0 rounded-full bg-[#fffaf6] p-2">
                  <service.icon className="h-4 w-4 text-[#a96f72]" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="whitespace-nowrap text-sm font-medium text-[#493235]">
                    {service.title}
                  </h3>
                  <p className="whitespace-nowrap text-xs font-light text-[#806d69]">
                    {service.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServiceHighlights;
