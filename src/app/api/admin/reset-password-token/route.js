import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

const TOKEN_FILE_PATH = path.join(process.cwd(), "src", "lib", "adminResetToken.json");

// In-memory fallback in case filesystem is read-only (e.g. serverless)
const memoryTokenState = new Map([
  ["token-admin-cb5c3e114062d5f19c45bd634f8e5fbe", { used: false }]
]);

function getTokens() {
  try {
    if (fs.existsSync(TOKEN_FILE_PATH)) {
      const data = JSON.parse(fs.readFileSync(TOKEN_FILE_PATH, "utf8"));
      return data.activeTokens || [];
    }
  } catch (_) {}
  // Fallback to in-memory
  const tokens = [];
  for (const [token, val] of memoryTokenState.entries()) {
    tokens.push({ token, used: val.used });
  }
  return tokens;
}

function markTokenAsUsed(tokenStr) {
  memoryTokenState.set(tokenStr, { used: true, usedAt: Date.now() });
  try {
    if (fs.existsSync(TOKEN_FILE_PATH)) {
      const data = JSON.parse(fs.readFileSync(TOKEN_FILE_PATH, "utf8"));
      const item = (data.activeTokens || []).find((t) => t.token === tokenStr);
      if (item) {
        item.used = true;
        item.usedAt = Date.now();
        fs.writeFileSync(TOKEN_FILE_PATH, JSON.stringify(data, null, 2), "utf8");
      }
    }
  } catch (_) {}
}

// GET: Cek validitas token saat halaman dimuat
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ valid: false, reason: "Token tidak disertakan." }, { status: 400 });
    }

    const tokens = getTokens();
    const tokenItem = tokens.find((t) => t.token === token);

    if (!tokenItem) {
      return NextResponse.json({ valid: false, reason: "Token tidak valid atau tidak dikenali." }, { status: 404 });
    }

    if (tokenItem.used) {
      return NextResponse.json({
        valid: false,
        reason: "Tautan token ini sudah pernah digunakan (bersifat 1-kali pakai) dan tidak berlaku lagi.",
      }, { status: 410 });
    }

    return NextResponse.json({ valid: true, message: "Token valid dan siap digunakan 1 kali." });
  } catch (err) {
    return NextResponse.json({ valid: false, reason: "Kesalahan server: " + err.message }, { status: 500 });
  }
}

// POST: Eksekusi reset password dengan validasi password saat ini
export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { token, email, currentPassword, newPassword } = body;

    if (!token) {
      return NextResponse.json({ error: "Token tidak disertakan." }, { status: 400 });
    }

    const tokens = getTokens();
    const tokenItem = tokens.find((t) => t.token === token);

    if (!tokenItem) {
      return NextResponse.json({ error: "Token tidak valid atau tidak dikenali." }, { status: 404 });
    }

    if (tokenItem.used) {
      return NextResponse.json({
        error: "Tautan token ini sudah pernah digunakan (bersifat 1-kali pakai) dan telah hangus.",
      }, { status: 410 });
    }

    if (!email || !email.trim()) {
      return NextResponse.json({ error: "Email akun admin wajib diisi." }, { status: 400 });
    }

    if (!currentPassword) {
      return NextResponse.json({ error: "Password saat ini wajib diisi untuk verifikasi keamanan." }, { status: 400 });
    }

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json({ error: "Password baru minimal 6 karakter." }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ error: "Konfigurasi Supabase belum lengkap." }, { status: 500 });
    }

    // 1. Buat instance client untuk memverifikasi password saat ini
    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
    });

    const cleanEmail = email.trim().toLowerCase();
    const { data: signInData, error: signInError } = await authClient.auth.signInWithPassword({
      email: cleanEmail,
      password: currentPassword,
    });

    if (signInError || !signInData?.user) {
      return NextResponse.json({
        error: "Password saat ini salah atau akun admin dengan email tersebut tidak ditemukan.",
      }, { status: 401 });
    }

    // 2. Verifikasi bahwa pengguna adalah Admin
    const { data: profile, error: profileErr } = await authClient
      .from("profiles")
      .select("role")
      .eq("id", signInData.user.id)
      .maybeSingle();

    if (profileErr || !profile || profile.role !== "admin") {
      return NextResponse.json({
        error: "Akses ditolak: Akun yang diverifikasi bukan akun Administrator.",
      }, { status: 403 });
    }

    // 3. Perbarui password ke password baru
    const { error: updateError } = await authClient.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      return NextResponse.json({
        error: "Gagal memperbarui password di Supabase: " + updateError.message,
      }, { status: 500 });
    }

    // 4. HANGUSKAN TOKEN (1-KALI PAKAI)
    markTokenAsUsed(token);

    return NextResponse.json({
      success: true,
      message: "Kata sandi Admin berhasil diubah! Token 1-kali pakai ini sekarang telah hangus secara permanen.",
    });
  } catch (err) {
    return NextResponse.json({ error: "Kesalahan internal server: " + err.message }, { status: 500 });
  }
}
