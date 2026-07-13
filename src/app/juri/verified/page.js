"use client";

import { useRouter } from "next/navigation";

export default function JuriVerifiedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 font-sans text-slate-200 relative overflow-hidden" style={{
      backgroundImage: "linear-gradient(135deg, rgba(3, 7, 18, 0.92) 0%, rgba(3, 7, 18, 0.96) 100%), url('/scout_event_live.png')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundAttachment: "fixed",
    }}>
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
        <div className="glass-card p-6 md:p-8 shadow-[0_0_60px_rgba(6,182,212,0.08)] border border-cyan-500/15 text-center space-y-6">
          <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto text-emerald-400 animate-bounce">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <div className="space-y-2">
            <h1 className="text-xl md:text-2xl font-black text-white uppercase tracking-wider">
              EMAIL TERVERIFIKASI!
            </h1>
            <p className="text-xs text-cyan-400 font-bold uppercase tracking-widest">
              AKUN DEWAN JURI AKTIF
            </p>
            <p className="text-sm text-slate-300 max-w-xs mx-auto pt-2">
              Email Anda telah berhasil diverifikasi oleh sistem. Akun dewan juri Anda kini sudah aktif dan siap digunakan.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={() => router.push("/login")}
              className="w-full bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-white font-black py-3.5 px-4 rounded-xl transition-all duration-300 shadow-[0_8px_25px_rgba(6,182,212,0.2)] hover:shadow-[0_12px_35px_rgba(6,182,212,0.3)] hover:-translate-y-0.5 active:translate-y-0 tracking-wider text-sm"
            >
              MASUK KE HALAMAN LOGIN
            </button>
          </div>

          <div className="text-center border-t border-slate-800/40 pt-4">
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
