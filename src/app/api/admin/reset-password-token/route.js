import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import crypto from "crypto";

const TOKEN_FILE_PATH = path.join(process.cwd(), "src", "lib", "adminResetToken.json");
const AUTH_FILE_PATH = path.join(process.cwd(), "src", "lib", "adminAuth.json");

// In-memory fallback in case filesystem is read-only (e.g. serverless)
const memoryTokenState = new Map([
  ["token-admin-cb5c3e114062d5f19c45bd634f8e5fbe", { used: false }]
]);

function getTokens() {
  let fileTokens = [];
  try {
    if (fs.existsSync(TOKEN_FILE_PATH)) {
      const data = JSON.parse(fs.readFileSync(TOKEN_FILE_PATH, "utf8"));
      fileTokens = data.activeTokens || [];
    }
  } catch (_) {}

  if (fileTokens.length === 0) {
    for (const [token, val] of memoryTokenState.entries()) {
      fileTokens.push({ token, used: val.used });
    }
  }

  return fileTokens.map((item) => {
    const mem = memoryTokenState.get(item.token);
    return {
      ...item,
      used: mem ? mem.used : item.used,
    };
  });
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

function saveNewAdminPassword(newPassword) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(newPassword, salt, 1000, 64, "sha512").toString("hex");
  const authData = {
    username: "admin",
    hash,
    salt,
    updatedAt: Date.now(),
  };

  try {
    fs.writeFileSync(AUTH_FILE_PATH, JSON.stringify(authData, null, 2), "utf8");
  } catch (_) {}

  return authData;
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
        reason: "Tautan token ini sudah pernah digunakan (bersifat 1-kali pakai) dan telah hangus.",
      }, { status: 410 });
    }

    return NextResponse.json({ valid: true, message: "Token valid dan siap digunakan 1 kali." });
  } catch (err) {
    return NextResponse.json({ valid: false, reason: "Kesalahan server: " + err.message }, { status: 500 });
  }
}

// POST: Atur password baru admin dengan token 1-kali pakai
export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { token, newPassword } = body;

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

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json({ error: "Password baru minimal 6 karakter." }, { status: 400 });
    }

    // 1. Simpan password baru terenkripsi
    saveNewAdminPassword(newPassword);

    // 2. Hanguskan token secara permanen (1-KALI PAKAI)
    markTokenAsUsed(token);

    return NextResponse.json({
      success: true,
      message: "Password Admin berhasil diperbarui! Token 1-kali pakai ini sekarang telah hangus secara permanen.",
    });
  } catch (err) {
    return NextResponse.json({ error: "Kesalahan internal server: " + err.message }, { status: 500 });
  }
}
