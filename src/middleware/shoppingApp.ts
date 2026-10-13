
// Products created after a deployment have no prerender yet. They must still
// load that deployment's shopping app, not just a static SEO document.
export async function attachShoppingApp(html: string, request: Request): Promise<string> {
  const headers = new Headers();
  for (const name of ['cookie', 'x-vercel-protection-bypass']) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }
  const response = await fetch(new URL('/index.html', request.url), {
    headers,
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error('Shopping app shell unavailable');
  const shell = await response.text();
  const head = shell.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)?.[1] || '';
  const modules = (head.match(/<script\b[^>]*>[\s\S]*?<\/script>/gi) || [])
    .filter(tag => /\btype=["']module["']/i.test(tag) && /\bsrc=["']\/assets\//i.test(tag));
  const assets = (head.match(/<link\b[^>]*>/gi) || [])
    .filter(tag => /\brel=["'](?:stylesheet|modulepreload)["']/i.test(tag) && /\bhref=["']\/assets\//i.test(tag));
  if (!modules.length) throw new Error('Shopping app entry missing');

  // React replaces the root contents on first render. Retain a readable
  // product for non-JS clients, and remove fallback CSS when React takes over.
  const cleanup = `<script>(function(){
    var root=document.getElementById('root');
    var observer=new MutationObserver(function(){
      if(root.querySelector('[data-product-fallback]'))return;
      observer.disconnect();
      document.querySelectorAll('style[data-product-fallback-style]').forEach(function(style){style.remove();});
    });
    observer.observe(root,{childList:true,subtree:true});
  })();</script>`;
  return html
    .replace(/<style(?=[\s>])/gi, '<style data-product-fallback-style')
    .replace('</head>', assets.join('\n') + '\n' + modules.join('\n') + '\n</head>')
    .replace(/<body([^>]*)>/i, '<body$1><div id="root"><div data-product-fallback>')
    .replace('</body>', '</div></div>' + cleanup + '</body>');
}
