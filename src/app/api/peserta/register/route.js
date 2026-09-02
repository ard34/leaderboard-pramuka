import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      nama_regu, pangkalan, kategori, gender, no_gudep, kontak_person, email,
      berkas_ketersediaan, berkas_pendaftaran, berkas_biodata_peserta, berkas_biodata_pembina, berkas_bukti_pembayaran
    } = body;

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
      nomor_dada: null,
      berkas_ketersediaan: berkas_ketersediaan || "",
      berkas_pendaftaran: berkas_pendaftaran || "",
      berkas_biodata_peserta: berkas_biodata_peserta || "",
      berkas_biodata_pembina: berkas_biodata_pembina || "",
      berkas_bukti_pembayaran: berkas_bukti_pembayaran || "",
      status_berkas: {
        ketersediaan: false,
        pendaftaran: false,
        biodata_peserta: false,
        biodata_pembina: false,
        bukti_pembayaran: false,
      },
      catatan_berkas: ""
    };

    // Primary insert attempt
    let { data: insertedData, error: insertError } = await supabaseAdmin
      .from("peserta")
      .insert(payload)
      .select("*")
      .single();

    // Fallback 1: if 'email' column does not exist in DB schema yet
    if (insertError && (insertError.message.includes("email") || insertError.code === "PGRST204" || insertError.code === "42703")) {
      delete payload.email;
      payload.kontak_person = `${cleanKontak} (Email: ${cleanEmail})`;
      const retryRes = await supabaseAdmin.from("peserta").insert(payload).select("*").single();
      insertError = retryRes.error;
      insertedData = retryRes.data;
    }

    if (insertError) {
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true 
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Terjadi kesalahan server: " + err.message },
      { status: 500 }
    );
  }
}

