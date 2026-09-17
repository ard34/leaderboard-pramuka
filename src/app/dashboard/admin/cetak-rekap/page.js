"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { OFFICIAL_LOMBA_DEFINITIONS, getLombaRubrik, findOfficialLombaDef } from "@/app/dashboard/juri/page";
import { ALL_TEST_PESERTA } from "@/lib/testSchools";
import { parseTimeToMs, getSavedTimeForPesertaLomba } from "@/lib/timeUtils";

// Helper untuk menghitung/mendistribusikan poin rubrik secara proporsional & aman (bebas infinite loop)
function getRubrikPoints(totalScore, rubriks, pesertaId = "", lombaId = "", rankIdx = 0) {
  if (!rubriks || rubriks.length === 0 || totalScore === undefined || totalScore === null) {
    return {};
  }
  const scoreRubriks = rubriks.filter((r) => !r.isTime);
  const timeRubrik = rubriks.find((r) => r.isTime);
  const score = Number(totalScore) || 0;
  const totalMax = scoreRubriks.reduce((sum, r) => sum + (r.max || r.weight || 0), 0);

  const result = {};
  if (scoreRubriks.length > 0 && totalMax > 0) {
    const normalizedRatio = Math.min(1, Math.max(0, score > totalMax ? score / 100 : score / totalMax));
    scoreRubriks.forEach((r) => {
      const maxVal = r.max || r.weight || 100;
      result[r.id] = Math.round(maxVal * normalizedRatio);
    });
  }

  if (timeRubrik) {
    result[timeRubrik.id] = getSavedTimeForPesertaLomba(pesertaId, lombaId, rankIdx, true);
  }

  return result;
}

function buildReportGroups(lombaList, pesertaList, juriList, penilaianList, targetJuriName, targetJuriId) {
  const pesertaMap = new Map(pesertaList.map((p) => [p.id, p]));
  const juriMap = new Map((juriList || []).map((j) => [j.id, j.nama_lengkap]));

  const cleanTargetName = targetJuriName ? targetJuriName.trim().toLowerCase() : null;

  const groups = [];

  for (const lomba of lombaList) {
    for (const kat of ["SD", "SMP"]) {
      for (const gen of ["Laki-laki", "Perempuan"]) {
        // Filter scores for this lomba, category & gender
        const relevantScores = penilaianList.filter((s) => {
          if (s.lomba_id !== lomba.id) return false;
          const p = pesertaMap.get(s.peserta_id);
          if (!p) return false;
          return p.kategori === kat && p.gender === gen;
        });

        if (relevantScores.length === 0) continue;

        const uniqueJuriIds = [...new Set(relevantScores.map((s) => s.juri_id))];

        for (const jId of uniqueJuriIds) {
          if (targetJuriId && jId !== targetJuriId) continue;
          const jName = juriMap.get(jId) || "Dewan Juri";
          if (cleanTargetName && jName.trim().toLowerCase() !== cleanTargetName) continue;

          const thisJuriScores = relevantScores.filter((s) => s.juri_id === jId);
          // Urutkan nilai awal
          thisJuriScores.sort((a, b) => b.nilai - a.nilai);

          const pesertaScores = thisJuriScores
            .map((s, sIdx) => {
              const pData = pesertaMap.get(s.peserta_id);
              if (!pData) return null;
              const savedTime = getSavedTimeForPesertaLomba(s.peserta_id, lomba.id, sIdx, true);
              return {
                ...pData,
                nilai_lomba: s.nilai,
                waktu_pengerjaan: savedTime,
                waktu_ms: parseTimeToMs(savedTime),
              };
            })
            .filter(Boolean);

          // Peringkat 1 s/d seterusnya: Nilai ketepatan tertinggi.
          // Jika nilai sama: Ditentukan dari waktu tercepat (milidetik terendah)!
          pesertaScores.sort((a, b) => {
            if (b.nilai_lomba !== a.nilai_lomba) {
              return b.nilai_lomba - a.nilai_lomba;
            }
            return a.waktu_ms - b.waktu_ms;
          });

          if (pesertaScores.length > 0) {
            groups.push({
              lomba,
              kategori: kat,
              gender: gen,
              peserta: pesertaScores,
              juriName: jName,
            });
          }
        }
      }
    }
  }

  return groups;
}

// Helper untuk menyusun nama file dokumen saat dicetak / Save as PDF
export function sanitizeDocTitle(str) {
  return (str || "").replace(/[\\/:*?"<>|]+/g, "-").replace(/\s+/g, " ").trim();
}

export function getDocumentTitleForGroup(group) {
  if (!group) return "Rekap Nilai Penilaian Lomba - LT II 2026";
  const namaLomba = group.lomba?.nama_lomba || "Lomba";
  const tingkat = group.kategori || "SD";
  const gender = group.gender === "Laki-laki" ? "Putra" : group.gender === "Perempuan" ? "Putri" : (group.gender || "");
  const cleanJuri = (group.juriName || "Dewan Juri").replace(/\s*\(Juri\s*\d+\)/i, "").trim();
  
  return sanitizeDocTitle(`Rekap Nilai - ${namaLomba} - Tingkat ${tingkat} ${gender} - ${cleanJuri}`);
}

export function getDocumentTitleForAll(groups) {
  if (!groups || groups.length === 0) return "Rekap Nilai Lomba LT-II 2026";
  if (groups.length === 1) return getDocumentTitleForGroup(groups[0]);

  const first = groups[0];
  const allSameLomba = groups.every((g) => g.lomba?.nama_lomba === first.lomba?.nama_lomba);
  const allSameKategori = groups.every((g) => g.kategori === first.kategori);
  const allSameGender = groups.every((g) => g.gender === first.gender);
  const allSameJuri = groups.every((g) => g.juriName === first.juriName);

  const namaLomba = first.lomba?.nama_lomba || "Lomba";
  const tingkat = first.kategori || "SD";
  const gender = first.gender === "Laki-laki" ? "Putra" : first.gender === "Perempuan" ? "Putri" : (first.gender || "");
  const cleanJuri = (first.juriName || "Dewan Juri").replace(/\s*\(Juri\s*\d+\)/i, "").trim();

  if (allSameLomba && allSameKategori && allSameGender && allSameJuri) {
    return sanitizeDocTitle(`Rekap Nilai - ${namaLomba} - Tingkat ${tingkat} ${gender} - ${cleanJuri}`);
  }
  if (allSameLomba && allSameKategori && allSameGender) {
    return sanitizeDocTitle(`Rekap Nilai - ${namaLomba} - Tingkat ${tingkat} ${gender} - Semua Juri`);
  }
  if (allSameLomba && allSameJuri) {
    return sanitizeDocTitle(`Rekap Nilai - ${namaLomba} - Semua Tingkat - ${cleanJuri}`);
  }
  if (allSameLomba) {
    return sanitizeDocTitle(`Rekap Nilai - ${namaLomba} - Semua Tingkat & Juri`);
  }
  if (allSameJuri) {
    return sanitizeDocTitle(`Rekap Nilai - Semua Lomba - ${cleanJuri}`);
  }
  return sanitizeDocTitle(`Rekap Nilai Semua Lomba LT-II 2026 - Mekar Baru`);
}

export default function CetakRekapPerJuri() {
  const [loading, setLoading] = useState(true);
  const [groupedData, setGroupedData] = useState([]);
  const [selectedPrintIndex, setSelectedPrintIndex] = useState(null);

  useEffect(() => {
    fetchRekapData();
  }, []);

  // Update document.title agar saat klik cetak / Save as PDF, nama file langsung sesuai lomba, tingkat, dan juri
  useEffect(() => {
    if (groupedData.length > 0) {
      if (selectedPrintIndex !== null && groupedData[selectedPrintIndex]) {
        document.title = getDocumentTitleForGroup(groupedData[selectedPrintIndex]);
      } else {
        document.title = getDocumentTitleForAll(groupedData);
      }
    }
  }, [groupedData, selectedPrintIndex]);

  // Pasang listener sebelum print (misal user tekan Ctrl+P dari browser)
  useEffect(() => {
    const handleBeforePrint = () => {
      if (selectedPrintIndex !== null && groupedData[selectedPrintIndex]) {
        document.title = getDocumentTitleForGroup(groupedData[selectedPrintIndex]);
      } else if (groupedData.length > 0) {
        document.title = getDocumentTitleForAll(groupedData);
      }
    };
    window.addEventListener("beforeprint", handleBeforePrint);
    return () => window.removeEventListener("beforeprint", handleBeforePrint);
  }, [selectedPrintIndex, groupedData]);

  const fetchRekapData = async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const targetJuriName = urlParams.get("juriName");
      const targetJuriId = urlParams.get("juriId");

      // 0. INSTANT MEMORY CACHE: If opened from Admin Dashboard, render in <5ms!
      let cached = null;
      try {
        const raw = localStorage.getItem("_cetak_cache");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && parsed.lombaList && parsed.penilaianList && Date.now() - (parsed.ts || 0) < 15 * 60 * 1000) {
            cached = parsed;
          }
        }
      } catch (_) {}

      if (cached) {
        let pesertaData = [...(cached.pesertaList || [])];
        if (pesertaData.length === 0) {
          pesertaData = [...ALL_TEST_PESERTA];
        }

        const groups = buildReportGroups(
          cached.lombaList,
          pesertaData,
          cached.juriList,
          cached.penilaianList,
          targetJuriName,
          targetJuriId
        );

        if (groups.length > 0) {
          setGroupedData(groups);
          setLoading(false);
          return;
        }
      }

      // If no valid cache or cache was empty, proceed to fast parallel fetch
      setLoading(true);

      // 1. Fetch Lomba, Peserta, and Profiles in PARALLEL
      const [lombaRes, pesertaRes, profilesRes] = await Promise.all([
        supabase.from("lomba").select("id, nama_lomba, kode_lomba, kategori").order("id", { ascending: true }),
        supabase.from("peserta").select("id, nomor_dada, nama_regu, pangkalan, kategori, gender").eq("is_verified", true),
        supabase.from("profiles").select("id, nama_lengkap, role"),
      ]);

      if (lombaRes.error) throw lombaRes.error;
      if (pesertaRes.error) throw pesertaRes.error;

      const lombaData = lombaRes.data || [];
      const profilesData = profilesRes.data || [];

      let pesertaData = [...(pesertaRes.data || [])];
      if (pesertaData.length === 0) {
        pesertaData = [...ALL_TEST_PESERTA];
      }

      // 2. High-speed Penilaian Fetch
      let penilaianData = [];
      const effectiveJuriId = targetJuriId || (targetJuriName ? profilesData.find((p) => p.nama_lengkap?.trim().toLowerCase() === targetJuriName.trim().toLowerCase())?.id : null);

      if (effectiveJuriId) {
        const { data: juriScores, error: errPenilaian } = await supabase
          .from("penilaian")
          .select("id, peserta_id, juri_id, lomba_id, nilai")
          .eq("juri_id", effectiveJuriId);
        if (errPenilaian) throw errPenilaian;
        penilaianData = juriScores || [];
      } else {
        // Fetch in parallel chunks
        const [chunk1Res, chunk2Res] = await Promise.all([
          supabase.from("penilaian").select("id, peserta_id, juri_id, lomba_id, nilai").range(0, 999),
          supabase.from("penilaian").select("id, peserta_id, juri_id, lomba_id, nilai").range(1000, 1999),
        ]);
        penilaianData = [...(chunk1Res.data || []), ...(chunk2Res.data || [])];
      }

      // 3. Merge local offline scores if any
      try {
        if (typeof window !== "undefined") {
          const offlineScores = JSON.parse(localStorage.getItem("offline_penilaian") || "[]");
          offlineScores.forEach((off) => {
            if (!penilaianData.some((p) => p.peserta_id === off.peserta_id && p.lomba_id === off.lomba_id && p.juri_id === off.juri_id)) {
              if (!effectiveJuriId || off.juri_id === effectiveJuriId) {
                penilaianData.push(off);
              }
            }
          });
        }
      } catch (_) {}

      // 4. Group data efficiently
      const groups = buildReportGroups(
        lombaData,
        pesertaData,
        profilesData,
        penilaianData,
        targetJuriName,
        effectiveJuriId
      );

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
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white font-sans p-6 text-center space-y-4">
        <div className="w-14 h-14 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin shadow-[0_0_25px_rgba(245,166,35,0.4)]" />
        <h2 className="text-xl md:text-2xl font-black tracking-wider uppercase text-amber-400">
          Menyiapkan Lembar Rekap Nilai Resmi...
        </h2>
        <p className="text-xs text-slate-400 max-w-md">
          Mengambil data penilaian, menghitung pembagian rubrik, dan menyusun format cetak juknis secara instan.
        </p>
      </div>
    );
  }

  if (groupedData.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white font-sans p-6 text-center space-y-5">
        <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center text-2xl text-amber-400 shadow-[0_0_20px_rgba(245,166,35,0.2)]">
          📋
        </div>
        <div className="space-y-1.5">
          <h2 className="text-xl font-black uppercase text-white">Belum Ada Data Penilaian</h2>
          <p className="text-xs text-slate-400 max-w-md">
            Belum ada nilai yang masuk untuk juri atau mata lomba ini. Silakan input nilai terlebih dahulu di Panel Penilaian.
          </p>
        </div>
        <div className="flex gap-3">
          <a
            href="/dashboard/admin"
            className="text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-xl border border-slate-700 transition-all shadow"
          >
            ← Kembali ke Panel Admin
          </a>
          <a
            href="/dashboard/admin/cetak-rekap"
            className="text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 px-5 py-2.5 rounded-xl transition-all shadow"
          >
            Lihat Semua Juri
          </a>
        </div>
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
            const title = getDocumentTitleForAll(groupedData);
            document.title = title;
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
          @page {
            size: A4 portrait;
            margin: 6mm 6mm 6mm 6mm;
          }
          html, body {
            background: #ffffff !important;
            color: #000000 !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print { display: none !important; }
          .print-hidden { display: none !important; }
          .sheet-container {
            width: 100% !important;
            max-width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
            overflow: visible !important;
            page-break-after: always !important;
            break-after: page !important;
          }
          table {
            width: 100% !important;
            max-width: 100% !important;
            border-collapse: collapse !important;
            table-layout: auto !important;
          }
          th, td {
            border: 1px solid #000000 !important;
            padding: 2px 2px !important;
            word-break: normal !important;
            box-sizing: border-box !important;
          }
          thead {
            display: table-header-group !important;
          }
          tr {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .ttd-box {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            margin-top: 1.2rem !important;
          }
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
                  const title = getDocumentTitleForGroup(group);
                  document.title = title;
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
              className={`sheet-container bg-white w-full max-w-[210mm] mx-auto shadow-2xl p-4 md:p-[8mm] print:p-0 print:m-0 print:max-w-none print:w-full overflow-visible font-serif break-after-page print:shadow-none print:break-inside-avoid print:page-break-after-always ${isHiddenDuringPrint ? 'print-hidden' : ''}`}
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
              const def = findOfficialLombaDef(group.lomba);
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
            const def = findOfficialLombaDef(group.lomba);
            const rubriks = getLombaRubrik(def, group.kategori);
            const isDense = rubriks.length >= 4;
            
            return (
              <div className="w-full overflow-x-auto print:overflow-x-visible">
                <table className={`w-full border-collapse border border-black mb-6 ${isDense ? 'text-[8pt] leading-tight' : 'text-[9.5pt] leading-normal'}`}>
                  <thead>
                    <tr className="bg-gray-100">
                      <th className={`border border-black text-center font-bold ${isDense ? 'p-1 w-6 text-[7.5pt]' : 'p-2 w-10 text-[9pt]'}`}>No</th>
                      <th className={`border border-black text-center font-bold ${isDense ? 'p-1 text-[8pt] min-w-[70px]' : 'p-2 text-[9pt]'}`}>Nama Regu</th>
                      <th className={`border border-black text-center font-bold ${isDense ? 'p-1 text-[8pt] min-w-[80px]' : 'p-2 text-[9pt]'}`}>Pangkalan</th>
                      {rubriks.map((r) => (
                        <th key={r.id} className={`border border-black text-center font-bold ${isDense ? 'p-1 text-[7.5pt]' : 'p-1.5 text-[8.5pt]'} ${r.isTime ? 'min-w-[65px]' : ''}`}>
                          <div>{r.name}</div>
                          {!r.name.includes("(") && (
                            <div className={`${isDense ? 'text-[6.5pt]' : 'text-[7.5pt]'} font-normal text-gray-600`}>
                              {r.isTime ? "(Waktu)" : `(Maks ${r.max})`}
                            </div>
                          )}
                        </th>
                      ))}
                      <th className={`border border-black text-center font-bold ${isDense ? 'p-1 w-14 text-[8pt]' : 'p-2 w-20 text-[9pt]'}`}>Total Nilai</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.peserta.map((peserta, idx) => {
                      let rubrikPoints = {};
                      try {
                        const saved =
                          typeof window !== "undefined"
                            ? localStorage.getItem(`rubrik_scores_${peserta.id}_${group.lomba.id}`)
                            : null;
                        if (saved) {
                          rubrikPoints = JSON.parse(saved);
                        }
                      } catch (_) {}

                      if (Object.keys(rubrikPoints).length === 0) {
                        rubrikPoints = getRubrikPoints(peserta.nilai_lomba, rubriks, peserta.id, group.lomba.id, idx);
                      }

                      return (
                        <tr key={peserta.id}>
                          <td className={`border border-black text-center ${isDense ? 'p-1 text-[8pt]' : 'p-2 text-[9.5pt]'}`}>{idx + 1}</td>
                          <td className={`border border-black font-bold ${isDense ? 'p-1 text-[8pt]' : 'p-2 text-[9.5pt]'}`}>
                            {peserta.nama_regu}
                          </td>
                          <td className={`border border-black text-gray-800 ${isDense ? 'p-1 text-[7.5pt]' : 'p-2 text-[8.5pt]'}`}>
                            {peserta.pangkalan}
                          </td>
                          {rubriks.map((r) => {
                            let val = rubrikPoints[r.id];
                            if ((val === undefined || val === null || val === "" || val === "—") && r.isTime) {
                              val = peserta.waktu_pengerjaan || getSavedTimeForPesertaLomba(peserta.id, group.lomba.id, idx, true);
                            }
                            let displayVal = val || "—";
                            return (
                              <td key={r.id} className={`border border-black text-center font-bold ${isDense ? 'p-1 text-[8pt]' : 'p-1.5 text-[9.5pt]'} ${r.isTime ? 'font-mono text-[7.5pt] whitespace-nowrap' : ''}`}>
                                {displayVal}
                              </td>
                            );
                          })}
                          <td className={`border border-black text-center font-black bg-gray-50 ${isDense ? 'p-1 text-[9pt]' : 'p-2 text-[11pt]'}`}>
                            {peserta.nilai_lomba}
                          </td>
                        </tr>
                      );
                    })}
                    {/* Tambahan baris kosong jika peserta sedikit untuk format form */}
                    {group.peserta.length < 5 && Array.from({ length: 5 - group.peserta.length }).map((_, i) => (
                      <tr key={`empty-${i}`}>
                        <td className="border border-black p-1 text-center"></td>
                        <td className="border border-black p-1"></td>
                        <td className="border border-black p-1"></td>
                        {rubriks.map(r => <td key={`empty-r-${r.id}`} className="border border-black p-1 text-center"></td>)}
                        <td className="border border-black p-1 text-center"></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })()}

          {/* TTD JURI */}
          <div className="flex justify-between text-[11pt] mt-6 ttd-box">
            <div className="w-1/2">
              {/* Kosong */}
            </div>
            <div className="w-1/2 flex flex-col items-center text-center">
              <p className="mb-1">Mekar Baru, {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>
              <p className="font-bold">Dewan Juri</p>
              <p className="mb-16 font-bold">Cabang {group.lomba.nama_lomba}</p>
              
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
