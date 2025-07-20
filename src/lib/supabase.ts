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
  full_name: string | null;
  phone: string | null;
  address: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

export interface Property {
  id: number;
  title: string;
  description: string;
  location: string;
  price: number;
  image: string;
  beds: number;
  baths: number;
  sqft: number;
  type: string;
  tag: string;
  rating: number;
  isPopular: boolean;
  isNew: boolean;
  created_at: string;
  updated_at: string;
  user_id: string;
}