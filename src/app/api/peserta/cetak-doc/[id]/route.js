import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import fs from 'fs';
import path from 'path';

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

    // Read the Word template file
    // Note: process.cwd() is the root of the project where Template_Bukti_Pendaftaran.doc is located.
    const templatePath = path.join(process.cwd(), 'Template_Bukti_Pendaftaran.doc');
    let docContent;
    try {
      docContent = fs.readFileSync(templatePath, 'utf16le');
    } catch (e) {
      console.error("Gagal membaca template:", e);
      return NextResponse.json({ error: "Template tidak ditemukan di server." }, { status: 500 });
    }

    // Prepare variables for substitution
    const namaRegu = peserta.nama_regu || "—";
    const pangkalan = peserta.pangkalan || "—";
    const noGudep = peserta.no_gudep || "—";
    const kategoriPeserta = peserta.kategori || "—";
    const jenisKelamin = peserta.gender || "—";
    
    // Format the date
    const tglDaftar = new Date(peserta.created_at).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    docContent = docContent.replace(/(No\.\s*(?:<[^>]+>\s*)*Registrasi\s*(?:<[^>]+>\s*)*\:)/i, `$1 ${id.slice(0, 8).toUpperCase()}`);
    docContent = docContent.replace(/(…………….)/g, tglDaftar);
    docContent = docContent.replace(/(Nama\s*(?:<[^>]+>\s*)*Regu(?:<[^>]+>\s*)*\:\s*(?:<[^>]+>\s*)*)(&nbsp;)/i, `$1${namaRegu}`);
    docContent = docContent.replace(/(Pangkalan\s*(?:<[^>]+>\s*)*\/\s*(?:<[^>]+>\s*)*Sekolah(?:<[^>]+>\s*)*\:\s*(?:<[^>]+>\s*)*)(&nbsp;)/i, `$1${pangkalan}`);
    docContent = docContent.replace(/(No\.\s*(?:<[^>]+>\s*)*Gugus\s*(?:<[^>]+>\s*)*Depan(?:<[^>]+>\s*)*\:\s*(?:<[^>]+>\s*)*)(&nbsp;)/i, `$1${noGudep}`);
    docContent = docContent.replace(/(Kategori\s*(?:<[^>]+>\s*)*Peserta(?:<[^>]+>\s*)*\:\s*(?:<[^>]+>\s*)*)(&nbsp;)/i, `$1${kategoriPeserta}`);
    docContent = docContent.replace(/(Jenis\s*(?:<[^>]+>\s*)*Kelamin(?:<[^>]+>\s*)*\:\s*(?:<[^>]+>\s*)*)(&nbsp;)/i, `$1${jenisKelamin}`);
    docContent = docContent.replace(/(Tanggal\s*(?:<[^>]+>\s*)*Daftar(?:<[^>]+>\s*)*\:\s*(?:<[^>]+>\s*)*)(&nbsp;)/i, `$1${tglDaftar}`);

    // Convert string back to buffer with utf16le encoding
    const docBuffer = Buffer.from(docContent, 'utf16le');
    
    const safeFilenameName = namaRegu.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const filename = `Bukti_Pendaftaran_${safeFilenameName}.doc`;

    // Return the response as a downloadable file
    return new NextResponse(docBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/msword',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': docBuffer.length.toString()
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
