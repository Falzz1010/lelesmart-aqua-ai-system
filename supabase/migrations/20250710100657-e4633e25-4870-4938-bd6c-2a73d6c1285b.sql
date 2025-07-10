
-- Create enum types for user roles and pond status
CREATE TYPE user_role AS ENUM ('admin', 'supervisor', 'farmer');
CREATE TYPE pond_status AS ENUM ('active', 'maintenance', 'inactive');
CREATE TYPE fish_health_status AS ENUM ('healthy', 'sick', 'critical');
CREATE TYPE feeding_status AS ENUM ('pending', 'completed', 'overdue');

-- Create profiles table for user management
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'farmer',
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ponds table
CREATE TABLE ponds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  size_m2 DECIMAL(10,2) NOT NULL,
  depth_m DECIMAL(5,2) NOT NULL,
  fish_count INTEGER DEFAULT 0,
  fish_age_days INTEGER DEFAULT 0,
  status pond_status DEFAULT 'active',
  water_temperature DECIMAL(5,2),
  ph_level DECIMAL(4,2),
  oxygen_level DECIMAL(5,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create feeding schedules table
CREATE TABLE feeding_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pond_id UUID REFERENCES ponds(id) ON DELETE CASCADE NOT NULL,
  feeding_time TIME NOT NULL,
  feed_amount_kg DECIMAL(8,2) NOT NULL,
  feed_type TEXT NOT NULL,
  status feeding_status DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create health records table
CREATE TABLE health_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pond_id UUID REFERENCES ponds(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  health_status fish_health_status NOT NULL,
  symptoms TEXT,
  treatment TEXT,
  image_url TEXT,
  ai_analysis JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create harvest predictions table
CREATE TABLE harvest_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pond_id UUID REFERENCES ponds(id) ON DELETE CASCADE NOT NULL,
  predicted_date DATE NOT NULL,
  predicted_weight_kg DECIMAL(10,2) NOT NULL,
  predicted_count INTEGER NOT NULL,
  confidence_score DECIMAL(5,4),
  market_price_prediction DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create water quality logs table
CREATE TABLE water_quality_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pond_id UUID REFERENCES ponds(id) ON DELETE CASCADE NOT NULL,
  temperature DECIMAL(5,2),
  ph_level DECIMAL(4,2),
  oxygen_level DECIMAL(5,2),
  ammonia_level DECIMAL(5,2),
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ponds ENABLE ROW LEVEL SECURITY;
ALTER TABLE feeding_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE harvest_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE water_quality_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for ponds
CREATE POLICY "Users can view own ponds" ON ponds FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own ponds" ON ponds FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own ponds" ON ponds FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own ponds" ON ponds FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for feeding schedules
CREATE POLICY "Users can view feeding schedules for own ponds" ON feeding_schedules FOR SELECT USING (
  EXISTS (SELECT 1 FROM ponds WHERE ponds.id = feeding_schedules.pond_id AND ponds.user_id = auth.uid())
);
CREATE POLICY "Users can insert feeding schedules for own ponds" ON feeding_schedules FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM ponds WHERE ponds.id = feeding_schedules.pond_id AND ponds.user_id = auth.uid())
);
CREATE POLICY "Users can update feeding schedules for own ponds" ON feeding_schedules FOR UPDATE USING (
  EXISTS (SELECT 1 FROM ponds WHERE ponds.id = feeding_schedules.pond_id AND ponds.user_id = auth.uid())
);

-- Create RLS policies for health records
CREATE POLICY "Users can view health records for own ponds" ON health_records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert health records" ON health_records FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for harvest predictions
CREATE POLICY "Users can view harvest predictions for own ponds" ON harvest_predictions FOR SELECT USING (
  EXISTS (SELECT 1 FROM ponds WHERE ponds.id = harvest_predictions.pond_id AND ponds.user_id = auth.uid())
);

-- Create RLS policies for water quality logs
CREATE POLICY "Users can view water quality logs for own ponds" ON water_quality_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM ponds WHERE ponds.id = water_quality_logs.pond_id AND ponds.user_id = auth.uid())
);
CREATE POLICY "Users can insert water quality logs for own ponds" ON water_quality_logs FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM ponds WHERE ponds.id = water_quality_logs.pond_id AND ponds.user_id = auth.uid())
);

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'farmer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Enable realtime for all tables
ALTER TABLE profiles REPLICA IDENTITY FULL;
ALTER TABLE ponds REPLICA IDENTITY FULL;
ALTER TABLE feeding_schedules REPLICA IDENTITY FULL;
ALTER TABLE health_records REPLICA IDENTITY FULL;
ALTER TABLE harvest_predictions REPLICA IDENTITY FULL;
ALTER TABLE water_quality_logs REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE ponds;
ALTER PUBLICATION supabase_realtime ADD TABLE feeding_schedules;
ALTER PUBLICATION supabase_realtime ADD TABLE health_records;
ALTER PUBLICATION supabase_realtime ADD TABLE harvest_predictions;
ALTER PUBLICATION supabase_realtime ADD TABLE water_quality_logs;
