import { useState } from 'react';
import { RefreshCw, Shield, ShoppingBag, Download, Trash2, Image, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Progress } from '@/components/ui/progress';

interface ValidationResult {
  total_validated: number;
  valid_count: number;
  invalid_count: number;
  updated_count: number;
  dry_run: boolean;
}

const AdminTools = () => {
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isScraping, setIsScraping] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);

  const handleRegenerateSitemap = async () => {
    setIsRegenerating(true);
    try {
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
      
      if (error) throw error;

      toast.success('Sitemap regenerated successfully', {
        description: `Generated ${data?.stats?.products || 0} product URLs`,
      });
    } catch (error) {
      console.error('Error regenerating sitemap:', error);
      toast.error('Failed to regenerate sitemap');
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
      
      if (error) throw error;

      if (data?.synced > 0) {
        toast.success(`Synced ${data.synced} products to Shopify`);
      } else if (data?.message === 'No products to sync') {
        toast.info('All products are already synced');
      } else {
        toast.warning('No products were synced');
      }
    } catch (error) {
      console.error('Error syncing to Shopify:', error);
      toast.error('Failed to sync to Shopify');
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
      
      if (error) throw error;

      toast.success(`Scraped ${data?.added || 0} products`);
    } catch (error) {
      console.error('Error scraping products:', error);
      toast.error('Failed to scrape products');
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

      toast.info('Cleaning up duplicates...');

      const { data, error } = await supabase.functions.invoke('cleanup-shopify-duplicates', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      
      if (error) throw error;

      toast.success(`Removed ${data?.duplicatesDeleted || 0} duplicates`);
    } catch (error) {
      console.error('Error cleaning duplicates:', error);
      toast.error('Failed to clean up duplicates');
    } finally {
      setIsCleaning(false);
    }
  };

  const handleValidateImages = async (dryRun = true) => {
    setIsValidating(true);
    setValidationResult(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please log in to use admin tools');
        return;
      }

      toast.info(dryRun ? 'Checking images (dry run)...' : 'Validating and cleaning images...');

      const { data, error } = await supabase.functions.invoke('validate-images', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: { batch_size: 200, dry_run: dryRun },
      });
      
      if (error) throw error;

      setValidationResult(data);

      if (data.invalid_count === 0) {
        toast.success('All images are valid!', {
          description: `Validated ${data.total_validated} images`,
        });
      } else if (dryRun) {
        toast.warning(`Found ${data.invalid_count} broken images`, {
          description: 'Run cleanup to mark them as inactive',
        });
      } else {
        toast.success(`Cleaned up ${data.updated_count} broken images`, {
          description: `${data.valid_count} valid images remain`,
        });
      }
    } catch (error) {
      console.error('Error validating images:', error);
      toast.error('Failed to validate images');
    } finally {
      setIsValidating(false);
    }
  };

  const validPercentage = validationResult 
    ? Math.round((validationResult.valid_count / validationResult.total_validated) * 100)
    : 0;

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
        {/* Image Validation Section */}
        <div className="p-4 bg-primary/5 rounded-lg border border-primary/20 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium flex items-center gap-2">
                <Image className="w-4 h-4" />
                Image Validation
              </p>
              <p className="text-sm text-muted-foreground">
                Check and clean broken product images
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => handleValidateImages(true)}
                disabled={isValidating}
                variant="outline"
                size="sm"
                className="gap-1"
              >
                {isValidating ? (
                  <RefreshCw className="w-3 h-3 animate-spin" />
                ) : (
                  <CheckCircle className="w-3 h-3" />
                )}
                Check
              </Button>
              <Button
                onClick={() => handleValidateImages(false)}
                disabled={isValidating}
                size="sm"
                className="gap-1"
              >
                {isValidating ? (
                  <RefreshCw className="w-3 h-3 animate-spin" />
                ) : (
                  <XCircle className="w-3 h-3" />
                )}
                Clean
              </Button>
            </div>
          </div>
          
          {validationResult && (
            <div className="space-y-2 pt-2 border-t border-primary/10">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Validation Results</span>
                <span className="font-medium">{validPercentage}% valid</span>
              </div>
              <Progress value={validPercentage} className="h-2" />
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center p-2 bg-background rounded">
                  <p className="font-medium text-lg">{validationResult.total_validated}</p>
                  <p className="text-muted-foreground">Checked</p>
                </div>
                <div className="text-center p-2 bg-green-500/10 rounded">
                  <p className="font-medium text-lg text-green-600">{validationResult.valid_count}</p>
                  <p className="text-muted-foreground">Valid</p>
                </div>
                <div className="text-center p-2 bg-red-500/10 rounded">
                  <p className="font-medium text-lg text-red-600">{validationResult.invalid_count}</p>
                  <p className="text-muted-foreground">Invalid</p>
                </div>
              </div>
              {validationResult.updated_count > 0 && (
                <p className="text-xs text-green-600 text-center">
                  ✓ {validationResult.updated_count} products marked as inactive
                </p>
              )}
            </div>
          )}
        </div>

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
              Scrape new products and auto-sync to Shopify
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
              Push unsynced products to Shopify
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
              Sync New
            </Button>
            <Button
              onClick={() => handleSyncToShopify(true)}
              disabled={isSyncing || isScraping}
              variant="secondary"
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              Re-sync
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-destructive/10 rounded-lg border border-destructive/20">
          <div>
            <p className="font-medium text-destructive">Cleanup Duplicates</p>
            <p className="text-sm text-muted-foreground">
              Remove duplicate products from Shopify
            </p>
          </div>
          <Button
            onClick={handleCleanupDuplicates}
            disabled={isCleaning || isSyncing || isScraping}
            variant="destructive"
            className="gap-2"
          >
            <Trash2 className={`w-4 h-4 ${isCleaning ? 'animate-pulse' : ''}`} />
            {isCleaning ? 'Cleaning...' : 'Remove'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminTools;
