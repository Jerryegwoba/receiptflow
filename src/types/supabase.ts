export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      receipts: {
        Row: {
          id: string
          user_id: string
          image_url: string
          extracted_data: Json | null
          status: 'pending' | 'processed' | 'failed'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          image_url: string
          extracted_data?: Json | null
          status?: 'pending' | 'processed' | 'failed'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          image_url?: string
          extracted_data?: Json | null
          status?: 'pending' | 'processed' | 'failed'
          created_at?: string
        }
      }
      profiles: {
        Row: {
          user_id: string
          subscription_tier: 'free' | 'pro'
          receipt_count_this_month: number
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          subscription_tier?: 'free' | 'pro'
          receipt_count_this_month?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          subscription_tier?: 'free' | 'pro'
          receipt_count_this_month?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
