
-- Update the user_role enum to include the correct roles for our pond management system
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'farmer';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'supervisor';

-- Since we can't remove enum values in PostgreSQL without recreating the enum,
-- we'll keep the existing ones but update any existing 'student' and 'lecturer' roles
-- to 'farmer' and 'supervisor' respectively if they exist
UPDATE profiles 
SET role = 'farmer'::user_role 
WHERE role = 'student'::user_role;

UPDATE profiles 
SET role = 'supervisor'::user_role 
WHERE role = 'lecturer'::user_role;
