import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Package, Heart, Settings, LogOut, Search, Shield } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/seo/SEOHead';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useUserRole } from '@/hooks/useUserRole';
import { useWishlistStore } from '@/stores/wishlistStore';
import OrderTracking from '@/components/account/OrderTracking';
import AdminTools from '@/components/account/AdminTools';

const Account = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const { profile, loading: profileLoading, updateProfile } = useProfile();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const wishlistItems = useWishlistStore(state => state.items);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const [preferredCurrency, setPreferredCurrency] = useState('INR');
  const [isSaving, setIsSaving] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Populate form with profile data
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setPhone(profile.phone || '');
      setNewsletterSubscribed(profile.newsletter_subscribed);
      setPreferredCurrency(profile.preferred_currency);
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    await updateProfile({
      full_name: fullName || null,
      phone: phone || null,
      newsletter_subscribed: newsletterSubscribed,
      preferred_currency: preferredCurrency,
    });
    setIsSaving(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (authLoading || profileLoading || roleLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-32 pb-20 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="My Account — LuxeMia"
        description="Manage your LuxeMia account."
        noIndex={true}
      />
      <Header />
      
      <main className="pt-[90px] lg:pt-[132px] pb-20">
        <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Page Header */}
            <div className="text-center mb-12">
              <h1 className="font-serif text-3xl lg:text-4xl mb-3">My Account</h1>
              <p className="text-muted-foreground">Manage your profile and preferences</p>
            </div>

            <Tabs defaultValue="profile" className="space-y-8">
              <TabsList className={`grid w-full bg-card ${isAdmin ? 'grid-cols-4' : 'grid-cols-3'}`}>
                <TabsTrigger value="profile" className="gap-2">
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">Profile</span>
                </TabsTrigger>
                <TabsTrigger value="orders" className="gap-2">
                  <Package className="w-4 h-4" />
                  <span className="hidden sm:inline">Orders</span>
                </TabsTrigger>
                <TabsTrigger value="preferences" className="gap-2">
                  <Settings className="w-4 h-4" />
                  <span className="hidden sm:inline">Preferences</span>
                </TabsTrigger>
                {isAdmin && (
                  <TabsTrigger value="admin" className="gap-2">
                    <Shield className="w-4 h-4" />
                    <span className="hidden sm:inline">Admin</span>
                  </TabsTrigger>
                )}
              </TabsList>

              {/* Profile Tab */}
              <TabsContent value="profile">
                <Card className="border-border/50">
                  <CardHeader>
                    <CardTitle className="font-serif text-xl">Profile Information</CardTitle>
                    <CardDescription>Update your personal details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={user.email || ''}
                        disabled
                        className="bg-muted/30"
                      />
                      <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        Full Name
                      </Label>
                      <Input
                        id="fullName"
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        Phone Number
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                      />
                    </div>

                    <Separator />

                    <div className="flex justify-between items-center">
                      <Button
                        onClick={handleSaveProfile}
                        disabled={isSaving}
                        className="bg-foreground text-background hover:bg-foreground/90"
                      >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                      </Button>
                      
                      <Button
                        variant="outline"
                        onClick={handleSignOut}
                        className="gap-2 text-destructive hover:text-destructive"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Orders Tab */}
              <TabsContent value="orders">
                <Card className="border-border/50">
                  <CardHeader>
                    <CardTitle className="font-serif text-xl flex items-center gap-2">
                      <Search className="w-5 h-5" />
                      Track Your Order
                    </CardTitle>
                    <CardDescription>
                      Enter your order number and email to check the status of your order
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <OrderTracking />
                  </CardContent>
                </Card>

                {/* Wishlist Summary */}
                <Card className="border-border/50 mt-6">
                  <CardHeader>
                    <CardTitle className="font-serif text-xl flex items-center gap-2">
                      <Heart className="w-5 h-5" />
                      Wishlist
                    </CardTitle>
                    <CardDescription>
                      {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {wishlistItems.length > 0 ? (
                      <div className="space-y-4">
                        {wishlistItems.slice(0, 3).map((item) => (
                          <div key={item.node.id} className="flex items-center gap-4">
                            <div className="w-16 h-20 bg-card rounded overflow-hidden">
                              {item.node.images?.edges?.[0]?.node?.url && (
                                <img
                                  src={item.node.images.edges[0].node.url}
                                  alt={item.node.images.edges[0].node.altText || item.node.title}
                                  className="w-full h-full object-cover"
                                />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{item.node.title}</p>
                              <p className="text-sm text-muted-foreground">
                                ₹{parseFloat(item.node.priceRange.minVariantPrice.amount).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        ))}
                        {wishlistItems.length > 3 && (
                          <p className="text-sm text-muted-foreground">
                            +{wishlistItems.length - 3} more items
                          </p>
                        )}
                        <Button
                          variant="outline"
                          className="w-full mt-4"
                          onClick={() => navigate('/wishlist')}
                        >
                          View Full Wishlist
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-muted-foreground text-sm">
                          No items in your wishlist yet
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Preferences Tab */}
              <TabsContent value="preferences">
                <Card className="border-border/50">
                  <CardHeader>
                    <CardTitle className="font-serif text-xl">Preferences</CardTitle>
                    <CardDescription>Customize your shopping experience</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="newsletter">Newsletter</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive updates about new collections and offers
                        </p>
                      </div>
                      <Switch
                        id="newsletter"
                        checked={newsletterSubscribed}
                        onCheckedChange={setNewsletterSubscribed}
                      />
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Label htmlFor="currency">Preferred Currency</Label>
                      <Select value={preferredCurrency} onValueChange={setPreferredCurrency}>
                        <SelectTrigger id="currency" className="w-full sm:w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="INR">₹ INR - Indian Rupee</SelectItem>
                          <SelectItem value="USD">$ USD - US Dollar</SelectItem>
                          <SelectItem value="GBP">£ GBP - British Pound</SelectItem>
                          <SelectItem value="EUR">€ EUR - Euro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Separator />

                    <Button
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                      className="bg-foreground text-background hover:bg-foreground/90"
                    >
                      {isSaving ? 'Saving...' : 'Save Preferences'}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Admin Tab - Only visible to admins */}
              {isAdmin && (
                <TabsContent value="admin" className="space-y-6">
                  <Card className="border-border/50">
                    <CardHeader>
                      <CardTitle className="font-serif text-xl flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        Admin Dashboard
                      </CardTitle>
                      <CardDescription>
                        Access the full admin dashboard to manage security, blocked IPs, and rate limits
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        onClick={() => navigate('/admin')}
                        className="bg-foreground text-background hover:bg-foreground/90 gap-2"
                      >
                        <Shield className="w-4 h-4" />
                        Open Admin Dashboard
                      </Button>
                    </CardContent>
                  </Card>
                  <AdminTools />
                </TabsContent>
              )}
            </Tabs>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Account;
