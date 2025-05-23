export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      auction_cars: {
        Row: {
          created_at: string | null
          current_price: number | null
          end_date: string
          external_id: string
          external_url: string
          fuel_type: string | null
          id: number
          image_url: string | null
          location: string | null
          make: string | null
          mileage: string | null
          model: string | null
          start_price: number
          status: string | null
          title: string
          transmission: string | null
          year: number
        }
        Insert: {
          created_at?: string | null
          current_price?: number | null
          end_date: string
          external_id: string
          external_url: string
          fuel_type?: string | null
          id?: number
          image_url?: string | null
          location?: string | null
          make?: string | null
          mileage?: string | null
          model?: string | null
          start_price: number
          status?: string | null
          title: string
          transmission?: string | null
          year: number
        }
        Update: {
          created_at?: string | null
          current_price?: number | null
          end_date?: string
          external_id?: string
          external_url?: string
          fuel_type?: string | null
          id?: number
          image_url?: string | null
          location?: string | null
          make?: string | null
          mileage?: string | null
          model?: string | null
          start_price?: number
          status?: string | null
          title?: string
          transmission?: string | null
          year?: number
        }
        Relationships: []
      }
      auction_registrations: {
        Row: {
          created_at: string
          id: number
          name: string
          phone: string
        }
        Insert: {
          created_at?: string
          id?: number
          name: string
          phone: string
        }
        Update: {
          created_at?: string
          id?: number
          name?: string
          phone?: string
        }
        Relationships: []
      }
      auctions: {
        Row: {
          car_id: number | null
          created_at: string | null
          current_price: number
          end_date: string
          id: number
          start_price: number
          status: string
          winner_id: string | null
        }
        Insert: {
          car_id?: number | null
          created_at?: string | null
          current_price: number
          end_date: string
          id?: number
          start_price: number
          status?: string
          winner_id?: string | null
        }
        Update: {
          car_id?: number | null
          created_at?: string | null
          current_price?: number
          end_date?: string
          id?: number
          start_price?: number
          status?: string
          winner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "auctions_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
        ]
      }
      cars: {
        Row: {
          category: string
          created_at: string
          engine_power: string
          engine_size: string
          fuel_type: string
          id: number
          image: string
          images: string[] | null
          make: string
          mileage: string
          model: string
          name: string
          price: string
          price_number: number
          transmission: string
          year: number
        }
        Insert: {
          category: string
          created_at?: string
          engine_power: string
          engine_size: string
          fuel_type: string
          id?: number
          image: string
          images?: string[] | null
          make: string
          mileage: string
          model: string
          name: string
          price: string
          price_number: number
          transmission: string
          year: number
        }
        Update: {
          category?: string
          created_at?: string
          engine_power?: string
          engine_size?: string
          fuel_type?: string
          id?: number
          image?: string
          images?: string[] | null
          make?: string
          mileage?: string
          model?: string
          name?: string
          price?: string
          price_number?: number
          transmission?: string
          year?: number
        }
        Relationships: []
      }
      inspections: {
        Row: {
          car: string
          client: string
          created_at: string
          date: string
          id: number
          status: string
        }
        Insert: {
          car: string
          client: string
          created_at?: string
          date: string
          id?: number
          status: string
        }
        Update: {
          car?: string
          client?: string
          created_at?: string
          date?: string
          id?: number
          status?: string
        }
        Relationships: []
      }
      scraped_cars: {
        Row: {
          created_at: string | null
          external_id: string
          external_url: string
          fuel_type: string | null
          id: number
          image_url: string | null
          location: string | null
          mileage: string | null
          price: number
          source: string
          title: string
          transmission: string | null
          year: number | null
        }
        Insert: {
          created_at?: string | null
          external_id: string
          external_url: string
          fuel_type?: string | null
          id?: number
          image_url?: string | null
          location?: string | null
          mileage?: string | null
          price: number
          source?: string
          title: string
          transmission?: string | null
          year?: number | null
        }
        Update: {
          created_at?: string | null
          external_id?: string
          external_url?: string
          fuel_type?: string | null
          id?: number
          image_url?: string | null
          location?: string | null
          mileage?: string | null
          price?: number
          source?: string
          title?: string
          transmission?: string | null
          year?: number | null
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
          role: Database["public"]["Enums"]["app_role"]
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
