import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: "Supabase config missing" }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    // 1. Fetch profiles for juri
    const { data: profiles, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("id, nama_lengkap, assigned_lomba_id, assigned_kategori, assigned_gender, is_verified, lomba(nama_lomba), no_wa")
      .eq("role", "juri")
      .order("nama_lengkap", { ascending: true });

    if (profileError) throw profileError;

    // 2. Fetch auth users to get emails
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (authError) throw authError;

    const usersMap = {};
    authData?.users?.forEach(u => {
      usersMap[u.id] = u.email;
    });

    // 3. Merge email into profiles
    const mergedProfiles = profiles.map(p => ({
      ...p,
      email: usersMap[p.id] || "No Email"
    }));

    return NextResponse.json({ success: true, data: mergedProfiles });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
