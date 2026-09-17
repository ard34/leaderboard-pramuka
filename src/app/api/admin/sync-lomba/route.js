import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: "Supabase config missing" }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    const officialUpdates = [
      { kode: "HMN", nama: "Lomba Paduan Suara" },
      { kode: "TSB", nama: "Lomba Tari Nusantara" },
      { kode: "PNR", nama: "Lomba Pionering" },
      { kode: "PGD", nama: "PPGD" },
      { kode: "SND", nama: "Sandi - Sandi" },
      { kode: "NAV", nama: "Orienteering Navigasi" },
      { kode: "TKS", nama: "Menaksir" },
      { kode: "SMP", nama: "Semaphore" },
      { kode: "MRS", nama: "Morse" },
      { kode: "KIM", nama: "Lomba KIM" },
      { kode: "KRN", nama: "Lomba Karnaval" },
      { kode: "MSK", nama: "Masak Nusantara" },
      { kode: "ADM", nama: "Administrasi Regu" },
    ];

    const results = [];
    for (const item of officialUpdates) {
      const { data, error } = await supabaseAdmin
        .from("lomba")
        .update({ nama_lomba: item.nama })
        .eq("kode_lomba", item.kode)
        .select("id, kode_lomba, nama_lomba, kategori");

      results.push({ kode: item.kode, nama: item.nama, updatedRows: data ? data.length : 0, error: error ? error.message : null });
    }

    const { data: allLomba } = await supabaseAdmin
      .from("lomba")
      .select("id, kode_lomba, nama_lomba, kategori")
      .order("kategori")
      .order("kode_lomba");

    return NextResponse.json({
      success: true,
      message: "12 Cabang Lomba Resmi berhasil disinkronkan di database!",
      results,
      allLomba,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
