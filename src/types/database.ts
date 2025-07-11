
// Database types for the pond management system
export interface Pond {
  id: string;
  user_id: string;
  name: string;
  size_m2: number;
  depth_m: number;
  fish_count: number;
  fish_age_days: number;
  status: 'active' | 'maintenance' | 'inactive';
  water_temperature?: number;
  ph_level?: number;
  created_at: string;
  updated_at: string;
}

export interface FeedingSchedule {
  id: string;
  pond_id: string;
  feeding_time: string;
  feed_amount_kg: number;
  feed_type: string;
  status: 'pending' | 'completed';
  created_at: string;
  ponds?: {
    user_id: string;
    name: string;
  };
}

export interface HealthRecord {
  id: string;
  pond_id: string;
  health_status: 'healthy' | 'sick' | 'critical';
  symptoms?: string;
  treatment?: string;
  created_at: string;
  ponds?: {
    user_id: string;
    name: string;
  };
}

export type PondInsert = Omit<Pond, 'id' | 'created_at' | 'updated_at'>;
export type PondUpdate = Partial<Omit<Pond, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;
export type FeedingScheduleInsert = Omit<FeedingSchedule, 'id' | 'created_at'>;
export type HealthRecordInsert = Omit<HealthRecord, 'id' | 'created_at'>;
