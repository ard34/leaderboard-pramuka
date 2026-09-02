"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function CetakRekapPerJuri() {
  const [loading, setLoading] = useState(true);
  const [groupedData, setGroupedData] = useState([]);

  useEffect(() => {
    fetchRekapData();
  }, []);

  const fetchRekapData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Lomba
      const { data: lombaData, error: errLomba } = await supabase.from("lomba").select("*").order("id", { ascending: true });
      if (errLomba) throw errLomba;

      // 2. Fetch Peserta
      const { data: pesertaData, error: errPeserta } = await supabase.from("peserta").select("*").eq("is_verified", true);
      if (errPeserta) throw errPeserta;

      // 3. Fetch Penilaian (with relations)
      const { data: penilaianData, error: errPenilaian } = await supabase.from("penilaian").select(`
        nilai,
        lomba:lomba_id (id),
        peserta:peserta_id (id, kategori, gender),
        juri:juri_id (nama_lengkap)
      `);
      if (errPenilaian) throw errPenilaian;

      let groups = [];
      const levels = ["SD", "SMP"];
      const genders = ["Laki-laki", "Perempuan"];

      // Generate groups
      for (const lomba of lombaData) {
        for (const kat of levels) {
          // Lomba has a 'kategori' field which indicates SD or SMP.
          if (lomba.kategori !== kat) continue;

          for (const gen of genders) {
            // Filter penilaian for this combination
            const filteredPenilaian = penilaianData.filter(
              (p) => p.lomba?.id === lomba.id && p.peserta?.kategori === kat && p.peserta?.gender === gen
            );

            if (filteredPenilaian.length > 0) {
              const uniqueJuri = [...new Set(filteredPenilaian.map((p) => p.juri?.nama_lengkap))].filter(Boolean);

              const pesertaScores = filteredPenilaian.map((p) => {
                const pData = pesertaData.find((pes) => pes.id === p.peserta?.id);
                return {
                  ...pData,
                  nilai_lomba: p.nilai, // Specific score for this Lomba
                };
              }).filter((p) => p.id); // Remove if pData was not found

              // Sort by specific score descending
              pesertaScores.sort((a, b) => b.nilai_lomba - a.nilai_lomba);

              groups.push({
                lomba,
                kategori: kat,
                gender: gen,
                peserta: pesertaScores,
                juri: uniqueJuri,
              });
            }
          }
        }
      }

      setGroupedData(groups);
    } catch (err) {
      console.error("Failed to fetch rekap data:", err);
      alert("Gagal menarik data: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white font-black text-2xl">
        Memuat Data Rekap...
      </div>
    );
  }

  if (groupedData.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white font-black text-2xl">
        Belum ada data penilaian yang masuk.
      </div>
    );
  }

  return (
    <div className="bg-slate-200 min-h-screen text-black">
      {/* Floating Action Button for Print */}
      <div className="fixed top-6 right-6 no-print z-50">
        <button
          onClick={() => window.print()}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl shadow-2xl flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          CETAK SEKARANG (CTRL+P)
        </button>
      </div>

      {groupedData.map((group, index) => (
        <div 
          key={`${group.lomba.id}-${group.kategori}-${group.gender}`}
          className="bg-white w-full max-w-[210mm] mx-auto shadow-2xl mb-8 print:shadow-none print:mb-0 p-[15mm] relative overflow-hidden font-serif text-[12pt] break-after-page"
        >
          {/* KOP SURAT */}
          <div className="flex items-center justify-between pb-3 mb-6" style={{ borderBottom: "5px double black" }}>
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

          {/* JUDUL */}
          <div className="text-center mb-6">
            <h3 className="font-bold text-[14pt] underline mb-1 uppercase">REKAPITULASI PENILAIAN LOMBA</h3>
            <p className="text-[12pt] font-bold uppercase">CABANG LOMBA: {group.lomba.nama_lomba}</p>
            <p className="text-[11pt] font-semibold uppercase mt-1">
              TINGKAT: {group.kategori} | GOLONGAN: {group.gender === "Laki-laki" ? "PUTRA" : "PUTRI"}
            </p>
          </div>

          {/* TABEL NILAI */}
          <table className="w-full border-collapse border border-black mb-8">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-black p-2 text-center w-12">Peringkat</th>
                <th className="border border-black p-2 text-center w-16">No. Dada</th>
                <th className="border border-black p-2 text-left">Nama Regu</th>
                <th className="border border-black p-2 text-left">Pangkalan / Sekolah</th>
                <th className="border border-black p-2 text-center w-24">Nilai Lomba</th>
              </tr>
            </thead>
            <tbody>
              {group.peserta.map((peserta, idx) => (
                <tr key={peserta.id}>
                  <td className="border border-black p-2 text-center font-bold">{idx + 1}</td>
                  <td className="border border-black p-2 text-center font-mono">{String(peserta.nomor_dada).padStart(3, "0")}</td>
                  <td className="border border-black p-2 font-semibold">{peserta.nama_regu}</td>
                  <td className="border border-black p-2">{peserta.pangkalan}</td>
                  <td className="border border-black p-2 text-center font-bold text-[13pt]">{peserta.nilai_lomba}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* TTD JURI */}
          <div className="flex justify-between text-[12pt] mt-12">
            <div className="w-1/2">
              {/* Kosong */}
            </div>
            <div className="w-1/2 flex flex-col items-center text-center">
              <p className="mb-1">Mekar Baru, {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>
              <p>Dewan Juri</p>
              <p className="mb-20">Cabang {group.lomba.nama_lomba}</p>
              
              <div className="w-64 border-b border-black font-bold text-center pb-1">
                {group.juri.length > 0 ? group.juri.join(" & ") : "( _____________________ )"}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
