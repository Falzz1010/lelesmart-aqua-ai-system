
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import type { FeedingSchedule, HealthRecord, FeedingScheduleInsert, HealthRecordInsert } from '@/types/database';

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
          ponds!inner(user_id, name)
        `)
        .eq('ponds.user_id', user.id)
        .order('feeding_time', { ascending: true });

      if (error) {
        console.error('Error fetching feeding schedules:', error);
        return;
      }

      setFeedingSchedules((data || []) as FeedingSchedule[]);
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

      setHealthRecords((data || []) as HealthRecord[]);
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

// Individual hooks for specific functionality
export const useRealtimeFeedingSchedules = () => {
  const [schedules, setSchedules] = useState<FeedingSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchSchedules = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('feeding_schedules')
        .select(`
          *,
          ponds!inner(user_id, name)
        `)
        .eq('ponds.user_id', user.id)
        .order('feeding_time', { ascending: true });

      if (error) {
        console.error('Error fetching feeding schedules:', error);
        return;
      }

      setSchedules((data || []) as FeedingSchedule[]);
    } catch (error) {
      console.error('Error fetching feeding schedules:', error);
    }
  };

  const createSchedule = async (scheduleData: FeedingScheduleInsert) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('feeding_schedules')
        .insert([scheduleData])
        .select()
        .single();

      if (error) {
        console.error('Error creating schedule:', error);
        throw error;
      }

      await fetchSchedules();
      return data;
    } catch (error) {
      console.error('Error creating schedule:', error);
      throw error;
    }
  };

  const updateScheduleStatus = async (id: string, status: 'pending' | 'completed') => {
    try {
      const { error } = await supabase
        .from('feeding_schedules')
        .update({ status })
        .eq('id', id);

      if (error) {
        console.error('Error updating schedule status:', error);
        throw error;
      }

      await fetchSchedules();
    } catch (error) {
      console.error('Error updating schedule status:', error);
      throw error;
    }
  };

  useEffect(() => {
    const loadSchedules = async () => {
      setLoading(true);
      await fetchSchedules();
      setLoading(false);
    };

    if (user) {
      loadSchedules();

      // Set up realtime subscription
      const channel = supabase
        .channel('feeding_schedules_realtime')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'feeding_schedules',
          },
          () => {
            fetchSchedules();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } else {
      setLoading(false);
    }
  }, [user]);

  return {
    schedules,
    loading,
    createSchedule,
    updateScheduleStatus,
    refetch: fetchSchedules,
  };
};

export const useRealtimeHealthRecords = () => {
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

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

      setHealthRecords((data || []) as HealthRecord[]);
    } catch (error) {
      console.error('Error fetching health records:', error);
    }
  };

  const createHealthRecord = async (recordData: HealthRecordInsert) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('health_records')
        .insert([recordData])
        .select()
        .single();

      if (error) {
        console.error('Error creating health record:', error);
        throw error;
      }

      await fetchHealthRecords();
      return data;
    } catch (error) {
      console.error('Error creating health record:', error);
      throw error;
    }
  };

  useEffect(() => {
    const loadHealthRecords = async () => {
      setLoading(true);
      await fetchHealthRecords();
      setLoading(false);
    };

    if (user) {
      loadHealthRecords();

      // Set up realtime subscription
      const channel = supabase
        .channel('health_records_realtime')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'health_records',
          },
          () => {
            fetchHealthRecords();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } else {
      setLoading(false);
    }
  }, [user]);

  return {
    healthRecords,
    loading,
    createHealthRecord,
    refetch: fetchHealthRecords,
  };
};

export const useRealtimeWaterQuality = () => {
  const [waterQualityLogs, setWaterQualityLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchWaterQuality = async () => {
    if (!user) return;

    try {
      // Fetch water quality data from ponds table
      const { data, error } = await supabase
        .from('ponds')
        .select('id, name, water_temperature, ph_level, updated_at')
        .eq('user_id', user.id)
        .not('water_temperature', 'is', null)
        .not('ph_level', 'is', null)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching water quality:', error);
        return;
      }

      const waterQualityData = (data || []).map(pond => ({
        id: pond.id,
        pond_name: pond.name,
        temperature: pond.water_temperature,
        ph_level: pond.ph_level,
        created_at: pond.updated_at
      }));

      setWaterQualityLogs(waterQualityData);
    } catch (error) {
      console.error('Error fetching water quality:', error);
    }
  };

  useEffect(() => {
    const loadWaterQuality = async () => {
      setLoading(true);
      await fetchWaterQuality();
      setLoading(false);
    };

    if (user) {
      loadWaterQuality();

      // Set up realtime subscription for pond updates
      const channel = supabase
        .channel('water_quality_realtime')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'ponds',
          },
          () => {
            fetchWaterQuality();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } else {
      setLoading(false);
    }
  }, [user]);

  return {
    waterQualityLogs,
    loading,
    refetch: fetchWaterQuality,
  };
};
