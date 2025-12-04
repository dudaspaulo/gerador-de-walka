-- Add new fields for favicon, webclip, and dashboard cover image
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS favicon_filename text DEFAULT 'favicon.png',
ADD COLUMN IF NOT EXISTS webclip_filename text DEFAULT 'apple-touch-icon.png',
ADD COLUMN IF NOT EXISTS dashboard_cover_image text;