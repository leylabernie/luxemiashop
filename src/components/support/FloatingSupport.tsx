import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Phone, Mail, HelpCircle, MessagesSquare } from 'lucide-react';

const WHATSAPP_NUMBER = '12153419990'; // Replace with actual number
const WHATSAPP_MESSAGE = encodeURIComponent('Hi! I have a question about your ethnic wear collection.');

// Tawk.to Property ID - Replace with your actual Tawk.to property ID
const TAWKTO_PROPERTY_ID = '6776c6feaf5bfec1dbe69971';
const TAWKTO_WIDGET_ID = '1igmejd2o';

declare global {
  interface Window {
    Tawk_API?: {
      toggle?: () => void;
      maximize?: () => void;
      minimize?: () => void;
      hideWidget?: () => void;
      showWidget?: () => void;
      onLoad?: () => void;
    };
    Tawk_LoadStart?: Date;
  }
}

const FloatingSupport = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showPulse, setShowPulse] = useState(true);
  const [tawkLoaded, setTawkLoaded] = useState(false);

  // Load Tawk.to script
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.Tawk_API) {
      window.Tawk_API = {};
      window.Tawk_LoadStart = new Date();

      const script = document.createElement('script');
      script.async = true;
      script.src = `https://embed.tawk.to/${TAWKTO_PROPERTY_ID}/${TAWKTO_WIDGET_ID}`;
      script.charset = 'UTF-8';
      script.setAttribute('crossorigin', '*');
      
      script.onload = () => {
        // Hide default Tawk.to widget - we'll use our custom button
        const checkTawkReady = setInterval(() => {
          if (window.Tawk_API?.hideWidget) {
            window.Tawk_API.hideWidget();
            setTawkLoaded(true);
            clearInterval(checkTawkReady);
          }
        }, 100);

        // Cleanup after 10 seconds if not loaded
        setTimeout(() => clearInterval(checkTawkReady), 10000);
      };

      document.head.appendChild(script);

      return () => {
        // Cleanup script on unmount if needed
        const existingScript = document.querySelector(`script[src*="embed.tawk.to"]`);
        if (existingScript) {
          existingScript.remove();
        }
      };
    }
  }, []);

  // Stop pulse animation after first interaction
  useEffect(() => {
    if (isOpen) setShowPulse(false);
  }, [isOpen]);

  const openTawkChat = () => {
    if (window.Tawk_API?.maximize) {
      window.Tawk_API.showWidget?.();
      window.Tawk_API.maximize();
      setIsOpen(false);
    }
  };

  const supportOptions = [
    {
      icon: MessagesSquare,
      label: 'Live Chat',
      description: tawkLoaded ? 'Chat with us now' : 'Loading...',
      action: openTawkChat,
      color: 'bg-blue-500 hover:bg-blue-600',
      isButton: true,
    },
    {
      icon: () => (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      ),
      label: 'WhatsApp',
      description: 'Chat with us instantly',
      href: `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`,
      color: 'bg-[#25D366] hover:bg-[#20BA5A]',
      external: true,
    },
    {
      icon: Phone,
      label: 'Call Us',
      description: '+1-215-341-9990',
      href: 'tel:+12153419990',
      color: 'bg-primary hover:bg-primary/90',
      external: false,
    },
    {
      icon: Mail,
      label: 'Email',
      description: 'hello@luxemia.com',
      href: 'mailto:hello@luxemia.com?subject=Customer%20Inquiry',
      color: 'bg-foreground hover:bg-foreground/90',
      external: false,
    },
    {
      icon: HelpCircle,
      label: 'FAQ',
      description: 'Find quick answers',
      href: '/faq',
      color: 'bg-secondary text-foreground hover:bg-secondary/80',
      external: false,
    },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-16 right-0 w-72 bg-background rounded-lg shadow-xl border border-border overflow-hidden"
          >
            {/* Header */}
            <div className="bg-foreground text-background p-4">
              <h3 className="font-serif text-lg">Need Help?</h3>
              <p className="text-sm text-background/80 font-light">
                We're here to assist you
              </p>
            </div>

            {/* Options */}
            <div className="p-3 space-y-2">
              {supportOptions.map((option) => {
                const IconComponent = option.icon;
                const isExternal = 'external' in option && option.external;
                const isButton = 'isButton' in option && option.isButton;
                
                if (isButton) {
                  return (
                    <button
                      key={option.label}
                      onClick={option.action}
                      disabled={!tawkLoaded}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors group w-full text-left disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className={`w-10 h-10 rounded-full ${option.color} flex items-center justify-center text-white transition-colors`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{option.label}</p>
                        <p className="text-xs text-muted-foreground">{option.description}</p>
                      </div>
                      {!tawkLoaded && (
                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      )}
                    </button>
                  );
                }
                
                return (
                  <a
                    key={option.label}
                    href={'href' in option ? option.href : '#'}
                    target={isExternal ? '_blank' : undefined}
                    rel={isExternal ? 'noopener noreferrer' : undefined}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors group"
                    onClick={() => setIsOpen(false)}
                  >
                    <div className={`w-10 h-10 rounded-full ${option.color} flex items-center justify-center text-background transition-colors`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{option.label}</p>
                      <p className="text-xs text-muted-foreground">{option.description}</p>
                    </div>
                  </a>
                );
              })}
            </div>

            {/* Online Status */}
            <div className="px-4 py-3 bg-secondary/30 border-t border-border">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${tawkLoaded ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse`} />
                <span className="text-xs text-muted-foreground">
                  {tawkLoaded ? 'Live agents available now' : 'Connecting to support...'}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`relative w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-colors ${
          isOpen 
            ? 'bg-foreground text-background' 
            : 'bg-[#25D366] text-white'
        }`}
        aria-label={isOpen ? 'Close support menu' : 'Open support menu'}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <MessageCircle className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pulse Animation */}
        {showPulse && !isOpen && (
          <>
            <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-30" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[10px] text-white font-medium">
              1
            </span>
          </>
        )}
      </motion.button>
    </div>
  );
};

export default FloatingSupport;
