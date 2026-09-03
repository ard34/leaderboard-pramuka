"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useOnlineStatus } from "@/lib/useOnlineStatus";

export default function JuriRegisterPage() {
  const router = useRouter();
  const isOnline = useOnlineStatus();

  // Form states
  const [namaLengkap, setNamaLengkap] = useState("");
  const [email, setEmail] = useState("");
  const [noWa, setNoWa] = useState("");
  const [kategori, setKategori] = useState("SD");
  const [gender, setGender] = useState("Laki-laki");
  const [lombaId, setLombaId] = useState("");

  // Data states
  const [lombaList, setLombaList] = useState([]);

  // UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);



  // Official JUKLAK LT-II Mekar Baru 2026 List
  const OFFICIAL_JUKLAK_LOMBA = [
    { nama_lomba: "Menyanyi Hymne & Mars Tangerang", kode_lomba: "HMN" },
    { nama_lomba: "Pentas Seni Budaya (Tari Kreasi)", kode_lomba: "TSB" },
    { nama_lomba: "Pionering & Tali-Temali", kode_lomba: "PNR" },
    { nama_lomba: "PPPK / PPGD", kode_lomba: "PGD" },
    { nama_lomba: "Sandi-Sandi", kode_lomba: "SND" },
    { nama_lomba: "Orienteering Navigasi", kode_lomba: "NAV" },
    { nama_lomba: "Menaksir", kode_lomba: "TKS" },
    { nama_lomba: "Packing Perlengkapan", kode_lomba: "PCK" },
    { nama_lomba: "Semaphore", kode_lomba: "SMP" },
    { nama_lomba: "Morse Pluit", kode_lomba: "MRS" },
    { nama_lomba: "Obat Tradisional & KIM", kode_lomba: "KIM" },
    { nama_lomba: "Karnaval", kode_lomba: "KRN" },
    { nama_lomba: "Administrasi Regu", kode_lomba: "ADM" },
    { nama_lomba: "Forum Penggalang", kode_lomba: "FRP" },
    { nama_lomba: "Masak Nusantara", kode_lomba: "MSK" },
  ];

  // Fetch and auto-sync all 15 official JUKLAK competitions
  useEffect(() => {
    const fetchLomba = async () => {
      let currentData = [];
      try {
        const { data } = await supabase
          .from("lomba")
          .select("id, nama_lomba, kode_lomba, kategori")
          .order("nama_lomba", { ascending: true });

        if (data) currentData = data;
      } catch (_) {}

      // Check missing entries for SD and SMP
      const categories = ["SD", "SMP"];
      const missingToInsert = [];

      categories.forEach((kat) => {
        OFFICIAL_JUKLAK_LOMBA.forEach((off) => {
          const exists = currentData.some(
            (l) => l.kategori === kat && (l.kode_lomba === off.kode_lomba || l.nama_lomba.toLowerCase().includes(off.kode_lomba.toLowerCase()))
          );
          if (!exists) {
            missingToInsert.push({
              nama_lomba: off.nama_lomba,
              kode_lomba: off.kode_lomba,
              kategori: kat,
            });
          }
        });
      });

      if (missingToInsert.length > 0) {
        try {
          const { data: insertedData } = await supabase
            .from("lomba")
            .insert(missingToInsert)
            .select();
          if (insertedData) {
            currentData = [...currentData, ...insertedData];
          }
        } catch (_) {}
      }

      // If DB fails or is empty, generate complete fallbacks
      if (currentData.length === 0) {
        const fallbacks = categories.flatMap((kat) =>
          OFFICIAL_JUKLAK_LOMBA.map((off, idx) => ({
            id: `fallback-${kat}-${idx}`,
            nama_lomba: off.nama_lomba,
            kode_lomba: off.kode_lomba,
            kategori: kat,
          }))
        );
        setLombaList(fallbacks);
      } else {
        setLombaList(currentData);
      }
    };
    fetchLomba();
  }, []);

  // Filtered lomba options based on selected kategori (with fallback to all if no exact match)
  const filteredLomba = useMemo(() => {
    const matched = lombaList.filter((l) => !l.kategori || l.kategori === kategori);
    if (matched.length > 0) return matched;
    // Fallback: return official 15 list for the selected category
    return OFFICIAL_JUKLAK_LOMBA.map((off, idx) => ({
      id: `fallback-${kategori}-${idx}`,
      nama_lomba: off.nama_lomba,
      kode_lomba: off.kode_lomba,
      kategori,
    }));
  }, [lombaList, kategori]);


  // Set default selected lomba when kategori changes
  useEffect(() => {
    if (filteredLomba.length > 0) {
      const exists = filteredLomba.some((l) => l.id === lombaId);
      if (!exists) {
        setLombaId(filteredLomba[0].id);
      }
    } else {
      setLombaId("");
    }
  }, [kategori, lombaList]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isOnline) {
      setError("Koneksi internet terputus. Periksa jaringan Anda.");
      return;
    }

    const cleanNama = namaLengkap.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanNoWa = noWa.trim();

    if (!cleanNama || !cleanEmail || !cleanNoWa) {
      setError("Harap lengkapi seluruh bidang form.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Primary attempt: send data via Server API route
      const apiRes = await fetch("/api/juri/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama_lengkap: cleanNama,
          email: cleanEmail,
          kategori,
          gender,
          lombaId,
          noWa: cleanNoWa,
        }),
      });

      const apiData = await apiRes.json();

      if (apiRes.ok && apiData.success) {
        setSuccess(true);
      } else {
        setError(apiData?.error || "Pendaftaran gagal. Silakan coba lagi.");
      }
    } catch (err) {
      setError("Terjadi kesalahan sistem. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center p-4 font-sans text-slate-200 relative overflow-hidden" style={{
      backgroundImage: "linear-gradient(135deg, rgba(3, 7, 18, 0.92) 0%, rgba(3, 7, 18, 0.96) 100%), url('/scout_event_live.png')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundAttachment: "fixed",
    }}>
      {/* Offline Banner */}
      {!isOnline && (
        <div className="offline-banner">
          ⚠️ KONEKSI TERPUTUS — Pendaftaran tidak dapat dikirim ke server
        </div>
      )}

      {/* Background Effects */}
      <div className="absolute top-[-20%] left-[10%] w-[500px] h-[500px] bg-emerald-500/8 blur-[120px] rounded-full pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-[-20%] right-[10%] w-[500px] h-[500px] bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none animate-pulse-glow" style={{ animationDelay: "2s" }} />
      <div className="bg-grid absolute inset-0 pointer-events-none" />

      <div className="relative z-10 max-w-md w-full">
        {/* Logos Header Cluster */}
        <div className="text-center mb-6 flex justify-center items-center gap-3 md:gap-4 flex-wrap">
          <img src="/logo_wosm.png" alt="WOSM" className="h-14 md:h-18 w-auto object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]" />
          <img src="/logo_kwarran_mekarbaru.png" alt="Kwarran Mekar Baru" className="h-14 md:h-18 w-auto object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]" />
          <img src="/logo_lt2.png" alt="LT-II 2026" className="h-14 md:h-18 w-auto object-contain drop-shadow-[0_0_20px_rgba(245,166,35,0.5)]" />
          <img src="/logo_65.png" alt="HUT 65 Pramuka" className="h-14 md:h-18 w-auto object-contain drop-shadow-[0_0_20px_rgba(245,166,35,0.5)]" />
        </div>


        {/* Form Card */}
        <div className="glass-card p-6 md:p-8 shadow-[0_0_60px_rgba(245,166,35,0.08)] border border-cyan-500/15">
          {!success ? (
            <>
              <div className="text-center space-y-2 mb-6">
                <h1 className="text-xl md:text-2xl font-black tracking-widest text-white uppercase">
                  REGISTRASI DEWAN JURI
                </h1>
                <p className="text-xs text-cyan-400 font-bold uppercase tracking-wider">
                  Lomba Tingkat II Kwartir Ranting Mekar Baru
                </p>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-center text-sm font-semibold mb-6 flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Nama Lengkap */}
                <div className="space-y-1.5">
                  <label className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-[0.1em]">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    value={namaLengkap}
                    onChange={(e) => setNamaLengkap(e.target.value)}
                    required
                    placeholder="Nama Lengkap dengan Gelar"
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-700 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all text-sm"
                  />
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-[0.1em]">
                    Email Aktif (Untuk Verifikasi)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="email@contoh.com"
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-700 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all text-sm"
                  />
                </div>

                {/* No WhatsApp */}
                <div className="space-y-1.5">
                  <label className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-[0.1em]">
                    No. WhatsApp (Aktif)
                  </label>
                  <input
                    type="tel"
                    value={noWa}
                    onChange={(e) => setNoWa(e.target.value)}
                    required
                    placeholder="0812xxxxxx"
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-700 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all text-sm"
                  />
                </div>

                {/* Tugas Tingkatan & Tugas Gender */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-[0.1em]">
                      Tugas Tingkatan
                    </label>
                    <select
                      value={kategori}
                      onChange={(e) => setKategori(e.target.value)}
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all text-sm"
                    >
                      <option value="SD">SD / MI</option>
                      <option value="SMP">SMP / MTs</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-[0.1em]">
                      Kategori Regu (Gender)
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all text-sm"
                    >
                      <option value="Laki-laki">Putra (Laki-laki)</option>
                      <option value="Perempuan">Putri (Perempuan)</option>
                    </select>
                  </div>
                </div>

                {/* Tugas Cabang Lomba */}
                <div className="space-y-1.5">
                  <label className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-[0.1em]">
                    Tugas Cabang Lomba
                  </label>
                  <select
                    value={lombaId}
                    onChange={(e) => setLombaId(e.target.value)}
                    required
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all text-sm"
                  >
                    {filteredLomba.length === 0 ? (
                      <option value="">Belum ada cabang lomba di tingkat {kategori}</option>
                    ) : (
                      filteredLomba.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.nama_lomba}
                        </option>
                      ))
                    )}
                  </select>
                </div>



                <button
                  type="submit"
                  disabled={loading || !isOnline}
                  className="w-full bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-white font-black py-3.5 px-4 rounded-xl mt-4 transition-all duration-300 shadow-[0_8px_25px_rgba(6,182,212,0.2)] hover:shadow-[0_12px_35px_rgba(6,182,212,0.3)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-[0_8px_25px_rgba(6,182,212,0.2)] tracking-wider text-sm"
                >
                  {loading ? "MEMPROSES PENDAFTARAN..." : "DAFTAR SEBAGAI JURI"}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-6 space-y-6 animate-fade-in">
              <div className="w-16 h-16 bg-cyan-500/10 border border-cyan-500/30 rounded-full flex items-center justify-center mx-auto text-cyan-400">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 19v-8.93a2 2 0 01.89-1.664l8-5.333a2 2 0 012.22 0l8 5.333A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-2.25-1.5a2 2 0 00-2.22 0l-2.25 1.5" />
                </svg>
              </div>
              <div className="space-y-2">
                <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-wider">
                  PENDAFTARAN MENUNGGU VERIFIKASI!
                </h2>
                <p className="text-sm text-slate-300 max-w-sm mx-auto">
                  Registrasi berhasil. Data Anda sedang ditinjau oleh Admin. Jika disetujui, Admin akan menghubungi Anda dan memberikan <strong>Kata Sandi</strong> untuk masuk ke panel juri dengan email <strong className="text-cyan-400">{email}</strong>.
                </p>
              </div>
              <a
                href="/login"
                className="inline-block bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-2.5 px-6 rounded-lg text-xs tracking-wider uppercase transition-colors"
              >
                Ke Halaman Login
              </a>
            </div>
          )}

          <div className="mt-6 text-center border-t border-slate-800/40 pt-4">
            <a
              href="/"
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              ← Kembali ke Halaman Utama
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
