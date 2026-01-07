import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

interface RateLimit {
  id: string;
  identifier: string;
  endpoint: string;
  request_count: number;
  violation_count: number;
  window_start: string;
  created_at: string;
  updated_at: string;
}

const RateLimitsTable = () => {
  const { data: rateLimits, isLoading, refetch } = useQuery({
    queryKey: ['rate-limits'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const url = new URL(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-stats?action=get-rate-limits`);
      const res = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to fetch rate limits');
      }

      const result = await res.json();
      return result.data as RateLimit[];
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (!rateLimits || rateLimits.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No rate limit entries found.</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
    );
  }

  const getViolationBadge = (count: number) => {
    if (count >= 5) return <Badge variant="destructive">{count}</Badge>;
    if (count >= 3) return <Badge variant="default" className="bg-amber-500">{count}</Badge>;
    return <Badge variant="secondary">{count}</Badge>;
  };

  const maskIdentifier = (identifier: string) => {
    // Mask part of the identifier for privacy
    if (identifier.length > 8) {
      return `${identifier.slice(0, 4)}****${identifier.slice(-4)}`;
    }
    return identifier;
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Identifier</TableHead>
              <TableHead>Endpoint</TableHead>
              <TableHead>Requests</TableHead>
              <TableHead>Violations</TableHead>
              <TableHead>Window Start</TableHead>
              <TableHead>Last Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rateLimits.map((limit) => (
              <TableRow key={limit.id}>
                <TableCell className="font-mono text-sm">
                  {maskIdentifier(limit.identifier)}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="font-mono text-xs">
                    {limit.endpoint}
                  </Badge>
                </TableCell>
                <TableCell>{limit.request_count}</TableCell>
                <TableCell>{getViolationBadge(limit.violation_count)}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {format(new Date(limit.window_start), 'MMM d, HH:mm')}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {format(new Date(limit.updated_at), 'MMM d, HH:mm:ss')}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default RateLimitsTable;