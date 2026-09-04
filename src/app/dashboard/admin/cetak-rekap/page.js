"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { OFFICIAL_LOMBA_DEFINITIONS } from "@/app/dashboard/juri/page";

export default function CetakRekapPerJuri() {
  const [loading, setLoading] = useState(true);
  const [groupedData, setGroupedData] = useState([]);
  const [selectedPrintIndex, setSelectedPrintIndex] = useState(null);

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
      
      const urlParams = new URLSearchParams(window.location.search);
      const targetJuriName = urlParams.get("juriName");

      // Generate groups
      for (const lomba of lombaData) {
        for (const kat of levels) {
          // Lomba has a 'kategori' field which indicates SD or SMP.
          if (lomba.kategori !== kat) continue;

          for (const gen of genders) {
            // Filter penilaian for this combination
            const baseFilteredPenilaian = penilaianData.filter(
              (p) => p.lomba?.id === lomba.id && p.peserta?.kategori === kat && p.peserta?.gender === gen
            );

              if (baseFilteredPenilaian.length > 0) {
                const uniqueJuriNames = [...new Set(baseFilteredPenilaian.map((p) => p.juri?.nama_lengkap))].filter(Boolean);

                // Buat grup untuk SETIAP juri
                for (const juriName of uniqueJuriNames) {
                  if (targetJuriName && juriName !== targetJuriName) continue; // Filter untuk Cetak Individual

                  const juriPenilaian = baseFilteredPenilaian.filter(p => p.juri?.nama_lengkap === juriName);

                const pesertaScores = juriPenilaian.map((p) => {
                  const pData = pesertaData.find((pes) => pes.id === p.peserta?.id);
                  return {
                    ...pData,
                    nilai_lomba: p.nilai, // Specific score for this Lomba given by this Juri
                  };
                }).filter((p) => p.id); // Remove if pData was not found

                // Sort by specific score descending
                pesertaScores.sort((a, b) => b.nilai_lomba - a.nilai_lomba);

                groups.push({
                  lomba,
                  kategori: kat,
                  gender: gen,
                  peserta: pesertaScores,
                  juriName: juriName,
                });
              }
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
      {/* Floating Action Button for Print All */}
      <div className="fixed top-6 right-6 no-print z-50 flex flex-col gap-3">
        <button
          onClick={() => {
            setSelectedPrintIndex(null);
            setTimeout(() => window.print(), 100);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl shadow-2xl flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          CETAK SEMUA JURI SEKALIGUS
        </button>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          .no-print { display: none !important; }
          .print-hidden { display: none !important; }
        }
      `}} />

      {groupedData.map((group, index) => {
        const isHiddenDuringPrint = selectedPrintIndex !== null && selectedPrintIndex !== index;
        return (
          <div key={`${group.lomba.id}-${group.kategori}-${group.gender}-${group.juriName}`} className="mb-8 print:mb-0 relative">
            
            {/* Tombol Cetak Individual */}
            <div className="text-center mb-4 no-print">
              <button
                onClick={() => {
                  setSelectedPrintIndex(index);
                  setTimeout(() => window.print(), 100);
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-6 rounded-lg shadow-md inline-flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                CETAK JURI INI SAJA ({group.juriName})
              </button>
            </div>

            <div 
              className={`bg-white w-full max-w-[210mm] mx-auto shadow-2xl p-[15mm] overflow-hidden font-serif text-[12pt] break-after-page print:shadow-none print:break-inside-avoid print:page-break-after-always ${isHiddenDuringPrint ? 'print-hidden' : ''}`}
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
            <h3 className="font-bold text-[14pt] mb-1 uppercase">FORMAT REKAPITULASI PENILAIAN</h3>
            <h3 className="font-bold text-[14pt] mb-1 uppercase">LOMBA LT-II 2026</h3>
            <h3 className="font-bold text-[14pt] mb-6 uppercase">KWARTIR RANTING MEKAR BARU</h3>
            
            {(() => {
              const def = OFFICIAL_LOMBA_DEFINITIONS.find(d => d.nama_lomba.toLowerCase() === group.lomba.nama_lomba.toLowerCase() || group.lomba.nama_lomba.toLowerCase().includes(d.nama_lomba.toLowerCase()));
              return (
                <div className="text-left">
                  <h4 className="font-bold text-[13pt] mb-2">{def ? `Kelompok ${def.kategori_kelompok}` : ""}</h4>
                  <p className="font-bold text-[12pt] mb-2">
                    Lomba {group.lomba.nama_lomba} (Tingkat: {group.kategori} {group.gender === "Laki-laki" ? "PUTRA" : "PUTRI"})
                  </p>
                </div>
              );
            })()}
          </div>

          {/* TABEL NILAI */}
          {(() => {
            const def = OFFICIAL_LOMBA_DEFINITIONS.find(d => d.nama_lomba.toLowerCase() === group.lomba.nama_lomba.toLowerCase() || group.lomba.nama_lomba.toLowerCase().includes(d.nama_lomba.toLowerCase()));
            const rubriks = def ? def.rubrik : [];
            
            return (
              <table className="w-full border-collapse border border-black mb-8 text-[11pt]">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-black p-2 text-center w-12 font-bold">No</th>
                    <th className="border border-black p-2 text-center font-bold">Nama Regu / Pangkalan</th>
                    {rubriks.map(r => (
                      <th key={r.id} className="border border-black p-2 text-center font-bold w-20">
                        {r.name} ({r.min}-{r.max})
                      </th>
                    ))}
                    <th className="border border-black p-2 text-center font-bold w-24">Total Nilai</th>
                  </tr>
                </thead>
                <tbody>
                  {group.peserta.map((peserta, idx) => (
                    <tr key={peserta.id}>
                      <td className="border border-black p-2 text-center">{idx + 1}</td>
                      <td className="border border-black p-2">
                        <div className="font-bold">{peserta.nama_regu}</div>
                        <div className="text-[10pt] text-gray-700">{peserta.pangkalan}</div>
                      </td>
                      {rubriks.map(r => (
                        <td key={r.id} className="border border-black p-2 text-center">
                          {/* Dikosongkan sesuai format manual Juklak Juknis */}
                        </td>
                      ))}
                      <td className="border border-black p-2 text-center font-bold text-[12pt]">
                        {peserta.nilai_lomba}
                      </td>
                    </tr>
                  ))}
                  {/* Tambahan baris kosong jika peserta sedikit untuk format form */}
                  {group.peserta.length < 5 && Array.from({ length: 5 - group.peserta.length }).map((_, i) => (
                    <tr key={`empty-${i}`}>
                      <td className="border border-black p-4 text-center"></td>
                      <td className="border border-black p-4"></td>
                      {rubriks.map(r => <td key={`empty-r-${r.id}`} className="border border-black p-4"></td>)}
                      <td className="border border-black p-4"></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            );
          })()}

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
                {group.juriName || "( _____________________ )"}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  })}
  </div>
  );
}
