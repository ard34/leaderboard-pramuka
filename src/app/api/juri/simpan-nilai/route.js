import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseServerAdmin";

export async function POST(request) {
  try {
    const body = await request.json();
    const { peserta_id, juri_id, lomba_id, nilai, rubrik, catatan_berkas } = body;

    if (!peserta_id || !juri_id || !lomba_id || nilai === undefined || nilai === null) {
      return NextResponse.json(
        { error: "Data penilaian tidak lengkap (peserta_id, juri_id, lomba_id, nilai wajib diisi)." },
        { status: 400 }
      );
    }

    const supabaseAdmin = await getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Gagal menghubungkan ke database server Supabase." },
        { status: 500 }
      );
    }

    const numNilai = Number(nilai);
    if (isNaN(numNilai) || numNilai < 0 || numNilai > 100) {
      return NextResponse.json(
        { error: "Nilai harus berupa angka antara 0 sampai 100." },
        { status: 400 }
      );
    }

    // 1. Simpan ke tabel penilaian
    const { data: savedScore, error: scoreError } = await supabaseAdmin
      .from("penilaian")
      .upsert(
        {
          peserta_id,
          juri_id,
          lomba_id,
          nilai: numNilai,
          rubrik: rubrik || {},
          updated_at: new Date().toISOString(),
        },
        { onConflict: "peserta_id, juri_id, lomba_id" }
      )
      .select()
      .single();

    if (scoreError) {
      console.error("Error saving score via API:", scoreError);
      return NextResponse.json(
        { error: `Gagal menyimpan nilai ke database: ${scoreError.message}` },
        { status: 500 }
      );
    }

    // 2. Jika ada catatan_berkas (rubrik detail), perbarui ke tabel peserta
    if (catatan_berkas) {
      await supabaseAdmin
        .from("peserta")
        .update({ catatan_berkas })
        .eq("id", peserta_id);
    }

    return NextResponse.json({
      success: true,
      message: "Nilai berhasil disimpan ke database.",
      data: savedScore,
    });
  } catch (err) {
    console.error("API simpan-nilai unexpected error:", err);
    return NextResponse.json(
      { error: err.message || "Terjadi kesalahan internal pada server saat menyimpan nilai." },
      { status: 500 }
    );
  }
}
