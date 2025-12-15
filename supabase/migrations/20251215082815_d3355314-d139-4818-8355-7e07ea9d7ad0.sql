-- Create partner_enquiries table to store partner form submissions
CREATE TABLE public.partner_enquiries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  location_lat NUMERIC,
  location_lng NUMERIC,
  location_address TEXT,
  charger_type TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create investor_enquiries table to store investor form submissions
CREATE TABLE public.investor_enquiries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  organization TEXT,
  city TEXT,
  investor_type TEXT,
  investment_range TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.partner_enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investor_enquiries ENABLE ROW LEVEL SECURITY;

-- Partner enquiries: Anyone can insert (public form), only admins can view/update/delete
CREATE POLICY "Anyone can submit partner enquiries" 
ON public.partner_enquiries 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Only admins can view partner enquiries" 
ON public.partner_enquiries 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can update partner enquiries" 
ON public.partner_enquiries 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can delete partner enquiries" 
ON public.partner_enquiries 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Investor enquiries: Anyone can insert (public form), only admins can view/update/delete
CREATE POLICY "Anyone can submit investor enquiries" 
ON public.investor_enquiries 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Only admins can view investor enquiries" 
ON public.investor_enquiries 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can update investor enquiries" 
ON public.investor_enquiries 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can delete investor enquiries" 
ON public.investor_enquiries 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add triggers for updated_at
CREATE TRIGGER update_partner_enquiries_updated_at
BEFORE UPDATE ON public.partner_enquiries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_investor_enquiries_updated_at
BEFORE UPDATE ON public.investor_enquiries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();