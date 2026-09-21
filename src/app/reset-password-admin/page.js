"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function ResetPasswordAdminContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();

  const [checkingToken, setCheckingToken] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [tokenError, setTokenError] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setCheckingToken(false);
      setTokenValid(false);
      setTokenError("Token tidak ditemukan di tautan URL. Pastikan Anda membuka tautan lengkap.");
      return;
    }

    const verifyToken = async () => {
      try {
        const res = await fetch(`/api/admin/reset-password-token?token=${encodeURIComponent(token)}`);
        let data = {};
        try {
          data = await res.json();
        } catch (_) {
          throw new Error("Server belum siap. Silakan refresh halaman.");
        }
        if (res.ok && data.valid) {
          setTokenValid(true);
        } else {
          setTokenValid(false);
          setTokenError(data.reason || "Tautan token ini sudah tidak berlaku atau pernah digunakan.");
        }
      } catch (err) {
        setTokenValid(false);
        setTokenError(err.message || "Gagal memverifikasi token.");
      } finally {
        setCheckingToken(false);
      }
    };

    verifyToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newPassword || newPassword.length < 6) {
      setError("Password baru minimal 6 karakter.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Konfirmasi password baru tidak cocok. Pastikan kedua kolom sama.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/reset-password-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          newPassword,
        }),
      });

      let data = {};
      try {
        data = await res.json();
      } catch (_) {
        throw new Error("Gagal membaca respons server.");
      }

      if (!res.ok || !data.success) {
        setError(data.error || "Gagal mengubah kata sandi.");
        setLoading(false);
        return;
      }

      setSuccess(true);
      setLoading(false);

      // Auto redirect to login after 3.5 seconds
      setTimeout(() => {
        router.replace("/login");
      }, 3500);
    } catch (err) {
      setError("Terjadi kesalahan: " + err.message);
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 font-sans text-slate-200 relative overflow-hidden"
      style={{
        backgroundImage:
          "linear-gradient(135deg, rgba(3, 7, 18, 0.94) 0%, rgba(3, 7, 18, 0.98) 100%), url('/scout_event_live.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Background glow effects */}
      <div className="absolute top-[-20%] left-[10%] w-[500px] h-[500px] bg-amber-500/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[10%] w-[500px] h-[500px] bg-cyan-500/5 blur-[130px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-md w-full">
        {/* Header Branding */}
        <div className="text-center mb-6 flex justify-center items-center gap-3 flex-wrap">
          <img
            src="/logo_kwarran_mekarbaru.png"
            alt="Kwarran Mekar Baru"
            className="h-16 w-auto object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]"
          />
          <img
            src="/logo_lt2.png"
            alt="LT-II 2026"
            className="h-16 w-auto object-contain drop-shadow-[0_0_20px_rgba(245,166,35,0.5)]"
          />
        </div>

        <div className="glass-card p-6 md:p-10 shadow-[0_0_60px_rgba(245,166,35,0.08)] border border-amber-500/20">
          <div className="text-center space-y-2 mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-1">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h1 className="text-xl md:text-2xl font-black tracking-widest text-white uppercase">
              GANTI PASSWORD ADMIN
            </h1>
            <p className="text-xs text-amber-400 font-semibold tracking-wider uppercase">
              Tautan Verifikasi 1-Kali Pakai
            </p>
          </div>

          {checkingToken ? (
            <div className="py-10 text-center space-y-3">
              <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-400">Memeriksa keaslian token 1-kali pakai...</p>
            </div>
          ) : !tokenValid ? (
            <div className="space-y-5 text-center py-4">
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm space-y-2">
                <div className="text-2xl">⚠️</div>
                <div className="font-bold">Tautan Tidak Berlaku</div>
                <p className="text-xs text-red-300/80 leading-relaxed">{tokenError}</p>
              </div>
              <button
                type="button"
                onClick={() => router.replace("/login")}
                className="w-full bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition-colors border border-slate-800"
              >
                Kembali ke Login
              </button>
            </div>
          ) : success ? (
            <div className="space-y-4 text-center py-4">
              <div className="p-5 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-sm space-y-3 shadow-xl">
                <div className="text-4xl animate-bounce">🎉</div>
                <div className="font-black text-lg text-white">Password Berhasil Diperbarui!</div>
                <p className="text-xs text-emerald-200/90 leading-relaxed">
                  Tautan 1-kali pakai ini sekarang telah <b>hangus secara permanen</b>.
                </p>
                <div className="p-3 bg-slate-950/80 rounded-xl border border-emerald-500/20 text-xs text-left space-y-1">
                  <div className="text-slate-400">Akun Anda:</div>
                  <div className="text-white font-bold">Username: <span className="text-amber-400">admin</span></div>
                  <div className="text-slate-400 text-[0.7rem]">Gunakan password baru yang baru saja Anda buat untuk login.</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => router.replace("/login")}
                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-black py-3.5 px-4 rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg hover:shadow-emerald-500/25"
              >
                Masuk ke Halaman Login Sekarang →
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Account Identity Info */}
              <div className="p-3 bg-amber-500/10 border border-amber-500/25 rounded-xl text-xs flex items-center justify-between">
                <div>
                  <span className="text-slate-400 block text-[0.65rem] uppercase tracking-wider">Target Akun:</span>
                  <span className="text-amber-300 font-black tracking-wide">Admin Utama (admin)</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[0.65rem] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  1-Kali Pakai
                </span>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-xl text-center text-xs font-semibold flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[0.7rem] font-bold text-slate-400 uppercase tracking-wider">
                    Password Baru
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-xs text-amber-400 hover:text-amber-300 transition-colors font-semibold"
                  >
                    {showPassword ? "Sembunyikan" : "Lihat"}
                  </button>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="Masukkan minimal 6 karakter"
                  autoComplete="new-password"
                  autoFocus
                  className="w-full bg-slate-950/90 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50 text-sm font-mono tracking-wide"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[0.7rem] font-bold text-slate-400 uppercase tracking-wider">
                  Ulangi Password Baru
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Ketik ulang password baru Anda"
                  autoComplete="new-password"
                  className="w-full bg-slate-950/90 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50 text-sm font-mono tracking-wide"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black py-3.5 px-4 rounded-xl mt-2 transition-all shadow-lg hover:shadow-amber-500/20 disabled:opacity-50 tracking-wider text-xs uppercase cursor-pointer"
              >
                {loading ? "Menyimpan & Menghanguskan Token..." : "Simpan Password Baru"}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <a href="/login" className="text-xs text-slate-500 hover:text-amber-400 transition-colors">
              ← Kembali ke Halaman Login
            </a>
          </div>
        </div>

        <p className="text-center text-slate-600 text-[0.65rem] mt-6 tracking-wider">
          LT-II Kwarran Mekar Baru • Sistem Terproteksi Token Sekali Pakai
        </p>
      </div>
    </div>
  );
}

export default function ResetPasswordAdminPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white text-xs">
          Memuat halaman verifikasi...
        </div>
      }
    >
      <ResetPasswordAdminContent />
    </Suspense>
  );
}
