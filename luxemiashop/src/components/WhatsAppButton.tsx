import { MessageCircle } from 'lucide-react';

const WHATSAPP_URL =
  'https://wa.me/12153419990?text=Hi%2C%20I%20need%20help%20with%20styling%20and%20sizing';

const WhatsAppButton = () => {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp for styling help"
      className="fixed bottom-20 md:bottom-6 right-4 z-30 flex flex-col items-center gap-1 group"
    >
      <span
        className="flex items-center justify-center h-12 w-12 md:h-14 md:w-14 rounded-full shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:shadow-xl"
        style={{ backgroundColor: '#25D366' }}
      >
        {/* WhatsApp SVG icon */}
        <svg
          viewBox="0 0 32 32"
          className="h-6 w-6 md:h-7 md:w-7 fill-white"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M16.004 2.002c-7.732 0-14.002 6.27-14.002 14.002 0 2.468.655 4.876 1.898 6.99L2 30l7.193-1.862A13.94 13.94 0 0 0 16.004 30c7.732 0 14.002-6.268 14.002-14.002S23.736 2.002 16.004 2.002Zm0 25.616a11.58 11.58 0 0 1-5.91-1.617l-.424-.252-4.394 1.152 1.172-4.284-.276-.44a11.57 11.57 0 0 1-1.776-6.173c0-6.408 5.216-11.62 11.624-11.62 6.406 0 11.618 5.212 11.618 11.62 0 6.41-5.22 11.614-11.634 11.614Zm6.372-8.704c-.35-.174-2.068-1.02-2.39-1.136-.32-.118-.554-.174-.786.174-.234.35-.906 1.136-1.11 1.37-.204.234-.41.264-.758.088-.35-.174-1.474-.544-2.808-1.734-1.038-.924-1.738-2.066-1.942-2.416-.204-.35-.022-.538.154-.712.158-.156.35-.408.524-.612.176-.204.234-.35.35-.584.118-.234.06-.438-.028-.612-.088-.176-.786-1.896-1.078-2.596-.284-.68-.572-.588-.786-.598l-.67-.012c-.234 0-.612.088-.932.438-.32.35-1.224 1.196-1.224 2.916s1.254 3.382 1.428 3.616c.176.234 2.468 3.768 5.98 5.282.836.36 1.488.576 1.996.738.838.266 1.602.228 2.204.138.672-.1 2.068-.846 2.36-1.662.292-.818.292-1.518.204-1.662-.088-.146-.32-.234-.67-.408Z" />
        </svg>
      </span>
      <span className="text-[10px] md:text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors whitespace-nowrap">
        Styling Help
      </span>
    </a>
  );
};

export default WhatsAppButton;
