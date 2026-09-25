"use client";

import React, { useEffect, useState, useMemo, Suspense } from "react";
import { createClient } from "@supabase/supabase-js";
import { useSearchParams, useRouter } from "next/navigation";
import { getNoGudepByGender } from "@/lib/gudepUtils";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

function CetakBuktiSemuaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL Query Parameters filter initial state
  const initialTingkat = searchParams.get("tingkat") || "ALL";
  const initialGender = searchParams.get("gender") || "ALL";

  const [filterTingkat, setFilterTingkat] = useState(initialTingkat);
  const [filterGender, setFilterGender] = useState(initialGender);
  const [sortOption, setSortOption] = useState("KAPLING"); // "KAPLING" (001-akhir) atau "KATEGORI"
  const [searchQuery, setSearchQuery] = useState("");

  const [pesertaList, setPesertaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Coba ambil dari database Supabase
        const { data, error: err } = await supabase
          .from("peserta")
          .select("*")
          .eq("is_verified", true)
          .order("nomor_dada", { ascending: true });

        if (err) throw err;
        setPesertaList(data || []);
      } catch (err) {
        console.error("Gagal fetch data peserta dari Supabase:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter & Urutkan: SD -> SMP, Putra -> Putri, No Kapling urut
  const filteredPeserta = useMemo(() => {
    let list = [...pesertaList];

    if (filterTingkat !== "ALL") {
      list = list.filter((p) => p.kategori === filterTingkat);
    }

    if (filterGender !== "ALL") {
      list = list.filter((p) => p.gender === filterGender);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.nama_regu?.toLowerCase().includes(q) ||
          p.pangkalan?.toLowerCase().includes(q) ||
          p.no_gudep?.toLowerCase().includes(q) ||
          String(p.nomor_dada || "").includes(q)
      );
    }

    // Urutkan sistematis:
    // Default: Urut murni berdasarkan nomor kapling (001 sampai akhir)
    return list.sort((a, b) => {
      const numA = parseInt(String(a.nomor_dada || "9999").replace(/\D/g, ""), 10) || 9999;
      const numB = parseInt(String(b.nomor_dada || "9999").replace(/\D/g, ""), 10) || 9999;

      if (sortOption === "KAPLING") {
        if (numA !== numB) {
          return numA - numB;
        }
        if (a.kategori !== b.kategori) {
          return a.kategori === "SD" ? -1 : 1;
        }
        return (a.nama_regu || "").localeCompare(b.nama_regu || "");
      } else {
        if (a.kategori !== b.kategori) {
          return a.kategori === "SD" ? -1 : 1;
        }
        if (a.gender !== b.gender) {
          return a.gender === "Laki-laki" ? -1 : 1;
        }
        return numA - numB;
      }
    });
  }, [pesertaList, filterTingkat, filterGender, sortOption, searchQuery]);

  // Set document title untuk nama file saat save PDF
  useEffect(() => {
    let suffix = "Semua";
    if (filterTingkat !== "ALL" && filterGender !== "ALL") {
      suffix = `${filterTingkat}_${filterGender === "Laki-laki" ? "Putra" : "Putri"}`;
    } else if (filterTingkat !== "ALL") {
      suffix = filterTingkat;
    } else if (filterGender !== "ALL") {
      suffix = filterGender === "Laki-laki" ? "Putra" : "Putri";
    }
    document.title = `Semua_Bukti_Pendaftaran_Terverifikasi_${suffix}_LT2_Mekar_Baru`;
  }, [filterTingkat, filterGender]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-bold tracking-wide text-amber-400">
            Memuat Seluruh Bukti Pendaftaran Terverifikasi...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="print-wrapper min-h-screen bg-slate-200/90 flex flex-col items-center py-6 print:py-0 print:m-0 print:p-0 print:bg-white print:block print:w-full print:min-h-0 text-black font-serif">
      <style>{`
        @page {
          size: A4 portrait;
          margin: 8mm 12mm;
        }
        @media print {
          *, *::before, *::after {
            box-shadow: none !important;
            -webkit-box-shadow: none !important;
            text-shadow: none !important;
            filter: none !important;
            outline: none !important;
          }
          html, body {
            width: 100% !important;
            height: auto !important;
            min-height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            overflow: visible !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print {
            display: none !important;
          }
          .print-wrapper {
            display: block !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: transparent !important;
          }
          .a4-page {
            box-shadow: none !important;
            -webkit-box-shadow: none !important;
            filter: none !important;
            border: none !important;
            outline: none !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            height: auto !important;
            min-height: auto !important;
            page-break-before: auto !important;
            page-break-after: always !important;
            break-after: page !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .a4-page:last-child {
            page-break-after: auto !important;
            break-after: auto !important;
          }
        }
      `}</style>

      {/* TOP CONTROL BAR (HANYA LAYAR, TIDAK TERCETAK) */}
      <div className="no-print mb-6 w-full max-w-[210mm] bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-2xl text-white font-sans">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h1 className="text-base font-black tracking-wide text-amber-400 uppercase flex items-center gap-2">
              <span>🖨️</span> Cetak Bukti Pendaftaran Terverifikasi
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Lomba Tingkat II (LT-II) Kwartir Ranting Mekar Baru Tahun 2026
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push("/dashboard/admin")}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-3 py-2 rounded-xl text-xs transition-all flex items-center gap-1.5"
            >
              <span>←</span> Kembali ke Admin
            </button>
            <button
              onClick={() => window.print()}
              disabled={filteredPeserta.length === 0}
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-black px-5 py-2 rounded-xl shadow-lg shadow-emerald-500/20 text-xs tracking-wider uppercase transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z" />
              </svg>
              <span>Cetak ({filteredPeserta.length} Halaman A4)</span>
            </button>
          </div>
        </div>

        {/* QUICK PRESET CHIPS */}
        <div className="pt-3 pb-2 flex flex-wrap items-center gap-2">
          <span className="text-[0.68rem] font-bold text-slate-400 uppercase tracking-wider">
            Preset Cepat:
          </span>
          <button
            type="button"
            onClick={() => {
              setFilterTingkat("ALL");
              setFilterGender("ALL");
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              filterTingkat === "ALL" && filterGender === "ALL"
                ? "bg-amber-500 text-slate-950 font-black shadow"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            📑 Semua ({pesertaList.length})
          </button>
          <button
            type="button"
            onClick={() => {
              setFilterTingkat("SD");
              setFilterGender("Laki-laki");
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              filterTingkat === "SD" && filterGender === "Laki-laki"
                ? "bg-cyan-500 text-slate-950 font-black shadow"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            🎒 SD/MI Putra
          </button>
          <button
            type="button"
            onClick={() => {
              setFilterTingkat("SD");
              setFilterGender("Perempuan");
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              filterTingkat === "SD" && filterGender === "Perempuan"
                ? "bg-pink-500 text-white font-black shadow"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            🎒 SD/MI Putri
          </button>
          <button
            type="button"
            onClick={() => {
              setFilterTingkat("SMP");
              setFilterGender("Laki-laki");
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              filterTingkat === "SMP" && filterGender === "Laki-laki"
                ? "bg-blue-500 text-white font-black shadow"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            🏫 SMP/MTs Putra
          </button>
          <button
            type="button"
            onClick={() => {
              setFilterTingkat("SMP");
              setFilterGender("Perempuan");
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              filterTingkat === "SMP" && filterGender === "Perempuan"
                ? "bg-purple-500 text-white font-black shadow"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            🏫 SMP/MTs Putri
          </button>
        </div>

        {/* CUSTOM FILTERS & SEARCH */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 pt-2 border-t border-slate-800/80">
          <div>
            <label className="block text-[0.65rem] text-slate-400 font-bold uppercase mb-1">
              Tingkat Satuan:
            </label>
            <select
              value={filterTingkat}
              onChange={(e) => setFilterTingkat(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">Semua Tingkat</option>
              <option value="SD">SD / MI</option>
              <option value="SMP">SMP / MTs</option>
            </select>
          </div>

          <div>
            <label className="block text-[0.65rem] text-slate-400 font-bold uppercase mb-1">
              Kategori Regu:
            </label>
            <select
              value={filterGender}
              onChange={(e) => setFilterGender(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">Semua Gender (Pa & Pi)</option>
              <option value="Laki-laki">👦 Putra (Laki-laki)</option>
              <option value="Perempuan">👧 Putri (Perempuan)</option>
            </select>
          </div>

          <div>
            <label className="block text-[0.65rem] text-amber-400 font-bold uppercase mb-1">
              Urutkan Dokumen:
            </label>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="w-full bg-slate-950 border border-amber-500/40 rounded-xl px-3 py-1.5 text-xs text-amber-300 font-bold focus:outline-none focus:border-amber-500"
            >
              <option value="KAPLING">🔢 No. Kapling (001 - Akhir)</option>
              <option value="KATEGORI">🏫 Kategori (SD lalu SMP)</option>
            </select>
          </div>

          <div>
            <label className="block text-[0.65rem] text-slate-400 font-bold uppercase mb-1">
              Cari Cepat:
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Regu, pangkalan, kapling..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* STATS INFO */}
        <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div>
            Menampilkan: <strong className="text-emerald-400">{filteredPeserta.length}</strong> dari {pesertaList.length} Regu Terverifikasi
          </div>
          <div className="text-[0.7rem] text-slate-500 italic">
            * Setiap regu otomatis dicetak pada 1 lembar A4 penuh tanpa bersambung
          </div>
        </div>
      </div>

      {/* KONDISI KOSONG */}
      {filteredPeserta.length === 0 && (
        <div className="a4-page bg-white w-full max-w-[210mm] shadow-2xl p-12 text-center text-slate-500 font-sans my-4">
          <p className="text-3xl mb-2">📂</p>
          <p className="font-bold text-base text-slate-800">
            Tidak Ada Data Peserta Terverifikasi yang Sesuai
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Ubah filter atau pastikan peserta sudah berstatus Aktif (Verified) di Manajemen Peserta Admin.
          </p>
        </div>
      )}

      {/* DAFTAR LEMBAR BUKTI PENDAFTARAN (1 LEMBAR A4 PER PESERTA) */}
      {filteredPeserta.map((peserta, idx) => {
        const noGudepDisplay = getNoGudepByGender(peserta.no_gudep, peserta.gender);
        const kaplingFormatted = peserta.nomor_dada
          ? String(peserta.nomor_dada).padStart(3, "0")
          : "—";

        const tglDaftar = new Date(peserta.created_at || Date.now()).toLocaleDateString("id-ID", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        });

        return (
          <div
            key={peserta.id}
            className="a4-page bg-white w-full max-w-[210mm] shadow-2xl print:shadow-none print:border-none print:outline-none print:filter-none p-[10mm_14mm] print:p-0 relative text-black text-[10.5pt] leading-normal mb-8 print:mb-0"
          >
            {/* KOP SURAT RESMI KWARRAN MEKAR BARU */}
            <div
              className="flex items-center justify-between pb-2 mb-2"
              style={{ borderBottom: "4px double black" }}
            >
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
                  <span className="text-black">Website:</span> mekarbaru.kwarcabtangerang.or.id &nbsp;|&nbsp;{" "}
                  <span className="text-black">Email:</span> kwarran.mekarbaru@gmail.com
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
                No. Registrasi: {peserta.id.slice(0, 8).toUpperCase()}
              </p>
            </div>

            {/* PENGANTAR */}
            <p className="text-[10pt] text-justify leading-relaxed mb-2">
              Panitia Pelaksana Lomba Tingkat Regu Pramuka Penggalang Dua (LT-II) Kwartir Ranting Mekar Baru Tahun 2026 menerangkan bahwa:
            </p>

            {/* TABEL DATA REGU PESERTA */}
            <table className="w-full mb-2 text-[10pt] font-bold border-collapse">
              <tbody>
                <tr>
                  <td className="py-0.5 pl-2 w-44">Nama Regu</td>
                  <td className="py-0.5 w-4">:</td>
                  <td className="py-0.5 text-black font-extrabold">{peserta.nama_regu}</td>
                </tr>
                <tr>
                  <td className="py-0.5 pl-2">No. Kapling (Tenda)</td>
                  <td className="py-0.5">:</td>
                  <td className="py-0.5 font-mono text-[11pt]">
                    <span className="bg-slate-100 px-2.5 py-0.5 rounded font-black border border-slate-300">
                      #{kaplingFormatted}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="py-0.5 pl-2">Pangkalan / Sekolah</td>
                  <td className="py-0.5">:</td>
                  <td className="py-0.5">{peserta.pangkalan}</td>
                </tr>
                <tr>
                  <td className="py-0.5 pl-2">No. Gugus Depan</td>
                  <td className="py-0.5">:</td>
                  <td className="py-0.5 font-mono">{noGudepDisplay}</td>
                </tr>
                <tr>
                  <td className="py-0.5 pl-2">Kategori Peserta</td>
                  <td className="py-0.5">:</td>
                  <td className="py-0.5">
                    {peserta.kategori === "SD" ? "SD / MI" : "SMP / MTs"}
                  </td>
                </tr>
                <tr>
                  <td className="py-0.5 pl-2">Jenis Kelamin</td>
                  <td className="py-0.5">:</td>
                  <td className="py-0.5">
                    {peserta.gender === "Laki-laki" ? "Laki-laki (Putra)" : "Perempuan (Putri)"}
                  </td>
                </tr>
                <tr>
                  <td className="py-0.5 pl-2">Tanggal Daftar</td>
                  <td className="py-0.5">:</td>
                  <td className="py-0.5">{tglDaftar}</td>
                </tr>
              </tbody>
            </table>

            {/* PERNYATAAN STATUS SAH */}
            <p className="text-[10pt] text-justify leading-relaxed mb-2">
              Telah menyerahkan kelengkapan dokumen persyaratan dan dinyatakan <strong>SAH & TERVERIFIKASI</strong> sebagai Peserta LT-II Kwartir Ranting Mekar Baru Tahun 2026.
            </p>

            {/* KOTAK INSTRUKSI PESERTA */}
            <div className="border border-black p-2.5 mb-3 bg-slate-50 rounded text-[9.5pt] leading-snug">
              <p className="font-bold mb-1">Instruksi untuk Peserta:</p>
              <ol className="list-decimal pl-5 space-y-0.5">
                <li>Surat ini adalah bukti sah verifikasi pendaftaran regu dari panitia pelaksana.</li>
                <li>Silakan cetak fisik surat ini pada kertas A4 (dapat dicetak warna atau hitam-putih).</li>
                <li>
                  Bawa surat fisik ini pada saat registrasi ulang di lokasi perkemahan (Bumi Perkemahan) untuk ditukarkan dengan Surat Izin Mendirikan Tenda di Kapling #{kaplingFormatted} dan ID Card peserta.
                </li>
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
                  ✅ RESMI & SAH
                </div>
                <div className="text-[7pt] font-mono text-slate-500">
                  KODE: LT2-2026-{peserta.id.slice(0, 8).toUpperCase()}
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
          </div>
        );
      })}
    </div>
  );
}

export default function CetakBuktiSemuaPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white font-sans">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-bold text-amber-400">Menyiapkan Dokumen Cetak...</p>
          </div>
        </div>
      }
    >
      <CetakBuktiSemuaContent />
    </Suspense>
  );
}
