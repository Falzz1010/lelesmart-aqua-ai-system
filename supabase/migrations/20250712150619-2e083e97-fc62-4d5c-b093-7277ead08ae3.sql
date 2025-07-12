
-- Update profiles table to support admin role
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'admin';

-- Insert admin user data (this will be referenced when the admin signs up)
-- The actual user creation will happen through Supabase Auth
UPDATE profiles 
SET role = 'admin'::user_role 
WHERE email = 'admin@gmail.com';

-- If the admin profile doesn't exist yet, we'll handle it in the signup process
-- Add policy to allow admins to view all profiles
CREATE POLICY "Admins can view all profiles" 
ON profiles 
FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'::user_role
  )
);

-- Add policy for admins to update any profile
CREATE POLICY "Admins can update any profile" 
ON profiles 
FOR UPDATE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'::user_role
  )
);

-- Add policy for admins to view all ponds
CREATE POLICY "Admins can view all ponds" 
ON ponds 
FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'::user_role
  ) OR auth.uid() = user_id
);

-- Add policy for admins to view all feeding schedules
CREATE POLICY "Admins can view all feeding schedules" 
ON feeding_schedules 
FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'::user_role
  ) OR EXISTS (
    SELECT 1 FROM ponds 
    WHERE ponds.id = feeding_schedules.pond_id AND ponds.user_id = auth.uid()
  )
);

-- Add policy for admins to view all health records
CREATE POLICY "Admins can view all health records" 
ON health_records 
FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'::user_role
  ) OR EXISTS (
    SELECT 1 FROM ponds 
    WHERE ponds.id = health_records.pond_id AND ponds.user_id = auth.uid()
  )
);
