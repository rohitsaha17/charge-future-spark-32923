-- Add station_type column to charging_stations table to distinguish between Public and Residential
ALTER TABLE charging_stations 
ADD COLUMN IF NOT EXISTS station_type TEXT DEFAULT 'Public';

-- Add pin_code column for complete address information
ALTER TABLE charging_stations 
ADD COLUMN IF NOT EXISTS pin_code TEXT;

-- Add district column for better location categorization
ALTER TABLE charging_stations 
ADD COLUMN IF NOT EXISTS district TEXT;