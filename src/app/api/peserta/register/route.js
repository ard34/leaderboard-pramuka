import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request) {
  try {
    const body = await request.json();
    const { nama_regu, pangkalan, kategori, gender, no_gudep, kontak_person, email } = body;

    const cleanNamaRegu = nama_regu?.trim();
    const cleanPangkalan = pangkalan?.trim();
    const cleanNoGudep = no_gudep?.trim();
    const cleanKontak = kontak_person?.trim();
    const cleanEmail = email?.trim();

    if (!cleanNamaRegu || !cleanPangkalan || !cleanNoGudep || !cleanKontak) {
      return NextResponse.json(
        { error: "Harap lengkapi semua bidang form pendaftaran." },
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

    // Create client with service role key (or anon key fallback)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    const payload = {
      nama_regu: cleanNamaRegu,
      pangkalan: cleanPangkalan,
      kategori,
      gender,
      no_gudep: cleanNoGudep,
      kontak_person: cleanKontak,
      email: cleanEmail || "",
      is_verified: false,
    };


    // Primary insert attempt
    let { error: insertError } = await supabaseAdmin.from("peserta").insert(payload);

    // Fallback if nomor_dada NOT NULL constraint exists in DB
    if (insertError && (insertError.message.includes("nomor_dada") || insertError.code === "23502")) {
      payload.nomor_dada = 0;
      const fallbackRes = await supabaseAdmin.from("peserta").insert(payload);
      insertError = fallbackRes.error;
    }

    if (insertError) {
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: "Terjadi kesalahan server: " + err.message },
      { status: 500 }
    );
  }
}
