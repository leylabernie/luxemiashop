import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { requiresNativeStitchingTimingConfirmation, NATIVE_STITCHING_TIMING_NOTICE } from '@/lib/serviceAddOns';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/seo/SEOHead';
import { createStorefrontCheckout, fetchAllProducts, fetchProductByHandle } from '@/lib/shopify';
import { readMetaContext, saveMetaContext, metaReturnPath, clearMetaContext, completeMetaHandoff } from '@/lib/metaCheckoutContext';
import { configuredMetaCheckoutLines, metaCheckoutLines, parseMetaCheckout, resolveMetaProducts, type MetaRequest, type MetaSelection } from '@/lib/metaCheckout';

export default function MetaCheckout() {
  const { search } = useLocation();
  const navigate = useNavigate();
  const contextToken = new URLSearchParams(search).get('context');
  const [request, setRequest] = useState<MetaRequest | null>(null);
  const [selections, setSelections] = useState<MetaSelection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const busy = useRef(false);
  const generation = useRef(0);
  useEffect(() => {
    // BFCache can restore stale React Router state after the privacy-safe history rewrite.
    const restore = (event: PageTransitionEvent) => { if (event.persisted) window.location.reload(); };
    window.addEventListener('pageshow', restore);
    return () => window.removeEventListener('pageshow', restore);
  }, []);
  useEffect(() => {
    const current = ++generation.current;
    setLoading(true); setError(''); setSelections([]); setRequest(null);
    busy.current = false; setSubmitting(false);
    (async () => {
      try {
        const saved = readMetaContext(new URLSearchParams(search).get('context'));
        if (new URLSearchParams(search).has('context') && !saved) throw new Error('Your shopping session expired. Reopen the original Meta shopping link.');
        const parsed = saved ? parseMetaCheckout(new URLSearchParams({ products: saved.request.lines.map(line => `${line.contentId}:${line.quantity}`).join(','), ...(saved.request.coupon !== null ? { coupon: saved.request.coupon } : {}) }).toString()) : parseMetaCheckout(search);
        const products = await resolveMetaProducts(parsed, fetchProductByHandle, () => fetchAllProducts());
        if (generation.current !== current) return;
        // Preserve exact selections/coupon across reloads and the full configurator.
        const restored = products.map((item, index) => { const choice = saved?.selections.find(value => value.contentId === parsed.lines[index].contentId); return { ...item, variantId: choice?.variantId || '', timingConfirmed: choice?.timingConfirmed, configured: choice?.configured }; });
        if (!saved) {
          const token = saveMetaContext(null, parsed, restored.map((item,index) => ({ contentId: parsed.lines[index].contentId, handle: item.product.handle, variantId: item.variantId })));
          navigate(metaReturnPath(token), { replace: true });
          return;
        }
        setRequest(parsed); setSelections(restored);
      } catch (cause) {
        if (generation.current === current) setError(cause instanceof Error ? cause.message : 'Unable to load this shopping link.');
      } finally { if (generation.current === current) setLoading(false); }
    })();
    return () => { generation.current = current + 1; };
  }, [search, navigate]);
  useEffect(() => {
    if (!request || !contextToken || !selections.length) return;
    try { saveMetaContext(contextToken, request, selections.map((item,index) => ({ contentId: request.lines[index].contentId, handle: item.product.handle, variantId: item.variantId, timingConfirmed: item.timingConfirmed, configured: item.configured }))); }
    catch { setError('Your browser could not preserve this shopping selection. Enable session storage before continuing.'); }
  }, [request, selections, contextToken]);
  function configure(index: number) {
    if (!contextToken || !request) return;
    try { saveMetaContext(contextToken, request, selections.map((item, i) => ({ contentId: request.lines[i].contentId, handle: item.product.handle, variantId: item.variantId, timingConfirmed: item.timingConfirmed, configured: item.configured }))); }
    catch { setError('Your browser could not preserve this shopping selection. Enable session storage before continuing.'); return; }
    navigate(`/product/${selections[index].product.handle}?${new URLSearchParams({ meta_context: contextToken, meta_item: request.lines[index].contentId, ...(selections[index].variantId ? { variant: selections[index].variantId } : {}) })}`);
  }
  async function checkout() {
    if (busy.current || !request) return;
    if (!contextToken || !readMetaContext(contextToken)) { setError('Your shopping session expired. Reopen the original Meta shopping link.'); return; }
    const current = generation.current;
    busy.current = true; setSubmitting(true); setError('');
    try {
      const groups = await Promise.all(selections.map(item => item.configured
        ? configuredMetaCheckoutLines(item, handle => fetchProductByHandle(handle, { allowHiddenBillingProduct: handle === 'luxemia-tailoring-saree-finishing-add-ons' }))
        : Promise.resolve(metaCheckoutLines([item]))));
      const lines = groups.flat();
      const url = await createStorefrontCheckout(lines, request.coupon);
      if (generation.current !== current) return;
      if (!url) throw new Error('Checkout could not be opened. Your selection is preserved; please try again.');
      completeMetaHandoff(contextToken, request, url);
    } catch (cause) {
      if (generation.current === current) setError(cause instanceof Error ? cause.message : 'Checkout is temporarily unavailable. Please try again.');
    } finally {
      if (generation.current === current) { busy.current = false; setSubmitting(false); }
    }
  }
  return <div className="min-h-screen bg-background">
    <SEOHead title="Review Your Selection | LuxeMia" description="Choose your product options before secure Shopify checkout." noIndex />
    <Header />
    <main className="pt-[110px] lg:pt-[150px] pb-16 px-4 max-w-3xl mx-auto">
      <h1 className="font-serif text-3xl mb-4">Review your selection</h1>
      <p className="text-muted-foreground mb-6">Choose the exact options you want. This selection is separate from your existing shopping bag, which will not be changed.</p>
      {loading && <p role="status">Loading your products…</p>}
      {error && <p role="alert" className="border border-destructive rounded p-4 mb-4">{error}</p>}
      {!loading && selections.map((item, index) => {
        const variant = item.product.variants.edges.find(edge => edge.node.id === item.variantId)?.node;
        const image = variant?.image?.url || item.product.images.edges[0]?.node.url;
        return <section key={item.product.id} className="border rounded p-4 mb-4 flex gap-4">
          {image && <img src={image} alt={item.product.title} className="w-24 h-32 object-cover" />}
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold">{item.product.title}</h2>
            <p>Quantity: {item.quantity}</p>
            <label className="block mt-2" htmlFor={`meta-option-${index}`}>Size / fit / product option</label>
            <select id={`meta-option-${index}`} className="border rounded p-2 w-full bg-background" value={item.variantId} disabled={submitting}
              onChange={event => { setError(''); setSelections(items => items.map((value, i) => i === index ? { ...value, variantId: event.target.value, timingConfirmed: false, configured: undefined } : value)); }}>
              <option value="">Choose an option</option>
              {item.product.variants.edges.map(({ node }) => <option key={node.id} value={node.id} disabled={!node.availableForSale}>
                {node.title} — {node.price.currencyCode} {Number(node.price.amount).toFixed(2)}{!node.availableForSale ? ' — Sold out' : ''}
              </option>)}
            </select>
            {!item.configured && variant && requiresNativeStitchingTimingConfirmation(item.product, variant.selectedOptions) && <label className="block mt-3"><input type="checkbox" checked={!!item.timingConfirmed} disabled={submitting} onChange={event => setSelections(items => items.map((value, i) => i === index ? { ...value, timingConfirmed: event.target.checked } : value))} /> I understand: {NATIVE_STITCHING_TIMING_NOTICE}</label>}
            {variant && <p className="mt-2 font-semibold">Item subtotal: {variant.price.currencyCode} {(Number(variant.price.amount) * item.quantity).toFixed(2)}</p>}
            {item.configured?.slice(1).map((line, serviceIndex) => <p key={serviceIndex} className="text-sm">{line.variantTitle}: {line.price.currencyCode} {(Number(line.price.amount) * line.quantity).toFixed(2)}</p>)}
            {item.configured && <p className="text-sm mt-2">Full product options saved{item.configured.length > 1 ? `, including ${item.configured.length - 1} paid service(s)` : ''}. Final prices are verified at Shopify checkout.</p>}
            <button type="button" className="underline text-sm" disabled={submitting} onClick={() => configure(index)}>Configure custom fit, sizing or optional services</button>
          </div>
        </section>;
      })}
      {request && selections.length > 0 && <>
        {request.coupon && <p className="mb-3">Discount code: <strong>{request.coupon}</strong>. Shopify will confirm eligibility and any savings at checkout.</p>}
        <p className="text-sm text-muted-foreground mb-4">Shipping, taxes and final discounts are calculated at checkout. Custom-fit measurements must be configured on the product page. For privacy, saved configuration is cleared when checkout opens. If you come back, your products and code remain, but you must reconfirm options.</p>
        <button className="bg-primary text-primary-foreground px-6 py-3 rounded disabled:opacity-50" disabled={submitting || selections.some(item => !item.variantId)} onClick={checkout}>
          {submitting ? 'Opening secure checkout…' : 'Continue to secure checkout'}
        </button>
      </>}
      <p className="mt-6">{contextToken ? <button type="button" className="underline" disabled={submitting} onClick={() => { clearMetaContext(contextToken); navigate('/new-arrivals'); }}>Cancel this Meta selection and return to the boutique</button> : <Link className="underline" to="/new-arrivals">Return to the boutique</Link>}</p>
    </main><Footer />
  </div>;
}
