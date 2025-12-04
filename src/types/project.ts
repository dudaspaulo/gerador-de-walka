export interface Project {
  id: string;
  created_at: string;
  name: string;
  slug: string;
  builder_name: string;
  city_state: string;
  address_full: string;
  whatsapp_link: string;
  email_contact: string;
  brand_color: string;
  hero_headline: string;
  hero_subheadline: string;
  hero_image_url: string;
  logo_url: string;
  seo_image_url: string;
  delivery_date: string;
  launch_date: string;
  footage_range: string;
  typologies_text: string;
  cta_link: string;
  location_desc: string;
  map_embed_src: string;
  points_of_interest: string;
  tech_specs: string;
  seo_title: string;
  seo_desc: string;
  status: 'draft' | 'published';
  favicon_filename: string;
  webclip_filename: string;
  dashboard_cover_image: string;
}

export interface ProjectGalleryItem {
  id: string;
  project_id: string;
  image_url: string;
  display_order: number;
}

export interface ProjectPlant {
  id: string;
  project_id: string;
  title: string;
  style: 'ECO' | 'SLIM' | 'URBAN';
  package: 'STANDARD' | 'BASIC' | 'ESSENTIAL' | 'DESIGN';
  footage: string;
  image_url: string;
  availability_text: string;
}

export interface ProjectTour {
  id: string;
  project_id: string;
  label: string;
  iframe_url: string;
  style_category: 'ECO' | 'SLIM' | 'URBAN';
}

export interface ProjectPrice {
  id: string;
  project_id: string;
  title: string;
  price_value: string;
  badge_text: string;
  features: string;
  cta_link: string;
}

export interface ProjectFaq {
  id: string;
  project_id: string;
  question: string;
  answer: string;
}

export interface FullProject extends Project {
  gallery: ProjectGalleryItem[];
  plants: ProjectPlant[];
  tours: ProjectTour[];
  prices: ProjectPrice[];
  faqs: ProjectFaq[];
}
