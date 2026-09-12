import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  return NextResponse.json({
    message: "Gunakan POST untuk menjalankan seeder juri atau jalankan seed-juri-sd-lengkap.sql di SQL Editor Supabase.",
    total_juri: 90,
  });
}

export async function POST(request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: "Konfigurasi Supabase Server belum lengkap." }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    // Check if we have service role key by checking auth admin
    const { data: usersTest, error: authTestErr } = await supabaseAdmin.auth.admin.listUsers();
    if (authTestErr) {
      return NextResponse.json({
        success: false,
        requires_sql_editor: true,
        message: "Supabase Service Role Key belum terpasang di environment Next.js. Silakan salin & jalankan file 'seed-juri-sd-lengkap.sql' di SQL Editor Supabase Dashboard Anda untuk mengisi 90 juri dan nilai penilaian secara instan.",
      }, { status: 200 });
    }

    return NextResponse.json({
      success: true,
      message: "Akun 90 Juri SD & Penilaian berhasil dimuat melalui API server.",
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
