
-- Create ponds table
CREATE TABLE public.ponds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  size_m2 NUMERIC NOT NULL,
  depth_m NUMERIC NOT NULL,
  fish_count INTEGER NOT NULL DEFAULT 0,
  fish_age_days INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'maintenance', 'inactive')),
  water_temperature NUMERIC,
  ph_level NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create feeding_schedules table
CREATE TABLE public.feeding_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pond_id UUID REFERENCES public.ponds(id) ON DELETE CASCADE NOT NULL,
  feeding_time TIME NOT NULL,
  feed_amount_kg NUMERIC NOT NULL,
  feed_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create health_records table
CREATE TABLE public.health_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pond_id UUID REFERENCES public.ponds(id) ON DELETE CASCADE NOT NULL,
  health_status TEXT NOT NULL CHECK (health_status IN ('healthy', 'sick', 'critical')),
  symptoms TEXT,
  treatment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.ponds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feeding_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_records ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for ponds
CREATE POLICY "Users can view their own ponds" 
  ON public.ponds 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own ponds" 
  ON public.ponds 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ponds" 
  ON public.ponds 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ponds" 
  ON public.ponds 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create RLS policies for feeding_schedules
CREATE POLICY "Users can view feeding schedules for their ponds" 
  ON public.feeding_schedules 
  FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.ponds WHERE ponds.id = feeding_schedules.pond_id AND ponds.user_id = auth.uid()));

CREATE POLICY "Users can create feeding schedules for their ponds" 
  ON public.feeding_schedules 
  FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.ponds WHERE ponds.id = feeding_schedules.pond_id AND ponds.user_id = auth.uid()));

CREATE POLICY "Users can update feeding schedules for their ponds" 
  ON public.feeding_schedules 
  FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.ponds WHERE ponds.id = feeding_schedules.pond_id AND ponds.user_id = auth.uid()));

CREATE POLICY "Users can delete feeding schedules for their ponds" 
  ON public.feeding_schedules 
  FOR DELETE 
  USING (EXISTS (SELECT 1 FROM public.ponds WHERE ponds.id = feeding_schedules.pond_id AND ponds.user_id = auth.uid()));

-- Create RLS policies for health_records
CREATE POLICY "Users can view health records for their ponds" 
  ON public.health_records 
  FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.ponds WHERE ponds.id = health_records.pond_id AND ponds.user_id = auth.uid()));

CREATE POLICY "Users can create health records for their ponds" 
  ON public.health_records 
  FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.ponds WHERE ponds.id = health_records.pond_id AND ponds.user_id = auth.uid()));

CREATE POLICY "Users can update health records for their ponds" 
  ON public.health_records 
  FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.ponds WHERE ponds.id = health_records.pond_id AND ponds.user_id = auth.uid()));

CREATE POLICY "Users can delete health records for their ponds" 
  ON public.health_records 
  FOR DELETE 
  USING (EXISTS (SELECT 1 FROM public.ponds WHERE ponds.id = health_records.pond_id AND ponds.user_id = auth.uid()));

-- Enable realtime for the new tables
ALTER TABLE public.ponds REPLICA IDENTITY FULL;
ALTER TABLE public.feeding_schedules REPLICA IDENTITY FULL;
ALTER TABLE public.health_records REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.ponds;
ALTER PUBLICATION supabase_realtime ADD TABLE public.feeding_schedules;
ALTER PUBLICATION supabase_realtime ADD TABLE public.health_records;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for ponds updated_at
CREATE TRIGGER handle_ponds_updated_at
  BEFORE UPDATE ON public.ponds
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
