-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('user', 'admin');

-- User roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles"
ON public.profiles FOR SELECT
USING (true);

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- Tourist spots table
CREATE TABLE public.tourist_spots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    contact_number TEXT,
    location TEXT NOT NULL,
    municipality TEXT,
    category TEXT[] DEFAULT '{}',
    image_url TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    rating DECIMAL(3, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.tourist_spots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view tourist spots"
ON public.tourist_spots FOR SELECT
USING (true);

CREATE POLICY "Only admins can insert tourist spots"
ON public.tourist_spots FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update tourist spots"
ON public.tourist_spots FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete tourist spots"
ON public.tourist_spots FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Restaurants table
CREATE TABLE public.restaurants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    food_type TEXT,
    location TEXT NOT NULL,
    municipality TEXT,
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view restaurants"
ON public.restaurants FOR SELECT
USING (true);

CREATE POLICY "Only admins can manage restaurants"
ON public.restaurants FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Events and Festivals table
CREATE TABLE public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    event_type TEXT,
    location TEXT NOT NULL,
    municipality TEXT,
    description TEXT,
    event_date DATE,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view events"
ON public.events FOR SELECT
USING (true);

CREATE POLICY "Only admins can manage events"
ON public.events FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- User itineraries table
CREATE TABLE public.itineraries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL DEFAULT 'My Itinerary',
    selected_categories TEXT[] DEFAULT '{}',
    spots JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.itineraries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own itineraries"
ON public.itineraries FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own itineraries"
ON public.itineraries FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own itineraries"
ON public.itineraries FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own itineraries"
ON public.itineraries FOR DELETE
USING (auth.uid() = user_id);

-- Reviews table
CREATE TABLE public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    spot_id UUID REFERENCES public.tourist_spots(id) ON DELETE CASCADE NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reviews"
ON public.reviews FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create reviews"
ON public.reviews FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews"
ON public.reviews FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews"
ON public.reviews FOR DELETE
USING (auth.uid() = user_id);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name');
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'user');
  
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE PLPGSQL
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tourist_spots_updated_at
BEFORE UPDATE ON public.tourist_spots
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_itineraries_updated_at
BEFORE UPDATE ON public.itineraries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();