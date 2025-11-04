-- Add user_preferences column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS user_preferences JSONB;

-- Add index for faster queries on user preferences
CREATE INDEX IF NOT EXISTS idx_profiles_user_preferences ON public.profiles USING gin(user_preferences);