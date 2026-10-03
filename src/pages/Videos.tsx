/**
 * Shop by Video — gallery of every product that has a video on its listing.
 * Each tile plays the product's first video inline (muted, loop, playsInline,
 * poster = the video's preview image) and links to the product page, so a
 * tap while browsing never traps the customer inside the player.
 */
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/seo/SEOHead';
import { fetchAllProducts, type ShopifyProduct } from '@/lib/shopify';
import { getIndexableRouteSeo } from '@/config/seoArchitecture';

interface VideoTile {
  handle: string;
  title: string;
  videoUrl: string;
  posterUrl?: string;
  price?: string;
}

const toTile = (product: ShopifyProduct): VideoTile | null => {
  const media = product.node.media?.edges || [];
  const video = media.find(edge => edge.node.mediaContentType === 'VIDEO' || edge.node.mediaContentType === 'Video');
  if (!video) return null;
  const sources = (video.node as { sources?: Array<{ url: string }> }).sources || [];
  const source = sources.find(s => s.url) || sources[0];
  if (!source) return null;
  const price = product.node.variants?.edges?.[0]?.node?.price?.amount;
  return {
    handle: product.node.handle,
    title: product.node.title,
    videoUrl: source.url,
    posterUrl: video.node.previewImage?.url || product.node.images?.edges?.[0]?.node?.url,
    price: price ? `$${Number(price).toFixed(0)}` : undefined,
  };
};

const VideoCard = ({ tile }: { tile: VideoTile }) => (
  <div className="group relative overflow-hidden rounded-lg border bg-card">
    <div className="relative aspect-[3/4] bg-black">
      <video
        src={tile.videoUrl}
        poster={tile.posterUrl}
        muted
        loop
        playsInline
        controls
        preload="none"
        className="h-full w-full object-cover"
      />
    </div>
    <div className="p-3">
      <Link
        to={`/product/${tile.handle}`}
        className="line-clamp-2 text-sm font-medium hover:underline"
      >
        {tile.title}
      </Link>
      {tile.price && (
        <p className="mt-1 text-sm text-muted-foreground">{tile.price}</p>
      )}
    </div>
  </div>
);

const seo = getIndexableRouteSeo('/videos');

const Videos = () => {
  const [tiles, setTiles] = useState<VideoTile[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchAllProducts()
      .then(products => {
        if (cancelled) return;
        const withVideo = products
          .map(toTile)
          .filter((t): t is VideoTile => t !== null);
        setTiles(withVideo);
      })
      .catch(() => {
        if (!cancelled) setTiles([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const count = tiles?.length ?? 0;
  const jsonLd = useMemo(() => (tiles && tiles.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: seo.title,
    description: seo.description,
    hasPart: tiles.map(t => ({
      '@type': 'Product',
      name: t.title,
      url: `https://luxemia.shop/product/${t.handle}`,
    })),
  } : null), [tiles]);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={seo.title}
        description={seo.description}
        canonical="https://luxemia.shop/videos"
      />
      <Header />
      <main className="container mx-auto px-4 py-10 lg:px-8">
        <div className="mb-8 max-w-2xl">
          <h1 className="font-serif text-3xl lg:text-4xl">{seo.h1}</h1>
          <p className="mt-3 text-muted-foreground">
            Every LuxeMia listing with a video, in one place — watch the drape,
            the flair and the embroidery in motion, then shop the exact piece.
          </p>
        </div>

        {tiles === null ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : count === 0 ? (
          <p className="text-muted-foreground">
            Videos are being updated. Check back shortly.
          </p>
        ) : (
          <>
            <p className="mb-4 text-sm text-muted-foreground">
              {count} {count === 1 ? 'video' : 'videos'}
            </p>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {tiles.map(tile => (
                <VideoCard key={tile.handle} tile={tile} />
              ))}
            </div>
          </>
        )}
      </main>
      <Footer />
      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </div>
  );
};

export default Videos;
