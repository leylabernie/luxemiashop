import { ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUserRole } from '@/hooks/useUserRole';
import { Skeleton } from '@/components/ui/skeleton';

const AdminTools = () => {
  const { isAdmin, loading: roleLoading } = useUserRole();

  if (roleLoading) {
    return (
      <Card className="border-border/50">
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="mt-2 h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!isAdmin) return null;

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-serif text-xl">
          <ShieldCheck className="h-5 w-5" />
          Catalog source of truth
        </CardTitle>
        <CardDescription>
          Legacy catalog automation has been retired.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-6 text-muted-foreground">
          Product facts, variants, prices, publication state, and availability are managed in the reviewed
          Shopify catalog. The public sitemap is generated during deployment from Shopify data. This account
          page no longer invokes scraper, product-creation, duplicate-deletion, image-mutation, or sitemap-cache
          edge functions.
        </p>
      </CardContent>
    </Card>
  );
};

export default AdminTools;
