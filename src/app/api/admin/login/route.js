import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

// =====================================================
// ADMIN LOGIN — Persistent via Supabase (key-value)
// Vercel filesystem is read-only; credentials stored
// in Supabase table `informasi` with key=admin_auth
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

// Baca hash admin dari Supabase (tabel informasi, key=admin_auth)
async function getAdminAuthFromSupabase() {
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) return null;
    const { data, error } = await supabase
      .from("informasi")
      .select("text")
      .eq("title", "admin_auth")
      .maybeSingle();
    if (error || !data) return null;
    return JSON.parse(data.text);
  } catch (_) {
    return null;
  }
}

// Fallback: baca dari env var jika tersedia
function getAdminAuthFromEnv() {
  const hash = process.env.ADMIN_HASH;
  const salt = process.env.ADMIN_SALT;
  if (hash && salt) return { hash, salt };
  return null;
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { usernameOrEmail, password } = body;

    if (!usernameOrEmail || !password) {
      return NextResponse.json(
        { success: false, error: "Username/Email dan kata sandi wajib diisi." },
        { status: 400 }
      );
    }

    const cleanInput = usernameOrEmail.trim().toLowerCase();
    const isAdminUser =
      cleanInput === "admin" ||
      cleanInput === "admin utama" ||
      cleanInput.startsWith("admin@") ||
      cleanInput.endsWith("@admin") ||
      cleanInput.includes("admin");

    if (!isAdminUser) {
      return NextResponse.json(
        { success: false, error: "Bukan akun admin." },
        { status: 403 }
      );
    }

    // 1. Coba dari Supabase dulu (persistent)
    let stored = await getAdminAuthFromSupabase();
    // 2. Fallback ke env var
    if (!stored) stored = getAdminAuthFromEnv();

    let isValid = false;

    if (stored && stored.hash && stored.salt) {
      const calculatedHash = crypto
        .pbkdf2Sync(password, stored.salt, 1000, 64, "sha512")
        .toString("hex");
      if (
        calculatedHash.length === stored.hash.length &&
        crypto.timingSafeEqual(Buffer.from(calculatedHash), Buffer.from(stored.hash))
      ) {
        isValid = true;
      }
    }

    // Fallback default passwords (hanya jika belum pernah diset)
    if (!isValid && !stored && (password === "admin123" || password === "Pramuka2026!")) {
      isValid = true;
    }

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "Kata sandi Admin salah. Silakan coba lagi atau gunakan tautan reset password." },
        { status: 401 }
      );
    }

    const adminUser = {
      id: "da882421-cecc-48ea-a032-8b6db1bf9697",
      nama_lengkap: "Admin Utama",
      role: "admin",
      email: cleanInput.includes("@") ? cleanInput : "admin@kwarranmekarbaru.my.id",
    };

    const sessionPayload = {
      user: adminUser,
      loggedAt: Date.now(),
      exp: Date.now() + 24 * 60 * 60 * 1000,
    };

    const sessionToken = Buffer.from(JSON.stringify(sessionPayload)).toString("base64");

    const response = NextResponse.json({
      success: true,
      message: "Login Admin berhasil!",
      user: adminUser,
      token: sessionToken,
    });

    response.cookies.set("admin_session", sessionToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 24 * 60 * 60,
      sameSite: "lax",
    });

    return response;
  } catch (err) {
    return NextResponse.json(
      { success: false, error: "Kesalahan server: " + err.message },
      { status: 500 }
    );
  }
}
