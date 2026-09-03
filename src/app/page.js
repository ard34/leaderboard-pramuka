"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

// Icons (Inline SVG)
const IconTrophy = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
);

const IconLive = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12a10 10 0 1 0 20 0 10 10 0 1 0-20 0"/><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 0-14.14 0"/><path d="M4.93 19.07a10 10 0 0 0 14.14 0"/></svg>
);

const IconSchool = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
);

const IconUserPlus = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>
);

const IconLogin = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" x2="3" y1="12" y2="12"/></svg>
);

const IconBadge = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="m9 12 2 2 4-4"/></svg>
);

const MenuCard = ({ href, title, description, icon, color }) => {
  const colorMap = {
    amber: "from-amber-500/20 to-orange-500/10 border-amber-500/30 hover:border-amber-400 hover:shadow-[0_0_25px_rgba(245,166,35,0.4)]",
    emerald: "from-emerald-500/20 to-teal-500/10 border-emerald-500/30 hover:border-emerald-400 hover:shadow-[0_0_25px_rgba(16,185,129,0.4)]",
    cyan: "from-cyan-500/20 to-blue-500/10 border-cyan-500/30 hover:border-cyan-400 hover:shadow-[0_0_25px_rgba(6,182,212,0.4)]",
    purple: "from-purple-500/20 to-fuchsia-500/10 border-purple-500/30 hover:border-purple-400 hover:shadow-[0_0_25px_rgba(168,85,247,0.4)]",
    rose: "from-rose-500/20 to-red-500/10 border-rose-500/30 hover:border-rose-400 hover:shadow-[0_0_25px_rgba(244,63,94,0.4)]",
    slate: "from-slate-500/20 to-gray-500/10 border-slate-500/30 hover:border-slate-400 hover:shadow-[0_0_25px_rgba(148,163,184,0.4)]",
  };

  const iconColorMap = {
    amber: "text-amber-400",
    emerald: "text-emerald-400",
    cyan: "text-cyan-400",
    purple: "text-purple-400",
    rose: "text-rose-400",
    slate: "text-slate-300",
  };

  return (
    <Link href={href} className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${colorMap[color]} border backdrop-blur-md p-5 sm:p-6 flex flex-col items-center text-center transition-all duration-300 transform hover:-translate-y-2`}>
      <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div className={`p-3 sm:p-4 rounded-full bg-slate-900/60 mb-3 sm:mb-4 shadow-inner ${iconColorMap[color]} group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
      <h3 className="text-lg sm:text-xl font-bold text-white mb-1.5 sm:mb-2 tracking-wide">{title}</h3>
      <p className="text-xs sm:text-sm text-slate-300 font-light">{description}</p>
    </Link>
  );
};

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-[100dvh] flex items-center justify-center px-4 py-8 sm:p-8 relative overflow-hidden">
      {/* Background overlay specific to landing page to make it readable */}
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-0"></div>

      {/* Decorative gradient glowing orbs */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-amber-500/10 blur-[120px] pointer-events-none z-0"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none z-0"></div>

      <div className="relative z-10 w-full max-w-6xl mx-auto space-y-8 sm:space-y-12 py-4 sm:py-10">
        
        {/* Header Section */}
        <div className="text-center space-y-6">
          <div className="inline-block p-4 bg-slate-900/50 rounded-full border border-amber-500/30 shadow-[0_0_30px_rgba(245,166,35,0.2)] mb-2 transform transition-transform hover:scale-105 duration-500">
            <img 
              src="/logo_lt2.png" 
              alt="Logo LT-II" 
              className="h-20 sm:h-28 md:h-36 w-auto object-contain drop-shadow-[0_0_15px_rgba(245,166,35,0.5)]" 
              onError={(e) => e.target.style.display = 'none'} 
            />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 drop-shadow-lg tracking-tight mb-2 sm:mb-3">
              PORTAL LOMBA TINGKAT II
            </h1>
            <p className="text-sm sm:text-lg md:text-2xl text-amber-100/90 font-bold tracking-[0.1em] sm:tracking-[0.2em] uppercase">
              Kwartir Ranting Mekar Baru 2026
            </p>
          </div>
        </div>

        {/* Main Grid Options */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mt-8 sm:mt-12">
          
          {/* Section: Klasemen */}
          <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl p-5 sm:p-6 md:p-8 border border-slate-700/50 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-[40px] group-hover:bg-amber-500/10 transition-colors duration-500"></div>
            
            <div className="flex items-center gap-3 mb-6 sm:mb-8 relative z-10">
              <div className="p-2 bg-amber-500/20 rounded-lg text-amber-400 border border-amber-500/30">
                <IconTrophy />
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-100 tracking-wider">
                KLASEMEN <span className="text-amber-400">LOMBA</span>
              </h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
              <div className="sm:col-span-2">
                <MenuCard 
                  href="/live" 
                  title="Live Klasemen (Rotasi)" 
                  description="Tampilan interaktif klasemen yang berputar otomatis, cocok untuk layar besar atau proyektor." 
                  icon={<IconLive />} 
                  color="amber" 
                />
              </div>
              <MenuCard 
                href="/leaderboard/sd" 
                title="Klasemen SD/MI" 
                description="Lihat peringkat dan nilai lengkap regu tingkat Sekolah Dasar." 
                icon={<IconSchool />} 
                color="emerald" 
              />
              <MenuCard 
                href="/leaderboard/smp" 
                title="Klasemen SMP/MTs" 
                description="Lihat peringkat dan nilai lengkap regu tingkat Sekolah Menengah." 
                icon={<IconSchool />} 
                color="cyan" 
              />
            </div>
          </div>

          {/* Section: Akses & Registrasi */}
          <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl p-5 sm:p-6 md:p-8 border border-slate-700/50 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-[40px] group-hover:bg-rose-500/10 transition-colors duration-500"></div>

            <div className="flex items-center gap-3 mb-6 sm:mb-8 relative z-10">
              <div className="p-2 bg-slate-800 rounded-lg text-slate-300 border border-slate-700">
                <IconUserPlus />
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-100 tracking-wider">
                AKSES <span className="text-rose-400">PORTAL</span>
              </h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
              <div className="sm:col-span-2">
                <MenuCard 
                  href="/login" 
                  title="Login Dewan Juri" 
                  description="Masuk ke dashboard panel dewan juri untuk melakukan input nilai secara real-time." 
                  icon={<IconLogin />} 
                  color="slate" 
                />
              </div>
              <MenuCard 
                href="/peserta/register" 
                title="Register Peserta" 
                description="Pendaftaran regu dan pangkalan baru untuk mengikuti LT-II." 
                icon={<IconUserPlus />} 
                color="rose" 
              />
              <MenuCard 
                href="/juri/register" 
                title="Register Juri" 
                description="Pendaftaran akun juri untuk mendapat akses penilaian." 
                icon={<IconBadge />} 
                color="purple" 
              />
            </div>
          </div>

        </div>
        
        {/* Footer */}
        <div className="text-center pt-8 text-slate-500 font-mono text-xs md:text-sm tracking-widest relative z-10">
          &copy; {new Date().getFullYear()} KWARTIR RANTING MEKAR BARU. ALL RIGHTS RESERVED.
        </div>
      </div>
    </div>
  );
}
