
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface Pond {
  id: string;
  name: string;
  size_m2: number;
  depth_m: number;
  fish_count: number;
  fish_age_days: number;
  status: 'active' | 'maintenance' | 'inactive';
  water_temperature?: number;
  ph_level?: number;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export const usePonds = () => {
  const [ponds, setPonds] = useState<Pond[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    fetchPonds();
    setupRealtimeSubscription();
  }, [user]);

  const fetchPonds = async () => {
    try {
      const { data, error } = await supabase
        .from('ponds' as any)
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setPonds(data || []);
    } catch (error: any) {
      console.error('Error fetching ponds:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal memuat data kolam"
      });
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('ponds-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ponds',
          filter: `user_id=eq.${user?.id}`
        },
        (payload) => {
          console.log('Pond change:', payload);
          if (payload.eventType === 'INSERT') {
            setPonds(prev => [payload.new as Pond, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setPonds(prev => prev.map(pond => 
              pond.id === payload.new.id ? payload.new as Pond : pond
            ));
          } else if (payload.eventType === 'DELETE') {
            setPonds(prev => prev.filter(pond => pond.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const createPond = async (pondData: Omit<Pond, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    try {
      const { data, error } = await supabase
        .from('ponds' as any)
        .insert([{
          ...pondData,
          user_id: user?.id
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      toast({
        title: "Berhasil",
        description: "Kolam berhasil ditambahkan"
      });
      
      return data;
    } catch (error: any) {
      console.error('Error creating pond:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Gagal menambahkan kolam"
      });
      throw error;
    }
  };

  const updatePond = async (id: string, updates: Partial<Pond>) => {
    try {
      const { data, error } = await supabase
        .from('ponds' as any)
        .update(updates)
        .eq('id', id)
        .eq('user_id', user?.id)
        .select()
        .single();
      
      if (error) throw error;
      
      toast({
        title: "Berhasil",
        description: "Kolam berhasil diupdate"
      });
      
      return data;
    } catch (error: any) {
      console.error('Error updating pond:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Gagal mengupdate kolam"
      });
      throw error;
    }
  };

  const deletePond = async (id: string) => {
    try {
      const { error } = await supabase
        .from('ponds' as any)
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);
      
      if (error) throw error;
      
      toast({
        title: "Berhasil",
        description: "Kolam berhasil dihapus"
      });
    } catch (error: any) {
      console.error('Error deleting pond:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Gagal menghapus kolam"
      });
      throw error;
    }
  };

  return {
    ponds,
    loading,
    createPond,
    updatePond,
    deletePond,
    refetch: fetchPonds
  };
};
