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
          ??? Cetak / Simpan sebagai PDF
        </button>
      </div>

      {/* Kertas A4 */}
      <div className="bg-white w-full max-w-[210mm] shadow-2xl print:shadow-none p-[15mm] relative overflow-hidden">
        
        {/* KOP SURAT */}
        <div className="flex items-center justify-between border-b-4 border-black pb-4 mb-6">
          <div className="flex-shrink-0">
            <img src="/logo_wosm.png" alt="WOSM" className="w-20 h-20 object-contain" />
          </div>
          <div className="flex-1 text-center px-4">
            <h1 className="text-2xl font-black uppercase tracking-wide">Kwartir Ranting Mekar Baru</h1>
            <h2 className="text-lg font-bold uppercase mt-1">Lomba Tingkat Regu Pramuka Penggalang Dua (LT-II)</h2>
            <p className="text-md mt-1 text-gray-800">Tahun 2026</p>
          </div>
          <div className="flex-shrink-0">
            <img src="/logo_lt2.png" alt="LT2" className="w-20 h-20 object-contain" />
          </div>
        </div>

        {/* JUDUL SURAT */}
        <div className="text-center mb-6">
          <h3 className="text-xl font-black underline uppercase">Tanda Bukti Verifikasi Pendaftaran</h3>
          <p className="text-sm mt-1 text-gray-800">No. Registrasi: {peserta.id.split("-")[0].toUpperCase()}</p>
        </div>

        {/* ISI SURAT */}
        <div className="space-y-3 text-justify leading-relaxed text-[15px]">
          <p>
            Panitia Pelaksana Lomba Tingkat Regu Pramuka Penggalang Dua (LT-II) Kwartir Ranting Mekar Baru Tahun 2026 menerangkan bahwa:
          </p>
          
          <table className="w-full ml-4 mb-3 mt-3">
            <tbody>
              <tr>
                <td className="py-1.5 w-48 font-semibold">Nama Regu</td>
                <td className="py-1.5 w-4">:</td>
                <td className="py-1.5 font-bold text-lg">{peserta.nama_regu}</td>
              </tr>
              <tr>
                <td className="py-1.5 font-semibold">Pangkalan / Sekolah</td>
                <td className="py-1.5">:</td>
                <td className="py-1.5">{peserta.pangkalan}</td>
              </tr>
              <tr>
                <td className="py-1.5 font-semibold">No. Gugus Depan</td>
                <td className="py-1.5">:</td>
                <td className="py-1.5">{peserta.no_gudep || "-"}</td>
              </tr>
              <tr>
                <td className="py-1.5 font-semibold">Kategori Peserta</td>
                <td className="py-1.5">:</td>
                <td className="py-1.5">{peserta.kategori}</td>
              </tr>
              <tr>
                <td className="py-1.5 font-semibold">Jenis Kelamin</td>
                <td className="py-1.5">:</td>
                <td className="py-1.5">{peserta.gender}</td>
              </tr>
              <tr>
                <td className="py-1.5 font-semibold">Tanggal Daftar</td>
                <td className="py-1.5">:</td>
                <td className="py-1.5">{tglDaftar}</td>
              </tr>
            </tbody>
          </table>

          <p>
            Telah menyerahkan kelengkapan dokumen persyaratan dan dinyatakan <strong>{isVerified ? "SAH & TERVERIFIKASI" : "BELUM DIVERIFIKASI"}</strong> sebagai Peserta LT-II Kwartir Ranting Mekar Baru Tahun 2026.
          </p>
        </div>

        {/* INSTRUKSI */}
        <div className="mt-8 p-4 border-2 border-dashed border-gray-400 rounded bg-gray-50 print:border-solid text-[15px]">
          <h4 className="font-bold mb-2">Instruksi untuk Peserta:</h4>
          <ol className="list-decimal ml-5 space-y-1">
            <li>Surat ini adalah <strong>bukti sah</strong> pendaftaran regu.</li>
            <li>Silakan <strong>cetak (print) / Download PDF</strong> surat ini.</li>
            <li>Bawa surat fisik/PDF ini pada saat registrasi ulang di lokasi perkemahan (Bumi Perkemahan) untuk ditukarkan dengan <strong>Nomor Kapling Tenda</strong> dan ID Card.</li>
          </ol>
        </div>

        {/* TTD */}
        <div className="mt-8 flex justify-end">
          <div className="text-center w-64 text-[15px]">
            <p className="mb-14">Mekar Baru, {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>
            <p className="font-bold underline">Panitia Pendaftaran</p>
            <p className="text-sm mt-1">LT-II Kwarran Mekar Baru</p>
          </div>
        </div>

        {/* WATERMARK */}
        {!isVerified && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
            <span className="text-8xl font-black text-red-500 transform -rotate-45">BELUM VERIFIKASI</span>
          </div>
        )}

      </div>
    </div>
  );
}
