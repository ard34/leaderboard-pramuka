import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: "Konfigurasi Supabase Server belum lengkap." },
        { status: 500 }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    const body = await request.json().catch(() => ({}));
    const email = (body.email || "juri.pengawas@siloti.id").toLowerCase().trim();
    const password = body.password || "Pramuka2026!";
    const nama_lengkap = body.nama_lengkap || "Dewan Juri Pengawas (Pemeriksa Format)";

    // 1. Cek apakah user sudah ada di Auth
    const { data: userList } = await supabaseAdmin.auth.admin.listUsers();
    let existingUser = userList?.users?.find((u) => u.email === email);
    let userId = existingUser?.id;

    if (existingUser) {
      // Update password & metadata
      await supabaseAdmin.auth.admin.updateUserById(userId, {
        password: password,
        email_confirm: true,
        user_metadata: {
          nama_lengkap: nama_lengkap,
          role: "juri",
          assigned_lomba_id: null,
          assigned_kategori: null,
          assigned_gender: "SEMUA",
        },
      });
    } else {
      // Buat user baru di auth
      const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true,
        user_metadata: {
          nama_lengkap: nama_lengkap,
          role: "juri",
          assigned_lomba_id: null,
          assigned_kategori: null,
          assigned_gender: "SEMUA",
        },
      });

      if (createError) {
        return NextResponse.json({ error: createError.message }, { status: 400 });
      }
      userId = created.user.id;
    }

    // 2. Upsert ke tabel profiles agar memiliki hak akses juri pengawas (unlocked)
    const { error: profileError } = await supabaseAdmin.from("profiles").upsert({
      id: userId,
      nama_lengkap: nama_lengkap,
      role: "juri",
      assigned_lomba_id: null,
      assigned_kategori: null,
      assigned_gender: "SEMUA",
      is_verified: true,
    });

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Akun Dewan Juri Pengawas & Pemeriksa Format berhasil dibuat/diperbarui!",
      credentials: {
        email: email,
        password: password,
        nama_lengkap: nama_lengkap,
        akses: "Semua Cabang Lomba, Semua Tingkat (SD & SMP), Semua Gender (Putra & Putri)",
      },
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
