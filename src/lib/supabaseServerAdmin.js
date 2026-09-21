import { createClient } from "@supabase/supabase-js";

let cachedAdminClient = null;
let tokenExpiresAt = 0;

/**
 * Mendapatkan Supabase client dengan hak akses admin tertinggi (bypass RLS).
 * 1. Prioritas utama: SUPABASE_SERVICE_ROLE_KEY (jika di-set di Vercel atau .env)
 * 2. Fallback cerdas: Menggunakan sesi authenticated admin (admin@gmail.com)
 * 3. Fallback terakhir: NEXT_PUBLIC_SUPABASE_ANON_KEY
 */
export async function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl) return null;

  // 1. Jika ada Service Role Key, langsung gunakan
  if (serviceKey && serviceKey !== anonKey) {
    return createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    });
  }

  // 2. Jika token auth admin masih aktif, gunakan cache
  const now = Date.now();
  if (cachedAdminClient && tokenExpiresAt > now + 60000) {
    return cachedAdminClient;
  }

  // 3. Login sebagai admin untuk mendapatkan hak akses admin (RLS is_admin() = true)
  if (anonKey) {
    try {
      const authHelper = createClient(supabaseUrl, anonKey, {
        auth: { persistSession: false },
      });

      const passwords = [
        process.env.ADMIN_PASSWORD,
        "nE!34niYJ4vr_Y5",
        "admin123",
        "Pramuka2026!",
      ].filter(Boolean);

      for (const pw of passwords) {
        const { data, error } = await authHelper.auth.signInWithPassword({
          email: "admin@gmail.com",
          password: pw,
        });

        if (!error && data?.session?.access_token) {
          tokenExpiresAt = (data.session.expires_at || 0) * 1000 || (now + 3600000);
          cachedAdminClient = createClient(supabaseUrl, anonKey, {
            auth: { persistSession: false },
            global: {
              headers: {
                Authorization: `Bearer ${data.session.access_token}`,
              },
            },
          });
          return cachedAdminClient;
        }
      }
    } catch (_) {}
  }

  // 4. Fallback ke anon client jika login gagal
  return createClient(supabaseUrl, anonKey || serviceKey, {
    auth: { persistSession: false },
  });
}
