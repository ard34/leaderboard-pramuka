"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useOnlineStatus } from "@/lib/useOnlineStatus";

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 30 * 1000; // 30 detik

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isLockedOut, setIsLockedOut] = useState(false);
  const [lockoutRemaining, setLockoutRemaining] = useState(0);
  const loginAttemptsRef = useRef(0);
  const lockoutTimerRef = useRef(null);
  const router = useRouter();
  const isOnline = useOnlineStatus();

  // Prefetch dashboard routes so navigation is instant after login
  useEffect(() => {
    router.prefetch("/dashboard/admin");
    router.prefetch("/dashboard/juri");
  }, [router]);

  const startLockout = () => {
    setIsLockedOut(true);
    setLockoutRemaining(LOCKOUT_DURATION_MS / 1000);
    lockoutTimerRef.current = setInterval(() => {
      setLockoutRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(lockoutTimerRef.current);
          setIsLockedOut(false);
          loginAttemptsRef.current = 0;
          setError(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!isOnline) {
      setError("Koneksi internet terputus. Periksa jaringan Anda.");
      return;
    }

    if (isLockedOut) {
      setError(`Terlalu banyak percobaan. Coba lagi dalam ${lockoutRemaining} detik.`);
      return;
    }

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !password) {
      setError("Email dan kata sandi wajib diisi.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password,
        });

      if (authError) {
        loginAttemptsRef.current += 1;
        const remaining = MAX_LOGIN_ATTEMPTS - loginAttemptsRef.current;

        if (loginAttemptsRef.current >= MAX_LOGIN_ATTEMPTS) {
          setError("Terlalu banyak percobaan gagal. Akun dikunci sementara.");
          startLockout();
        } else {
          setError(`Kredensial tidak valid. Sisa percobaan: ${remaining}`);
        }
        setLoading(false);
        return;
      }

      // Reset attempts on success
      loginAttemptsRef.current = 0;

      // Fetch profile with nama_lengkap so dashboard can skip its own profile query
      const { data: profileData } = await supabase
        .from("profiles")
        .select("role, nama_lengkap")
        .eq("id", authData.user.id)
        .maybeSingle();

      if (!profileData) {
        await supabase.auth.signOut();
        setError("Profil tidak ditemukan. Hubungi Admin Utama.");
        setLoading(false);
        return;
      }

      // Cache profile so dashboard pages skip redundant profile query
      try {
        sessionStorage.setItem("_profile_cache", JSON.stringify({
          id: authData.user.id,
          role: profileData.role,
          nama_lengkap: profileData.nama_lengkap,
          ts: Date.now(),
        }));
      } catch (_) { /* ignore storage errors */ }

      // Use replace() so login page is removed from browser history
      router.replace(profileData.role === "admin" ? "/dashboard/admin" : "/dashboard/juri");
    } catch (err) {
      setError("Terjadi kesalahan jaringan. Silakan coba lagi.");
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
          ⚠️ KONEKSI TERPUTUS — Data tidak dapat dikirim ke server
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
            className="h-28 w-auto object-contain drop-shadow-[0_0_20px_rgba(245,166,35,0.45)]"
          />
        </div>

        {/* Login Card */}
        <div className="glass-card p-6 md:p-10 shadow-[0_0_60px_rgba(245,166,35,0.08)] border border-amber-500/15">
          <div className="text-center space-y-2 mb-6">
            <h1 className="text-xl md:text-2xl font-black tracking-widest text-white uppercase">
              MASUK PANEL PENILAIAN
            </h1>
            <p className="text-xs text-slate-500 uppercase tracking-wider">
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

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[0.7rem] font-bold text-slate-500 uppercase tracking-[0.15em]">
                Email Akun
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3.5 text-white placeholder-slate-700 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[0.7rem] font-bold text-slate-500 uppercase tracking-[0.15em]">
                Kata Sandi
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3.5 text-white placeholder-slate-700 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !isOnline || isLockedOut}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-black py-4 px-4 rounded-xl mt-2 transition-all duration-300 shadow-[0_8px_25px_rgba(245,166,35,0.2)] hover:shadow-[0_12px_35px_rgba(245,166,35,0.3)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-[0_8px_25px_rgba(245,166,35,0.2)] tracking-wider"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  MEMVALIDASI...
                </span>
              ) : (
                "MASUK KE PANEL"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <a
              href="/"
              className="text-xs text-slate-600 hover:text-slate-400 transition-colors"
            >
              ← Kembali ke Halaman Utama
            </a>
          </div>
        </div>

        <p className="text-center text-slate-700 text-[0.65rem] mt-6 tracking-wider">
          Server-Side Validated • End-to-End Encrypted
        </p>
      </div>
    </div>
  );
}