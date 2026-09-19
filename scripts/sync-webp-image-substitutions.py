"""Convert every .webp image source found in dist/merchant-feed.xml to a real
JPEG under public/images/gmc/ and rewrite the WEBP_SOURCE_LOCAL_JPG map in
scripts/generate-static-feed.cjs.

Google Merchant Center rejects image URLs whose path ends in .webp even when
Shopify's format=jpg transform serves JPEG bytes, so those sources must be
published as local .jpg files. Re-run this script whenever the feed generator
warns about a new .webp source:
    python scripts/sync-webp-image-substitutions.py
"""
import os
import re
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FEED = os.path.join(ROOT, 'dist', 'merchant-feed.xml')
GMC_DIR = os.path.join(ROOT, 'public', 'images', 'gmc')
FEED_SCRIPT = os.path.join(ROOT, 'scripts', 'generate-static-feed.cjs')

xml = open(FEED, encoding='utf-8').read()
urls = set(re.findall(r'<g:(?:image_link|additional_image_link)>([^<]*\.webp\?[^<]*)</g:', xml))
basenames = sorted({re.search(r'/([^/?]+)\.webp', u).group(1) for u in urls})
print(f'{len(basenames)} unique .webp source(s) in feed')

os.makedirs(GMC_DIR, exist_ok=True)
mapping = {}
for name in basenames:
    local = os.path.join(GMC_DIR, f'{name}.jpg')
    if not os.path.exists(local):
        src = f'https://cdn.shopify.com/s/files/1/0746/4707/7035/files/{name}.webp?format=jpg&width=1500'
        data = urllib.request.urlopen(src).read()
        open(local, 'wb').write(data)
        print(f'  converted {name} ({len(data) // 1024} KB)')
    mapping[name] = f'/images/gmc/{name}.jpg'

script = open(FEED_SCRIPT, encoding='utf-8').read()
# Union with the existing map: previously-mapped sources no longer appear as
# .webp in the feed, but their substitutions must be kept.
existing = dict(re.findall(r"'([^']+)':\s*'(/images/gmc/[^']+)'", script))
existing.update(mapping)
mapping = existing
entries = '\n'.join(f"  '{k}': '{v}'," for k, v in sorted(mapping.items()))
block = 'const WEBP_SOURCE_LOCAL_JPG = {\n' + entries + '\n};'
new_script, n = re.subn(r'const WEBP_SOURCE_LOCAL_JPG = \{.*?\};', block, script, flags=re.S)
if n != 1:
    raise SystemExit('could not locate WEBP_SOURCE_LOCAL_JPG block')
open(FEED_SCRIPT, 'w', encoding='utf-8', newline='\n').write(new_script)
print(f'map updated with {len(mapping)} entr(ies)')
