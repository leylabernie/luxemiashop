import { useState } from 'react';
import { Search, Package, Truck, CheckCircle, Clock, MapPin, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface OrderLineItem {
  title: string;
  quantity: number;
  image: string | null;
  price: {
    amount: string;
    currencyCode: string;
  } | null;
}

interface OrderFulfillment {
  status: string;
  createdAt: string;
  tracking: {
    number: string;
    url: string;
  } | null;
}

interface Order {
  id: string;
  name: string;
  createdAt: string;
  financialStatus: string;
  fulfillmentStatus: string;
  total: {
    amount: string;
    currencyCode: string;
  } | null;
  shippingAddress: {
    city: string;
    province: string;
    country: string;
  } | null;
  lineItems: OrderLineItem[];
  fulfillments: OrderFulfillment[];
}

const OrderTracking = () => {
  const { toast } = useToast();
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTrackOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!orderNumber.trim() || !email.trim()) {
      toast({
        title: "Missing information",
        description: "Please enter both order number and email address.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setOrder(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('get-order', {
        body: { 
          orderNumber: orderNumber.trim(),
          email: email.trim(),
        },
      });

      if (fnError) {
        // Handle authentication errors specifically
        if (fnError.message?.includes('401') || fnError.message?.includes('Unauthorized')) {
          setError('Please log in to track your orders.');
        } else {
          throw fnError;
        }
        return;
      }

      if (data?.error) {
        if (data.error === 'Unauthorized') {
          setError('Please log in to track your orders.');
        } else {
          setError(data.error);
        }
        return;
      }

      if (data?.order) {
        setOrder(data.order);
      }
    } catch (err) {
      console.error('Error tracking order:', err);
      setError('Failed to track order. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'fulfilled':
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'in_transit':
      case 'shipped':
        return <Truck className="w-5 h-5 text-blue-600" />;
      case 'pending':
      case 'unfulfilled':
        return <Clock className="w-5 h-5 text-amber-600" />;
      default:
        return <Package className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusLower = status?.toLowerCase() || '';
    let variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'secondary';
    let label = status?.replace(/_/g, ' ') || 'Unknown';

    if (statusLower.includes('fulfilled') || statusLower.includes('delivered') || statusLower.includes('paid')) {
      variant = 'default';
    } else if (statusLower.includes('pending') || statusLower.includes('unfulfilled')) {
      variant = 'outline';
    } else if (statusLower.includes('cancelled') || statusLower.includes('refunded')) {
      variant = 'destructive';
    }

    return <Badge variant={variant} className="capitalize">{label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: string, currencyCode: string) => {
    const num = parseFloat(amount);
    if (currencyCode === 'INR') {
      return `₹${num.toLocaleString('en-IN')}`;
    }
    return `${currencyCode} ${num.toFixed(2)}`;
  };

  return (
    <div className="space-y-6">
      {/* Order Lookup Form */}
      <Card className="border-border/50">
        <CardContent className="pt-6">
          <form onSubmit={handleTrackOrder} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="orderNumber">Order Number</Label>
                <Input
                  id="orderNumber"
                  type="text"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="#1001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="trackEmail">Email Address</Label>
                <Input
                  id="trackEmail"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                />
              </div>
            </div>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto bg-foreground text-background hover:bg-foreground/90"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Tracking...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Track Order
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="pt-6">
            <p className="text-destructive text-center">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Order Details */}
      {order && (
        <Card className="border-border/50">
          <CardContent className="pt-6 space-y-6">
            {/* Order Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-serif text-xl">Order {order.name}</h3>
                <p className="text-sm text-muted-foreground">
                  Placed on {formatDate(order.createdAt)}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {getStatusBadge(order.financialStatus)}
                {getStatusBadge(order.fulfillmentStatus)}
              </div>
            </div>

            <Separator />

            {/* Order Status Timeline */}
            <div className="flex items-center gap-4 p-4 bg-card rounded-lg">
              {getStatusIcon(order.fulfillmentStatus)}
              <div className="flex-1">
                <p className="font-medium capitalize">
                  {order.fulfillmentStatus?.replace(/_/g, ' ') || 'Processing'}
                </p>
                {order.shippingAddress && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {[order.shippingAddress.city, order.shippingAddress.province, order.shippingAddress.country]
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                )}
              </div>
            </div>

            {/* Tracking Information */}
            {order.fulfillments && order.fulfillments.length > 0 && order.fulfillments[0].tracking && (
              <div className="p-4 bg-secondary/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Tracking Number</p>
                    <p className="font-mono">{order.fulfillments[0].tracking.number}</p>
                  </div>
                  {order.fulfillments[0].tracking.url && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(order.fulfillments[0].tracking!.url, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Track
                    </Button>
                  )}
                </div>
              </div>
            )}

            <Separator />

            {/* Line Items */}
            <div className="space-y-4">
              <h4 className="font-medium">Items</h4>
              {order.lineItems.map((item, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-16 h-20 bg-card rounded overflow-hidden flex-shrink-0">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-6 h-6 text-muted-foreground/50" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.title}</p>
                    <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  {item.price && (
                    <p className="font-medium">
                      {formatCurrency(item.price.amount, item.price.currencyCode)}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <Separator />

            {/* Order Total */}
            {order.total && (
              <div className="flex justify-between items-center">
                <span className="font-medium">Total</span>
                <span className="text-xl font-serif">
                  {formatCurrency(order.total.amount, order.total.currencyCode)}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OrderTracking;
