import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Unlock, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface BlockedIP {
  id: string;
  ip_address: string;
  reason: string;
  violation_count: number;
  blocked_at: string;
  blocked_until: string;
  created_at: string;
  updated_at: string;
}

const BlockedIPsTable = () => {
  const queryClient = useQueryClient();
  const [unblockingId, setUnblockingId] = useState<string | null>(null);

  const { data: blockedIps, isLoading, refetch } = useQuery({
    queryKey: ['blocked-ips'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const url = new URL(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-stats?action=get-blocked-ips`);
      const res = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to fetch blocked IPs');
      }

      const result = await res.json();
      return result.data as BlockedIP[];
    },
  });

  const unblockMutation = useMutation({
    mutationFn: async (ipId: string) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-stats?action=unblock-ip`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ip_id: ipId }),
        }
      );

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to unblock IP');
      }

      return res.json();
    },
    onSuccess: () => {
      toast.success('IP address unblocked successfully');
      queryClient.invalidateQueries({ queryKey: ['blocked-ips'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    },
    onError: (error) => {
      toast.error(`Failed to unblock IP: ${error.message}`);
    },
    onSettled: () => {
      setUnblockingId(null);
    },
  });

  const handleUnblock = (ipId: string) => {
    setUnblockingId(ipId);
    unblockMutation.mutate(ipId);
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (!blockedIps || blockedIps.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No blocked IP addresses found.</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
    );
  }

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
              <TableHead>IP Address</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Violations</TableHead>
              <TableHead>Blocked At</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {blockedIps.map((ip) => (
              <TableRow key={ip.id}>
                <TableCell className="font-mono text-sm">{ip.ip_address}</TableCell>
                <TableCell>
                  <Badge variant="outline">{ip.reason}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={ip.violation_count >= 5 ? 'destructive' : 'secondary'}>
                    {ip.violation_count}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {format(new Date(ip.blocked_at), 'MMM d, yyyy HH:mm')}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {format(new Date(ip.blocked_until), 'MMM d, yyyy HH:mm')}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleUnblock(ip.id)}
                    disabled={unblockingId === ip.id}
                  >
                    <Unlock className="h-4 w-4 mr-1" />
                    {unblockingId === ip.id ? 'Unblocking...' : 'Unblock'}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default BlockedIPsTable;