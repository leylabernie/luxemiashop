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
  role: 'Indian Wedding & Ethnic Wear Editors',
  credentials: 'Product and shopping guidance reviewed by the LuxeMia team',
  bio: `The LuxeMia Editorial Team creates practical guides for shopping Indian ethnic wear online. Our articles cover occasion dressing, garment terminology, sizing, care, shipping and styling considerations for customers in the USA, Canada and Australia.

We review product details and policy information before publication and update time-sensitive subjects, including customs and delivery guidance, when official information changes. Readers should confirm current customs rules with the relevant government authority before ordering.`,
  expertise: [
    'Indian Wedding Attire',
    'Ethnic Wear Sizing',
    'Occasion Styling',
    'Garment Care',
    'Online Shopping Guidance',
  ],
  location: 'Philadelphia, USA',
  publishedAt: '2026-01-05',
};

export const BLOG_AUTHORS: BlogAuthor[] = [EDITORIAL_TEAM];

export function getAuthorBySlug(slug: string): BlogAuthor | undefined {
  return BLOG_AUTHORS.find((author) => author.slug === slug);
}

export function getAuthorByName(_authorString: string): BlogAuthor {
  return EDITORIAL_TEAM;
}
