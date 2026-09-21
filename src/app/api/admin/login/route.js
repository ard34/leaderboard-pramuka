import { NextResponse } from "next/server";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

const LOCAL_AUTH_FILE = path.join(process.cwd(), "src", "lib", "adminAuth.json");
const TMP_AUTH_FILE = path.join("/tmp", "adminAuth.json");

function getStoredAdminAuth() {
  // Cek /tmp dulu (paling mutakhir saat runtime di cloud)
  try {
    if (fs.existsSync(TMP_AUTH_FILE)) {
      return JSON.parse(fs.readFileSync(TMP_AUTH_FILE, "utf8"));
    }
  } catch (_) {}

  // Cek file lokal yang di-commit
  try {
    if (fs.existsSync(LOCAL_AUTH_FILE)) {
      return JSON.parse(fs.readFileSync(LOCAL_AUTH_FILE, "utf8"));
    }
  } catch (_) {}

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

    let isValid = false;

    // 1. Cek PBKDF2 hash dari auth storage
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

    // 2. Cek langsung via Supabase Auth jika belum cocok
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

    // 3. Fallback passwords yang sah
    if (!isValid && (password === "nE!34niYJ4vr_Y5" || password === "admin123" || password === "Pramuka2026!")) {
      isValid = true;
    }

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "Kata sandi Admin salah. Silakan gunakan tautan reset password." },
        { status: 401 }
      );
    }

    const adminUser = {
      id: "0f1d4b5c-739c-47dd-adca-4b2123b59ec1",
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
