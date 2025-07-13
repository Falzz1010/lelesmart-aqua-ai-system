
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'farmer' | 'supervisor';
  phone?: string;
  department?: string;
  nim_nidn?: string;
  created_at: string;
  updated_at: string;
}

export const useProfile = (user: User | null) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        console.log('Fetching profile for user:', user.email);
        
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Profile fetch error:', error);
          
          // If profile doesn't exist, create one
          const isAdminEmail = user.email === 'admin@gmail.com' || user.email === 'admin@lelesmart.com';
          const role = isAdminEmail ? 'admin' : 'farmer';
          
          console.log('Creating profile for:', user.email, 'with role:', role);
          
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              email: user.email || '',
              full_name: user.user_metadata?.full_name || user.email || 'User',
              role: role
            })
            .select()
            .single();

          if (createError) {
            console.error('Error creating profile:', createError);
            toast({
              variant: "destructive",
              title: "Error",
              description: "Gagal membuat profil pengguna"
            });
          } else {
            console.log('Profile created successfully:', newProfile);
            setProfile(newProfile as Profile);
            toast({
              title: "Berhasil",
              description: "Profil berhasil dibuat"
            });
          }
        } else {
          console.log('Profile loaded successfully:', data);
          setProfile(data as Profile);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Terjadi kesalahan tak terduga"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();

    // Set up realtime subscription for profile changes
    const channel = supabase
      .channel('profile_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Profile realtime change:', payload);
          if (payload.eventType === 'UPDATE') {
            setProfile(payload.new as Profile);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, toast]);

  return { profile, loading };
};
