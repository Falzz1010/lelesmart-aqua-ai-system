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

export interface WaterQualityLog {
  id: string;
  pond_id: string;
  temperature?: number;
  ph_level?: number;
  oxygen_level?: number;
  ammonia_level?: number;
  recorded_at: string;
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
          .from('feeding_schedules')
          .select(`
            *,
            ponds!inner (
              name,
              user_id
            )
          `)
          .eq('ponds.user_id', user.id)
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

  const createSchedule = async (scheduleData: Omit<FeedingSchedule, 'id' | 'created_at' | 'ponds'>) => {
    try {
      const { data, error } = await supabase
        .from('feeding_schedules')
        .insert([scheduleData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating feeding schedule:', error);
      throw error;
    }
  };

  const updateScheduleStatus = async (id: string, status: 'pending' | 'completed') => {
    try {
      const { data, error } = await supabase
        .from('feeding_schedules')
        .update({ status })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating feeding schedule:', error);
      throw error;
    }
  };

  return { schedules, loading, createSchedule, updateScheduleStatus };
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
          .from('health_records')
          .select(`
            *,
            ponds!inner (
              name,
              user_id
            )
          `)
          .eq('ponds.user_id', user.id)
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

  const createHealthRecord = async (recordData: Omit<HealthRecord, 'id' | 'created_at' | 'ponds'>) => {
    try {
      const { data, error } = await supabase
        .from('health_records')
        .insert([recordData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating health record:', error);
      throw error;
    }
  };

  return { healthRecords, loading, createHealthRecord };
};

export const useRealtimeWaterQuality = () => {
  const [waterQualityLogs, setWaterQualityLogs] = useState<WaterQualityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchWaterQuality = async () => {
      try {
        const { data, error } = await supabase
          .from('water_quality_logs')
          .select(`
            *,
            ponds!inner (
              name,
              user_id
            )
          `)
          .eq('ponds.user_id', user.id)
          .order('recorded_at', { ascending: false });
        
        if (!error && data) {
          setWaterQualityLogs(data);
        }
      } catch (error) {
        console.error('Error fetching water quality logs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWaterQuality();

    const channel = supabase
      .channel('water-quality-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'water_quality_logs'
        },
        () => {
          fetchWaterQuality();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const createWaterQualityLog = async (logData: Omit<WaterQualityLog, 'id' | 'recorded_at' | 'ponds'>) => {
    try {
      const { data, error } = await supabase
        .from('water_quality_logs')
        .insert([logData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating water quality log:', error);
      throw error;
    }
  };

  return { waterQualityLogs, loading, createWaterQualityLog };
};