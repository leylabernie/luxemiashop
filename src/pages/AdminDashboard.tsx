import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/seo/SEOHead';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle, Activity, Lock, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';
import BlockedIPsTable from '@/components/admin/BlockedIPsTable';
import RateLimitsTable from '@/components/admin/RateLimitsTable';
import AdminStats from '@/components/admin/AdminStats';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!roleLoading && !isAdmin && user) {
      navigate('/');
    }
  }, [isAdmin, roleLoading, user, navigate]);

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            <Skeleton className="h-8 w-64" />
            <div className="grid gap-4 md:grid-cols-3">
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
            </div>
            <Skeleton className="h-96" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Admin Dashboard — LuxeMia"
        description="LuxeMia admin dashboard."
        noIndex={true}
      />
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-serif font-bold">Admin Dashboard</h1>
          </div>
          <p className="text-muted-foreground">
            Monitor security metrics, manage blocked IPs, and view rate limiting statistics.
          </p>
        </div>

        <AdminStats />

        {/* ─── Refresh Products from Shopify ────────────────────────────────
            After updating products in Shopify (CSV import, manual edit, etc.),
            the prerendered HTML at /_prerender/product/*.html is stale. This
            button triggers a fresh Vercel deploy so prerendering runs again
            and picks up the new titles/descriptions/prices/images.

            Behind the scenes: POST /api/refresh-products → Vercel Deploy Hook
            → fresh build → prerender.js fetches from Shopify → new HTML files.
            Total ETA: 2-4 minutes from button click to live site update.
        ──────────────────────────────────────────────────────────────────── */}
        <Card className="mt-8 border-primary/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-primary" />
              Refresh Products from Shopify
            </CardTitle>
            <CardDescription>
              Use this after updating products in Shopify (CSV import, title edits, price changes).
              Triggers a fresh Vercel deploy so prerendered HTML is regenerated with the latest
              product data. Takes 2-4 minutes to complete.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 flex-wrap">
              <Button
                onClick={async () => {
                  setRefreshing(true);
                  try {
                    const resp = await fetch('/api/refresh-products', {
                      method: 'POST',
                      // The endpoint accepts ?token= for browser-fetch auth.
                      // Token is read from a meta tag set by the admin layout.
                      // For now, use the public-no-auth path — the endpoint will
                      // 401 if ADMIN_REFRESH_TOKEN is set without a matching token.
                      headers: { 'Content-Type': 'application/json' },
                    });
                    const data = await resp.json().catch(() => ({}));
                    if (resp.ok && data.ok) {
                      toast.success('Deploy triggered!', {
                        description: 'Prerendered HTML will refresh in 2-4 minutes. You can close this page.',
                      });
                      setLastRefresh(new Date());
                    } else {
                      toast.error('Failed to trigger deploy', {
                        description: data.error || data.message || `HTTP ${resp.status}`,
                      });
                    }
                  } catch (err: any) {
                    toast.error('Network error', {
                      description: err?.message ?? String(err),
                    });
                  } finally {
                    setRefreshing(false);
                  }
                }}
                disabled={refreshing}
                className="min-w-[180px]"
              >
                {refreshing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Triggering...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Products Now
                  </>
                )}
              </Button>

              {lastRefresh && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Last triggered: {lastRefresh.toLocaleTimeString()}
                </div>
              )}

              <div className="text-xs text-muted-foreground max-w-md">
                <strong>Note:</strong> This button only works if the{' '}
                <code className="px-1 py-0.5 bg-muted rounded text-xs">ADMIN_REFRESH_TOKEN</code>{' '}
                and{' '}
                <code className="px-1 py-0.5 bg-muted rounded text-xs">VERCEL_DEPLOY_HOOK_URL</code>{' '}
                env vars are set in Vercel. If you see a 401 error, ask your developer
                to configure them — see <code className="px-1 py-0.5 bg-muted rounded text-xs">scripts/SETUP_SHOPIFY_WEBHOOK.md</code>.
              </div>
            </div>

            {lastRefresh && (
              <div className="mt-4 p-3 bg-muted/50 rounded-md text-xs text-muted-foreground">
                <XCircle className="h-3 w-3 inline mr-1" />
                <strong>What happens next:</strong> Vercel queues a new build →
                <code className="px-1 py-0.5 bg-muted rounded text-xs mx-1">npm run build</code> runs
                (1-2 min) → <code className="px-1 py-0.5 bg-muted rounded text-xs mx-1">prerender.js</code> fetches
                fresh data from Shopify → new HTML files are deployed to the edge. CDN edge
                cache (5 min TTL) then refreshes on next request.
              </div>
            )}
          </CardContent>
        </Card>

        <Tabs defaultValue="blocked-ips" className="mt-8">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="blocked-ips" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Blocked IPs
            </TabsTrigger>
            <TabsTrigger value="rate-limits" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Rate Limits
            </TabsTrigger>
          </TabsList>

          <TabsContent value="blocked-ips" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  Blocked IP Addresses
                </CardTitle>
                <CardDescription>
                  View and manage IP addresses that have been blocked due to rate limit violations or suspicious activity.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BlockedIPsTable />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rate-limits" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Rate Limit Statistics
                </CardTitle>
                <CardDescription>
                  Monitor API usage and identify potential abuse patterns.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RateLimitsTable />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;