export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      api_usage: {
        Row: {
          calls_count: number | null
          created_at: string | null
          date: string | null
          endpoint: string
          id: string
          user_id: string | null
        }
        Insert: {
          calls_count?: number | null
          created_at?: string | null
          date?: string | null
          endpoint: string
          id?: string
          user_id?: string | null
        }
        Update: {
          calls_count?: number | null
          created_at?: string | null
          date?: string | null
          endpoint?: string
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "api_usage_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      feeding_schedules: {
        Row: {
          created_at: string
          feed_amount_kg: number
          feed_type: string
          feeding_time: string
          id: string
          pond_id: string
          status: string
        }
        Insert: {
          created_at?: string
          feed_amount_kg: number
          feed_type: string
          feeding_time: string
          id?: string
          pond_id: string
          status?: string
        }
        Update: {
          created_at?: string
          feed_amount_kg?: number
          feed_type?: string
          feeding_time?: string
          id?: string
          pond_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "feeding_schedules_pond_id_fkey"
            columns: ["pond_id"]
            isOneToOne: false
            referencedRelation: "ponds"
            referencedColumns: ["id"]
          },
        ]
      }
      guidance_schedule: {
        Row: {
          created_at: string | null
          id: string
          lecturer_id: string
          notes: string | null
          scheduled_date: string
          status: string | null
          student_id: string
          thesis_id: string
          title: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          lecturer_id: string
          notes?: string | null
          scheduled_date: string
          status?: string | null
          student_id: string
          thesis_id: string
          title: string
        }
        Update: {
          created_at?: string | null
          id?: string
          lecturer_id?: string
          notes?: string | null
          scheduled_date?: string
          status?: string | null
          student_id?: string
          thesis_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "guidance_schedule_lecturer_id_fkey"
            columns: ["lecturer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guidance_schedule_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guidance_schedule_thesis_id_fkey"
            columns: ["thesis_id"]
            isOneToOne: false
            referencedRelation: "thesis"
            referencedColumns: ["id"]
          },
        ]
      }
      health_records: {
        Row: {
          created_at: string
          health_status: string
          id: string
          pond_id: string
          symptoms: string | null
          treatment: string | null
        }
        Insert: {
          created_at?: string
          health_status: string
          id?: string
          pond_id: string
          symptoms?: string | null
          treatment?: string | null
        }
        Update: {
          created_at?: string
          health_status?: string
          id?: string
          pond_id?: string
          symptoms?: string | null
          treatment?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "health_records_pond_id_fkey"
            columns: ["pond_id"]
            isOneToOne: false
            referencedRelation: "ponds"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          sender_id: string
          thesis_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          sender_id: string
          thesis_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          sender_id?: string
          thesis_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_thesis_id_fkey"
            columns: ["thesis_id"]
            isOneToOne: false
            referencedRelation: "thesis"
            referencedColumns: ["id"]
          },
        ]
      }
      ponds: {
        Row: {
          created_at: string
          depth_m: number
          fish_age_days: number
          fish_count: number
          id: string
          name: string
          ph_level: number | null
          size_m2: number
          status: string
          updated_at: string
          user_id: string
          water_temperature: number | null
        }
        Insert: {
          created_at?: string
          depth_m: number
          fish_age_days?: number
          fish_count?: number
          id?: string
          name: string
          ph_level?: number | null
          size_m2: number
          status?: string
          updated_at?: string
          user_id: string
          water_temperature?: number | null
        }
        Update: {
          created_at?: string
          depth_m?: number
          fish_age_days?: number
          fish_count?: number
          id?: string
          name?: string
          ph_level?: number | null
          size_m2?: number
          status?: string
          updated_at?: string
          user_id?: string
          water_temperature?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          department: string | null
          email: string
          full_name: string
          id: string
          nim_nidn: string | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          department?: string | null
          email: string
          full_name: string
          id: string
          nim_nidn?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          department?: string | null
          email?: string
          full_name?: string
          id?: string
          nim_nidn?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Relationships: []
      }
      submissions: {
        Row: {
          comments: string | null
          created_at: string | null
          file_name: string | null
          file_url: string | null
          id: string
          status: Database["public"]["Enums"]["thesis_status"] | null
          student_id: string
          thesis_id: string
          title: string
          type: Database["public"]["Enums"]["submission_type"]
          updated_at: string | null
          version: number | null
        }
        Insert: {
          comments?: string | null
          created_at?: string | null
          file_name?: string | null
          file_url?: string | null
          id?: string
          status?: Database["public"]["Enums"]["thesis_status"] | null
          student_id: string
          thesis_id: string
          title: string
          type: Database["public"]["Enums"]["submission_type"]
          updated_at?: string | null
          version?: number | null
        }
        Update: {
          comments?: string | null
          created_at?: string | null
          file_name?: string | null
          file_url?: string | null
          id?: string
          status?: Database["public"]["Enums"]["thesis_status"] | null
          student_id?: string
          thesis_id?: string
          title?: string
          type?: Database["public"]["Enums"]["submission_type"]
          updated_at?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "submissions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_thesis_id_fkey"
            columns: ["thesis_id"]
            isOneToOne: false
            referencedRelation: "thesis"
            referencedColumns: ["id"]
          },
        ]
      }
      thesis: {
        Row: {
          approved_at: string | null
          created_at: string | null
          description: string | null
          id: string
          keywords: string[] | null
          lecturer_id: string | null
          status: Database["public"]["Enums"]["thesis_status"] | null
          student_id: string
          submitted_at: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          keywords?: string[] | null
          lecturer_id?: string | null
          status?: Database["public"]["Enums"]["thesis_status"] | null
          student_id: string
          submitted_at?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          keywords?: string[] | null
          lecturer_id?: string | null
          status?: Database["public"]["Enums"]["thesis_status"] | null
          student_id?: string
          submitted_at?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "thesis_lecturer_id_fkey"
            columns: ["lecturer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "thesis_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      water_quality_logs: {
        Row: {
          ammonia_level: number | null
          created_at: string
          dissolved_oxygen: number | null
          id: string
          nitrate_level: number | null
          nitrite_level: number | null
          ph_level: number | null
          pond_id: string
          recorded_at: string
          temperature: number | null
        }
        Insert: {
          ammonia_level?: number | null
          created_at?: string
          dissolved_oxygen?: number | null
          id?: string
          nitrate_level?: number | null
          nitrite_level?: number | null
          ph_level?: number | null
          pond_id: string
          recorded_at?: string
          temperature?: number | null
        }
        Update: {
          ammonia_level?: number | null
          created_at?: string
          dissolved_oxygen?: number | null
          id?: string
          nitrate_level?: number | null
          nitrite_level?: number | null
          ph_level?: number | null
          pond_id?: string
          recorded_at?: string
          temperature?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "water_quality_logs_pond_id_fkey"
            columns: ["pond_id"]
            isOneToOne: false
            referencedRelation: "ponds"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_new_api_key: {
        Args: { user_uuid: string }
        Returns: string
      }
      is_admin_user: {
        Args: { user_id?: string }
        Returns: boolean
      }
    }
    Enums: {
      submission_type: "proposal" | "chapter" | "final" | "revision"
      thesis_status:
        | "draft"
        | "submitted"
        | "under_review"
        | "approved"
        | "rejected"
        | "revision_needed"
      user_role: "student" | "lecturer" | "admin"
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
      submission_type: ["proposal", "chapter", "final", "revision"],
      thesis_status: [
        "draft",
        "submitted",
        "under_review",
        "approved",
        "rejected",
        "revision_needed",
      ],
      user_role: ["student", "lecturer", "admin"],
    },
  },
} as const
