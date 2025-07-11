
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';
import type { Pond, PondInsert, PondUpdate } from '@/types/database';

export const usePonds = () => {
  const [ponds, setPonds] = useState<Pond[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch ponds
  const fetchPonds = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('ponds')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching ponds:', error);
        toast({
          title: "Error",
          description: "Gagal memuat data kolam",
          variant: "destructive",
        });
        return;
      }

      setPonds((data || []) as Pond[]);
    } catch (error) {
      console.error('Error fetching ponds:', error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat memuat data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Add new pond
  const addPond = async (pondData: PondInsert) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('ponds')
        .insert([{ ...pondData, user_id: user.id }])
        .select()
        .single();

      if (error) {
        console.error('Error adding pond:', error);
        toast({
          title: "Error",
          description: "Gagal menambah kolam baru",
          variant: "destructive",
        });
        return;
      }

      setPonds(prev => [data as Pond, ...prev]);
      toast({
        title: "Berhasil",
        description: "Kolam baru berhasil ditambahkan",
      });

      return data as Pond;
    } catch (error) {
      console.error('Error adding pond:', error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat menambah kolam",
        variant: "destructive",
      });
    }
  };

  // Update pond
  const updatePond = async (id: string, updates: PondUpdate) => {
    try {
      const { data, error } = await supabase
        .from('ponds')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating pond:', error);
        toast({
          title: "Error",
          description: "Gagal memperbarui kolam",
          variant: "destructive",
        });
        return;
      }

      setPonds(prev => prev.map(pond => pond.id === id ? data as Pond : pond));
      toast({
        title: "Berhasil",
        description: "Data kolam berhasil diperbarui",
      });

      return data as Pond;
    } catch (error) {
      console.error('Error updating pond:', error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat memperbarui kolam",
        variant: "destructive",
      });
    }
  };

  // Delete pond
  const deletePond = async (id: string) => {
    try {
      const { error } = await supabase
        .from('ponds')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting pond:', error);
        toast({
          title: "Error",
          description: "Gagal menghapus kolam",
          variant: "destructive",
        });
        return;
      }

      setPonds(prev => prev.filter(pond => pond.id !== id));
      toast({
        title: "Berhasil",
        description: "Kolam berhasil dihapus",
      });
    } catch (error) {
      console.error('Error deleting pond:', error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat menghapus kolam",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchPonds();
  }, [user]);

  // Set up real-time subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('ponds_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ponds',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Realtime pond change:', payload);
          
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
  }, [user]);

  return {
    ponds,
    isLoading,
    addPond,
    updatePond,
    deletePond,
    refetchPonds: fetchPonds,
  };
};

// Export Pond type for components to use
export type { Pond } from '@/types/database';
