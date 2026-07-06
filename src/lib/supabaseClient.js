import { createClient } from '@supabase/supabase-js';

// Mengambil kunci rahasia dari file .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Mengecek apakah kunci rahasia sudah terisi agar tidak terjadi error senyap
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase URL atau Anon Key belum diset di file .env.local!");
}

// Membuka jalur komunikasi (client) ke database
export const supabase = createClient(supabaseUrl, supabaseAnonKey);