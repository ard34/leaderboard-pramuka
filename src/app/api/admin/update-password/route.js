import { NextResponse } from "next/server";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { getSupabaseAdmin } from "@/lib/supabaseServerAdmin";
import { verifyAdminRequest } from "@/lib/adminAuthHelper";
import { createClient } from "@supabase/supabase-js";

const LOCAL_AUTH_FILE = path.join(process.cwd(), "src", "lib", "adminAuth.json");
const TMP_AUTH_FILE = path.join("/tmp", "adminAuth.json");

function getStoredAdminAuth() {
  try {
    if (fs.existsSync(TMP_AUTH_FILE)) {
      return JSON.parse(fs.readFileSync(TMP_AUTH_FILE, "utf8"));
    }
  } catch (_) {}

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
    const { newPassword, currentPassword, token } = body;

    if (!newPassword || typeof newPassword !== "string" || newPassword.length < 6) {
      return NextResponse.json(
        { error: "Kata sandi baru wajib diisi minimal 6 karakter." },
        { status: 400 }
      );
    }

    // 1. Verifikasi Otorisasi Admin:
    // Opsi A: Sesi admin sah terverifikasi via HMAC token / Cookie / Header
    const adminSession = verifyAdminRequest(request, token);

    // Opsi B: Verifikasi lewat kata sandi lama (currentPassword)
    let isAuthorized = Boolean(adminSession && adminSession.role === "admin");

    if (!isAuthorized && currentPassword) {
      // Periksa kata sandi lama terhadap hash tersimpan
      const stored = getStoredAdminAuth();
      if (stored && stored.hash && stored.salt) {
        const calculatedHash = crypto
          .pbkdf2Sync(currentPassword, stored.salt, 1000, 64, "sha512")
          .toString("hex");
        if (
          calculatedHash.length === stored.hash.length &&
          crypto.timingSafeEqual(Buffer.from(calculatedHash), Buffer.from(stored.hash))
        ) {
          isAuthorized = true;
        }
      }

      // Periksa via Supabase Auth jika belum cocok
      if (!isAuthorized) {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        if (supabaseUrl && supabaseAnonKey) {
          try {
            const client = createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false } });
            const { data, error } = await client.auth.signInWithPassword({
              email: "admin@gmail.com",
              password: currentPassword,
            });
            if (!error && data?.user) {
              isAuthorized = true;
            }
          } catch (_) {}
        }
      }

      if (!isAuthorized && process.env.ADMIN_PASSWORD && currentPassword === process.env.ADMIN_PASSWORD) {
        isAuthorized = true;
      }
    }

    // Jika tidak memiliki sesi admin sah dan tidak memasukkan sandi lama yang benar -> TOLAK AKSES
    if (!isAuthorized) {
      return NextResponse.json(
        { error: "Akses ditolak. Anda wajib login sebagai Admin atau menyertakan kata sandi lama yang sah untuk mengganti sandi." },
        { status: 401 }
      );
    }

    // 2. Buat hash baru dengan PBKDF2-HMAC-SHA512
    const salt = crypto.randomBytes(16).toString("hex");
    const hash = crypto.pbkdf2Sync(newPassword, salt, 1000, 64, "sha512").toString("hex");
    const authData = {
      username: "admin",
      hash,
      salt,
      updatedAt: Date.now(),
    };

    // Simpan ke file lokal & /tmp
    try {
      fs.writeFileSync(LOCAL_AUTH_FILE, JSON.stringify(authData, null, 2), "utf8");
    } catch (_) {}

    try {
      fs.writeFileSync(TMP_AUTH_FILE, JSON.stringify(authData, null, 2), "utf8");
    } catch (_) {}

    // Sinkronkan ke Supabase Auth jika ada admin client
    try {
      const supabaseAdmin = await getSupabaseAdmin();
      if (supabaseAdmin) {
        // Cari user admin di Supabase Auth dan update passwordnya
        const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
        const adminUser = usersData?.users?.find(
          (u) => u.email === "admin@gmail.com" || u.email?.includes("admin")
        );
        if (adminUser) {
          await supabaseAdmin.auth.admin.updateUserById(adminUser.id, {
            password: newPassword,
          });
        }
      }
    } catch (_) {}

    return NextResponse.json({
      success: true,
      message: "Kata sandi Admin berhasil diperbarui dengan aman!",
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Gagal memperbarui kata sandi: " + err.message },
      { status: 500 }
    );
  }
}
