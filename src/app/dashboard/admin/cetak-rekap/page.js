"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { OFFICIAL_LOMBA_DEFINITIONS, getLombaRubrik, findOfficialLombaDef } from "@/app/dashboard/juri/page";
import { parseTimeToMs, getSavedTimeForPesertaLomba, isZeroOrEmptyTime, comparePesertaByScoreAndTime } from "@/lib/timeUtils";
import { getRubrikForLomba } from "@/lib/catatanBerkasUtils";

// Helper untuk menghitung/mendistribusikan poin rubrik secara proporsional & aman (bebas infinite loop)
function getRubrikPoints(totalScore, rubriks, pesertaId = "", lombaId = "", pesertaWaktu = "") {
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
    // Konsisten gunakan waktu asli peserta, jika 00:00:00.00 atau kosong maka tetap kosong
    result[timeRubrik.id] = isZeroOrEmptyTime(pesertaWaktu) ? "" : String(pesertaWaktu).trim();
  }

  return result;
}

function buildReportGroups(lombaList, pesertaList, juriList, penilaianList, targetJuriName, targetJuriId) {
  const pesertaMap = new Map(pesertaList.map((p) => [p.id, p]));
  const juriMap = new Map((juriList || []).map((j) => [j.id, j.nama_lengkap]));

  const cleanTargetName = targetJuriName ? targetJuriName.trim().toLowerCase() : null;

  // Temukan target juri jika spesifik dipilih
  const targetJuri = (juriList || []).find((j) => {
    if (targetJuriId && j.id === targetJuriId) return true;
    if (cleanTargetName && j.nama_lengkap?.trim().toLowerCase() === cleanTargetName) return true;
    return false;
  });

  // Petakan seluruh definisi cabang lomba resmi
  const officialDefs = OFFICIAL_LOMBA_DEFINITIONS;

  // Jika target juri spesifik dipilih, tentukan cabang lomba yang dinilai
  let selectedDefs = officialDefs;
  if (targetJuri) {
    const juriLombaId = targetJuri.assigned_lomba_id;
    const juriLombaObj = lombaList.find((l) => l.id === juriLombaId);
    const juriLombaDef = juriLombaObj ? findOfficialLombaDef(juriLombaObj) : null;

    const juriNameLower = (targetJuri.nama_lengkap || "").toLowerCase();
    const nameKeywords = [
      { key: "semap", kode: "SMP" },
      { key: "morse", kode: "MRS" },
      { key: "pioner", kode: "PNR" },
      { key: "sandi", kode: "SND" },
      { key: "taksir", kode: "TKS" },
      { key: "naviga", kode: "NAV" },
      { key: "ppgd", kode: "PGD" },
      { key: "pppk", kode: "PGD" },
      { key: "tari", kode: "TSB" },
      { key: "seni", kode: "TSB" },
      { key: "hymne", kode: "HMN" },
      { key: "suara", kode: "HMN" },
      { key: "masak", kode: "MSK" },
      { key: "administrasi", kode: "ADM" },
      { key: "karnaval", kode: "KRN" },
      { key: "forum", kode: "FRP" },
      { key: "kim", kode: "KIM" },
      { key: "obat", kode: "KIM" },
    ];
    const matchedKeyword = nameKeywords.find((k) => juriNameLower.includes(k.key));

    const targetKode = juriLombaDef?.kode || (matchedKeyword ? matchedKeyword.kode : null);

    if (targetKode) {
      selectedDefs = officialDefs.filter((d) => d.kode === targetKode);
    } else if (juriLombaId) {
      const matched = lombaList.find((l) => l.id === juriLombaId);
      const def = matched ? findOfficialLombaDef(matched) : null;
      if (def) selectedDefs = [def];
    }
  }

  const groups = [];

  for (const def of selectedDefs) {
    // Ambil seluruh row lomba di DB yang sesuai dengan cabang lomba ini (baik SD maupun SMP)
    const matchingLombas = lombaList.filter((l) => {
      const lDef = findOfficialLombaDef(l);
      return (
        lDef?.kode === def.kode ||
        l.kode_lomba?.toUpperCase() === def.kode ||
        l.nama_lomba.toLowerCase().includes(def.nama_lomba.toLowerCase())
      );
    });
    const matchingLombaIds = new Set(matchingLombas.map((l) => l.id));

    // Setiap juri cabang lomba bertugas sesuai penugasan di DB (assigned_kategori & assigned_gender)
    for (const kat of ["SD", "SMP"]) {
      // Cek apakah tingkat ini diizinkan untuk juri ini sesuai penugasan di database
      const isKatAllowed =
        !targetJuri?.assigned_kategori ||
        targetJuri.assigned_kategori === "SEMUA" ||
        targetJuri.assigned_kategori === kat;

      // Jika juri spesifik tidak ditugaskan untuk tingkat ini, lewati!
      if (targetJuri && !isKatAllowed) {
        continue;
      }

      // Cek apakah tingkat ini ada peserta terdaftar/diverifikasi di database
      const hasPesertaInKat = pesertaList.some((p) => p.kategori === kat && p.is_verified);
      const hasScoreInKat = (penilaianList || []).some((s) => {
        const p = pesertaMap.get(s.peserta_id);
        return p && p.kategori === kat;
      });

      // Jika di database tidak ada peserta atau nilai untuk tingkat ini, lewati!
      if (!hasPesertaInKat && !hasScoreInKat) {
        continue;
      }

      for (const gen of ["Laki-laki", "Perempuan"]) {
        // Cek apakah gender ini diizinkan untuk juri ini sesuai penugasan di database
        const isGenAllowed =
          !targetJuri?.assigned_gender ||
          targetJuri.assigned_gender === "SEMUA" ||
          targetJuri.assigned_gender === gen;

        // Jika juri spesifik tidak ditugaskan untuk gender ini, lewati!
        if (targetJuri && !isGenAllowed) {
          continue;
        }

        // Cek apakah ada peserta untuk kombinasi tingkat dan gender ini di database
        const catPeserta = pesertaList
          .filter((p) => p.kategori === kat && p.gender === gen && p.is_verified)
          .sort((a, b) => (Number(a.nomor_dada) || 0) - (Number(b.nomor_dada) || 0));

        // Ambil nilai relevan untuk kombinasi lomba, tingkat (SD/SMP), dan gender ini
        const relevantScores = (penilaianList || []).filter((s) => {
          if (matchingLombaIds.size > 0 && !matchingLombaIds.has(s.lomba_id)) {
            const sLomba = lombaList.find((l) => l.id === s.lomba_id);
            if (!sLomba || findOfficialLombaDef(sLomba)?.kode !== def.kode) return false;
          }
          if (targetJuriId && s.juri_id !== targetJuriId) return false;
          const p = pesertaMap.get(s.peserta_id);
          if (!p) return false;
          return p.kategori === kat && p.gender === gen;
        });

        // Sinkronkan dengan isi database: jika tidak ada peserta terdaftar dan tidak ada nilai, jangan masukkan di cetak laporan!
        if (catPeserta.length === 0 && relevantScores.length === 0) {
          continue;
        }

        // Tentukan nama juri penanggung jawab
        let displayJuriName = targetJuri?.nama_lengkap || targetJuriName || null;
        if (!displayJuriName && relevantScores.length > 0) {
          displayJuriName = juriMap.get(relevantScores[0].juri_id) || "Dewan Juri";
        }
        if (!displayJuriName) {
          displayJuriName = "Dewan Juri";
        }

        let pesertaScores = [];
        if (relevantScores.length > 0) {
          pesertaScores = relevantScores
            .map((s) => {
              const pData = pesertaMap.get(s.peserta_id);
              if (!pData) return null;
              // Ambil waktu asli tersimpan atau waktu deterministik peserta
              const savedTime = getSavedTimeForPesertaLomba(s.peserta_id, s.lomba_id || matchingLombas[0]?.id, 0, true);
              const waktuClean = isZeroOrEmptyTime(savedTime) ? "" : String(savedTime).trim();
              return {
                ...pData,
                nilai_lomba: s.nilai,
                waktu_pengerjaan: waktuClean,
                waktu_ms: parseTimeToMs(waktuClean),
              };
            })
            .filter(Boolean);

          // Peringkat 1 s/d seterusnya:
          pesertaScores.sort(comparePesertaByScoreAndTime);
        } else if (catPeserta.length > 0) {
          // Jika belum ada nilai, buat lembar rekap kosong siap nilai untuk peserta yang terdaftar di database
          pesertaScores = catPeserta.map((p) => ({
            ...p,
            nilai_lomba: "",
            waktu_pengerjaan: "",
            waktu_ms: Infinity,
          }));
        }

        // Masukkan group HANYA jika memiliki baris peserta yang sah
        if (pesertaScores.length > 0) {
          const matchedLombaForKat = matchingLombas.find((l) => l.kategori === kat) || matchingLombas[0] || {
            id: `lomba-${def.kode}-${kat}`,
            nama_lomba: def.nama_lomba,
            kode_lomba: def.kode,
            kategori: kat,
          };

          groups.push({
            lomba: {
              ...matchedLombaForKat,
              nama_lomba: def.nama_lomba,
              kategori: kat,
            },
            kategori: kat,
            gender: gen,
            peserta: pesertaScores,
            juriName: displayJuriName,
          });
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
      // Autentikasi sesi resmi dari Supabase Auth
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        window.location.href = "/login";
        return;
      }

      const urlParams = new URLSearchParams(window.location.search);
      const targetJuriName = urlParams.get("juriName");
      const targetJuriId = urlParams.get("juriId");

      // Sinkronkan catatan waktu tersimpan dari server agar juri dan admin selalu selaras
      try {
        const waktuRes = await fetch("/api/juri/waktu");
        if (waktuRes.ok) {
          const waktuJson = await waktuRes.json();
          if (waktuJson && waktuJson.times) {
            const allTime = JSON.parse(localStorage.getItem("all_time_scores") || "{}");
            const merged = { ...allTime, ...waktuJson.times };
            localStorage.setItem("all_time_scores", JSON.stringify(merged));
          }
        }
      } catch (_) {}

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
        const validLomba = (cached.lombaList || []).filter((l) =>
          OFFICIAL_LOMBA_DEFINITIONS.some((d) => d.kode === l.kode_lomba?.toUpperCase())
        );

        if (pesertaData.length > 0) {
          const groups = buildReportGroups(
            validLomba,
            pesertaData,
            cached.juriList,
            cached.penilaianList,
            targetJuriName,
            targetJuriId
          );

          if (groups.length > 0) {
            setGroupedData(groups);
            setLoading(false);
          }
        }
      }

      // 1. Fetch Lomba, Peserta, and Profiles in PARALLEL from Supabase
      const [lombaRes, pesertaRes, profilesRes] = await Promise.all([
        supabase.from("lomba").select("id, nama_lomba, kode_lomba, kategori").order("id", { ascending: true }),
        supabase.from("peserta").select("id, nomor_dada, nama_regu, pangkalan, kategori, gender, catatan_berkas").eq("is_verified", true),
        supabase.from("profiles").select("id, nama_lengkap, role, assigned_lomba_id, assigned_kategori, assigned_gender"),
      ]);

      if (lombaRes.error) throw lombaRes.error;
      if (pesertaRes.error) throw pesertaRes.error;

      const lombaData = (lombaRes.data || []).filter((l) =>
        OFFICIAL_LOMBA_DEFINITIONS.some((d) => d.kode === l.kode_lomba?.toUpperCase())
      );
      const profilesData = profilesRes.data || [];
      let pesertaData = [...(pesertaRes.data || [])];

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
        const [chunk1Res, chunk2Res, chunk3Res, chunk4Res] = await Promise.all([
          supabase.from("penilaian").select("id, peserta_id, juri_id, lomba_id, nilai").range(0, 999),
          supabase.from("penilaian").select("id, peserta_id, juri_id, lomba_id, nilai").range(1000, 1999),
          supabase.from("penilaian").select("id, peserta_id, juri_id, lomba_id, nilai").range(2000, 2999),
          supabase.from("penilaian").select("id, peserta_id, juri_id, lomba_id, nilai").range(3000, 3999),
        ]);
        penilaianData = [
          ...(chunk1Res.data || []),
          ...(chunk2Res.data || []),
          ...(chunk3Res.data || []),
          ...(chunk4Res.data || []),
        ];
      }

      // 3. Merge local offline scores if any
      try {
        if (typeof window !== "undefined") {
          const rawOffline = JSON.parse(localStorage.getItem("offline_penilaian") || "[]");
          const offlineScores = rawOffline.filter((off) => pesertaData.some((p) => p.id === off.peserta_id));
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
      const freshGroups = buildReportGroups(
        lombaData,
        pesertaData,
        profilesData,
        penilaianData,
        targetJuriName,
        effectiveJuriId
      );

      if (freshGroups.length > 0) {
        setGroupedData(freshGroups);
      }
    } catch (err) {
      console.error("Failed to fetch rekap data:", err);
      // Jangan alert jika cached data sudah tampil dengan baik
      if (groupedData.length === 0) {
        alert("Gagal menarik data: " + err.message);
      }
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
                      // 1. Coba ambil dari localStorage (cache lokal juri)
                      try {
                        const saved =
                          typeof window !== "undefined"
                            ? localStorage.getItem(`rubrik_scores_${peserta.id}_${group.lomba.id}`)
                            : null;
                        if (saved) {
                          rubrikPoints = JSON.parse(saved);
                        }
                      } catch (_) {}

                      // 2. Fallback: ambil dari catatan_berkas di cloud (Supabase)
                      if (Object.keys(rubrikPoints).length === 0 && peserta.catatan_berkas) {
                        try {
                          const cloudRubrik = getRubrikForLomba(peserta.catatan_berkas, group.lomba.id);
                          if (cloudRubrik && typeof cloudRubrik === "object" && Object.keys(cloudRubrik).length > 0) {
                            rubrikPoints = cloudRubrik;
                          }
                        } catch (_) {}
                      }

                      // 3. Terakhir: distribusikan secara proporsional dari total nilai
                      if (Object.keys(rubrikPoints).length === 0) {
                        rubrikPoints = getRubrikPoints(peserta.nilai_lomba, rubriks, peserta.id, group.lomba.id, peserta.waktu_pengerjaan);
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
                            let displayVal = "—";
                            if (r.isTime) {
                              const rawWaktu = peserta.waktu_pengerjaan || rubrikPoints[r.id];
                              displayVal = isZeroOrEmptyTime(rawWaktu) ? "—" : String(rawWaktu).trim();
                            } else {
                              const rawScore = rubrikPoints[r.id];
                              displayVal = (rawScore !== undefined && rawScore !== null && rawScore !== "") ? rawScore : "—";
                            }

                            return (
                              <td key={r.id} className={`border border-black text-center font-bold ${isDense ? 'p-1 text-[8pt]' : 'p-1.5 text-[9.5pt]'} ${r.isTime ? 'font-mono text-[7.5pt] whitespace-nowrap' : ''}`}>
                                {displayVal}
                              </td>
                            );
                          })}
                          <td className={`border border-black text-center font-black bg-gray-50 ${isDense ? 'p-1 text-[9pt]' : 'p-2 text-[11pt]'}`}>
                            {peserta.nilai_lomba !== undefined && peserta.nilai_lomba !== null && peserta.nilai_lomba !== "" ? peserta.nilai_lomba : "—"}
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
