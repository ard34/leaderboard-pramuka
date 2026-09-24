import { NextResponse } from "next/server";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import {
  signAdminToken,
  verifyAdminRequest,
  checkAdminLoginRateLimit,
  recordAdminLoginFailure,
  resetAdminLoginRateLimit,
} from "@/lib/adminAuthHelper";

const LOCAL_AUTH_FILE = path.join(process.cwd(), "src", "lib", "adminAuth.json");
const TMP_AUTH_FILE = path.join("/tmp", "adminAuth.json");

function getStoredAdminAuth() {
  // Selalu prioritaskan local auth file yang menyimpan hash resmi terkini
  try {
    if (fs.existsSync(LOCAL_AUTH_FILE)) {
      return JSON.parse(fs.readFileSync(LOCAL_AUTH_FILE, "utf8"));
    }
  } catch (_) {}

  // Fallback ke /tmp
  try {
    if (fs.existsSync(TMP_AUTH_FILE)) {
      return JSON.parse(fs.readFileSync(TMP_AUTH_FILE, "utf8"));
    }
  } catch (_) {}

  return null;
}

/**
 * Endpoint GET: Verifikasi keabsahan token sesi admin secara kriptografis
 */
export async function GET(request) {
  const verified = verifyAdminRequest(request);
  if (!verified) {
    return NextResponse.json(
      { valid: false, error: "Sesi admin tidak valid atau telah kedaluwarsa." },
      { status: 401 }
    );
  }
  return NextResponse.json({ valid: true, user: verified });
}

export async function POST(request) {
  try {
    // 0. Ekstrak IP klien untuk Server-side Rate Limiting
    const forwardedFor = request.headers.get("x-forwarded-for");
    const clientIp = forwardedFor ? forwardedFor.split(",")[0].trim() : (request.headers.get("x-real-ip") || "127.0.0.1");

    // Periksa batas percobaan gagal (Anti Brute-Force)
    const rateCheck = checkAdminLoginRateLimit(clientIp);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, error: rateCheck.error, remainingSeconds: rateCheck.remainingSeconds },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { usernameOrEmail, password } = body;

    if (!usernameOrEmail || !password) {
      return NextResponse.json(
        { success: false, error: "Username/Email dan kata sandi wajib diisi." },
        { status: 400 }
      );
    }

    // BLOKIR KERAS: Kata sandi admin123 dan Pramuka2026! telah dihapus permanen
    if (password === "admin123" || password === "Pramuka2026!") {
      recordAdminLoginFailure(clientIp);
      return NextResponse.json(
        { success: false, error: "Kata sandi salah. Kata sandi lama (admin123 / Pramuka2026!) telah dihapus permanen. Gunakan kata sandi acak resmi Admin." },
        { status: 401 }
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
      recordAdminLoginFailure(clientIp);
      return NextResponse.json(
        { success: false, error: "Bukan akun admin." },
        { status: 403 }
      );
    }

    let isValid = false;

    // 1. Cek PBKDF2 hash dari auth storage (Kriptografi Aman nE!34niYJ4vr_Y5)
    const stored = getStoredAdminAuth();
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

    // 2. Cek langsung via Supabase Auth resmi (admin@gmail.com)
    if (!isValid) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (supabaseUrl && supabaseAnonKey) {
        try {
          const client = createClient(supabaseUrl, supabaseAnonKey, {
            auth: { persistSession: false },
          });
          const { data, error } = await client.auth.signInWithPassword({
            email: "admin@gmail.com",
            password: password,
          });
          if (!error && data?.user) {
            isValid = true;
          }
        } catch (_) {}
      }
    }

    // 3. Cek kata sandi acak resmi Admin
    if (!isValid && (password === "nE!34niYJ4vr_Y5" || (process.env.ADMIN_PASSWORD && password === process.env.ADMIN_PASSWORD))) {
      isValid = true;
    }

    // Jika kata sandi salah: Catat kegagalan & tolak akses
    if (!isValid) {
      recordAdminLoginFailure(clientIp);
      return NextResponse.json(
        { success: false, error: "Kata sandi Admin salah. Silakan gunakan tautan reset password jika lupa sandi." },
        { status: 401 }
      );
    }

    // Berhasil Login: Reset hitungan gagal
    resetAdminLoginRateLimit(clientIp);

    const adminUser = {
      id: "0f1d4b5c-739c-47dd-adca-4b2123b59ec1",
      nama_lengkap: "Admin Utama",
      role: "admin",
      email: cleanInput.includes("@") ? cleanInput : "admin@kwarranmekarbaru.my.id",
    };

    // Buat signed cryptographic token dengan HMAC-SHA256
    const sessionToken = signAdminToken(adminUser);

    const response = NextResponse.json({
      success: true,
      message: "Login Admin berhasil!",
      user: adminUser,
      token: sessionToken,
    });

    // Simpan ke cookie dengan proteksi httpOnly & SameSite
    response.cookies.set("admin_session", sessionToken, {
      httpOnly: true,
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
