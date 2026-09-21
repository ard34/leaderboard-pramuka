import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import crypto from "crypto";

const AUTH_FILE_PATH = path.join(process.cwd(), "src", "lib", "adminAuth.json");

function getStoredAdminAuth() {
  try {
    if (fs.existsSync(AUTH_FILE_PATH)) {
      return JSON.parse(fs.readFileSync(AUTH_FILE_PATH, "utf8"));
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

    const stored = getStoredAdminAuth();
    let isValid = false;

    if (stored && stored.hash && stored.salt) {
      const calculatedHash = crypto
        .pbkdf2Sync(password, stored.salt, 1000, 64, "sha512")
        .toString("hex");
      
      // Timing safe comparison to prevent timing attacks
      if (
        calculatedHash.length === stored.hash.length &&
        crypto.timingSafeEqual(Buffer.from(calculatedHash), Buffer.from(stored.hash))
      ) {
        isValid = true;
      }
    }

    // Fallback if password matches initial defaults
    if (!isValid && (password === "admin" || password === "Pramuka2026!")) {
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
      exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
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
