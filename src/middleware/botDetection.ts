/**
 * Bot Detection Module
 *
 * Centralized list of search engine bot user agents for middleware detection.
 * Extracted from middleware.ts for maintainability and testability.
 */

export const BOT_USER_AGENTS: string[] = [
  'googlebot',
  'google-inspectiontool',
  'google-InspectionTool',
  'mediapartners-google',
  'bingbot',
  'yandexbot',
  'duckduckbot',
  'baiduspider',
  'slurp',
  'sogou',
  'facebookexternalhit',
  'facebot',
  'twitterbot',
  'linkedinbot',
  'whatsapp',
  'telegrambot',
  'applebot',
  'pinterestbot',
  'redditbot',
  'oai-searchbot',
  'perplexitybot',
  'claudebot',
  'gptbot',
  'ia_archiver',
  'semrushbot',
  'ahrefsbot',
  'mj12bot',
  'dotbot',
  'petalbot',
  'bytespider',
  // Additional crawlers that GMC / Google Shopping may use
  'googleweb-light',
  'google-sa',
  'storebot-google',
  'google-sitemaps',
  'adsbot-google',
  'feedfetcher-google',
  // GMC-specific page checker user agents
  'adsbot-google-mobile',
  'mediapartners-google',
  'google-produce',
  'google-shopping',
];

export function isBot(userAgent: string): boolean {
  const ua = userAgent.toLowerCase();
  return BOT_USER_AGENTS.some((bot) => ua.includes(bot.toLowerCase()));
}
