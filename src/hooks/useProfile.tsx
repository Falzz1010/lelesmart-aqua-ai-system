
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
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
          // If profile doesn't exist, create one
          const role = user.email === 'admin@gmail.com' ? 'admin' : 'farmer';
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
            setProfile(newProfile);
          }
        } else {
          setProfile(data);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, toast]);

  return { profile, loading };
};
