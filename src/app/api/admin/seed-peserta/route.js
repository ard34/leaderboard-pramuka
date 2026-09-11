import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Daftar 15 Regu SD dan 15 Regu SMP Resmi Mekar Baru
const DEFAULT_PESERTA_SD = [
  { nomor_dada: 101, nama_regu: "Regu Garuda", pangkalan: "SDN 1 Mekar Baru", kategori: "SD", gender: "Laki-laki", is_verified: true, total_nilai: 0 },
  { nomor_dada: 102, nama_regu: "Regu Elang", pangkalan: "SDN 2 Mekar Baru", kategori: "SD", gender: "Laki-laki", is_verified: true, total_nilai: 0 },
  { nomor_dada: 103, nama_regu: "Regu Rajawali", pangkalan: "SDN Klutuk", kategori: "SD", gender: "Laki-laki", is_verified: true, total_nilai: 0 },
  { nomor_dada: 104, nama_regu: "Regu Singa", pangkalan: "SDN Kosambi Dalam", kategori: "SD", gender: "Laki-laki", is_verified: true, total_nilai: 0 },
  { nomor_dada: 105, nama_regu: "Regu Harimau", pangkalan: "MI Nurul Huda", kategori: "SD", gender: "Laki-laki", is_verified: true, total_nilai: 0 },
  { nomor_dada: 106, nama_regu: "Regu Badak", pangkalan: "SDN Jenggot", kategori: "SD", gender: "Laki-laki", is_verified: true, total_nilai: 0 },
  { nomor_dada: 107, nama_regu: "Regu Banteng", pangkalan: "SDN Cijeruk", kategori: "SD", gender: "Laki-laki", is_verified: true, total_nilai: 0 },
  { nomor_dada: 108, nama_regu: "Regu Melati", pangkalan: "SDN 1 Mekar Baru", kategori: "SD", gender: "Perempuan", is_verified: true, total_nilai: 0 },
  { nomor_dada: 109, nama_regu: "Regu Mawar", pangkalan: "SDN 2 Mekar Baru", kategori: "SD", gender: "Perempuan", is_verified: true, total_nilai: 0 },
  { nomor_dada: 110, nama_regu: "Regu Anggrek", pangkalan: "SDN Klutuk", kategori: "SD", gender: "Perempuan", is_verified: true, total_nilai: 0 },
  { nomor_dada: 111, nama_regu: "Regu Dahlia", pangkalan: "SDN Kosambi Dalam", kategori: "SD", gender: "Perempuan", is_verified: true, total_nilai: 0 },
  { nomor_dada: 112, nama_regu: "Regu Sakura", pangkalan: "MI Nurul Huda", kategori: "SD", gender: "Perempuan", is_verified: true, total_nilai: 0 },
  { nomor_dada: 113, nama_regu: "Regu Teratai", pangkalan: "SDN Jenggot", kategori: "SD", gender: "Perempuan", is_verified: true, total_nilai: 0 },
  { nomor_dada: 114, nama_regu: "Regu Cempaka", pangkalan: "SDN Cijeruk", kategori: "SD", gender: "Perempuan", is_verified: true, total_nilai: 0 },
  { nomor_dada: 115, nama_regu: "Regu Kenanga", pangkalan: "MI Al-Falah", kategori: "SD", gender: "Perempuan", is_verified: true, total_nilai: 0 },
];

const DEFAULT_PESERTA_SMP = [
  { nomor_dada: 201, nama_regu: "Regu Cobra", pangkalan: "SMPN 1 Mekar Baru", kategori: "SMP", gender: "Laki-laki", is_verified: true, total_nilai: 0 },
  { nomor_dada: 202, nama_regu: "Regu Serigala", pangkalan: "SMPN 2 Mekar Baru", kategori: "SMP", gender: "Laki-laki", is_verified: true, total_nilai: 0 },
  { nomor_dada: 203, nama_regu: "Regu Jaguar", pangkalan: "MTs Al-Falah Mekar Baru", kategori: "SMP", gender: "Laki-laki", is_verified: true, total_nilai: 0 },
  { nomor_dada: 204, nama_regu: "Regu Macan Tutul", pangkalan: "SMP IT Mekar Baru", kategori: "SMP", gender: "Laki-laki", is_verified: true, total_nilai: 0 },
  { nomor_dada: 205, nama_regu: "Regu Scorpio", pangkalan: "MTs Nurul Huda", kategori: "SMP", gender: "Laki-laki", is_verified: true, total_nilai: 0 },
  { nomor_dada: 206, nama_regu: "Regu Cheetah", pangkalan: "SMPN 3 Mekar Baru", kategori: "SMP", gender: "Laki-laki", is_verified: true, total_nilai: 0 },
  { nomor_dada: 207, nama_regu: "Regu Puma", pangkalan: "MTs Daarul Falah", kategori: "SMP", gender: "Laki-laki", is_verified: true, total_nilai: 0 },
  { nomor_dada: 208, nama_regu: "Regu Lavender", pangkalan: "SMPN 1 Mekar Baru", kategori: "SMP", gender: "Perempuan", is_verified: true, total_nilai: 0 },
  { nomor_dada: 209, nama_regu: "Regu Lily", pangkalan: "SMPN 2 Mekar Baru", kategori: "SMP", gender: "Perempuan", is_verified: true, total_nilai: 0 },
  { nomor_dada: 210, nama_regu: "Regu Tulip", pangkalan: "MTs Al-Falah Mekar Baru", kategori: "SMP", gender: "Perempuan", is_verified: true, total_nilai: 0 },
  { nomor_dada: 211, nama_regu: "Regu Edelweis", pangkalan: "SMP IT Mekar Baru", kategori: "SMP", gender: "Perempuan", is_verified: true, total_nilai: 0 },
  { nomor_dada: 212, nama_regu: "Regu Flamboyan", pangkalan: "MTs Nurul Huda", kategori: "SMP", gender: "Perempuan", is_verified: true, total_nilai: 0 },
  { nomor_dada: 213, nama_regu: "Regu Asoka", pangkalan: "SMPN 3 Mekar Baru", kategori: "SMP", gender: "Perempuan", is_verified: true, total_nilai: 0 },
  { nomor_dada: 214, nama_regu: "Regu Bougenville", pangkalan: "MTs Daarul Falah", kategori: "SMP", gender: "Perempuan", is_verified: true, total_nilai: 0 },
  { nomor_dada: 215, nama_regu: "Regu Kamboja", pangkalan: "SMP Terbuka Mekar Baru", kategori: "SMP", gender: "Perempuan", is_verified: true, total_nilai: 0 },
];

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

    const existingNomorDada = new Set((existingPeserta || []).map(p => p.nomor_dada));
    const newPeserta = dataToInsert.filter(p => !existingNomorDada.has(p.nomor_dada));

    if (newPeserta.length === 0) {
      return NextResponse.json({
        success: true,
        message: "Seluruh data sekolah/regu standar sudah ada di sistem.",
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
      message: `Berhasil menambahkan ${inserted?.length || 0} regu sekolah resmi Kwarran Mekar Baru!`,
      insertedCount: inserted?.length || 0,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
