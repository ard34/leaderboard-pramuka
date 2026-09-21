import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

// =====================================================
// UPDATE PASSWORD — Persistent via Supabase
// Simpan hash + salt ke tabel informasi (key=admin_auth)
// =====================================================

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseServiceKey) return null;
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });
}

async function saveAdminAuthToSupabase(hash, salt) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return false;

  const authData = JSON.stringify({
    username: "admin",
    hash,
    salt,
    updatedAt: Date.now(),
  });

  // Cek apakah sudah ada row dengan title=admin_auth
  const { data: existing } = await supabase
    .from("informasi")
    .select("id")
    .eq("title", "admin_auth")
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("informasi")
      .update({ text: authData, updated_at: new Date().toISOString() })
      .eq("title", "admin_auth");
    return !error;
  } else {
    const { error } = await supabase
      .from("informasi")
      .insert({ title: "admin_auth", text: authData });
    return !error;
  }
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { newPassword } = body;

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password minimal 6 karakter." },
        { status: 400 }
      );
    }

    const salt = crypto.randomBytes(16).toString("hex");
    const hash = crypto.pbkdf2Sync(newPassword, salt, 1000, 64, "sha512").toString("hex");

    const saved = await saveAdminAuthToSupabase(hash, salt);

    return NextResponse.json({
      success: true,
      message: saved
        ? "Password Admin berhasil diperbarui dan tersimpan permanen!"
        : "Password diproses namun gagal disimpan ke database. Hubungi developer.",
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: "Kesalahan server: " + err.message },
      { status: 500 }
    );
  }
}
