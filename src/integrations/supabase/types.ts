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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      accounts: {
        Row: {
          balance: number
          color: string
          created_at: string
          currency: string
          icon: string | null
          id: string
          is_active: boolean
          is_demo: boolean
          is_primary: boolean
          name: string
          notes: string | null
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          color?: string
          created_at?: string
          currency?: string
          icon?: string | null
          id?: string
          is_active?: boolean
          is_demo?: boolean
          is_primary?: boolean
          name: string
          notes?: string | null
          type?: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          balance?: number
          color?: string
          created_at?: string
          currency?: string
          icon?: string | null
          id?: string
          is_active?: boolean
          is_demo?: boolean
          is_primary?: boolean
          name?: string
          notes?: string | null
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      assets: {
        Row: {
          acquisition_date: string | null
          asset_name: string
          asset_type: string
          created_at: string
          current_value: number
          id: string
          is_demo: boolean
          linked_account_id: string | null
          note: string | null
          purchase_value: number
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          acquisition_date?: string | null
          asset_name: string
          asset_type?: string
          created_at?: string
          current_value?: number
          id?: string
          is_demo?: boolean
          linked_account_id?: string | null
          note?: string | null
          purchase_value?: number
          status?: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          acquisition_date?: string | null
          asset_name?: string
          asset_type?: string
          created_at?: string
          current_value?: number
          id?: string
          is_demo?: boolean
          linked_account_id?: string | null
          note?: string | null
          purchase_value?: number
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assets_linked_account_id_fkey"
            columns: ["linked_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      budgets: {
        Row: {
          alert_threshold: number
          allocated_amount: number
          category_id: string
          created_at: string
          id: string
          is_active: boolean
          is_demo: boolean
          note: string | null
          period_type: string
          start_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          alert_threshold?: number
          allocated_amount?: number
          category_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          is_demo?: boolean
          note?: string | null
          period_type?: string
          start_date?: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          alert_threshold?: number
          allocated_amount?: number
          category_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          is_demo?: boolean
          note?: string | null
          period_type?: string
          start_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "budgets_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          color: string
          created_at: string
          description: string | null
          group: string
          icon: string | null
          id: string
          is_active: boolean
          is_demo: boolean
          is_subcategory: boolean
          name: string
          parent_id: string | null
          updated_at: string
          usable_in_budgets: boolean
          usage_count: number
          user_id: string
        }
        Insert: {
          color?: string
          created_at?: string
          description?: string | null
          group?: string
          icon?: string | null
          id?: string
          is_active?: boolean
          is_demo?: boolean
          is_subcategory?: boolean
          name: string
          parent_id?: string | null
          updated_at?: string
          usable_in_budgets?: boolean
          usage_count?: number
          user_id?: string
        }
        Update: {
          color?: string
          created_at?: string
          description?: string | null
          group?: string
          icon?: string | null
          id?: string
          is_active?: boolean
          is_demo?: boolean
          is_subcategory?: boolean
          name?: string
          parent_id?: string | null
          updated_at?: string
          usable_in_budgets?: boolean
          usage_count?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      investments: {
        Row: {
          created_at: string
          current_value: number
          id: string
          invested_amount: number
          investment_name: string
          investment_type: string
          is_demo: boolean
          linked_account_id: string | null
          note: string | null
          start_date: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_value?: number
          id?: string
          invested_amount?: number
          investment_name: string
          investment_type?: string
          is_demo?: boolean
          linked_account_id?: string | null
          note?: string | null
          start_date?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          current_value?: number
          id?: string
          invested_amount?: number
          investment_name?: string
          investment_type?: string
          is_demo?: boolean
          linked_account_id?: string | null
          note?: string | null
          start_date?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "investments_linked_account_id_fkey"
            columns: ["linked_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      loans: {
        Row: {
          created_at: string
          due_date: string | null
          id: string
          installment_amount: number | null
          interest_rate: number | null
          is_demo: boolean
          lender_name: string
          linked_account_id: string | null
          loan_type: string
          note: string | null
          paid_amount: number
          principal_amount: number
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          due_date?: string | null
          id?: string
          installment_amount?: number | null
          interest_rate?: number | null
          is_demo?: boolean
          lender_name: string
          linked_account_id?: string | null
          loan_type?: string
          note?: string | null
          paid_amount?: number
          principal_amount?: number
          status?: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          due_date?: string | null
          id?: string
          installment_amount?: number | null
          interest_rate?: number | null
          is_demo?: boolean
          lender_name?: string
          linked_account_id?: string | null
          loan_type?: string
          note?: string | null
          paid_amount?: number
          principal_amount?: number
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "loans_linked_account_id_fkey"
            columns: ["linked_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      partnership_entries: {
        Row: {
          amount: number
          contributor: string | null
          created_at: string
          date: string
          description: string | null
          entry_type: string
          id: string
          is_demo: boolean
          note: string | null
          partnership_id: string
          user_id: string
        }
        Insert: {
          amount?: number
          contributor?: string | null
          created_at?: string
          date?: string
          description?: string | null
          entry_type?: string
          id?: string
          is_demo?: boolean
          note?: string | null
          partnership_id: string
          user_id?: string
        }
        Update: {
          amount?: number
          contributor?: string | null
          created_at?: string
          date?: string
          description?: string | null
          entry_type?: string
          id?: string
          is_demo?: boolean
          note?: string | null
          partnership_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "partnership_entries_partnership_id_fkey"
            columns: ["partnership_id"]
            isOneToOne: false
            referencedRelation: "partnerships"
            referencedColumns: ["id"]
          },
        ]
      }
      partnerships: {
        Row: {
          created_at: string
          id: string
          is_demo: boolean
          note: string | null
          partner_contribution: number
          partner_name: string
          partnership_name: string
          settlement_amount: number
          shared_expense_total: number
          start_date: string | null
          status: string
          updated_at: string
          user_id: string
          your_contribution: number
        }
        Insert: {
          created_at?: string
          id?: string
          is_demo?: boolean
          note?: string | null
          partner_contribution?: number
          partner_name: string
          partnership_name: string
          settlement_amount?: number
          shared_expense_total?: number
          start_date?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          your_contribution?: number
        }
        Update: {
          created_at?: string
          id?: string
          is_demo?: boolean
          note?: string | null
          partner_contribution?: number
          partner_name?: string
          partnership_name?: string
          settlement_amount?: number
          shared_expense_total?: number
          start_date?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          your_contribution?: number
        }
        Relationships: []
      }
      payable_books: {
        Row: {
          created_at: string
          description: string | null
          email: string | null
          id: string
          is_demo: boolean
          opening_balance: number
          person_name: string
          phone: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          is_demo?: boolean
          opening_balance?: number
          person_name: string
          phone?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          is_demo?: boolean
          opening_balance?: number
          person_name?: string
          phone?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      payable_entries: {
        Row: {
          amount: number
          book_id: string
          category: string | null
          created_at: string
          date: string
          description: string | null
          due_date: string | null
          id: string
          is_demo: boolean
          linked_account_id: string | null
          note: string | null
          paid_amount: number
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          book_id: string
          category?: string | null
          created_at?: string
          date?: string
          description?: string | null
          due_date?: string | null
          id?: string
          is_demo?: boolean
          linked_account_id?: string | null
          note?: string | null
          paid_amount?: number
          status?: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          amount?: number
          book_id?: string
          category?: string | null
          created_at?: string
          date?: string
          description?: string | null
          due_date?: string | null
          id?: string
          is_demo?: boolean
          linked_account_id?: string | null
          note?: string | null
          paid_amount?: number
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payable_entries_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "payable_books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payable_entries_linked_account_id_fkey"
            columns: ["linked_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      payable_payment_history: {
        Row: {
          account_id: string | null
          amount: number
          created_at: string
          date: string
          entry_id: string
          id: string
          note: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          account_id?: string | null
          amount?: number
          created_at?: string
          date?: string
          entry_id: string
          id?: string
          note?: string | null
          updated_at?: string
          user_id?: string
        }
        Update: {
          account_id?: string | null
          amount?: number
          created_at?: string
          date?: string
          entry_id?: string
          id?: string
          note?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payable_payment_history_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payable_payment_history_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "payable_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      payables: {
        Row: {
          created_at: string
          due_date: string | null
          id: string
          is_demo: boolean
          linked_account_id: string | null
          note: string | null
          paid_amount: number
          person_name: string
          reason: string | null
          status: string
          total_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          due_date?: string | null
          id?: string
          is_demo?: boolean
          linked_account_id?: string | null
          note?: string | null
          paid_amount?: number
          person_name: string
          reason?: string | null
          status?: string
          total_amount?: number
          updated_at?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          due_date?: string | null
          id?: string
          is_demo?: boolean
          linked_account_id?: string | null
          note?: string | null
          paid_amount?: number
          person_name?: string
          reason?: string | null
          status?: string
          total_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payables_linked_account_id_fkey"
            columns: ["linked_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          company_name: string | null
          country: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          organization_type: string | null
          phone: string | null
          role_title: string | null
          state_division: string | null
          status: string
          subscription_plan: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          company_name?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          organization_type?: string | null
          phone?: string | null
          role_title?: string | null
          state_division?: string | null
          status?: string
          subscription_plan?: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          company_name?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          organization_type?: string | null
          phone?: string | null
          role_title?: string | null
          state_division?: string | null
          status?: string
          subscription_plan?: string
          updated_at?: string
        }
        Relationships: []
      }
      receivable_books: {
        Row: {
          created_at: string
          description: string | null
          email: string | null
          id: string
          is_demo: boolean
          opening_balance: number
          person_name: string
          phone: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          is_demo?: boolean
          opening_balance?: number
          person_name: string
          phone?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          is_demo?: boolean
          opening_balance?: number
          person_name?: string
          phone?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      receivable_collection_history: {
        Row: {
          account_id: string | null
          amount: number
          created_at: string
          date: string
          entry_id: string
          id: string
          note: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          account_id?: string | null
          amount?: number
          created_at?: string
          date?: string
          entry_id: string
          id?: string
          note?: string | null
          updated_at?: string
          user_id?: string
        }
        Update: {
          account_id?: string | null
          amount?: number
          created_at?: string
          date?: string
          entry_id?: string
          id?: string
          note?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "receivable_collection_history_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receivable_collection_history_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "receivable_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      receivable_entries: {
        Row: {
          amount: number
          book_id: string
          category: string | null
          collected_amount: number
          created_at: string
          date: string
          description: string | null
          due_date: string | null
          id: string
          is_demo: boolean
          linked_account_id: string | null
          note: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          book_id: string
          category?: string | null
          collected_amount?: number
          created_at?: string
          date?: string
          description?: string | null
          due_date?: string | null
          id?: string
          is_demo?: boolean
          linked_account_id?: string | null
          note?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          amount?: number
          book_id?: string
          category?: string | null
          collected_amount?: number
          created_at?: string
          date?: string
          description?: string | null
          due_date?: string | null
          id?: string
          is_demo?: boolean
          linked_account_id?: string | null
          note?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "receivable_entries_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "receivable_books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receivable_entries_linked_account_id_fkey"
            columns: ["linked_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      receivables: {
        Row: {
          created_at: string
          due_date: string | null
          id: string
          is_demo: boolean
          linked_account_id: string | null
          note: string | null
          person_name: string
          reason: string | null
          received_amount: number
          status: string
          total_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          due_date?: string | null
          id?: string
          is_demo?: boolean
          linked_account_id?: string | null
          note?: string | null
          person_name: string
          reason?: string | null
          received_amount?: number
          status?: string
          total_amount?: number
          updated_at?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          due_date?: string | null
          id?: string
          is_demo?: boolean
          linked_account_id?: string | null
          note?: string | null
          person_name?: string
          reason?: string | null
          received_amount?: number
          status?: string
          total_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "receivables_linked_account_id_fkey"
            columns: ["linked_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      reminders: {
        Row: {
          created_at: string
          due_date: string
          id: string
          is_demo: boolean
          note: string | null
          priority: string
          related_entity_id: string | null
          related_module: string | null
          reminder_type: string
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          due_date?: string
          id?: string
          is_demo?: boolean
          note?: string | null
          priority?: string
          related_entity_id?: string | null
          related_module?: string | null
          reminder_type?: string
          status?: string
          title: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          due_date?: string
          id?: string
          is_demo?: boolean
          note?: string | null
          priority?: string
          related_entity_id?: string | null
          related_module?: string | null
          reminder_type?: string
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          account_id: string
          amount: number
          category_id: string | null
          created_at: string
          date: string
          id: string
          is_demo: boolean
          note: string | null
          status: string
          tags: string[] | null
          to_account_id: string | null
          transfer_fee: number | null
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_id: string
          amount?: number
          category_id?: string | null
          created_at?: string
          date?: string
          id?: string
          is_demo?: boolean
          note?: string | null
          status?: string
          tags?: string[] | null
          to_account_id?: string | null
          transfer_fee?: number | null
          type?: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          account_id?: string
          amount?: number
          category_id?: string | null
          created_at?: string
          date?: string
          id?: string
          is_demo?: boolean
          note?: string | null
          status?: string
          tags?: string[] | null
          to_account_id?: string | null
          transfer_fee?: number | null
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_to_account_id_fkey"
            columns: ["to_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
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
      increment_balance: {
        Args: { account_uuid: string; amount_val: number }
        Returns: undefined
      }
      increment_usage: { Args: { cat_uuid: string }; Returns: undefined }
    }
    Enums: {
      app_role: "admin" | "user" | "manager" | "support"
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
      app_role: ["admin", "user", "manager", "support"],
    },
  },
} as const
