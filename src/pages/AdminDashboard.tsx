import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/seo/SEOHead';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle, Activity, Lock, RefreshCw, CheckCircle2, HelpCircle } from 'lucide-react';
import BlockedIPsTable from '@/components/admin/BlockedIPsTable';
import RateLimitsTable from '@/components/admin/RateLimitsTable';
import AdminStats from '@/components/admin/AdminStats';
import SetupWizard from '@/components/admin/SetupWizard';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [showSetup, setShowSetup] = useState(false);

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

            Auth: uses the logged-in admin's Supabase session token automatically.
            No separate ADMIN_REFRESH_TOKEN env var needed.
        ──────────────────────────────────────────────────────────────────── */}
        <Card className="mt-8 border-primary/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-primary" />
              Refresh Products from Shopify (Optional)
            </CardTitle>
            <CardDescription>
              <strong>Good news:</strong> Your website now automatically shows the latest product titles,
              prices, and images from Shopify within seconds of a customer loading a product page — no
              setup required. <br /><br />
              The button below is <strong>optional</strong>. It refreshes the static HTML that Googlebot
              and social media previews see, so your updates appear in Google search results faster
              (instead of waiting for Google's next crawl). Skip this entirely if you don't care about
              SEO refresh speed.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 flex-wrap">
              <Button
                onClick={async () => {
                  setRefreshing(true);
                  try {
                    // Get the current Supabase session token (admin auth)
                    const { data: { session }, error: sessionErr } = await supabase.auth.getSession();
                    if (sessionErr || !session?.access_token) {
                      toast.error('Not logged in', {
                        description: 'Please log in to the admin dashboard and try again.',
                      });
                      setRefreshing(false);
                      return;
                    }

                    const resp = await fetch('/api/refresh-products', {
                      method: 'POST',
                      headers: {
                        'Authorization': `Bearer ${session.access_token}`,
                        'Content-Type': 'application/json',
                      },
                    });
                    const data = await resp.json().catch(() => ({}));
                    if (resp.ok && data.ok) {
                      toast.success('✅ Refresh triggered!', {
                        description: 'New product titles will appear on luxemia.shop in 2-4 minutes. You can close this page.',
                      });
                      setLastRefresh(new Date());
                    } else if (resp.status === 500 && (data.message || data.error || '').includes('VERCEL_DEPLOY_HOOK_URL')) {
                      toast.error('First-time setup needed', {
                        description: 'Click "Show first-time setup" below and follow the 3 steps. Takes 5 minutes.',
                      });
                      setShowSetup(true);
                    } else {
                      toast.error('Failed to trigger refresh', {
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
                className="min-w-[200px]"
                size="lg"
              >
                {refreshing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Triggering refresh...
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
            </div>

            {/* First-time setup toggle */}
            <div className="border-t pt-4">
              <button
                onClick={() => setShowSetup(!showSetup)}
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <HelpCircle className="h-4 w-4" />
                {showSetup ? 'Hide optional SEO setup' : 'Show optional SEO setup (only if you want faster Google updates)'}
              </button>
              {showSetup && (
                <div className="mt-4">
                  <SetupWizard />
                </div>
              )}
            </div>

            {lastRefresh && (
              <div className="p-3 bg-muted/50 rounded-md text-xs text-muted-foreground">
                <strong>What happens next:</strong> Vercel queues a new build →
                prerender script fetches fresh data from Shopify → new HTML files are
                deployed to the edge → CDN cache (5 min TTL) refreshes on next request.
                Total time: 2-4 minutes.
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