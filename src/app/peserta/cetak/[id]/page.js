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
        <div className="flex items-center justify-between pb-3 mb-1" style={{ borderBottom: "5px double black" }}>
          <div className="flex-shrink-0 ml-4">
            <img 
              src="/tunas_kelapa.png" 
              alt="Tunas Kelapa" 
              className="w-[60px] h-[85px] object-contain mix-blend-multiply" 
            />
          </div>
          <div className="flex-1 text-center px-2" style={{ fontFamily: "Arial, sans-serif" }}>
            <h1 className="text-[26px] font-black uppercase tracking-widest leading-tight">Gerakan Pramuka</h1>
            <h2 className="text-[22px] font-black uppercase tracking-wider leading-tight mt-1">Kwartir Ranting Mekar Baru</h2>
            <p className="text-[13px] mt-1 text-black font-medium leading-tight">Jl.KH Suhaemi Ds. Mekar Baru Kec. Mekar Baru Kabupaten Tangerang Banten 15550</p>
            <p className="text-[12px] font-bold italic text-black leading-tight">Website : mekarbaru.kwarcabtangerang.or.id //Email: kwarran.mekarbaru@gmail.com</p>
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

        {/* SURAT INFORMATION */}
        <div className="flex flex-col md:flex-row justify-between mb-6 text-[15px] font-sans text-black">
          <div>
            <table className="leading-snug">
              <tbody>
                <tr><td className="pr-4 py-0.5 align-top">Nomor</td><td className="pr-2 py-0.5 align-top">:</td><td className="py-0.5 font-bold">0 5 1 /28.04.13-A</td></tr>
                <tr><td className="pr-4 py-0.5 align-top">Lampiran</td><td className="pr-2 py-0.5 align-top">:</td><td className="py-0.5">-</td></tr>
                <tr>
                  <td className="pr-4 py-0.5 align-top">Perihal</td>
                  <td className="pr-2 py-0.5 align-top">:</td>
                  <td className="py-0.5 font-bold">
                    Tanda Bukti Pendaftaran<br/>
                    Lomba Tingkat (LT-II) Tahun 2026<br/>
                    Kwartir Ranting Mekar Baru
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="text-right mt-4 md:mt-0">
            <p>Mekar Baru, {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>
          </div>
        </div>

        {/* KEPADA YTH */}
        <div className="mb-6 text-[15px] font-sans text-black leading-snug">
          <p>Kepada Yth.</p>
          <p className="font-bold">Pembina Pasukan {peserta.pangkalan}</p>
          <p className="font-bold">Gerakan Pramuka Mekar Baru</p>
          <p>di-</p>
          <p className="ml-6">Tempat</p>
        </div>

        {/* ISI SURAT */}
        <div className="text-[15px] font-sans text-black text-justify leading-relaxed">
          <p className="font-bold italic mb-4">Assalamu'alaikum Wr. Wb.</p>
          <p className="font-bold italic mb-4">Salam Pramuka,</p>
          
          <p className="mb-4">
            Disampaikan dengan hormat, Panitia Pelaksana Lomba Tingkat Regu Pramuka Penggalang Dua (LT-II) Kwartir Ranting Gerakan Pramuka Mekar Baru menerangkan bahwa:
          </p>
          
          <table className="w-full ml-4 mb-4">
            <tbody>
              <tr><td className="py-1 w-48 font-semibold">Nama Regu</td><td className="py-1 w-4">:</td><td className="py-1 font-bold">{peserta.nama_regu}</td></tr>
              <tr><td className="py-1 font-semibold">Pangkalan / Sekolah</td><td className="py-1">:</td><td className="py-1">{peserta.pangkalan}</td></tr>
              <tr><td className="py-1 font-semibold">No. Gugus Depan</td><td className="py-1">:</td><td className="py-1">{peserta.no_gudep || "-"}</td></tr>
              <tr><td className="py-1 font-semibold">Kategori & Gender</td><td className="py-1">:</td><td className="py-1">{peserta.kategori} - {peserta.gender}</td></tr>
              <tr><td className="py-1 font-semibold">Status Pendaftaran</td><td className="py-1">:</td><td className="py-1 font-bold">{isVerified ? "TERVERIFIKASI" : "MENUNGGU VERIFIKASI"}</td></tr>
            </tbody>
          </table>

          <p className="mb-4">
            Telah menyerahkan kelengkapan dokumen persyaratan dan dinyatakan resmi terdaftar sebagai Peserta pada kegiatan Lomba Tingkat (LT-II) Kwartir Ranting Mekar Baru Tahun 2026.
          </p>

          <p className="mb-6">
            Demikian tanda bukti pendaftaran ini kami sampaikan, atas perhatian dan kerjasamanya diucapkan terima kasih.
          </p>

          <p className="font-bold italic mb-1">Wassalamu'alaikum Wr. Wb.</p>
          <p className="font-bold italic mb-8">Salam Pramuka,</p>
        </div>

        {/* TTD */}
        <div className="flex justify-between font-sans text-black text-[15px] mt-4">
          <div className="w-64">
            {/* Kiri Kosong */}
          </div>
          <div className="w-72">
            <p>Panitia Pendaftaran</p>
            <p>Gerakan Pramuka Mekar Baru</p>
            <p className="mb-20">Ketua,</p>
            <p className="font-bold underline uppercase">TUTI ALWIYAH, S.Pd.</p>
            <p className="text-sm">NTA. 28.04.13.090282.0001</p>
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
