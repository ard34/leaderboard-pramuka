"use client";

import { useRef, useEffect, useState } from "react";

/**
 * LeaderboardTable — Komponen reusable untuk tabel klasemen.
 * Mendukung animasi auto-sort (FR-LB-02) saat posisi berubah.
 *
 * Props:
 * - data: Array of { id, nomor_dada, nama_regu, pangkalan, total_nilai }
 * - accentColor: "emerald" | "cyan" | "purple"
 * - tingkat: label tingkatan untuk display
 */

const accentMap = {
  emerald: {
    gradient: "from-emerald-400 to-cyan-400",
    badge: "bg-emerald-500/10 border-emerald-500/20",
    badgeText: "text-emerald-400",
    ping: "bg-emerald-400",
    pingDot: "bg-emerald-500",
    rowHighlight: "bg-emerald-900/10",
    numberColor: "text-emerald-400",
    glow1: "bg-emerald-500/10",
    glow2: "bg-emerald-500/5",
  },
  cyan: {
    gradient: "from-cyan-400 to-blue-500",
    badge: "bg-cyan-500/10 border-cyan-500/20",
    badgeText: "text-cyan-400",
    ping: "bg-cyan-400",
    pingDot: "bg-cyan-500",
    rowHighlight: "bg-cyan-900/10",
    numberColor: "text-cyan-400",
    glow1: "bg-cyan-500/10",
    glow2: "bg-blue-500/5",
  },
  purple: {
    gradient: "from-purple-400 to-fuchsia-500",
    badge: "bg-purple-500/10 border-purple-500/20",
    badgeText: "text-purple-400",
    ping: "bg-purple-400",
    pingDot: "bg-purple-500",
    rowHighlight: "bg-purple-900/10",
    numberColor: "text-purple-400",
    glow1: "bg-purple-500/10",
    glow2: "bg-fuchsia-500/5",
  },
};

export default function LeaderboardTable({ data, accentColor = "emerald", tingkat }) {
  const theme = accentMap[accentColor] || accentMap.emerald;
  const [changedIds, setChangedIds] = useState(new Set());
  const prevDataRef = useRef(new Map());

  // Detect rank changes and trigger animations
  useEffect(() => {
    const prevMap = prevDataRef.current;
    const newChangedIds = new Set();

    data.forEach((item, index) => {
      const prevItem = prevMap.get(item.id);
      if (prevItem && (prevItem.index !== index || prevItem.total_nilai !== item.total_nilai)) {
        newChangedIds.add(item.id);
      }
    });

    if (newChangedIds.size > 0) {
      setChangedIds(newChangedIds);
      const timer = setTimeout(() => setChangedIds(new Set()), 1200);
      return () => clearTimeout(timer);
    }

    // Store current positions for next comparison
    const newMap = new Map();
    data.forEach((item, index) => {
      newMap.set(item.id, { index, total_nilai: item.total_nilai });
    });
    prevDataRef.current = newMap;
  }, [data]);

  // Update prevDataRef after change detection
  useEffect(() => {
    const newMap = new Map();
    data.forEach((item, index) => {
      newMap.set(item.id, { index, total_nilai: item.total_nilai });
    });
    prevDataRef.current = newMap;
  }, [data]);

  const getMedalClass = (index) => {
    if (index === 0) return "medal-gold";
    if (index === 1) return "medal-silver";
    if (index === 2) return "medal-bronze";
    return "bg-slate-800/80 text-slate-400";
  };

  return (
    <div className="min-h-screen bg-[#030712] font-sans text-slate-200 p-4 md:p-10 relative overflow-hidden">
      {/* Background Glow Effects */}
      <div className={`absolute top-[-10%] left-[-10%] w-[500px] h-[500px] ${theme.glow1} blur-[120px] rounded-full pointer-events-none animate-pulse-glow`} />
      <div className={`absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] ${theme.glow2} blur-[120px] rounded-full pointer-events-none animate-pulse-glow`} style={{ animationDelay: "1.5s" }} />
      <div className="bg-grid absolute inset-0 pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-10 md:mb-14 space-y-3">
          <p className="text-xs md:text-sm font-bold tracking-[0.3em] uppercase text-slate-500 mb-2">
            Lomba Pramuka 2026
          </p>
          <h1 className={`text-4xl sm:text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r ${theme.gradient} tracking-tight leading-tight`}>
            LIVE KLASEMEN
          </h1>
          <p className="text-lg md:text-xl text-slate-400 font-semibold tracking-widest uppercase">
            {tingkat}
          </p>
          <div className={`mt-5 inline-flex items-center space-x-2.5 ${theme.badge} border px-5 py-2.5 rounded-full`}>
            <span className="relative flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${theme.ping} opacity-75`} />
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${theme.pingDot}`} />
            </span>
            <span className={`${theme.badgeText} text-xs font-bold tracking-[0.2em]`}>
              REAL-TIME BROADCAST
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="glass-card shadow-2xl overflow-hidden">
          <table className="w-full text-left border-collapse leaderboard-table">
            <thead>
              <tr className="bg-slate-950/60 text-slate-500 text-[0.7rem] md:text-xs uppercase tracking-[0.15em]">
                <th className="p-4 md:p-6 font-bold w-20 md:w-24 text-center">Rank</th>
                <th className="p-4 md:p-6 font-bold hide-mobile">No. Dada</th>
                <th className="p-4 md:p-6 font-bold">Regu & Pangkalan</th>
                <th className="p-4 md:p-6 font-bold text-right w-28 md:w-40">Total Skor</th>
              </tr>
            </thead>
            <tbody className="stagger-fade-in">
              {data.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-16 text-center text-slate-600 italic text-lg">
                    <div className="flex flex-col items-center gap-3">
                      <svg className="w-12 h-12 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      Belum ada regu yang dinilai.
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((regu, index) => (
                  <tr
                    key={regu.id}
                    className={`leaderboard-row border-t border-slate-800/40 ${
                      index < 3 ? theme.rowHighlight : "hover:bg-slate-800/30"
                    } ${changedIds.has(regu.id) ? "rank-changed" : ""}`}
                  >
                    {/* Rank Medal */}
                    <td className="p-4 md:p-6 text-center">
                      <span className={`inline-flex items-center justify-center w-9 h-9 md:w-11 md:h-11 rounded-full font-black text-sm md:text-base ${getMedalClass(index)}`}>
                        {index + 1}
                      </span>
                    </td>
                    {/* Nomor Dada */}
                    <td className={`p-4 md:p-6 text-xl md:text-2xl font-bold font-mono ${theme.numberColor} hide-mobile`}>
                      {regu.nomor_dada}
                    </td>
                    {/* Nama Regu & Pangkalan */}
                    <td className="p-4 md:p-6">
                      <div className="text-base md:text-xl font-bold text-white mb-0.5">{regu.nama_regu}</div>
                      <div className="text-xs md:text-sm text-slate-500">{regu.pangkalan}</div>
                      <div className={`md:hidden text-xs font-mono ${theme.numberColor} mt-1`}>No. {regu.nomor_dada}</div>
                    </td>
                    {/* Total Score */}
                    <td className="p-4 md:p-6 text-right">
                      <span className={`text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400 ${changedIds.has(regu.id) ? "score-updated" : ""}`}>
                        {regu.total_nilai ?? 0}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-slate-600 text-xs tracking-wider">
          Powered by Supabase Realtime • Data diperbarui secara otomatis
        </div>
      </div>
    </div>
  );
}
