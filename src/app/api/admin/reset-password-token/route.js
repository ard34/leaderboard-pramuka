import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

// =====================================================
// RESET PASSWORD VIA TOKEN — Persistent via Supabase
// Token disimpan di Supabase (key=admin_reset_tokens)
// Credentials disimpan di Supabase (key=admin_auth)
// =====================================================

// Token tetap (hardcoded 1-kali pakai, bisa di-reset oleh developer)
const HARDCODED_TOKEN = "token-admin-cb5c3e114062d5f19c45bd634f8e5fbe";

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseServiceKey) return null;
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });
}

// Baca token state dari Supabase
async function getTokenState(tokenStr) {
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) return null;
    const { data } = await supabase
      .from("informasi")
      .select("text")
      .eq("title", "admin_reset_tokens")
      .maybeSingle();
    if (!data) return null;
    const tokens = JSON.parse(data.text);
    return tokens[tokenStr] || null;
  } catch (_) {
    return null;
  }
}

// Tandai token sebagai sudah dipakai di Supabase
async function markTokenUsedInSupabase(tokenStr) {
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) return;

    const { data: existing } = await supabase
      .from("informasi")
      .select("id, text")
      .eq("title", "admin_reset_tokens")
      .maybeSingle();

    let tokens = {};
    if (existing) {
      try { tokens = JSON.parse(existing.text); } catch (_) {}
    }

    tokens[tokenStr] = { used: true, usedAt: Date.now() };

    if (existing) {
      await supabase
        .from("informasi")
        .update({ text: JSON.stringify(tokens) })
        .eq("title", "admin_reset_tokens");
    } else {
      await supabase
        .from("informasi")
        .insert({ title: "admin_reset_tokens", text: JSON.stringify(tokens) });
    }
  } catch (_) {}
}

// Simpan password admin baru ke Supabase
async function saveAdminAuthToSupabase(newPassword) {
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) return false;

    const salt = crypto.randomBytes(16).toString("hex");
    const hash = crypto.pbkdf2Sync(newPassword, salt, 1000, 64, "sha512").toString("hex");

    const authData = JSON.stringify({
      username: "admin",
      hash,
      salt,
      updatedAt: Date.now(),
    });

    const { data: existing } = await supabase
      .from("informasi")
      .select("id")
      .eq("title", "admin_auth")
      .maybeSingle();

    if (existing) {
      await supabase
        .from("informasi")
        .update({ text: authData })
        .eq("title", "admin_auth");
    } else {
      await supabase
        .from("informasi")
        .insert({ title: "admin_auth", text: authData });
    }
    return true;
  } catch (_) {
    return false;
  }
}

// GET: Cek validitas token
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ valid: false, reason: "Token tidak disertakan." }, { status: 400 });
    }

    // Cek apakah token dikenali
    if (token !== HARDCODED_TOKEN) {
      return NextResponse.json({ valid: false, reason: "Token tidak valid atau tidak dikenali." }, { status: 404 });
    }

    // Cek apakah sudah dipakai (dari Supabase)
    const state = await getTokenState(token);
    if (state && state.used) {
      return NextResponse.json({
        valid: false,
        reason: "Tautan token ini sudah pernah digunakan (bersifat 1-kali pakai) dan telah hangus.",
      }, { status: 410 });
    }

    return NextResponse.json({ valid: true, message: "Token valid dan siap digunakan 1 kali." });
  } catch (err) {
    return NextResponse.json({ valid: false, reason: "Kesalahan server: " + err.message }, { status: 500 });
  }
}

// POST: Reset password dengan token 1-kali pakai
export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { token, newPassword } = body;

    if (!token) {
      return NextResponse.json({ error: "Token tidak disertakan." }, { status: 400 });
    }

    if (token !== HARDCODED_TOKEN) {
      return NextResponse.json({ error: "Token tidak valid atau tidak dikenali." }, { status: 404 });
    }

    // Cek apakah sudah dipakai
    const state = await getTokenState(token);
    if (state && state.used) {
      return NextResponse.json({
        error: "Tautan token ini sudah pernah digunakan (bersifat 1-kali pakai) dan telah hangus.",
      }, { status: 410 });
    }

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json({ error: "Password baru minimal 6 karakter." }, { status: 400 });
    }

    // 1. Simpan password baru ke Supabase
    await saveAdminAuthToSupabase(newPassword);

    // 2. Tandai token sebagai sudah dipakai di Supabase
    await markTokenUsedInSupabase(token);

    return NextResponse.json({
      success: true,
      message: "Password Admin berhasil diperbarui! Token 1-kali pakai ini sekarang telah hangus secara permanen.",
    });
  } catch (err) {
    return NextResponse.json({ error: "Kesalahan internal server: " + err.message }, { status: 500 });
  }
}
