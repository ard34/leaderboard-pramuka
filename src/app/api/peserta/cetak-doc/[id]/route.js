import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { generatePdfBukti } from "@/lib/generatePdfBukti";

export async function GET(request, { params }) {
  try {
    // Await params to access id safely (Next.js 15+ convention for dynamic routes)
    const resolvedParams = await params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json({ error: "ID Peserta tidak ditemukan" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Fetch participant data
    const { data: peserta, error } = await supabase
      .from("peserta")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !peserta) {
      return NextResponse.json(
        { error: "Peserta tidak ditemukan: " + (error?.message || "") },
        { status: 404 }
      );
    }

    const kaplingFormatted = peserta.nomor_dada
      ? String(peserta.nomor_dada).padStart(3, "0")
      : "";

    // Generate PDF buffer (no_gudep otomatis dipisahkan sesuai gender di helper)
    let pdfBuffer;
    try {
      pdfBuffer = await generatePdfBukti(peserta, id, kaplingFormatted);
    } catch (e) {
      console.error("Gagal generate PDF:", e);
      return NextResponse.json({ error: "Gagal membuat PDF: " + e.message }, { status: 500 });
    }

    const safeFilenameName = (peserta.nama_regu || "regu")
      .replace(/[^a-z0-9]/gi, "_")
      .toLowerCase();
    const filename = `Bukti_Pendaftaran_${safeFilenameName}.pdf`;

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    });

  } catch (err) {
    console.error("Kesalahan server cetak-doc:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server: " + err.message },
      { status: 500 }
    );
  }
}
