const fs = require('fs');
const path = require('path');

module.exports = function handler(req, res) {
  try {
    // Try multiple possible locations for the feed file
    const possiblePaths = [
      path.join(process.cwd(), 'public', 'merchant-feed.xml'),
      path.join(process.cwd(), 'dist', 'merchant-feed.xml'),
      path.join(__dirname, '..', 'public', 'merchant-feed.xml'),
    ];
    
    let feedContent = null;
    for (const p of possiblePaths) {
      try {
        feedContent = fs.readFileSync(p, 'utf8');
        break;
      } catch (e) {
        // Try next path
      }
    }
    
    if (!feedContent) {
      res.status(500).send('<?xml version="1.0"?><error>Feed file not found</error>');
      return;
    }
    
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=3600, must-revalidate');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.status(200).send(feedContent);
  } catch (error) {
    res.status(500).send('<?xml version="1.0"?><error>Feed generation failed</error>');
  }
};
