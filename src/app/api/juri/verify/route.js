import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, password } = body;

    if (!userId || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: "Konfigurasi Supabase Server belum lengkap." },
        { status: 500 }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    // 1. Update auth user password
    const { error: updateAuthError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: password
    });

    if (updateAuthError) {
      return NextResponse.json({ error: "Gagal update password auth: " + updateAuthError.message }, { status: 400 });
    }

    // 2. Update profiles table to set is_verified = true
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({ is_verified: true })
      .eq("id", userId);

    if (profileError) {
      return NextResponse.json({ error: "Gagal update status verifikasi: " + profileError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: "Terjadi kesalahan server: " + err.message },
      { status: 500 }
    );
  }
}
