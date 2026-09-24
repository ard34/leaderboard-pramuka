import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseServerAdmin";

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { id, status_berkas, catatan_berkas, email } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID peserta wajib diisi." },
        { status: 400 }
      );
    }

    const supabase = await getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: "Koneksi database tidak tersedia." },
        { status: 500 }
      );
    }

    const updateData = {};
    if (status_berkas !== undefined) updateData.status_berkas = status_berkas;
    if (catatan_berkas !== undefined) updateData.catatan_berkas = catatan_berkas;
    if (email !== undefined && email !== null) updateData.email = String(email).trim();

    const { data, error } = await supabase
      .from("peserta")
      .update(updateData)
      .eq("id", id)
      .select();

    if (error) {
      return NextResponse.json(
        { success: false, error: "Gagal menyimpan berkas: " + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Status berkas berhasil disimpan permanen!",
      data: data?.[0] || null,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: "Kesalahan server: " + err.message },
      { status: 500 }
    );
  }
}
