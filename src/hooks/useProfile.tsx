import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  phone: string | null;
  newsletter_subscribed: boolean;
  preferred_currency: string;
  created_at: string;
  updated_at: string;
}

export const useProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      
      // If no profile exists, create one
      if (!data) {
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({ user_id: user.id })
          .select()
          .single();
        
        if (insertError) throw insertError;
        setProfile({
          ...newProfile,
          newsletter_subscribed: newProfile.newsletter_subscribed ?? false,
          preferred_currency: newProfile.preferred_currency ?? 'USD',
        });
      } else {
        setProfile({
          ...data,
          newsletter_subscribed: data.newsletter_subscribed ?? false,
          preferred_currency: data.preferred_currency ?? 'USD',
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      void fetchProfile();
    } else {
      setProfile(null);
      setLoading(false);
    }
  }, [fetchProfile, user]);

  const updateProfile = async (updates: Partial<Pick<Profile, 'full_name' | 'phone' | 'newsletter_subscribed' | 'preferred_currency'>>) => {
    if (!user || !profile) return { error: new Error('Not authenticated') };

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id);

      if (error) throw error;

      setProfile({ ...profile, ...updates });
      toast({
        title: "Profile updated",
        description: "Your preferences have been saved.",
      });
      return { error: null };
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
      return { error };
    }
  };

  return { profile, loading, updateProfile, refetch: fetchProfile };
};
