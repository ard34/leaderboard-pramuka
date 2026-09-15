import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const NAMA_REGU_PUTRA_SD = [
  "Regu Garuda", "Regu Elang", "Regu Rajawali", "Regu Singa", "Regu Harimau",
  "Regu Badak", "Regu Banteng", "Regu Serigala", "Regu Cobra", "Regu Scorpio",
  "Regu Jaguar", "Regu Panther", "Regu Kancil", "Regu Kucing Hutan", "Regu Beruang",
  "Regu Merak", "Regu Jalak", "Regu Kutilang", "Regu Kenari"
];

const NAMA_REGU_PUTRI_SD = [
  "Regu Melati", "Regu Mawar", "Regu Anggrek", "Regu Dahlia", "Regu Teratai",
  "Regu Sakura", "Regu Tulip", "Regu Cempaka", "Regu Flamboyan", "Regu Kenanga",
  "Regu Lily", "Regu Lavender", "Regu Asoka", "Regu Bougenville", "Regu Edelweis",
  "Regu Kamboja", "Regu Matahari", "Regu Sedap Malam", "Regu Nusa Indah"
];

const NAMA_REGU_PUTRA_SMP = [
  "Regu Harimau", "Regu Singa", "Regu Rajawali", "Regu Garuda",
  "Regu Elang", "Regu Serigala", "Regu Banteng"
];

const NAMA_REGU_PUTRI_SMP = [
  "Regu Melati", "Regu Mawar", "Regu Anggrek", "Regu Dahlia",
  "Regu Sakura", "Regu Lily", "Regu Teratai"
];

// Daftar 19 Sekolah SD/MI (19 Regu Putra & 19 Regu Putri = 38 Regu)
export const DEFAULT_PESERTA_SD = [];
for (let i = 1; i <= 19; i++) {
  DEFAULT_PESERTA_SD.push({
    nomor_dada: 100 + i,
    nama_regu: NAMA_REGU_PUTRA_SD[i - 1],
    pangkalan: `SD Test ${i}`,
    no_gudep: `01.${String(i * 2 - 1).padStart(3, "0")}`,
    kontak_person: `08123456${String(100 + i)}`,
    email: `sdtest${i}@gmail.com`,
    kategori: "SD",
    gender: "Laki-laki",
    is_verified: true,
    status_berkas: { ketersediaan: true, pendaftaran: true, biodata_peserta: true, biodata_pembina: true, bukti_pembayaran: true },
    catatan_berkas: "Berkas lengkap dan terverifikasi",
    total_nilai: 0,
  });
}
for (let i = 1; i <= 19; i++) {
  DEFAULT_PESERTA_SD.push({
    nomor_dada: 120 + i,
    nama_regu: NAMA_REGU_PUTRI_SD[i - 1],
    pangkalan: `SD Test ${i}`,
    no_gudep: `01.${String(i * 2).padStart(3, "0")}`,
    kontak_person: `08123456${String(120 + i)}`,
    email: `sdtest${i}@gmail.com`,
    kategori: "SD",
    gender: "Perempuan",
    is_verified: true,
    status_berkas: { ketersediaan: true, pendaftaran: true, biodata_peserta: true, biodata_pembina: true, bukti_pembayaran: true },
    catatan_berkas: "Berkas lengkap dan terverifikasi",
    total_nilai: 0,
  });
}

// Daftar 7 Sekolah SMP/MTs (7 Regu Putra & 7 Regu Putri = 14 Regu)
export const DEFAULT_PESERTA_SMP = [];
for (let i = 1; i <= 7; i++) {
  DEFAULT_PESERTA_SMP.push({
    nomor_dada: 200 + i,
    nama_regu: NAMA_REGU_PUTRA_SMP[i - 1],
    pangkalan: `SMP Test ${i}`,
    no_gudep: `02.${String(i * 2 - 1).padStart(3, "0")}`,
    kontak_person: `08123456${String(200 + i)}`,
    email: `smptest${i}@gmail.com`,
    kategori: "SMP",
    gender: "Laki-laki",
    is_verified: true,
    status_berkas: { ketersediaan: true, pendaftaran: true, biodata_peserta: true, biodata_pembina: true, bukti_pembayaran: true },
    catatan_berkas: "Berkas lengkap dan terverifikasi",
    total_nilai: 0,
  });
}
for (let i = 1; i <= 7; i++) {
  DEFAULT_PESERTA_SMP.push({
    nomor_dada: 210 + i,
    nama_regu: NAMA_REGU_PUTRI_SMP[i - 1],
    pangkalan: `SMP Test ${i}`,
    no_gudep: `02.${String(i * 2).padStart(3, "0")}`,
    kontak_person: `08123456${String(210 + i)}`,
    email: `smptest${i}@gmail.com`,
    kategori: "SMP",
    gender: "Perempuan",
    is_verified: true,
    status_berkas: { ketersediaan: true, pendaftaran: true, biodata_peserta: true, biodata_pembina: true, bukti_pembayaran: true },
    catatan_berkas: "Berkas lengkap dan terverifikasi",
    total_nilai: 0,
  });
}

export async function POST(request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: "Konfigurasi Supabase Server belum lengkap." }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    const body = await request.json().catch(() => ({}));
    const targetKategori = body.kategori || "ALL"; // "SD", "SMP", or "ALL"

    let dataToInsert = [];
    if (targetKategori === "SD") dataToInsert = DEFAULT_PESERTA_SD;
    else if (targetKategori === "SMP") dataToInsert = DEFAULT_PESERTA_SMP;
    else dataToInsert = [...DEFAULT_PESERTA_SD, ...DEFAULT_PESERTA_SMP];

    // Cek apakah data sudah ada berdasarkan nomor dada
    const { data: existingPeserta } = await supabaseAdmin
      .from("peserta")
      .select("nomor_dada");

    const existingNomorDada = new Set((existingPeserta || []).map((p) => p.nomor_dada));
    const newPeserta = dataToInsert.filter((p) => !existingNomorDada.has(p.nomor_dada));

    if (newPeserta.length === 0) {
      return NextResponse.json({
        success: true,
        message: "Seluruh data sekolah/regu test (19 SD & 7 SMP = 52 regu) sudah ada di sistem.",
        insertedCount: 0,
      });
    }

    const { data: inserted, error } = await supabaseAdmin
      .from("peserta")
      .insert(newPeserta)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Berhasil menambahkan ${inserted?.length || 0} regu resmi (19 SD & 7 SMP Langsung Aktif & Terverifikasi)!`,
      insertedCount: inserted?.length || 0,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
