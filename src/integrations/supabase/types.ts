export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      project_faqs: {
        Row: {
          answer: string
          created_at: string
          id: string
          project_id: string
          question: string
        }
        Insert: {
          answer: string
          created_at?: string
          id?: string
          project_id: string
          question: string
        }
        Update: {
          answer?: string
          created_at?: string
          id?: string
          project_id?: string
          question?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_faqs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_gallery: {
        Row: {
          created_at: string
          display_order: number | null
          id: string
          image_url: string
          project_id: string
        }
        Insert: {
          created_at?: string
          display_order?: number | null
          id?: string
          image_url: string
          project_id: string
        }
        Update: {
          created_at?: string
          display_order?: number | null
          id?: string
          image_url?: string
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_gallery_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_plants: {
        Row: {
          availability_text: string | null
          created_at: string
          footage: string | null
          id: string
          image_url: string | null
          package: string | null
          project_id: string
          style: string | null
          title: string
        }
        Insert: {
          availability_text?: string | null
          created_at?: string
          footage?: string | null
          id?: string
          image_url?: string | null
          package?: string | null
          project_id: string
          style?: string | null
          title: string
        }
        Update: {
          availability_text?: string | null
          created_at?: string
          footage?: string | null
          id?: string
          image_url?: string | null
          package?: string | null
          project_id?: string
          style?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_plants_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_prices: {
        Row: {
          badge_text: string | null
          created_at: string
          cta_link: string | null
          features: string | null
          id: string
          price_value: string | null
          project_id: string
          title: string
        }
        Insert: {
          badge_text?: string | null
          created_at?: string
          cta_link?: string | null
          features?: string | null
          id?: string
          price_value?: string | null
          project_id: string
          title: string
        }
        Update: {
          badge_text?: string | null
          created_at?: string
          cta_link?: string | null
          features?: string | null
          id?: string
          price_value?: string | null
          project_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_prices_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_tours: {
        Row: {
          created_at: string
          id: string
          iframe_url: string
          label: string
          project_id: string
          style_category: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          iframe_url: string
          label: string
          project_id: string
          style_category?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          iframe_url?: string
          label?: string
          project_id?: string
          style_category?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_tours_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          address_full: string | null
          brand_color: string | null
          builder_name: string | null
          city_state: string | null
          created_at: string
          cta_link: string | null
          delivery_date: string | null
          email_contact: string | null
          footage_range: string | null
          hero_headline: string | null
          hero_image_url: string | null
          hero_subheadline: string | null
          id: string
          launch_date: string | null
          location_desc: string | null
          logo_url: string | null
          map_embed_src: string | null
          name: string
          points_of_interest: string | null
          seo_desc: string | null
          seo_image_url: string | null
          seo_title: string | null
          slug: string
          status: string | null
          tech_specs: string | null
          typologies_text: string | null
          updated_at: string
          whatsapp_link: string | null
        }
        Insert: {
          address_full?: string | null
          brand_color?: string | null
          builder_name?: string | null
          city_state?: string | null
          created_at?: string
          cta_link?: string | null
          delivery_date?: string | null
          email_contact?: string | null
          footage_range?: string | null
          hero_headline?: string | null
          hero_image_url?: string | null
          hero_subheadline?: string | null
          id?: string
          launch_date?: string | null
          location_desc?: string | null
          logo_url?: string | null
          map_embed_src?: string | null
          name: string
          points_of_interest?: string | null
          seo_desc?: string | null
          seo_image_url?: string | null
          seo_title?: string | null
          slug: string
          status?: string | null
          tech_specs?: string | null
          typologies_text?: string | null
          updated_at?: string
          whatsapp_link?: string | null
        }
        Update: {
          address_full?: string | null
          brand_color?: string | null
          builder_name?: string | null
          city_state?: string | null
          created_at?: string
          cta_link?: string | null
          delivery_date?: string | null
          email_contact?: string | null
          footage_range?: string | null
          hero_headline?: string | null
          hero_image_url?: string | null
          hero_subheadline?: string | null
          id?: string
          launch_date?: string | null
          location_desc?: string | null
          logo_url?: string | null
          map_embed_src?: string | null
          name?: string
          points_of_interest?: string | null
          seo_desc?: string | null
          seo_image_url?: string | null
          seo_title?: string | null
          slug?: string
          status?: string | null
          tech_specs?: string | null
          typologies_text?: string | null
          updated_at?: string
          whatsapp_link?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
