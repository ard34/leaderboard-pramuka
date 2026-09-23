"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useOnlineStatus } from "@/lib/useOnlineStatus";

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isSessionReady, setIsSessionReady] = useState(false);
  const router = useRouter();
  const isOnline = useOnlineStatus();

  useEffect(() => {
    // Supabase recovers session via URL hash (#access_token=...&type=recovery)
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsSessionReady(true);
      } else {
        // Also listen to auth state change in case hash is being processed
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (event === "PASSWORD_RECOVERY" || session) {
              setIsSessionReady(true);
            }
          }
        );
        return () => subscription.unsubscribe();
      }
    };
    checkSession();
  }, []);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();

    if (!isOnline) {
      setError("Koneksi internet terputus. Silakan periksa jaringan Anda.");
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setError("Kata sandi baru minimal 6 karakter.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Konfirmasi kata sandi tidak cocok dengan kata sandi baru.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        setError(updateError.message || "Gagal memperbarui kata sandi.");
        setLoading(false);
        return;
      }

      setSuccess(true);
      setLoading(false);

      // Auto redirect to login after 3 seconds
      setTimeout(() => {
        router.replace("/login");
      }, 3000);
    } catch (err) {
      setError("Terjadi kesalahan sistem: " + err.message);
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 font-sans text-slate-200 relative overflow-hidden"
      style={{
        backgroundImage:
          "linear-gradient(135deg, rgba(3, 7, 18, 0.94) 0%, rgba(3, 7, 18, 0.97) 100%), url('/scout_event_live.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Background Glow */}
      <div className="absolute top-[-20%] left-[10%] w-[500px] h-[500px] bg-amber-500/10 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[10%] w-[500px] h-[500px] bg-cyan-500/5 blur-[140px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-md w-full">
        {/* Header Branding */}
        <div className="text-center mb-6 flex justify-center items-center gap-3 px-2">
          <img
            src="/logo_kwarran_mekarbaru.png"
            alt="Kwarran Mekar Baru"
            className="h-12 sm:h-16 max-w-[35vw] w-auto object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.4)] shrink-0"
          />
          <img
            src="/logo_lt2.png"
            alt="LT-II 2026"
            className="h-12 sm:h-16 max-w-[35vw] w-auto object-contain drop-shadow-[0_0_20px_rgba(245,166,35,0.5)] shrink-0"
          />
        </div>

        {/* Card */}
        <div className="glass-card p-6 md:p-10 shadow-[0_0_60px_rgba(245,166,35,0.08)] border border-amber-500/20">
          <div className="text-center space-y-2 mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <h1 className="text-xl md:text-2xl font-black tracking-widest text-white uppercase">
              RESET KATA SANDI
            </h1>
            <p className="text-xs text-slate-400">
              Buat kata sandi baru yang aman untuk akun Anda
            </p>
          </div>

          {success ? (
            <div className="space-y-4 text-center">
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm">
                <div className="text-2xl mb-1">🎉</div>
                <div className="font-bold">Kata Sandi Berhasil Diperbarui!</div>
                <p className="text-xs text-emerald-300/80 mt-1">
                  Mengarahkan Anda ke halaman login dalam beberapa detik...
                </p>
              </div>
              <button
                type="button"
                onClick={() => router.replace("/login")}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition-all"
              >
                Masuk Sekarang
              </button>
            </div>
          ) : (
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-center text-xs font-semibold flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[0.7rem] font-bold text-slate-400 uppercase tracking-[0.15em]">
                  Kata Sandi Baru
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    placeholder="Minimal 6 karakter"
                    autoComplete="new-password"
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? "Sembunyikan" : "Lihat"}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[0.7rem] font-bold text-slate-400 uppercase tracking-[0.15em]">
                  Konfirmasi Kata Sandi Baru
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Ulangi kata sandi baru"
                  autoComplete="new-password"
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !isOnline}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-bold py-3.5 px-4 rounded-xl mt-2 transition-all shadow-[0_8px_25px_rgba(245,166,35,0.2)] disabled:opacity-50 tracking-wider text-xs uppercase"
              >
                {loading ? "Menyimpan Kata Sandi..." : "Simpan Kata Sandi Baru"}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <a
              href="/login"
              className="text-xs text-slate-500 hover:text-amber-400 transition-colors"
            >
              ← Kembali ke Halaman Login
            </a>
          </div>
        </div>

        <p className="text-center text-slate-600 text-[0.65rem] mt-6 tracking-wider">
          LT-II Kwarran Mekar Baru • Sistem Terproteksi Enkripsi Supabase
        </p>
      </div>
    </div>
  );
}
