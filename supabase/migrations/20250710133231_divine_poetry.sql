/*
  # Create water_quality_logs table

  1. New Tables
    - `water_quality_logs`
      - `id` (uuid, primary key)
      - `pond_id` (uuid, foreign key to ponds table)
      - `temperature` (numeric, water temperature in Celsius)
      - `ph_level` (numeric, pH level of water)
      - `dissolved_oxygen` (numeric, dissolved oxygen level in mg/L)
      - `ammonia_level` (numeric, ammonia level in mg/L)
      - `nitrite_level` (numeric, nitrite level in mg/L)
      - `nitrate_level` (numeric, nitrate level in mg/L)
      - `recorded_at` (timestamp, when the measurement was taken)
      - `created_at` (timestamp, when the record was created)

  2. Security
    - Enable RLS on `water_quality_logs` table
    - Add policies for users to manage water quality logs for their own ponds

  3. Realtime
    - Add table to realtime publication for live updates
*/

-- Create water_quality_logs table
CREATE TABLE IF NOT EXISTS public.water_quality_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pond_id UUID REFERENCES public.ponds(id) ON DELETE CASCADE NOT NULL,
  temperature NUMERIC,
  ph_level NUMERIC,
  dissolved_oxygen NUMERIC,
  ammonia_level NUMERIC,
  nitrite_level NUMERIC,
  nitrate_level NUMERIC,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.water_quality_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for water_quality_logs
CREATE POLICY "Users can view water quality logs for their ponds" 
  ON public.water_quality_logs 
  FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.ponds WHERE ponds.id = water_quality_logs.pond_id AND ponds.user_id = auth.uid()));

CREATE POLICY "Users can create water quality logs for their ponds" 
  ON public.water_quality_logs 
  FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.ponds WHERE ponds.id = water_quality_logs.pond_id AND ponds.user_id = auth.uid()));

CREATE POLICY "Users can update water quality logs for their ponds" 
  ON public.water_quality_logs 
  FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.ponds WHERE ponds.id = water_quality_logs.pond_id AND ponds.user_id = auth.uid()));

CREATE POLICY "Users can delete water quality logs for their ponds" 
  ON public.water_quality_logs 
  FOR DELETE 
  USING (EXISTS (SELECT 1 FROM public.ponds WHERE ponds.id = water_quality_logs.pond_id AND ponds.user_id = auth.uid()));

-- Enable realtime for the new table
ALTER TABLE public.water_quality_logs REPLICA IDENTITY FULL;

-- Add table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.water_quality_logs;