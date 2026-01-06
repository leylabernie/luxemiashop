import { useState } from 'react';
import { RefreshCw, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const AdminTools = () => {
  const [isRegenerating, setIsRegenerating] = useState(false);

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
      </CardContent>
    </Card>
  );
};

export default AdminTools;
