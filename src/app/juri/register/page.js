"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useOnlineStatus } from "@/lib/useOnlineStatus";

export default function JuriRegisterPage() {
  const router = useRouter();
  const isOnline = useOnlineStatus();

  // Form states
  const [namaLengkap, setNamaLengkap] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Password validation: minimum 8 characters, at least 1 uppercase letter, and 1 number
  const validatePassword = (pass) => {
    const minLength = pass.length >= 8;
    const hasUppercase = /[A-Z]/.test(pass);
    const hasNumber = /[0-9]/.test(pass);
    return minLength && hasUppercase && hasNumber;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isOnline) {
      setError("Koneksi internet terputus. Periksa jaringan Anda.");
      return;
    }

    const cleanNama = namaLengkap.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanNama || !cleanEmail || !password || !confirmPassword) {
      setError("Harap lengkapi seluruh bidang form.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Konfirmasi kata sandi tidak cocok.");
      return;
    }

    if (!validatePassword(password)) {
      setError("Kata sandi harus terdiri dari minimal 8 karakter, mengandung setidaknya 1 huruf besar dan 1 angka.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Sign up with Supabase auth (sends verification email automatically)
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            nama_lengkap: cleanNama,
          },
        },
      });

      if (signUpError) {
        setError("Gagal mendaftar: " + signUpError.message);
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
      <div className="absolute bottom-[-20%] right-[10%] w-[500px] h-[500px] bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none animate-pulse-glow" style={{ animationDelay: "2s" }} />
      <div className="bg-grid absolute inset-0 pointer-events-none" />

      <div className="relative z-10 max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-6 flex justify-center">
          <img 
            src="/logo_65.png" 
            alt="Logo 65 HUT Pramuka" 
            className="h-24 w-auto object-contain drop-shadow-[0_0_20px_rgba(245,166,35,0.45)]"
          />
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
                  Lomba Pramuka Kwaran Mekar Baru
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

                {/* Password */}
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <label className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-[0.1em]">
                      Kata Sandi
                    </label>
                    <span className="text-[0.6rem] text-slate-500">Min 8 Karatker, A-Z, 0-9</span>
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-700 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all text-sm"
                  />
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <label className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-[0.1em]">
                    Ulangi Kata Sandi
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-700 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all text-sm"
                  />
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
                  VERIFIKASI EMAIL ANDA!
                </h2>
                <p className="text-sm text-slate-300 max-w-sm mx-auto">
                  Registrasi berhasil. Link verifikasi telah dikirimkan ke email <strong className="text-cyan-400">{email}</strong>. Harap buka inbox/spam email Anda dan klik link tersebut agar Anda dapat masuk ke panel juri.
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
