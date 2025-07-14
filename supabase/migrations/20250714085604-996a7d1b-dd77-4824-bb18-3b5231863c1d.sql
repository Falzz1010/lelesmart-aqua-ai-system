-- Enable real-time for water quality logs
ALTER TABLE public.water_quality_logs REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE water_quality_logs;

-- Enable real-time for ponds
ALTER TABLE public.ponds REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE ponds;

-- Enable real-time for feeding schedules
ALTER TABLE public.feeding_schedules REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE feeding_schedules;

-- Enable real-time for health records
ALTER TABLE public.health_records REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE health_records;