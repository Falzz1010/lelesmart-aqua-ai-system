
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import type { FeedingSchedule, HealthRecord } from '@/types/database';

export const useRealtimeData = () => {
  const [feedingSchedules, setFeedingSchedules] = useState<FeedingSchedule[]>([]);
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  // Fetch feeding schedules
  const fetchFeedingSchedules = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('feeding_schedules')
        .select(`
          *,
          ponds!inner(user_id)
        `)
        .eq('ponds.user_id', user.id)
        .order('feeding_time', { ascending: true });

      if (error) {
        console.error('Error fetching feeding schedules:', error);
        return;
      }

      setFeedingSchedules(data || []);
    } catch (error) {
      console.error('Error fetching feeding schedules:', error);
    }
  };

  // Fetch health records
  const fetchHealthRecords = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('health_records')
        .select(`
          *,
          ponds!inner(user_id, name)
        `)
        .eq('ponds.user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching health records:', error);
        return;
      }

      setHealthRecords(data || []);
    } catch (error) {
      console.error('Error fetching health records:', error);
    }
  };

  // Initial data fetch
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchFeedingSchedules(),
        fetchHealthRecords(),
      ]);
      setIsLoading(false);
    };

    if (user) {
      fetchData();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user) return;

    const feedingChannel = supabase
      .channel('feeding_schedules_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'feeding_schedules',
        },
        (payload) => {
          console.log('Realtime feeding schedule change:', payload);
          fetchFeedingSchedules(); // Refetch to get proper joins
        }
      )
      .subscribe();

    const healthChannel = supabase
      .channel('health_records_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'health_records',
        },
        (payload) => {
          console.log('Realtime health record change:', payload);
          fetchHealthRecords(); // Refetch to get proper joins
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(feedingChannel);
      supabase.removeChannel(healthChannel);
    };
  }, [user]);

  return {
    feedingSchedules,
    healthRecords,
    isLoading,
    refetchFeedingSchedules: fetchFeedingSchedules,
    refetchHealthRecords: fetchHealthRecords,
  };
};
