import { Facebook, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  buildPinterestPinDescription,
  withShareUtm,
  type PinFulfillment,
} from '@/lib/pinterestPin';

const WhatsAppIcon = () => (
  <svg viewBox="0 0 32 32" className="h-5 w-5 fill-white" xmlns="http://www.w3.org/2000/svg">
    <path d="M16.004 2.002c-7.732 0-14.002 6.27-14.002 14.002 0 2.468.655 4.876 1.898 6.99L2 30l7.193-1.862A13.94 13.94 0 0 0 16.004 30c7.732 0 14.002-6.268 14.002-14.002S23.736 2.002 16.004 2.002Zm0 25.616a11.58 11.58 0 0 1-5.91-1.617l-.424-.252-4.394 1.152 1.172-4.284-.276-.44a11.57 11.57 0 0 1-1.776-6.173c0-6.408 5.216-11.62 11.624-11.62 6.406 0 11.618 5.212 11.618 11.62 0 6.41-5.22 11.614-11.634 11.614Zm6.372-8.704c-.35-.174-2.068-1.02-2.39-1.136-.32-.118-.554-.174-.786.174-.234.35-.906 1.136-1.11 1.37-.204.234-.41.264-.758.088-.35-.174-1.474-.544-2.808-1.734-1.038-.924-1.738-2.066-1.942-2.416-.204-.35-.022-.538.154-.712.158-.156.35-.408.524-.612.176-.204.234-.35.35-.584.118-.234.06-.438-.028-.612-.088-.176-.786-1.896-1.078-2.596-.284-.68-.572-.588-.786-.598l-.67-.012c-.234 0-.612.088-.932.438-.32.35-1.224 1.196-1.224 2.916s1.254 3.382 1.428 3.616c.176.234 2.468 3.768 5.98 5.282.836.36 1.488.576 1.996.738.838.266 1.602.228 2.204.138.672-.1 2.068-.846 2.36-1.662.292-.818.292-1.518.204-1.662-.088-.146-.32-.234-.67-.408Z" />
  </svg>
);

const PinterestIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
  </svg>
);

interface SocialShareProps {
  productTitle: string;
  productUrl: string;
  productImage?: string;
  /** Catalog attributes for the Pinterest pin formula. All optional. */
  productColor?: string;
  productMaterial?: string;
  productCategory?: string;
  productOccasion?: string;
  fulfillment?: PinFulfillment;
  className?: string;
}

/** Native sharing URLs — no external SDKs or dependencies required. */
const buildWhatsAppUrl = (text: string, url: string) =>
  `https://wa.me/?text=${encodeURIComponent(`${text}\n\n${url}`)}`;

const buildPinterestUrl = (url: string, media?: string, description?: string) =>
  `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}${
    media ? `&media=${encodeURIComponent(media)}` : ''
  }${description ? `&description=${encodeURIComponent(description)}` : ''}`;

const buildFacebookUrl = (url: string) =>
  `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;

export const SocialShare = ({
  productTitle,
  productUrl,
  productImage,
  productColor,
  productMaterial,
  productCategory,
  productOccasion,
  fulfillment,
  className,
}: SocialShareProps) => {
  // Each channel gets its own utm_source so GA4 can attribute organic social
  // clicks without any paid tooling. The canonical URL stays on the page.
  const whatsappDestination = withShareUtm(productUrl, 'whatsapp');
  const pinterestDestination = withShareUtm(productUrl, 'pinterest');
  const facebookDestination = withShareUtm(productUrl, 'facebook');
  const whatsappText = `Check out ${productTitle} at LuxeMia`;
  // Rich pin copy: published delivery, lining, seam-allowance and support
  // facts only — never invented craftsmanship or insurance claims.
  const pinterestDescription = buildPinterestPinDescription({
    title: productTitle,
    color: productColor,
    material: productMaterial,
    category: productCategory,
    occasion: productOccasion,
    url: pinterestDestination,
    fulfillment,
  });

  return (
    <div className={`flex flex-col sm:flex-row gap-2 sm:gap-3 ${className || ''}`}>
      {/* WhatsApp — direct to a contact or status */}

      <Button
        as="a"
        href={buildWhatsAppUrl(whatsappText, whatsappDestination)}
        target="_blank"
        rel="noopener noreferrer"
        variant="outline"
        size="icon"
        aria-label="Share on WhatsApp"
        className="h-10 w-10 sm:h-11 sm:w-11 bg-[#25D366] text-white hover:bg-[#20BD5E] transition-colors"
      >
        <WhatsAppIcon />
      </Button>

      {/* Pinterest — save the product pin */}

      <Button
        as="a"
        href={buildPinterestUrl(pinterestDestination, productImage, pinterestDescription)}
        target="_blank"
        rel="noopener noreferrer"
        variant="outline"
        size="icon"
        aria-label="Pin to Pinterest"
        className="h-10 w-10 sm:h-11 sm:w-11 bg-[#E60023] text-white hover:bg-[#CC001F] transition-colors"
      >
        <PinterestIcon />
      </Button>

      {/* Facebook — share to timeline or message */}

      <Button
        as="a"
        href={buildFacebookUrl(facebookDestination)}
        target="_blank"
        rel="noopener noreferrer"
        variant="outline"
        size="icon"
        aria-label="Share on Facebook"
        className="h-10 w-10 sm:h-11 sm:w-11 bg-[#1877F2] text-white hover:bg-[#166FE5] transition-colors"
      >
        <Facebook className="h-5 w-5" />
      </Button>

      {/* Generic share — Web Share API with clipboard fallback */}

      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={async () => {
          try {
            if (navigator.share) {
              await navigator.share({
                title: productTitle,
                text: `View ${productTitle} at LuxeMia`,
                url: productUrl,
              });
              return;
            }
            await navigator.clipboard.writeText(productUrl);
          } catch {
            if (navigator.clipboard) {
              await navigator.clipboard.writeText(productUrl);
            }
          }
        }}
        aria-label="Copy product link"
        className="h-10 w-10 sm:h-11 sm:w-11"
      >
        <Share2 className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default SocialShare;
