"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

/**
 * LiveTicker — Komponen ticker line berjalan (FR-LB-03)
 * Menampilkan info ringkas skor terbaru secara real-time.
 *
 * Props:
 * - accentColor: "emerald" | "cyan" | "purple"
 * - kategori: "SD" | "SMP" | "SMK" — filter data realtime
 */

const accentStyles = {
  emerald: {
    bg: "bg-emerald-950/80",
    border: "border-emerald-900/50",
    dot: "bg-emerald-500",
    label: "text-emerald-400",
    itemBg: "bg-emerald-500/10",
    itemText: "text-emerald-300",
    scoreBg: "bg-emerald-500/20",
    scoreText: "text-emerald-400",
  },
  cyan: {
    bg: "bg-cyan-950/80",
    border: "border-cyan-900/50",
    dot: "bg-cyan-500",
    label: "text-cyan-400",
    itemBg: "bg-cyan-500/10",
    itemText: "text-cyan-300",
    scoreBg: "bg-cyan-500/20",
    scoreText: "text-cyan-400",
  },
  purple: {
    bg: "bg-purple-950/80",
    border: "border-purple-900/50",
    dot: "bg-purple-500",
    label: "text-purple-400",
    itemBg: "bg-purple-500/10",
    itemText: "text-purple-300",
    scoreBg: "bg-purple-500/20",
    scoreText: "text-purple-400",
  },
};

export default function LiveTicker({ accentColor = "emerald", kategori = "SD" }) {
  const [tickerItems, setTickerItems] = useState([]);
  const theme = accentStyles[accentColor] || accentStyles.emerald;

  useEffect(() => {
    // Subscribe to realtime changes for new scores
    const channel = supabase
      .channel(`ticker-${kategori}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "penilaian",
        },
        async (payload) => {
          // Fetch peserta name for context
          if (payload.new && payload.new.peserta_id) {
            const { data: peserta } = await supabase
              .from("peserta")
              .select("nama_regu, pangkalan, kategori")
              .eq("id", payload.new.peserta_id)
              .single();

            if (peserta && peserta.kategori === kategori) {
              const timestamp = new Date().toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
              });

              setTickerItems((prev) => {
                const newItem = {
                  id: Date.now(),
                  text: `${peserta.nama_regu} (${peserta.pangkalan})`,
                  pos: payload.new.pos_nilai || "—",
                  nilai: payload.new.nilai,
                  time: timestamp,
                };
                // Keep last 20 items max
                const updated = [newItem, ...prev].slice(0, 20);
                return updated;
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [kategori]);

  // Default placeholder items when no real-time data yet
  const displayItems =
    tickerItems.length > 0
      ? tickerItems
      : [
          { id: 1, text: "Menunggu data penilaian masuk...", pos: "—", nilai: "—", time: "" },
          { id: 2, text: "Skor akan muncul secara real-time", pos: "—", nilai: "—", time: "" },
          { id: 3, text: "Klasemen diperbarui otomatis", pos: "—", nilai: "—", time: "" },
        ];

  // Duplicate items for seamless infinite scroll
  const allItems = [...displayItems, ...displayItems];

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-50 ${theme.bg} backdrop-blur-md border-t ${theme.border}`}>
      <div className="flex items-center h-10 md:h-12">
        {/* Live Badge */}
        <div className="flex-shrink-0 flex items-center gap-2 px-4 md:px-6 border-r border-slate-800/50">
          <span className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${theme.dot} opacity-75`} />
            <span className={`relative inline-flex rounded-full h-2 w-2 ${theme.dot}`} />
          </span>
          <span className={`${theme.label} text-[0.65rem] md:text-xs font-black tracking-[0.15em] uppercase`}>
            LIVE
          </span>
        </div>

        {/* Ticker Content */}
        <div className="ticker-wrap flex-1">
          <div
            className="ticker-content"
            style={{ "--ticker-duration": `${Math.max(20, displayItems.length * 5)}s` }}
          >
            {allItems.map((item, i) => (
              <div key={`${item.id}-${i}`} className="ticker-item">
                {item.time && (
                  <span className="text-slate-600 text-[0.65rem] font-mono">[{item.time}]</span>
                )}
                <span className={`${theme.itemText} text-[0.7rem] md:text-xs`}>{item.text}</span>
                {item.pos !== "—" && (
                  <span className={`${theme.itemBg} px-1.5 py-0.5 rounded text-[0.6rem] ${theme.itemText} font-bold`}>
                    {item.pos}
                  </span>
                )}
                {item.nilai !== "—" && (
                  <span className={`${theme.scoreBg} ${theme.scoreText} px-2 py-0.5 rounded font-black text-[0.7rem]`}>
                    {item.nilai}
                  </span>
                )}
                <span className="text-slate-700 mx-1">•</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
