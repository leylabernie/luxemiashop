import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, AlertTriangle, Activity, Lock } from 'lucide-react';
import BlockedIPsTable from '@/components/admin/BlockedIPsTable';
import RateLimitsTable from '@/components/admin/RateLimitsTable';
import AdminStats from '@/components/admin/AdminStats';
import { Skeleton } from '@/components/ui/skeleton';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();

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