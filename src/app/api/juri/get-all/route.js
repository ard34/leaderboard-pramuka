import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "@/lib/supabaseServerAdmin";

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    let supabaseAdmin = await getSupabaseAdmin();
    if (!supabaseAdmin && supabaseUrl && supabaseServiceKey) {
      supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
        auth: { persistSession: false },
      });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Supabase config missing" }, { status: 500 });
    }

    // 1. Fetch profiles for juri
    const { data: profiles, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("id, nama_lengkap, assigned_lomba_id, assigned_kategori, assigned_gender, is_verified, lomba(nama_lomba), no_wa")
      .eq("role", "juri")
      .order("nama_lengkap", { ascending: true });

    if (profileError) throw profileError;

    // 2. Fetch auth users to get emails & initial_password safely
    const usersMap = {};
    try {
      const { data: authData } = await supabaseAdmin.auth.admin.listUsers();
      authData?.users?.forEach((u) => {
        usersMap[u.id] = {
          email: u.email,
          password: u.user_metadata?.initial_password || u.user_metadata?.password || null,
        };
      });
    } catch (_) {}

    // 3. Merge email & initial_password into profiles
    const mergedProfiles = profiles.map((p) => ({
      ...p,
      email: usersMap[p.id]?.email || "No Email",
      initial_password: usersMap[p.id]?.password || null,
    }));

    return NextResponse.json({ success: true, data: mergedProfiles });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
