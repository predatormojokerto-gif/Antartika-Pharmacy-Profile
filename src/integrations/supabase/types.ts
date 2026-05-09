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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      messages: {
        Row: {
          created_at: string
          email: string
          id: string
          is_read: boolean
          is_replied: boolean
          message: string
          name: string
          replied_at: string | null
          subject: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_read?: boolean
          is_replied?: boolean
          message: string
          name: string
          replied_at?: string | null
          subject?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_read?: boolean
          is_replied?: boolean
          message?: string
          name?: string
          replied_at?: string | null
          subject?: string
        }
        Relationships: []
      }
      product_categories: {
        Row: {
          created_at: string
          description: string
          id: string
          image_url: string | null
          name: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          image_url?: string | null
          name: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          image_url?: string | null
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      products: {
        Row: {
          badge: string
          category: string
          created_at: string
          description: string
          id: string
          image_url: string | null
          name: string
          price: string
          sort_order: number
          updated_at: string
          usage: string[]
          warnings: string[]
        }
        Insert: {
          badge?: string
          category?: string
          created_at?: string
          description?: string
          id?: string
          image_url?: string | null
          name: string
          price?: string
          sort_order?: number
          updated_at?: string
          usage?: string[]
          warnings?: string[]
        }
        Update: {
          badge?: string
          category?: string
          created_at?: string
          description?: string
          id?: string
          image_url?: string | null
          name?: string
          price?: string
          sort_order?: number
          updated_at?: string
          usage?: string[]
          warnings?: string[]
        }
        Relationships: []
      }
      services: {
        Row: {
          created_at: string
          description: string
          icon: string
          id: string
          sort_order: number
          title: string
        }
        Insert: {
          created_at?: string
          description: string
          icon?: string
          id?: string
          sort_order?: number
          title: string
        }
        Update: {
          created_at?: string
          description?: string
          icon?: string
          id?: string
          sort_order?: number
          title?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          about_text: string
          about_title: string
          address: string
          company_name: string
          email: string
          hero_subtitle: string
          hero_title: string
          hours: string
          id: string
          logo_url: string | null
          mission: string
          phone: string
          stat_branches: string
          stat_customers: string
          stat_products: string
          stat_years: string
          tagline: string
          updated_at: string
          vision: string
        }
        Insert: {
          about_text?: string
          about_title?: string
          address?: string
          company_name?: string
          email?: string
          hero_subtitle?: string
          hero_title?: string
          hours?: string
          id?: string
          logo_url?: string | null
          mission?: string
          phone?: string
          stat_branches?: string
          stat_customers?: string
          stat_products?: string
          stat_years?: string
          tagline?: string
          updated_at?: string
          vision?: string
        }
        Update: {
          about_text?: string
          about_title?: string
          address?: string
          company_name?: string
          email?: string
          hero_subtitle?: string
          hero_title?: string
          hours?: string
          id?: string
          logo_url?: string | null
          mission?: string
          phone?: string
          stat_branches?: string
          stat_customers?: string
          stat_products?: string
          stat_years?: string
          tagline?: string
          updated_at?: string
          vision?: string
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
      claim_first_admin: { Args: never; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin"
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
      app_role: ["admin"],
    },
  },
} as const
