import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our database tables
export type UserRole = 'admin' | 'user';

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
  full_name?: string;  // Added field for user's full name
  phone?: string;      // Added field for user's phone number
  address?: string;    // Keeping existing optional fields
  bio?: string;        // Keeping existing optional fields
  updated_at?: string; // Keeping existing optional fields
}

export interface Property {
  id: number;
  title: string;
  description: string;
  location: string;
  price: number;
  image: string; // Keep for backward compatibility
  images?: string[]; // New field for multiple images
  beds: number;
  baths: number;
  sqft: number;
  tag: string;
  maxPaymentPlanMonths?: number;
  rating: number;
  isPopular: boolean;
  isNew: boolean;
  created_at: string;
  user_id: string;
}