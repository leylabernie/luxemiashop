import type { VercelRequest, VercelResponse } from '@vercel/node';
import fs from 'fs';
import path from 'path';

export default function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const feedPath = path.join(process.cwd(), 'public', 'merchant-feed.xml');
    const feedContent = fs.readFileSync(feedPath, 'utf8');
    
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=3600, must-revalidate');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.status(200).send(feedContent);
  } catch (error) {
    res.status(500).send('<?xml version="1.0"?><error>Feed not available</error>');
  }
}
