import { useState } from 'react';
import { RefreshCw, Shield, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const AdminTools = () => {
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

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
            <p className="font-medium">Sync Products to Shopify</p>
            <p className="text-sm text-muted-foreground">
              Push unsynced products with images to Shopify
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => handleSyncToShopify(false)}
              disabled={isSyncing}
              variant="outline"
              className="gap-2"
            >
              <ShoppingBag className={`w-4 h-4 ${isSyncing ? 'animate-pulse' : ''}`} />
              {isSyncing ? 'Syncing...' : 'Sync New'}
            </Button>
            <Button
              onClick={() => handleSyncToShopify(true)}
              disabled={isSyncing}
              variant="secondary"
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              Re-sync All
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminTools;
