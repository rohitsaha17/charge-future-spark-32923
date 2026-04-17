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
      blog_posts: {
        Row: {
          author_id: string | null
          content: string
          created_at: string
          excerpt: string
          featured_image: string | null
          id: string
          meta_description: string | null
          meta_keywords: string[] | null
          published_at: string | null
          slug: string
          status: string
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          content: string
          created_at?: string
          excerpt: string
          featured_image?: string | null
          id?: string
          meta_description?: string | null
          meta_keywords?: string[] | null
          published_at?: string | null
          slug: string
          status?: string
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          content?: string
          created_at?: string
          excerpt?: string
          featured_image?: string | null
          id?: string
          meta_description?: string | null
          meta_keywords?: string[] | null
          published_at?: string | null
          slug?: string
          status?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      charging_stations: {
        Row: {
          address: string
          amenities: string[] | null
          available_chargers: number
          charger_type: string
          city: string
          connector_type: string
          created_at: string
          created_by: string | null
          district: string | null
          id: string
          latitude: number
          longitude: number
          name: string
          pin_code: string | null
          power_output: string
          price_per_unit: number | null
          state: string
          station_type: string | null
          status: string
          total_chargers: number
          updated_at: string
        }
        Insert: {
          address: string
          amenities?: string[] | null
          available_chargers?: number
          charger_type: string
          city: string
          connector_type: string
          created_at?: string
          created_by?: string | null
          district?: string | null
          id?: string
          latitude: number
          longitude: number
          name: string
          pin_code?: string | null
          power_output: string
          price_per_unit?: number | null
          state: string
          station_type?: string | null
          status?: string
          total_chargers?: number
          updated_at?: string
        }
        Update: {
          address?: string
          amenities?: string[] | null
          available_chargers?: number
          charger_type?: string
          city?: string
          connector_type?: string
          created_at?: string
          created_by?: string | null
          district?: string | null
          id?: string
          latitude?: number
          longitude?: number
          name?: string
          pin_code?: string | null
          power_output?: string
          price_per_unit?: number | null
          state?: string
          station_type?: string | null
          status?: string
          total_chargers?: number
          updated_at?: string
        }
        Relationships: []
      }
      investor_enquiries: {
        Row: {
          city: string | null
          created_at: string
          email: string
          id: string
          investment_range: string | null
          investor_type: string | null
          name: string
          organization: string | null
          phone: string
          status: string
          updated_at: string
        }
        Insert: {
          city?: string | null
          created_at?: string
          email: string
          id?: string
          investment_range?: string | null
          investor_type?: string | null
          name: string
          organization?: string | null
          phone: string
          status?: string
          updated_at?: string
        }
        Update: {
          city?: string | null
          created_at?: string
          email?: string
          id?: string
          investment_range?: string | null
          investor_type?: string | null
          name?: string
          organization?: string | null
          phone?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      partner_enquiries: {
        Row: {
          charger_type: string | null
          created_at: string
          email: string
          id: string
          location_address: string | null
          location_lat: number | null
          location_lng: number | null
          message: string | null
          name: string
          phone: string
          status: string
          updated_at: string
        }
        Insert: {
          charger_type?: string | null
          created_at?: string
          email: string
          id?: string
          location_address?: string | null
          location_lat?: number | null
          location_lng?: number | null
          message?: string | null
          name: string
          phone: string
          status?: string
          updated_at?: string
        }
        Update: {
          charger_type?: string | null
          created_at?: string
          email?: string
          id?: string
          location_address?: string | null
          location_lat?: number | null
          location_lng?: number | null
          message?: string | null
          name?: string
          phone?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          created_at: string
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          setting_key: string
          setting_value?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string
        }
        Relationships: []
      }
      partners: {
        Row: {
          id: string
          name: string
          logo_url: string | null
          website_url: string | null
          sort_order: number
          visible: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          logo_url?: string | null
          website_url?: string | null
          sort_order?: number
          visible?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          logo_url?: string | null
          website_url?: string | null
          sort_order?: number
          visible?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      statistics: {
        Row: {
          id: string
          label: string
          value: string
          suffix: string | null
          icon: string | null
          sort_order: number
          visible: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          label: string
          value: string
          suffix?: string | null
          icon?: string | null
          sort_order?: number
          visible?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          label?: string
          value?: string
          suffix?: string | null
          icon?: string | null
          sort_order?: number
          visible?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          id: string
          name: string
          role: string | null
          location: string | null
          image_url: string | null
          rating: number
          review: string
          sort_order: number
          visible: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          role?: string | null
          location?: string | null
          image_url?: string | null
          rating?: number
          review: string
          sort_order?: number
          visible?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          role?: string | null
          location?: string | null
          image_url?: string | null
          rating?: number
          review?: string
          sort_order?: number
          visible?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      team_members: {
        Row: {
          id: string
          name: string
          role: string
          image_url: string | null
          bio: string | null
          highlight: string | null
          linkedin_url: string | null
          youtube_url: string | null
          sort_order: number
          visible: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          role: string
          image_url?: string | null
          bio?: string | null
          highlight?: string | null
          linkedin_url?: string | null
          youtube_url?: string | null
          sort_order?: number
          visible?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          role?: string
          image_url?: string | null
          bio?: string | null
          highlight?: string | null
          linkedin_url?: string | null
          youtube_url?: string | null
          sort_order?: number
          visible?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      faqs: {
        Row: {
          id: string
          question: string
          answer: string
          category: string | null
          sort_order: number
          visible: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          question: string
          answer: string
          category?: string | null
          sort_order?: number
          visible?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          question?: string
          answer?: string
          category?: string | null
          sort_order?: number
          visible?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      services_catalog: {
        Row: {
          id: string
          slug: string | null
          name: string
          charger_type: string | null
          power: string | null
          price: string | null
          warranty: string | null
          description: string | null
          features: string[]
          ideal_for: string | null
          image_url: string | null
          sort_order: number
          visible: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug?: string | null
          name: string
          charger_type?: string | null
          power?: string | null
          price?: string | null
          warranty?: string | null
          description?: string | null
          features?: string[]
          ideal_for?: string | null
          image_url?: string | null
          sort_order?: number
          visible?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string | null
          name?: string
          charger_type?: string | null
          power?: string | null
          price?: string | null
          warranty?: string | null
          description?: string | null
          features?: string[]
          ideal_for?: string | null
          image_url?: string | null
          sort_order?: number
          visible?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
