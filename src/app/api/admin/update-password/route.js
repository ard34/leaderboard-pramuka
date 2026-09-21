import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import crypto from "crypto";

const AUTH_FILE_PATH = path.join(process.cwd(), "src", "lib", "adminAuth.json");

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
    const authData = {
      username: "admin",
      hash,
      salt,
      updatedAt: Date.now(),
    };

    try {
      fs.writeFileSync(AUTH_FILE_PATH, JSON.stringify(authData, null, 2), "utf8");
    } catch (_) {}

    return NextResponse.json({
      success: true,
      message: "Password Admin berhasil diperbarui!",
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: "Kesalahan server: " + err.message },
      { status: 500 }
    );
  }
}
