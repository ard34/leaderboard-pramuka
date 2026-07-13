"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useOnlineStatus } from "@/lib/useOnlineStatus";

export default function RegisterPage() {
  const router = useRouter();
  const isOnline = useOnlineStatus();

  // Form states
  const [pangkalan, setPangkalan] = useState("");
  const [noGudep, setNoGudep] = useState("");
  const [namaRegu, setNamaRegu] = useState("");
  const [kategori, setKategori] = useState("SD");
  const [gender, setGender] = useState("Laki-laki");
  const [kontakPerson, setKontakPerson] = useState("");

  // UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isOnline) {
      setError("Koneksi internet terputus. Periksa jaringan Anda.");
      return;
    }

    // Input validations
    const cleanPangkalan = pangkalan.trim();
    const cleanNoGudep = noGudep.trim();
    const cleanNamaRegu = namaRegu.trim();
    const cleanKontak = kontakPerson.trim();

    if (!cleanPangkalan || !cleanNoGudep || !cleanNamaRegu || !cleanKontak) {
      setError("Harap lengkapi semua bidang form pendaftaran.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Insert new participant (nomor_dada: null, is_verified: false)
      const { error: insertError } = await supabase.from("peserta").insert({
        nama_regu: cleanNamaRegu,
        pangkalan: cleanPangkalan,
        kategori,
        gender,
        no_gudep: cleanNoGudep,
        kontak_person: cleanKontak,
        is_verified: false,
      });

      if (insertError) {
        // If there's an error (e.g. duplicate check for Gudep/Regu combo if applicable, or database constraint issue)
        setError("Gagal mendaftar: " + insertError.message);
        setLoading(false);
        return;
      }

      setSuccess(true);
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
      <div className="absolute bottom-[-20%] right-[10%] w-[500px] h-[500px] bg-amber-500/5 blur-[120px] rounded-full pointer-events-none animate-pulse-glow" style={{ animationDelay: "2s" }} />
      <div className="bg-grid absolute inset-0 pointer-events-none" />

      <div className="relative z-10 max-w-lg w-full">
        {/* Logo */}
        <div className="text-center mb-6 flex justify-center">
          <img 
            src="/logo_65.png" 
            alt="Logo 65 HUT Pramuka" 
            className="h-24 w-auto object-contain drop-shadow-[0_0_20px_rgba(245,166,35,0.45)]"
          />
        </div>

        {/* Form Card */}
        <div className="glass-card p-6 md:p-8 shadow-[0_0_60px_rgba(245,166,35,0.08)] border border-amber-500/15">
          {!success ? (
            <>
              <div className="text-center space-y-2 mb-6">
                <h1 className="text-lg md:text-xl font-black tracking-widest text-white uppercase">
                  PENDAFTARAN PESERTA LOMBA TINGKAT II
                </h1>
                <p className="text-xs text-amber-400 font-bold uppercase tracking-wider">
                  Kwartir Ranting Mekar Baru
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Nama Regu */}
                  <div className="space-y-1.5">
                    <label className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-[0.1em]">
                      Nama Regu
                    </label>
                    <input
                      type="text"
                      value={namaRegu}
                      onChange={(e) => setNamaRegu(e.target.value)}
                      required
                      placeholder="Contoh: Rajawali"
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-700 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all text-sm"
                    />
                  </div>

                  {/* Asal Pangkalan */}
                  <div className="space-y-1.5">
                    <label className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-[0.1em]">
                      Nama Sekolah / Pangkalan
                    </label>
                    <input
                      type="text"
                      value={pangkalan}
                      onChange={(e) => setPangkalan(e.target.value)}
                      required
                      placeholder="Contoh: SDN 1 Mekar Baru"
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-700 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* No Gudep */}
                  <div className="space-y-1.5">
                    <label className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-[0.1em]">
                      No. Gugus Depan (Gudep)
                    </label>
                    <input
                      type="text"
                      value={noGudep}
                      onChange={(e) => setNoGudep(e.target.value)}
                      required
                      placeholder="Contoh: 04.081 - 04.082"
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-700 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all text-sm"
                    />
                  </div>

                  {/* Kontak Person */}
                  <div className="space-y-1.5">
                    <label className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-[0.1em]">
                      Kontak Person / No. WA
                    </label>
                    <input
                      type="text"
                      value={kontakPerson}
                      onChange={(e) => setKontakPerson(e.target.value)}
                      required
                      placeholder="Contoh: 08123456789"
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-700 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Kategori Tingkat */}
                  <div className="space-y-1.5">
                    <label className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-[0.1em]">
                      Tingkat Lomba
                    </label>
                    <select
                      value={kategori}
                      onChange={(e) => setKategori(e.target.value)}
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all text-sm"
                    >
                      <option value="SD">SD / MI</option>
                      <option value="SMP">SMP / MTs</option>
                    </select>
                  </div>

                  {/* Gender / Regu */}
                  <div className="space-y-1.5">
                    <label className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-[0.1em]">
                      Kategori Regu (Gender)
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all text-sm"
                    >
                      <option value="Laki-laki">Putra (Laki-laki)</option>
                      <option value="Perempuan">Putri (Perempuan)</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !isOnline}
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-black py-3.5 px-4 rounded-xl mt-4 transition-all duration-300 shadow-[0_8px_25px_rgba(245,166,35,0.2)] hover:shadow-[0_12px_35px_rgba(245,166,35,0.3)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-[0_8px_25px_rgba(245,166,35,0.2)] tracking-wider text-sm"
                >
                  {loading ? "MENGIRIM PENDAFTARAN..." : "DAFTAR SEKARANG"}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-6 space-y-6 animate-fade-in">
              <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-full flex items-center justify-center mx-auto text-amber-400">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="space-y-2">
                <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-wider">
                  PENDAFTARAN BERHASIL!
                </h2>
                <p className="text-sm text-slate-300 max-w-sm mx-auto">
                  Data Regu <strong className="text-amber-400">{namaRegu}</strong> telah terkirim. Harap tunggu verifikasi dari Admin Kwartir Ranting Mekar Baru sebelum regu Anda muncul di Leaderboard utama.
                </p>
              </div>
              <button
                onClick={() => {
                  setSuccess(false);
                  setPangkalan("");
                  setNoGudep("");
                  setNamaRegu("");
                  setKontakPerson("");
                }}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-2.5 px-6 rounded-lg text-xs tracking-wider uppercase transition-colors"
              >
                Daftar Regu Lain
              </button>
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
