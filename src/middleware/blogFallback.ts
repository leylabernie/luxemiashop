import { blogPosts, PUBLISHED_BLOG_SLUGS } from '../data/blogPosts.js';
import { BLOG_CATEGORY_GROUPS, BLOG_POST_CATEGORY_MAP } from '../data/blogCategories.js';
import { serializeJsonLd } from '../lib/serializeJsonLd.cjs';

const escapeHtml = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

/** Render only checked-in published articles or topic hubs; never synthesize an unknown slug. */
export function generateBlogFallback(slug: string): string | null {
  const post = PUBLISHED_BLOG_SLUGS.some(value => value === slug) ? blogPosts.find(item => item.slug === slug) : undefined;
  const group = BLOG_CATEGORY_GROUPS.find(item => item.slug === slug);
  if (!post && !group) return null;
  const title = post?.title || group!.name;
  const description = post?.excerpt || group!.metaDescription;
  const url = `https://luxemia.shop/blog/${slug}`;
  const schema = post ? {
    '@context': 'https://schema.org', '@type': 'BlogPosting', headline: title,
    description, mainEntityOfPage: url, datePublished: post.publishedAt,
    dateModified: post.updatedAt, author: { '@type': 'Organization', name: post.author },
    publisher: { '@type': 'Organization', name: 'LuxeMia' },
  } : { '@context': 'https://schema.org', '@type': 'CollectionPage', name: title, description, url };

  // Checked-in article HTML is also rendered by React. For this emergency
  // server fallback emit its full text as escaped paragraphs, never executing
  // markup or event handlers; hydration restores the normal article layout.
  const body = post ? (post.content || post.excerpt)
    .replace(/<\/(?:p|h[1-6]|li|tr|div|blockquote|table|section)>/gi, '\n')
    .replace(/<br\s*\/?\s*>/gi, '\n')
    .replace(/<[^>]*>/g, ' ')
    .split(/\n+/).map(part => part.replace(/\s+/g, ' ').trim()).filter(Boolean)
    .map(part => `<p>${escapeHtml(part)}</p>`).join('')
    : `<p>${escapeHtml(group!.longDescription)}</p><ul>${blogPosts.filter(item => PUBLISHED_BLOG_SLUGS.some(value => value === item.slug) && BLOG_POST_CATEGORY_MAP[item.slug] === slug)
      .map(item => `<li><a href="/blog/${escapeHtml(item.slug)}">${escapeHtml(item.title)}</a></li>`).join('')}</ul>`;

  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)} | LuxeMia</title><meta name="description" content="${escapeHtml(description)}"><link rel="canonical" href="${escapeHtml(url)}"><meta name="robots" content="index, follow"><script type="application/ld+json">${serializeJsonLd(schema)}</script></head><body><main><nav><a href="/blog">Blog</a></nav><article><h1>${escapeHtml(title)}</h1>${body}</article></main></body></html>`;
}
