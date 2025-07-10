
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const useRealtimePonds = () => {
  const [ponds, setPonds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const fetchPonds = async () => {
      const { data, error } = await supabase
        .from('ponds')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        setPonds(data);
      }
      setLoading(false);
    };

    fetchPonds();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('ponds-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ponds'
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setPonds(prev => [payload.new, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setPonds(prev => prev.map(pond => 
              pond.id === payload.new.id ? payload.new : pond
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

  return { ponds, loading };
};

export const useRealtimeFeedingSchedules = () => {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const fetchSchedules = async () => {
      const { data, error } = await supabase
        .from('feeding_schedules')
        .select(`
          *,
          ponds (name)
        `)
        .order('feeding_time', { ascending: true });
      
      if (!error && data) {
        setSchedules(data);
      }
      setLoading(false);
    };

    fetchSchedules();

    const channel = supabase
      .channel('feeding-schedules-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'feeding_schedules'
        },
        () => {
          fetchSchedules(); // Refetch to get pond names
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return { schedules, loading };
};

export const useRealtimeHealthRecords = () => {
  const [healthRecords, setHealthRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const fetchHealthRecords = async () => {
      const { data, error } = await supabase
        .from('health_records')
        .select(`
          *,
          ponds (name)
        `)
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        setHealthRecords(data);
      }
      setLoading(false);
    };

    fetchHealthRecords();

    const channel = supabase
      .channel('health-records-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'health_records'
        },
        () => {
          fetchHealthRecords();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return { healthRecords, loading };
};
