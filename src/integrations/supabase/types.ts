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
      cash_sessions: {
        Row: {
          church_id: string
          created_at: string
          created_by: string
          culto_evento: string
          date_session: string
          id: string
          status: string
          updated_at: string
          validated_at: string | null
          validated_by: string | null
        }
        Insert: {
          church_id: string
          created_at?: string
          created_by: string
          culto_evento: string
          date_session?: string
          id?: string
          status?: string
          updated_at?: string
          validated_at?: string | null
          validated_by?: string | null
        }
        Update: {
          church_id?: string
          created_at?: string
          created_by?: string
          culto_evento?: string
          date_session?: string
          id?: string
          status?: string
          updated_at?: string
          validated_at?: string | null
          validated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cash_sessions_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
        ]
      }
      churches: {
        Row: {
          address: string | null
          city: string | null
          created_at: string
          id: string
          name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string
          id?: string
          name: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      cultos_eventos: {
        Row: {
          ativo: boolean
          church_id: string
          created_at: string
          descricao: string | null
          id: string
          nome: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          church_id: string
          created_at?: string
          descricao?: string | null
          id?: string
          nome: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          church_id?: string
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cultos_eventos_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
        ]
      }
      pix_entries: {
        Row: {
          amount: number
          cash_session_id: string
          created_at: string
          data_pix: string
          description: string | null
          id: string
        }
        Insert: {
          amount: number
          cash_session_id: string
          created_at?: string
          data_pix?: string
          description?: string | null
          id?: string
        }
        Update: {
          amount?: number
          cash_session_id?: string
          created_at?: string
          data_pix?: string
          description?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pix_entries_cash_session_id_fkey"
            columns: ["cash_session_id"]
            isOneToOne: false
            referencedRelation: "cash_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          church_id: string | null
          created_at: string
          id: string
          name: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          church_id?: string | null
          created_at?: string
          id: string
          name: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          church_id?: string | null
          created_at?: string
          id?: string
          name?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          cash_session_id: string | null
          category: Database["public"]["Enums"]["categoria_entrada"] | null
          created_at: string
          culto_evento: string | null
          date_transaction: string
          description: string
          id: string
          moeda_estrangeira: string | null
          observacao: string | null
          outros_gastos: number | null
          type: Database["public"]["Enums"]["tipo_transacao"]
          updated_at: string
          user_id: string
          valor_moeda_estrangeira: number | null
          valor_seguranca: number | null
          voluntarios: number | null
        }
        Insert: {
          amount: number
          cash_session_id?: string | null
          category?: Database["public"]["Enums"]["categoria_entrada"] | null
          created_at?: string
          culto_evento?: string | null
          date_transaction?: string
          description: string
          id?: string
          moeda_estrangeira?: string | null
          observacao?: string | null
          outros_gastos?: number | null
          type: Database["public"]["Enums"]["tipo_transacao"]
          updated_at?: string
          user_id: string
          valor_moeda_estrangeira?: number | null
          valor_seguranca?: number | null
          voluntarios?: number | null
        }
        Update: {
          amount?: number
          cash_session_id?: string | null
          category?: Database["public"]["Enums"]["categoria_entrada"] | null
          created_at?: string
          culto_evento?: string | null
          date_transaction?: string
          description?: string
          id?: string
          moeda_estrangeira?: string | null
          observacao?: string | null
          outros_gastos?: number | null
          type?: Database["public"]["Enums"]["tipo_transacao"]
          updated_at?: string
          user_id?: string
          valor_moeda_estrangeira?: number | null
          valor_seguranca?: number | null
          voluntarios?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_cash_session_id_fkey"
            columns: ["cash_session_id"]
            isOneToOne: false
            referencedRelation: "cash_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      volunteer_churches: {
        Row: {
          church_id: string
          created_at: string
          id: string
          volunteer_id: string
        }
        Insert: {
          church_id: string
          created_at?: string
          id?: string
          volunteer_id: string
        }
        Update: {
          church_id?: string
          created_at?: string
          id?: string
          volunteer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "volunteer_churches_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "volunteer_churches_volunteer_id_fkey"
            columns: ["volunteer_id"]
            isOneToOne: false
            referencedRelation: "volunteers"
            referencedColumns: ["id"]
          },
        ]
      }
      volunteer_payments: {
        Row: {
          amount: number
          cash_session_id: string
          created_at: string
          id: string
          paid_at: string | null
          paid_by: string | null
          status: string
          transaction_id: string | null
          updated_at: string
          volunteer_id: string
          volunteer_name: string
        }
        Insert: {
          amount: number
          cash_session_id: string
          created_at?: string
          id?: string
          paid_at?: string | null
          paid_by?: string | null
          status?: string
          transaction_id?: string | null
          updated_at?: string
          volunteer_id: string
          volunteer_name: string
        }
        Update: {
          amount?: number
          cash_session_id?: string
          created_at?: string
          id?: string
          paid_at?: string | null
          paid_by?: string | null
          status?: string
          transaction_id?: string | null
          updated_at?: string
          volunteer_id?: string
          volunteer_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "volunteer_payments_cash_session_id_fkey"
            columns: ["cash_session_id"]
            isOneToOne: false
            referencedRelation: "cash_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "volunteer_payments_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "volunteer_payments_volunteer_id_fkey"
            columns: ["volunteer_id"]
            isOneToOne: false
            referencedRelation: "volunteers"
            referencedColumns: ["id"]
          },
        ]
      }
      volunteers: {
        Row: {
          area_atuacao: string | null
          created_at: string
          id: string
          name: string
          phone: string | null
          pix_key: string | null
          updated_at: string
        }
        Insert: {
          area_atuacao?: string | null
          created_at?: string
          id?: string
          name: string
          phone?: string | null
          pix_key?: string | null
          updated_at?: string
        }
        Update: {
          area_atuacao?: string | null
          created_at?: string
          id?: string
          name?: string
          phone?: string | null
          pix_key?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_validate_session: {
        Args: { session_id: string; user_id: string }
        Returns: boolean
      }
      get_pending_validations_count: {
        Args: { user_church_id: string }
        Returns: number
      }
      is_master: {
        Args: { user_id: string }
        Returns: boolean
      }
      is_supervisor: {
        Args: { user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      categoria_entrada: "dinheiro" | "pix" | "cartao_credito" | "cartao_debito"
      tipo_transacao: "entrada" | "saida"
      user_role: "master" | "tesoureiro" | "supervisor"
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
      categoria_entrada: ["dinheiro", "pix", "cartao_credito", "cartao_debito"],
      tipo_transacao: ["entrada", "saida"],
      user_role: ["master", "tesoureiro", "supervisor"],
    },
  },
} as const
