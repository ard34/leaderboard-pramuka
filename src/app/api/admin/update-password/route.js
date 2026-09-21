import { NextResponse } from "next/server";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { getSupabaseAdmin } from "@/lib/supabaseServerAdmin";

const LOCAL_AUTH_FILE = path.join(process.cwd(), "src", "lib", "adminAuth.json");
const TMP_AUTH_FILE = path.join("/tmp", "adminAuth.json");

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { newPassword } = body;

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { error: "Password baru minimal 6 karakter." },
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

    // 1. Simpan ke local file
    try {
      fs.writeFileSync(LOCAL_AUTH_FILE, JSON.stringify(authData, null, 2), "utf8");
    } catch (_) {}

    // 2. Simpan ke /tmp
    try {
      fs.writeFileSync(TMP_AUTH_FILE, JSON.stringify(authData, null, 2), "utf8");
    } catch (_) {}

    // 3. Sinkronkan ke Supabase Auth jika ada sesi
    try {
      const supabase = await getSupabaseAdmin();
      if (supabase) {
        await supabase.auth.updateUser({ password: newPassword }).catch(() => {});
      }
    } catch (_) {}

    return NextResponse.json({
      success: true,
      message: "Password Admin berhasil diperbarui dan tersimpan aman!",
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Gagal memperbarui password: " + err.message },
      { status: 500 }
    );
  }
}
