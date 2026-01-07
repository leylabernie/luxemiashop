import { useState } from 'react';
import { RefreshCw, Shield, ShoppingBag, Download, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const AdminTools = () => {
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isScraping, setIsScraping] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);

  const handleRegenerateSitemap = async () => {
    setIsRegenerating(true);
    try {
      // Get current session for auth token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please log in to use admin tools');
        return;
      }

      const { data, error } = await supabase.functions.invoke('regenerate-sitemap', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      
      if (error) {
        throw error;
      }

      toast.success('Sitemap regenerated successfully', {
        description: `Generated ${data?.stats?.products || 0} product URLs`,
      });
    } catch (error) {
      console.error('Error regenerating sitemap:', error);
      toast.error('Failed to regenerate sitemap', {
        description: 'Please try again later',
      });
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleSyncToShopify = async (resetSync = false) => {
    setIsSyncing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please log in to use admin tools');
        return;
      }

      const { data, error } = await supabase.functions.invoke('sync-to-shopify', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: { resetSync, limit: 50 },
      });
      
      if (error) {
        throw error;
      }

      if (data?.synced > 0) {
        toast.success(`Synced ${data.synced} products to Shopify`, {
          description: data.failed > 0 ? `${data.failed} failed` : undefined,
        });
      } else if (data?.message === 'No products to sync') {
        toast.info('All products are already synced to Shopify');
      } else {
        toast.warning('No products were synced', {
          description: data?.failedProducts?.join(', ') || 'Check product images',
        });
      }
    } catch (error) {
      console.error('Error syncing to Shopify:', error);
      toast.error('Failed to sync to Shopify', {
        description: error instanceof Error ? error.message : 'Please try again later',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleScrapeProducts = async () => {
    setIsScraping(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please log in to use admin tools');
        return;
      }

      toast.info('Scraping products... This may take a few minutes');

      const { data, error } = await supabase.functions.invoke('sync-products', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      
      if (error) {
        throw error;
      }

      toast.success(`Scraped ${data?.added || 0} products`, {
        description: `Synced to Shopify: ${data?.shopifySynced || 0}${data?.shopifyFailed > 0 ? `, Failed: ${data.shopifyFailed}` : ''}`,
      });
    } catch (error) {
      console.error('Error scraping products:', error);
      toast.error('Failed to scrape products', {
        description: error instanceof Error ? error.message : 'Please try again later',
      });
    } finally {
      setIsScraping(false);
    }
  };

  const handleCleanupDuplicates = async () => {
    setIsCleaning(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please log in to use admin tools');
        return;
      }

      toast.info('Cleaning up duplicate products... This may take a few minutes');

      const { data, error } = await supabase.functions.invoke('cleanup-shopify-duplicates', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      
      if (error) {
        throw error;
      }

      toast.success(`Removed ${data?.duplicatesDeleted || 0} duplicate products`, {
        description: `${data?.uniqueProductsRemaining || 0} unique products remain in Shopify`,
      });
    } catch (error) {
      console.error('Error cleaning duplicates:', error);
      toast.error('Failed to clean up duplicates', {
        description: error instanceof Error ? error.message : 'Please try again later',
      });
    } finally {
      setIsCleaning(false);
    }
  };

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="font-serif text-xl flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Admin Tools
        </CardTitle>
        <CardDescription>
          Administrative functions for site management
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
          <div>
            <p className="font-medium">Regenerate Sitemap</p>
            <p className="text-sm text-muted-foreground">
              Update the sitemap with latest products
            </p>
          </div>
          <Button
            onClick={handleRegenerateSitemap}
            disabled={isRegenerating}
            variant="outline"
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isRegenerating ? 'animate-spin' : ''}`} />
            {isRegenerating ? 'Regenerating...' : 'Regenerate'}
          </Button>
        </div>

        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
          <div>
            <p className="font-medium">Scrape & Sync Products</p>
            <p className="text-sm text-muted-foreground">
              Scrape new products and auto-sync to Shopify with SEO
            </p>
          </div>
          <Button
            onClick={handleScrapeProducts}
            disabled={isScraping || isSyncing}
            className="gap-2"
          >
            <Download className={`w-4 h-4 ${isScraping ? 'animate-bounce' : ''}`} />
            {isScraping ? 'Scraping...' : 'Scrape & Sync'}
          </Button>
        </div>

        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
          <div>
            <p className="font-medium">Sync Products to Shopify</p>
            <p className="text-sm text-muted-foreground">
              Push unsynced products with images to Shopify
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => handleSyncToShopify(false)}
              disabled={isSyncing || isScraping}
              variant="outline"
              className="gap-2"
            >
              <ShoppingBag className={`w-4 h-4 ${isSyncing ? 'animate-pulse' : ''}`} />
              {isSyncing ? 'Syncing...' : 'Sync New'}
            </Button>
            <Button
              onClick={() => handleSyncToShopify(true)}
              disabled={isSyncing || isScraping}
              variant="secondary"
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              Re-sync All
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-destructive/10 rounded-lg border border-destructive/20">
          <div>
            <p className="font-medium text-destructive">Cleanup Duplicate Products</p>
            <p className="text-sm text-muted-foreground">
              Remove duplicate products from Shopify (keeps oldest)
            </p>
          </div>
          <Button
            onClick={handleCleanupDuplicates}
            disabled={isCleaning || isSyncing || isScraping}
            variant="destructive"
            className="gap-2"
          >
            <Trash2 className={`w-4 h-4 ${isCleaning ? 'animate-pulse' : ''}`} />
            {isCleaning ? 'Cleaning...' : 'Remove Duplicates'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminTools;
