"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useParams } from "next/navigation";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function CetakBuktiPendaftaran() {
  const { id } = useParams();
  const [peserta, setPeserta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data, error: err } = await supabase
          .from("peserta")
          .select("*")
          .eq("id", id)
          .single();

        if (err) throw err;
        if (!data) throw new Error("Data tidak ditemukan");
        
        setPeserta(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-slate-800">
        <p>Memuat dokumen...</p>
      </div>
    );
  }

  if (error || !peserta) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-red-600">
        <p>Gagal memuat dokumen: {error || "Peserta tidak ditemukan"}</p>
      </div>
    );
  }

  const isVerified = peserta.is_verified;
  const tglDaftar = new Date(peserta.created_at).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center py-6 print:py-0 print:bg-white text-black" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 0; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>
      {/* Tombol Cetak (Sembunyi saat di-print) */}
      <div className="mb-6 print:hidden flex gap-4">
        <button 
          onClick={() => window.print()}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-6 rounded-lg shadow-lg flex items-center gap-2 transition-all"
        >
          🖨️ Cetak / Simpan sebagai PDF
        </button>
        {isVerified && (
          <a
            href={`/api/peserta/cetak-doc/${id}`}
            download
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow-lg flex items-center gap-2 transition-all"
          >
            📄 Unduh Bukti (Word/DOC)
          </a>
        )}
      </div>

      {/* Kertas A4 */}
      <div className="bg-white w-full max-w-[210mm] shadow-2xl print:shadow-none p-[15mm] relative overflow-hidden text-black font-serif text-[12pt]">
        
        {/* KOP SURAT */}
        <div className="flex items-center justify-between pb-3 mb-1" style={{ borderBottom: "5px double black" }}>
          <div className="flex-shrink-0 ml-4">
            <img 
              src="/tunas_kelapa.jpg" 
              alt="Logo Kiri" 
              className="w-[85px] h-[85px] object-contain" 
            />
          </div>
          <div className="flex-1 text-center px-2" style={{ fontFamily: "Arial, sans-serif" }}>
            <h1 className="text-[22px] font-bold uppercase tracking-[0.2em] leading-tight">G E R A K A N  P R A M U K A</h1>
            <h2 className="text-[20px] font-bold uppercase tracking-wider leading-tight mt-1">KWARTIR RANTING MEKAR BARU</h2>
            <p className="text-[12px] mt-1 font-medium leading-tight">Jl.KH Suhaemi Ds. Mekar Baru Kec. Mekar Baru Kabupaten Tangerang Banten 15550</p>
            <p className="text-[11px] font-bold italic leading-tight text-blue-800">
              <span className="text-black">Website :</span> mekarbaru.kwarcabtangerang.or.id <span className="text-black">//Email:</span> kwarran.mekarbaru@gmail.com
            </p>
          </div>
          <div className="flex-shrink-0 mr-4">
            <img 
              src="/logo_wosm.png" 
              alt="WOSM" 
              className="w-[85px] h-[85px] object-contain" 
            />
          </div>
        </div>
        
        {/* Jarak setelah kop */}
        <div className="mb-6"></div>

        {/* JUDUL SURAT */}
        <div className="text-center mb-8">
          <h3 className="font-bold text-[14pt] underline mb-1">TANDA BUKTI VERIFIKASI PENDAFTARAN</h3>
          <p className="text-[11pt]">No. Registrasi: {id.slice(0, 8).toUpperCase()}</p>
        </div>

        {/* ISI SURAT */}
        <div className="text-[12pt] text-justify leading-relaxed">
          <p className="mb-4">
            Panitia Pelaksana Lomba Tingkat Regu Pramuka Penggalang Dua (LT-II) Kwartir Ranting Mekar Baru Tahun 2026 menerangkan bahwa:
          </p>
          
          <table className="w-full ml-10 mb-6 font-bold">
            <tbody>
              <tr><td className="py-1.5 w-48">Nama Regu</td><td className="py-1.5 w-4">:</td><td className="py-1.5">{peserta.nama_regu}</td></tr>
              <tr><td className="py-1.5">Pangkalan / Sekolah</td><td className="py-1.5">:</td><td className="py-1.5">{peserta.pangkalan}</td></tr>
              <tr><td className="py-1.5">No. Gugus Depan</td><td className="py-1.5">:</td><td className="py-1.5">{peserta.no_gudep || "-"}</td></tr>
              <tr><td className="py-1.5">Kategori Peserta</td><td className="py-1.5">:</td><td className="py-1.5">{peserta.kategori}</td></tr>
              <tr><td className="py-1.5">Jenis Kelamin</td><td className="py-1.5">:</td><td className="py-1.5">{peserta.gender}</td></tr>
              <tr><td className="py-1.5">Tanggal Daftar</td><td className="py-1.5">:</td><td className="py-1.5">{tglDaftar}</td></tr>
            </tbody>
          </table>

          <p className="mb-8">
            Telah menyerahkan kelengkapan dokumen persyaratan dan dinyatakan <strong>SAH & TERVERIFIKASI</strong> sebagai Peserta LT-II Kwartir Ranting Mekar Baru Tahun 2026.
          </p>

          {/* BOX INSTRUKSI */}
          <div className="border border-black p-4 mb-8 bg-gray-50">
            <p className="font-bold mb-2">Instruksi untuk Peserta:</p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Surat ini adalah bukti sah pendaftaran regu.</li>
              <li>Silakan cetak (print) / Download PDF surat ini.</li>
              <li>Bawa surat fisik/PDF ini pada saat registrasi ulang di lokasi perkemahan (Bumi Perkemahan) untuk ditukarkan dengan Nomor Kapling Tenda dan ID Card.</li>
            </ol>
          </div>
        </div>

        {/* TTD */}
        <div className="flex justify-between text-[12pt] mt-8">
          <div className="w-1/2">
            {/* Kiri Kosong */}
          </div>
          <div className="w-1/2 flex flex-col items-center text-center">
            <p className="mb-1">Mekar Baru, {tglDaftar}</p>
            <p>Panitia/ Admin</p>
            <p>LT-II Kwarran Mekar Baru</p>
            {/* Tanda tangan dibiarkan kosong sesuai template */}
            <div className="h-24"></div>
          </div>
        </div>

        {/* WATERMARK JIKA BELUM VERIFIKASI */}
        {!isVerified && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
            <span className="text-8xl font-black text-red-500 transform -rotate-45">BELUM VERIFIKASI</span>
          </div>
        )}

      </div>
    </div>
  );
}
