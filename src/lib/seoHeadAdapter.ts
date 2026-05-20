import type { PageMetadata } from './seoMetadata';

export interface SEOHeadMetadataInput extends PageMetadata {
  image?: string;
  noIndex?: boolean;
}

export interface SEOHeadMetadataProps {
  title: string;
  description: string;
  canonical: string;
  image: string;
  type: PageMetadata['type'];
  noIndex: boolean;
}

const isNoIndexMetadata = (metadata: Pick<PageMetadata, 'robots' | 'indexability'>): boolean =>
  metadata.indexability === 'noindex' || metadata.robots.startsWith('noindex');

/**
 * Convert the shared metadata shape into the existing SEOHead prop shape.
 *
 * Preparation-only helper: this does not wire shared metadata into live pages.
 * SEOHead currently expects `image`; shared metadata uses `ogImage`, so callers
 * may still pass `image` as an override while pages migrate gradually.
 */
export function metadataToSEOHeadProps(metadata: SEOHeadMetadataInput): SEOHeadMetadataProps {
  return {
    title: metadata.title,
    description: metadata.description,
    canonical: metadata.canonical,
    image: metadata.image || metadata.ogImage,
    type: metadata.type,
    noIndex: metadata.noIndex ?? isNoIndexMetadata(metadata),
  };
}
