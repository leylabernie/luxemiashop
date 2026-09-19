#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const file = path.resolve(__dirname, '../src/components/home/NewArrivalsBanner.tsx');
const source = fs.readFileSync(file, 'utf8');
const eagerBlock = `  useEffect(() => {\n    const nextSlide = featuredSlides[(index + 1) % featuredSlides.length];\n    const source =\n      window.matchMedia('(min-width: 640px)').matches && nextSlide.desktopImage\n        ? nextSlide.desktopImage\n        : nextSlide.image;\n    const preloadedImage = new Image();\n    preloadedImage.src = \`\${source}.webp\`;\n  }, [index]);\n\n`;

if (source.includes(eagerBlock)) {
  fs.writeFileSync(file, source.replace(eagerBlock, ''), 'utf8');
  console.log('[hero-preload] Removed eager preload for the inactive next slide.');
} else if (source.includes('const preloadedImage = new Image();')) {
  throw new Error('[hero-preload] Eager slide preload changed shape and was not safely removed.');
} else {
  console.log('[hero-preload] Eager inactive-slide preload is already absent.');
}
