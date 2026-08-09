/**
 * Public author information must be factual and verifiable. Until individual
 * contributors are documented, articles are attributed to the editorial team
 * rather than presenting invented biographies or third-party credentials.
 */
export interface BlogAuthor {
  slug: string;
  name: string;
  role: string;
  credentials: string;
  bio: string;
  expertise: string[];
  location: string;
  image?: string;
  publishedAt: string;
}

const EDITORIAL_TEAM: BlogAuthor = {
  slug: 'luxemia-editorial-team',
  name: 'LuxeMia Editorial Team',
  role: 'Editorial and Source Review',
  credentials: 'Source-based guides reviewed against cited references and current LuxeMia policies',
  bio: `LuxeMia publishes practical guides for shopping Indian ethnic wear online. Articles cover garment terminology, measurements, textiles, cultural context, care, shipping and optional styling considerations for customers in the United States.

Every published guide identifies its sources and review date. Brand-owned sources are attributed as brand claims, cultural practices are not presented as universal rules, and styling suggestions are labelled as guidance. Individual product listings remain the source of truth for materials, included pieces, stitching, measurements, price and availability. No unnamed individual credentials are claimed for the team.`,
  expertise: [
    'Source Review',
    'Clothing Measurements',
    'Textile Terminology',
    'Cultural Context',
    'Shopping Guidance',
  ],
  location: 'United States',
  publishedAt: '2026-01-05',
};

export const BLOG_AUTHORS: BlogAuthor[] = [EDITORIAL_TEAM];

export function getAuthorBySlug(slug: string): BlogAuthor | undefined {
  return BLOG_AUTHORS.find((author) => author.slug === slug);
}

export function getAuthorByName(_authorString: string): BlogAuthor {
  return EDITORIAL_TEAM;
}
