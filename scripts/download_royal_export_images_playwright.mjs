import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const MAP_PATH = 'royal-export-selected-image-map.json';
const OUT_DIR = 'royal-export-artifact';

const products = JSON.parse(await fs.readFile(MAP_PATH, 'utf8'));
if (!Array.isArray(products) || products.length !== 16) {
  throw new Error(`Expected 16 approved products, found ${products?.length ?? 'invalid map'}`);
}

await fs.rm(OUT_DIR, { recursive: true, force: true });
await fs.mkdir(path.join(OUT_DIR, 'images'), { recursive: true });

const browser = await chromium.launch({ headless: true });
const manifest = [];

const isImageBuffer = (buffer) => {
  if (!buffer || buffer.length < 15000) return false;
  const jpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  const png = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
  const webp = buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP';
  return jpeg || png || webp;
};

const extensionFor = (buffer) => {
  if (buffer[0] === 0x89 && buffer[1] === 0x50) return '.png';
  if (buffer.toString('ascii', 0, 4) === 'RIFF') return '.webp';
  return '.jpg';
};

for (const product of products) {
  const { sku, source_url: sourceUrl } = product;
  const targets = product.images.slice(0, 4);
  if (targets.length !== 4) throw new Error(`${sku}: expected 4 selected images`);

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36',
    locale: 'en-US',
    viewport: { width: 1440, height: 1200 },
    extraHTTPHeaders: {
      'Accept-Language': 'en-US,en;q=0.9',
    },
  });
  const page = await context.newPage();
  const captured = new Map();

  page.on('response', async (response) => {
    try {
      const url = response.url();
      if (!url.includes('/product/product-img/') || response.status() !== 200) return;
      const contentType = (response.headers()['content-type'] || '').toLowerCase();
      if (!contentType.startsWith('image/')) return;
      const body = await response.body();
      if (isImageBuffer(body)) captured.set(url, body);
    } catch {
      // A response may be disposed before its body is available; other strategies below retry it.
    }
  });

  console.log(`Opening ${sku}: ${sourceUrl}`);
  await page.goto(sourceUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(3000);

  // Trigger each full-size gallery request through the supplier's own same-origin page.
  for (const target of targets) {
    const anchor = page.locator(`a[href="${target}"]`).first();
    if (await anchor.count()) {
      try {
        await anchor.scrollIntoViewIfNeeded();
        await anchor.click({ timeout: 8000 });
        await page.waitForTimeout(800);
      } catch {
        // MagicZoom may intercept or cover a selector. The in-page fetch below is the fallback.
      }
    }
  }

  const productDir = path.join(OUT_DIR, 'images', sku);
  await fs.mkdir(productDir, { recursive: true });
  const imageRecords = [];

  for (let index = 0; index < targets.length; index += 1) {
    const target = targets[index];
    let buffer = captured.get(target);

    if (!isImageBuffer(buffer)) {
      // Same-origin fetch from inside the loaded supplier page preserves the browser session,
      // cookies, origin, and referrer that the supplier requires for gallery assets.
      const result = await page.evaluate(async (url) => {
        const response = await fetch(url, {
          credentials: 'include',
          cache: 'no-store',
          redirect: 'follow',
          headers: { Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8' },
        });
        const bytes = new Uint8Array(await response.arrayBuffer());
        let binary = '';
        const chunk = 0x8000;
        for (let i = 0; i < bytes.length; i += chunk) {
          binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
        }
        return {
          ok: response.ok,
          status: response.status,
          finalUrl: response.url,
          contentType: response.headers.get('content-type') || '',
          base64: btoa(binary),
        };
      }, target);
      const candidate = Buffer.from(result.base64, 'base64');
      if (result.contentType.startsWith('image/') && isImageBuffer(candidate)) {
        buffer = candidate;
      } else {
        console.log(`${sku} image ${index + 1} in-page fetch returned ${result.status} ${result.contentType} ${result.finalUrl}`);
      }
    }

    if (!isImageBuffer(buffer)) {
      // Last-resort browser rendering: load the exact image in an <img> on the supplier page
      // and export the complete source image at its natural dimensions without cropping.
      const rendered = await page.evaluate(async (url) => {
        const image = new Image();
        image.crossOrigin = 'anonymous';
        image.decoding = 'sync';
        image.src = url;
        await new Promise((resolve, reject) => {
          image.onload = resolve;
          image.onerror = () => reject(new Error(`Image element failed: ${url}`));
        });
        if (!image.naturalWidth || !image.naturalHeight) throw new Error(`Invalid dimensions for ${url}`);
        const canvas = document.createElement('canvas');
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        const ctx = canvas.getContext('2d', { alpha: false });
        ctx.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight);
        return {
          width: image.naturalWidth,
          height: image.naturalHeight,
          dataUrl: canvas.toDataURL('image/jpeg', 0.98),
        };
      }, target);
      buffer = Buffer.from(rendered.dataUrl.split(',')[1], 'base64');
    }

    if (!isImageBuffer(buffer)) {
      throw new Error(`${sku} image ${index + 1}: browser did not return a valid image for ${target}`);
    }

    const extension = extensionFor(buffer);
    const filename = `${String(index + 1).padStart(2, '0')}${extension}`;
    const filePath = path.join(productDir, filename);
    await fs.writeFile(filePath, buffer);
    imageRecords.push({
      source_url: target,
      path: `images/${sku}/${filename}`,
      bytes: buffer.length,
    });
    console.log(`Saved ${sku} image ${index + 1}: ${buffer.length} bytes`);
  }

  manifest.push({ sku, source_url: sourceUrl, images: imageRecords });
  await context.close();
}

await browser.close();
await fs.writeFile(path.join(OUT_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2));
await fs.writeFile(
  path.join(OUT_DIR, 'README.md'),
  'Temporary supplier-source image staging for the approved Royal Export Navratri listing build. Do not merge this directory into production.\n',
);
console.log(`Completed ${manifest.length} products and ${manifest.reduce((sum, row) => sum + row.images.length, 0)} images`);
