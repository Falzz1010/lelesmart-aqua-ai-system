
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface FeedingSchedule {
  id: string;
  pond_id: string;
  feeding_time: string;
  feed_amount_kg: number;
  feed_type: string;
  status: 'pending' | 'completed';
  created_at: string;
  ponds?: { name: string };
}

export interface HealthRecord {
  id: string;
  pond_id: string;
  health_status: 'healthy' | 'sick' | 'critical';
  symptoms?: string;
  treatment?: string;
  created_at: string;
  ponds?: { name: string };
}

export const useRealtimeFeedingSchedules = () => {
  const [schedules, setSchedules] = useState<FeedingSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchSchedules = async () => {
      try {
        const { data, error } = await supabase
          .from('feeding_schedules' as any)
          .select(`
            *,
            ponds (name)
          `)
          .order('feeding_time', { ascending: true });
        
        if (!error && data) {
          setSchedules(data);
        }
      } catch (error) {
        console.error('Error fetching feeding schedules:', error);
      } finally {
        setLoading(false);
      }
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
          fetchSchedules();
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
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchHealthRecords = async () => {
      try {
        const { data, error } = await supabase
          .from('health_records' as any)
          .select(`
            *,
            ponds (name)
          `)
          .order('created_at', { ascending: false });
        
        if (!error && data) {
          setHealthRecords(data);
        }
      } catch (error) {
        console.error('Error fetching health records:', error);
      } finally {
        setLoading(false);
      }
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
