-- Add missing fields to tourist_spots table
ALTER TABLE public.tourist_spots ADD COLUMN IF NOT EXISTS is_hidden_gem BOOLEAN DEFAULT false;

-- Add onboarding_answers to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_answers JSONB;

-- Update itineraries table to include route
ALTER TABLE public.itineraries DROP COLUMN IF EXISTS route;
ALTER TABLE public.itineraries ADD COLUMN route JSONB DEFAULT '{"start":"","destinations":[],"total_distance":"","estimated_time":""}'::jsonb;

-- Create index for hidden gems query performance
CREATE INDEX IF NOT EXISTS idx_tourist_spots_hidden_gem ON public.tourist_spots(is_hidden_gem) WHERE is_hidden_gem = true;