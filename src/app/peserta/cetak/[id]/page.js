"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useParams } from "next/navigation";
import { getNoGudepByGender } from "@/lib/gudepUtils";

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

  useEffect(() => {
    if (peserta) {
      const reguSafe = (peserta.nama_regu || "Regu").replace(/[^a-zA-Z0-9]/g, "_");
      const kaplingSafe = peserta.nomor_dada ? `_Kapling_${String(peserta.nomor_dada).padStart(3, "0")}` : "";
      document.title = `Bukti_Pendaftaran_${reguSafe}${kaplingSafe}`;
    }
  }, [peserta]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold tracking-wide text-slate-300">Memuat Bukti Pendaftaran Resmi...</p>
        </div>
      </div>
    );
  }

  if (error || !peserta) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-red-400 font-sans p-4 text-center">
        <div className="bg-slate-950 p-6 rounded-2xl border border-red-500/30 max-w-md shadow-2xl">
          <p className="text-lg font-bold mb-2">⚠️ Dokumen Tidak Ditemukan</p>
          <p className="text-xs text-slate-400 mb-4">{error || "Data peserta tidak ditemukan di sistem."}</p>
          <a href="/" className="inline-block bg-slate-800 hover:bg-slate-700 text-white text-xs px-4 py-2 rounded-lg font-semibold transition-all">
            Kembali ke Beranda
          </a>
        </div>
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

  const noGudepDisplay = getNoGudepByGender(peserta.no_gudep, peserta.gender);
  const kaplingFormatted = peserta.nomor_dada ? String(peserta.nomor_dada).padStart(3, "0") : null;

  return (
    <div className="min-h-screen bg-slate-200/80 flex flex-col items-center py-6 print:py-0 print:bg-white text-black font-serif">
      <style>{`
        @page {
          size: A4 portrait;
          margin: 8mm 12mm;
        }
        @media print {
          html, body {
            height: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print {
            display: none !important;
          }
          .a4-page {
            box-shadow: none !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            border: none !important;
            page-break-inside: avoid !important;
            page-break-after: avoid !important;
          }
        }
      `}</style>

      {/* PANEL AKSI CETAK (Hanya tampil di layar, otomatis sembunyi saat cetak/save PDF) */}
      <div className="no-print mb-4 w-full max-w-[210mm] flex items-center justify-between gap-3 px-4 font-sans">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs font-bold text-slate-700 tracking-wide">
            Pratinjau Bukti Pendaftaran (A4 - 1 Lembar Pas)
          </span>
        </div>
        <button 
          onClick={() => window.print()}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-black py-2.5 px-6 rounded-xl shadow-lg hover:shadow-emerald-600/30 flex items-center gap-2 transition-all text-xs tracking-wider uppercase cursor-pointer"
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"/>
          </svg>
          <span>Cetak / Simpan PDF (A4)</span>
        </button>
      </div>

      {/* LEMBAR KERTAS A4 (Proporsi pas 1 lembar A4: 210mm) */}
      <div className="a4-page bg-white w-full max-w-[210mm] shadow-2xl p-[10mm_14mm] relative text-black text-[10.5pt] leading-normal">
        
        {/* KOP SURAT RESMI KWARRAN MEKAR BARU */}
        <div className="flex items-center justify-between pb-2 mb-2" style={{ borderBottom: "4px double black" }}>
          <div className="shrink-0">
            <img 
              src="/tunas_kelapa.jpg" 
              alt="Logo Pramuka" 
              className="w-[68px] h-[68px] object-contain" 
            />
          </div>
          <div className="flex-1 text-center px-2" style={{ fontFamily: "Arial, sans-serif" }}>
            <h1 className="text-[17px] font-bold uppercase tracking-[0.2em] leading-tight text-black m-0">
              G E R A K A N &nbsp; P R A M U K A
            </h1>
            <h2 className="text-[15px] font-bold uppercase tracking-wider leading-tight mt-0.5 text-black m-0">
              KWARTIR RANTING MEKAR BARU
            </h2>
            <p className="text-[9.5px] mt-0.5 font-medium leading-tight text-slate-800 m-0">
              Jl. KH Suhaemi Ds. Mekar Baru Kec. Mekar Baru Kabupaten Tangerang Banten 15550
            </p>
            <p className="text-[9px] font-bold italic leading-tight text-blue-900 mt-0.5 m-0">
              <span className="text-black">Website:</span> mekarbaru.kwarcabtangerang.or.id &nbsp;|&nbsp; <span className="text-black">Email:</span> kwarran.mekarbaru@gmail.com
            </p>
          </div>
          <div className="shrink-0">
            <img 
              src="/logo_wosm.png" 
              alt="Logo WOSM" 
              className="w-[68px] h-[68px] object-contain" 
            />
          </div>
        </div>

        {/* JUDUL SURAT & NO. REGISTRASI */}
        <div className="text-center mb-2.5">
          <h3 className="font-bold text-[12.5pt] underline mb-0.5 tracking-wide uppercase">
            TANDA BUKTI VERIFIKASI PENDAFTARAN
          </h3>
          <p className="text-[9.5pt] font-mono font-semibold text-slate-800 m-0">
            No. Registrasi: {id.slice(0, 8).toUpperCase()}
          </p>
        </div>

        {/* PENGANTAR */}
        <p className="text-[10pt] text-justify leading-relaxed mb-2">
          Panitia Pelaksana Lomba Tingkat Regu Pramuka Penggalang Dua (LT-II) Kwartir Ranting Mekar Baru Tahun 2026 menerangkan bahwa:
        </p>
        
        {/* TABEL DATA REGU PESERTA */}
        <table className="w-full ml-2 md:ml-4 mb-2 text-[10pt] font-bold border-collapse">
          <tbody>
            <tr>
              <td className="py-0.5 w-44">Nama Regu</td>
              <td className="py-0.5 w-4">:</td>
              <td className="py-0.5 text-black">{peserta.nama_regu}</td>
            </tr>
            <tr>
              <td className="py-0.5">No. Kapling (Tenda)</td>
              <td className="py-0.5">:</td>
              <td className="py-0.5 font-mono text-[11pt]">
                {kaplingFormatted ? (
                  <span className="bg-slate-100 px-2 py-0.2 rounded font-black border border-slate-300">
                    #{kaplingFormatted}
                  </span>
                ) : (
                  <span className="text-slate-600 font-normal italic">Menunggu Verifikasi</span>
                )}
              </td>
            </tr>
            <tr>
              <td className="py-0.5">Pangkalan / Sekolah</td>
              <td className="py-0.5">:</td>
              <td className="py-0.5">{peserta.pangkalan}</td>
            </tr>
            <tr>
              <td className="py-0.5">No. Gugus Depan</td>
              <td className="py-0.5">:</td>
              <td className="py-0.5 font-mono">{noGudepDisplay}</td>
            </tr>
            <tr>
              <td className="py-0.5">Kategori Peserta</td>
              <td className="py-0.5">:</td>
              <td className="py-0.5">{peserta.kategori}</td>
            </tr>
            <tr>
              <td className="py-0.5">Jenis Kelamin</td>
              <td className="py-0.5">:</td>
              <td className="py-0.5">{peserta.gender === "Laki-laki" ? "Laki-laki (Putra)" : "Perempuan (Putri)"}</td>
            </tr>
            <tr>
              <td className="py-0.5">Tanggal Daftar</td>
              <td className="py-0.5">:</td>
              <td className="py-0.5">{tglDaftar}</td>
            </tr>
          </tbody>
        </table>

        {/* PERNYATAAN STATUS SAH */}
        <p className="text-[10pt] text-justify leading-relaxed mb-2">
          Telah menyerahkan kelengkapan dokumen persyaratan dan dinyatakan <strong>SAH & TERVERIFIKASI</strong> sebagai Peserta LT-II Kwartir Ranting Mekar Baru Tahun 2026.
        </p>

        {/* KOTAK INSTRUKSI PESERTA (KOMPAK & RAPI) */}
        <div className="border border-black p-2.5 mb-3 bg-slate-50 rounded text-[9.5pt] leading-snug">
          <p className="font-bold mb-1">Instruksi untuk Peserta:</p>
          <ol className="list-decimal pl-5 space-y-0.5">
            <li>Surat ini adalah bukti sah verifikasi pendaftaran regu dari panitia pelaksana.</li>
            <li>Silakan cetak fisik surat ini pada kertas A4 (dapat dicetak warna atau hitam-putih).</li>
            <li>Bawa surat fisik ini pada saat registrasi ulang di lokasi perkemahan (Bumi Perkemahan) untuk ditukarkan dengan Surat Izin Mendirikan Tenda di Kapling #{kaplingFormatted || "—"} dan ID Card peserta.</li>
          </ol>
        </div>

        {/* TANDA TANGAN & LEGALITAS */}
        <div className="flex justify-between items-start text-[10pt] mt-2">
          {/* Sisi Kiri: Badge Status Resmi */}
          <div className="w-56 p-2 rounded border border-emerald-600/40 bg-emerald-50/50 text-center font-sans">
            <div className="text-[7.5pt] font-mono text-emerald-800 font-bold uppercase tracking-wider">
              Status Verifikasi Sistem
            </div>
            <div className="text-[12pt] font-black text-emerald-700 tracking-wider my-0.5">
              {isVerified ? "✅ RESMI & SAH" : "⏳ DALAM PROSES"}
            </div>
            <div className="text-[7pt] font-mono text-slate-500">
              KODE: LT2-2026-{id.slice(0, 8).toUpperCase()}
            </div>
          </div>

          {/* Sisi Kanan: Pengesahan Panitia */}
          <div className="w-56 text-center">
            <p className="mb-0.5 leading-tight">Mekar Baru, {tglDaftar}</p>
            <p className="font-bold leading-tight">Panitia Pelaksana LT-II</p>
            <p className="text-[9pt] text-slate-700 leading-tight">Kwarran Mekar Baru</p>
            <div className="h-12 flex items-center justify-center">
              <span className="text-[7.5pt] text-slate-400 italic">(Cap & Tanda Tangan)</span>
            </div>
            <div className="border-b border-black w-36 mx-auto"></div>
          </div>
        </div>

        {/* WATERMARK KHUSUS JIKA BELUM DIVERIFIKASI */}
        {!isVerified && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-15">
            <span className="text-7xl font-black text-red-600 transform -rotate-45 border-4 border-red-600 p-4 rounded-xl">
              BELUM VERIFIKASI
            </span>
          </div>
        )}

      </div>
    </div>
  );
}

