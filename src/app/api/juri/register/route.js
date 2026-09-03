import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request) {
  try {
    const body = await request.json();
    const { nama_lengkap, email, kategori, gender, lombaId, noWa } = body;

    const cleanNama = nama_lengkap?.trim();
    const cleanEmail = email?.trim()?.toLowerCase();

    if (!cleanNama || !cleanEmail || !kategori || !gender || !lombaId) {
      return NextResponse.json(
        { error: "Harap isi seluruh kolom formulir registrasi juri." },
        { status: 400 }
      );
    }

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

    // Ensure valid UUID for assigned_lomba_id
    let validLombaId = null;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(lombaId);

    if (isUuid) {
      validLombaId = lombaId;
    } else {
      // Find or insert matching lomba row in public.lomba
      const { data: matched } = await supabaseAdmin
        .from("lomba")
        .select("id")
        .eq("kategori", kategori)
        .ilike("nama_lomba", `%${lombaId.replace(/fallback-.*-/g, '')}%`)
        .maybeSingle();

      if (matched) {
        validLombaId = matched.id;
      }
    }

    // Generate a temporary random password for the user
    const tempPassword = Math.random().toString(36).slice(-10) + "A1!";

    // 1. Create auth user with auto-email confirm
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: cleanEmail,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        nama_lengkap: cleanNama,
        assigned_kategori: kategori,
        assigned_gender: gender,
        assigned_lomba_id: validLombaId,
        role: "juri",
        no_wa: noWa,
      },
    });

    let userId = authData?.user?.id;

    if (authError) {
      // If user already registered in Auth, attempt login/profile link
      if (authError.message.includes("already registered") || authError.status === 422) {
        const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
        const found = existingUsers?.users?.find((u) => u.email === cleanEmail);
        if (found) {
          userId = found.id;
        } else {
          return NextResponse.json({ error: "Email sudah terdaftar. Silakan login." }, { status: 400 });
        }
      } else {
        return NextResponse.json({ error: authError.message }, { status: 400 });
      }
    }

    // 2. Upsert profile with is_verified: false
    const { error: profileError } = await supabaseAdmin.from("profiles").upsert({
      id: userId,
      nama_lengkap: cleanNama,
      role: "juri",
      assigned_lomba_id: validLombaId,
      assigned_kategori: kategori,
      assigned_gender: gender,
      no_wa: noWa,
      is_verified: false,
    });

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, userId });
  } catch (err) {
    return NextResponse.json(
      { error: "Terjadi kesalahan server: " + err.message },
      { status: 500 }
    );
  }
}
