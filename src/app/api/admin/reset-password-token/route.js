import { NextResponse } from "next/server";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { getSupabaseAdmin } from "@/lib/supabaseServerAdmin";

// =====================================================
// RESET PASSWORD TOKEN ADMIN — Robust & Persistent
// Mendukung pembuatan token baru seketika (1-kali pakai)
// =====================================================

const TOKEN_SECRET = process.env.ADMIN_TOKEN_SECRET || "SILOTI_LT2_KWARRAN_MEKAR_BARU_2026_SECRET";
const LEGACY_TOKENS = [
  "token-admin-ac8f5980a2ee4509c86e7562cbf43803",
  "token-admin-cb5c3e114062d5f19c45bd634f8e5fbe",
];

// File paths untuk persistensi lokal dan Vercel /tmp
const LOCAL_AUTH_FILE = path.join(process.cwd(), "src", "lib", "adminAuth.json");
const TMP_AUTH_FILE = path.join("/tmp", "adminAuth.json");
const TMP_USED_TOKENS_FILE = path.join("/tmp", "used_tokens.json");

// In-memory set untuk used tokens
const memoryUsedTokens = new Set();

function getUsedTokens() {
  try {
    if (fs.existsSync(TMP_USED_TOKENS_FILE)) {
      const data = JSON.parse(fs.readFileSync(TMP_USED_TOKENS_FILE, "utf8"));
      if (Array.isArray(data)) {
        data.forEach((t) => memoryUsedTokens.add(t));
      }
    }
  } catch (_) {}
  return memoryUsedTokens;
}

function markTokenAsUsed(tokenStr) {
  memoryUsedTokens.add(tokenStr);
  try {
    const list = Array.from(memoryUsedTokens);
    fs.writeFileSync(TMP_USED_TOKENS_FILE, JSON.stringify(list), "utf8");
  } catch (_) {}
}

export function generateNewAdminToken() {
  const ts = Date.now();
  const rand = crypto.randomBytes(8).toString("hex");
  const payload = `${ts}:${rand}`;
  const sig = crypto.createHmac("sha256", TOKEN_SECRET).update(payload).digest("hex").slice(0, 16);
  return `token-admin-${ts}-${rand}-${sig}`;
}

export function checkTokenValidity(tokenStr) {
  if (!tokenStr || typeof tokenStr !== "string") {
    return { valid: false, reason: "Token tidak disertakan." };
  }

  const cleanToken = tokenStr.trim();
  const usedTokens = getUsedTokens();

  if (usedTokens.has(cleanToken)) {
    return {
      valid: false,
      reason: "Tautan token ini sudah pernah digunakan (bersifat 1-kali pakai) dan telah hangus.",
    };
  }

  // 1. Cek legacy hardcoded tokens
  if (LEGACY_TOKENS.includes(cleanToken)) {
    return { valid: true };
  }

  // 2. Cek HMAC signed token
  if (cleanToken.startsWith("token-admin-")) {
    const rest = cleanToken.slice("token-admin-".length);
    const parts = rest.split("-");
    if (parts.length === 3) {
      const [tsStr, rand, sig] = parts;
      const ts = parseInt(tsStr, 10);
      if (isNaN(ts) || Date.now() - ts > 48 * 60 * 60 * 1000) {
        return { valid: false, reason: "Token telah kedaluwarsa (berlaku 48 jam)." };
      }
      const expected = crypto
        .createHmac("sha256", TOKEN_SECRET)
        .update(`${tsStr}:${rand}`)
        .digest("hex")
        .slice(0, 16);

      if (sig === expected) {
        return { valid: true };
      }
    }
  }

  return { valid: false, reason: "Token tidak valid atau tidak dikenali." };
}

async function saveAdminPasswordToStorage(newPassword) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(newPassword, salt, 1000, 64, "sha512").toString("hex");

  const authData = {
    username: "admin",
    hash,
    salt,
    updatedAt: Date.now(),
  };

  // 1. Simpan ke local file jika writable
  try {
    fs.writeFileSync(LOCAL_AUTH_FILE, JSON.stringify(authData, null, 2), "utf8");
  } catch (_) {}

  // 2. Simpan ke /tmp
  try {
    fs.writeFileSync(TMP_AUTH_FILE, JSON.stringify(authData, null, 2), "utf8");
  } catch (_) {}

  // 3. Simpan / perbarui ke Supabase Auth
  try {
    const supabase = await getSupabaseAdmin();
    if (supabase) {
      await supabase.auth.updateUser({ password: newPassword }).catch(() => {});
    }
  } catch (_) {}

  return authData;
}

// GET: Cek validitas token ATAU buat token baru jika ?action=generate
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const token = searchParams.get("token");

    // Pembuatan token baru langsung
    if (action === "generate") {
      const newToken = generateNewAdminToken();
      const baseUrl =
        process.env.NEXT_PUBLIC_BASE_URL ||
        request.headers.get("origin") ||
        "https://www.siloti-kwaranmekarbaru.my.id";
      const resetUrl = `${baseUrl}/reset-password-admin?token=${newToken}`;

      return NextResponse.json({
        success: true,
        token: newToken,
        resetUrl,
        message: "Token reset password baru berhasil dibuat.",
      });
    }

    if (!token) {
      return NextResponse.json({ valid: false, reason: "Token tidak disertakan." }, { status: 400 });
    }

    const check = checkTokenValidity(token);
    if (!check.valid) {
      return NextResponse.json({ valid: false, reason: check.reason }, { status: 410 });
    }

    return NextResponse.json({
      valid: true,
      message: "Token valid dan siap digunakan 1 kali.",
    });
  } catch (err) {
    return NextResponse.json(
      { valid: false, reason: "Kesalahan server: " + err.message },
      { status: 500 }
    );
  }
}

// POST: Reset password dengan token 1-kali pakai ATAU buat token baru { action: 'generate' }
export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { token, newPassword, action } = body;

    // Aksi pembuatan token baru
    if (action === "generate") {
      const newToken = generateNewAdminToken();
      const baseUrl =
        process.env.NEXT_PUBLIC_BASE_URL ||
        request.headers.get("origin") ||
        "https://www.siloti-kwaranmekarbaru.my.id";
      const resetUrl = `${baseUrl}/reset-password-admin?token=${newToken}`;

      return NextResponse.json({
        success: true,
        token: newToken,
        resetUrl,
        message: "Token reset password baru berhasil dibuat.",
      });
    }

    if (!token) {
      return NextResponse.json({ error: "Token tidak disertakan." }, { status: 400 });
    }

    const check = checkTokenValidity(token);
    if (!check.valid) {
      return NextResponse.json({ error: check.reason }, { status: 410 });
    }

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json({ error: "Password baru minimal 6 karakter." }, { status: 400 });
    }

    // 1. Simpan password baru
    await saveAdminPasswordToStorage(newPassword);

    // 2. Tandai token sebagai sudah dipakai (1-KALI PAKAI)
    markTokenAsUsed(token);

    return NextResponse.json({
      success: true,
      message: "Password Admin berhasil diperbarui! Token ini sekarang telah hangus secara permanen.",
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Kesalahan internal server: " + err.message },
      { status: 500 }
    );
  }
}
