-- Create accommodations table for hotels and lodging
CREATE TABLE public.accommodations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  location TEXT NOT NULL,
  municipality TEXT,
  category TEXT[] DEFAULT '{}',
  image_url TEXT,
  contact_number TEXT,
  email TEXT,
  price_range TEXT,
  amenities TEXT[] DEFAULT '{}',
  rating NUMERIC DEFAULT 0,
  latitude NUMERIC,
  longitude NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.accommodations ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view accommodations (public data)
CREATE POLICY "Anyone can view accommodations"
ON public.accommodations
FOR SELECT
USING (true);

-- Only admins can manage accommodations
CREATE POLICY "Only admins can manage accommodations"
ON public.accommodations
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_accommodations_updated_at
BEFORE UPDATE ON public.accommodations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add some sample data
INSERT INTO public.accommodations (name, description, location, municipality, category, price_range, amenities, rating) VALUES
('The Oriental Legazpi', 'Premium hotel with stunning views of Mayon Volcano and modern amenities', 'Rizal Street, Old Albay District', 'Legazpi', ARRAY['Luxury', 'Business Hotel', 'City Center'], '₱3,500 - ₱8,000', ARRAY['WiFi', 'Restaurant', 'Pool', 'Gym', 'Conference Rooms', 'Spa'], 4.5),
('Mayon Backpackers Hostel', 'Budget-friendly hostel for solo travelers and backpackers', 'Penaranda Street', 'Legazpi', ARRAY['Budget', 'Hostel', 'Backpacker'], '₱300 - ₱800', ARRAY['WiFi', 'Common Area', 'Kitchen', 'Lockers'], 4.2),
('Misibis Bay Resort', 'Luxury beachfront resort with private island experience', 'Misibis Bay', 'Cagraray Island', ARRAY['Luxury', 'Beach Resort', 'All-Inclusive'], '₱12,000 - ₱30,000', ARRAY['WiFi', 'Beach Access', 'Water Sports', 'Restaurant', 'Spa', 'Pool', 'Bar'], 4.8),
('Hotel St. Ellis', 'Comfortable mid-range hotel near city attractions', 'Penaranda Street', 'Legazpi', ARRAY['Mid-range', 'City Center', 'Family-Friendly'], '₱1,500 - ₱3,000', ARRAY['WiFi', 'Restaurant', 'Air Conditioning', 'Cable TV'], 4.0),
('Pepperland Hotel', 'Modern boutique hotel with artistic interiors', 'Tahao Road', 'Legazpi', ARRAY['Mid-range', 'Boutique', 'Pet-Friendly'], '₱2,000 - ₱4,500', ARRAY['WiFi', 'Restaurant', 'Parking', 'Pet-Friendly', 'Art Gallery'], 4.3),
('Tiwi Hot Spring Resort', 'Natural hot spring resort for relaxation', 'Tiwi Hot Springs', 'Tiwi', ARRAY['Resort', 'Hot Springs', 'Nature'], '₱1,800 - ₱5,000', ARRAY['Hot Springs', 'Restaurant', 'Pool', 'Massage', 'Nature Trails'], 4.4),
('Casa Simeon', 'Heritage house turned boutique hotel', 'Brgy. Banao', 'Guinobatan', ARRAY['Boutique', 'Heritage', 'Mountain View'], '₱2,500 - ₱4,000', ARRAY['WiFi', 'Restaurant', 'Garden', 'Mountain View', 'Cultural Tours'], 4.6),
('Albay Astoria Hotel', 'Value hotel for business and leisure travelers', 'Washington Drive', 'Legazpi', ARRAY['Mid-range', 'Business Hotel'], '₱1,800 - ₱3,500', ARRAY['WiFi', 'Restaurant', 'Meeting Rooms', 'Parking'], 4.1);