
-- Fix infinite recursion in profiles RLS policies by dropping conflicting policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;

-- Update enum to include farmer and supervisor roles properly
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('student', 'lecturer', 'admin', 'farmer', 'supervisor');
    ELSE
        -- Add new enum values if they don't exist
        BEGIN
            ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'farmer';
        EXCEPTION
            WHEN duplicate_object THEN NULL;
        END;
        
        BEGIN
            ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'supervisor';
        EXCEPTION
            WHEN duplicate_object THEN NULL;
        END;
    END IF;
END $$;

-- Create admin profiles if they don't exist
INSERT INTO profiles (id, email, full_name, role) 
SELECT 
    gen_random_uuid(),
    'admin@gmail.com',
    'Administrator',
    'admin'::user_role
WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE email = 'admin@gmail.com');

INSERT INTO profiles (id, email, full_name, role) 
SELECT 
    gen_random_uuid(),
    'admin@lelesmart.com', 
    'LeleSmart Admin',
    'admin'::user_role
WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE email = 'admin@lelesmart.com');

-- Create better RLS policies without recursion
CREATE POLICY "Users can view own profile" 
ON profiles 
FOR SELECT 
TO authenticated 
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON profiles 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
ON profiles 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = id);

-- Create a security definer function to check admin role safely
CREATE OR REPLACE FUNCTION is_admin(user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_id AND role = 'admin'::user_role
  );
$$;

-- Admin policies using the security definer function
CREATE POLICY "Admins can view all profiles" 
ON profiles 
FOR SELECT 
TO authenticated 
USING (is_admin());

CREATE POLICY "Admins can update any profile" 
ON profiles 
FOR UPDATE 
TO authenticated 
USING (is_admin());

-- Enable realtime for key tables
ALTER publication supabase_realtime ADD TABLE ponds;
ALTER publication supabase_realtime ADD TABLE feeding_schedules;
ALTER publication supabase_realtime ADD TABLE health_records;
ALTER publication supabase_realtime ADD TABLE profiles;

-- Set replica identity for better realtime updates
ALTER TABLE ponds REPLICA IDENTITY FULL;
ALTER TABLE feeding_schedules REPLICA IDENTITY FULL;
ALTER TABLE health_records REPLICA IDENTITY FULL;
ALTER TABLE profiles REPLICA IDENTITY FULL;

-- Create admin users in auth.users table (this will trigger profile creation)
-- Note: You'll need to manually create these users through Supabase Auth UI or run this in a function
-- INSERT INTO auth.users (email, encrypted_password, email_confirmed_at, created_at, updated_at)
-- VALUES 
-- ('admin@gmail.com', crypt('admin123', gen_salt('bf')), now(), now(), now()),
-- ('admin@lelesmart.com', crypt('admin123', gen_salt('bf')), now(), now(), now())
-- ON CONFLICT (email) DO NOTHING;
