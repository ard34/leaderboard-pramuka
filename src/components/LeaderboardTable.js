"use client";

import { useRef, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function LeaderboardTable({ data, accentColor = "emerald", tingkat }) {
  const [lombaList, setLombaList] = useState([]);
  const [nilaiMap, setNilaiMap] = useState({});
  const [tickerItems, setTickerItems] = useState([]);
  const [clock, setClock] = useState("");
  const [lastUpdate, setLastUpdate] = useState("—");
  const [changedIds, setChangedIds] = useState(new Set());
  const [changedCellKey, setChangedCellKey] = useState(null);
  
  const prevDataRef = useRef(new Map());

  // Determine category based on accentColor prop
  const kategori = accentColor === "emerald" ? "SD" : accentColor === "cyan" ? "SMP" : "SMK";

  // Live Clock
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setClock(now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch lomba and assessment details
  const fetchDetails = async () => {
    try {
      // 1. Fetch lomba
      const { data: lombaData } = await supabase
        .from("lomba")
        .select("id, nama_lomba, kode_lomba")
        .eq("kategori", kategori)
        .order("nama_lomba", { ascending: true });

      if (lombaData) setLombaList(lombaData);

      // 2. Fetch nilai if there are participants
      if (data && data.length > 0) {
        const ids = data.map((p) => p.id);
        const { data: nilaiData } = await supabase
          .from("penilaian")
          .select("peserta_id, lomba_id, nilai")
          .in("peserta_id", ids);

        if (nilaiData) {
          const map = {};
          const counts = {};
          nilaiData.forEach((n) => {
            const key = `${n.peserta_id}_${n.lomba_id}`;
            if (!map[key]) {
              map[key] = 0;
              counts[key] = 0;
            }
            map[key] += n.nilai;
            counts[key] += 1;
          });
          Object.keys(map).forEach((key) => {
            map[key] = Math.round((map[key] / counts[key]) * 100) / 100;
          });
          setNilaiMap(map);
        }
      }

      // 3. Fetch recent scores for ticker
      const { data: recentScores } = await supabase
        .from("penilaian")
        .select(`
          id,
          nilai,
          updated_at,
          peserta!inner (nama_regu, pangkalan, kategori),
          lomba:lomba_id (nama_lomba)
        `)
        .eq("peserta.kategori", kategori)
        .order("updated_at", { ascending: false })
        .limit(15);

      if (recentScores) {
        const items = recentScores.map((s) => {
          const time = new Date(s.updated_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
          return {
            id: s.id,
            text: `${s.peserta.nama_regu}: ${s.lomba.nama_lomba} = ${s.nilai}`,
            time,
          };
        });
        setTickerItems(items);
      }

      setLastUpdate(new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    } catch (e) {
      console.error("Error loading subpage details:", e);
    }
  };

  // Load details on mount or data change
  useEffect(() => {
    fetchDetails();
  }, [data, kategori]);

  // Realtime update listener specifically for this category
  useEffect(() => {
    const handleRealtimeChange = async (payload) => {
      await fetchDetails();
      if (payload?.new?.id) {
        setChangedIds(new Set([payload.new.id]));
        setTimeout(() => setChangedIds(new Set()), 3500);
      }
    };

    const channelPeserta = supabase
      .channel(`realtime-subpage-peserta-${kategori}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "peserta", filter: `kategori=eq.${kategori}` },
        handleRealtimeChange
      )
      .subscribe();

    const channelNilai = supabase
      .channel(`realtime-subpage-nilai-${kategori}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "penilaian" },
        async (payload) => {
          await fetchDetails();

          if (payload.new && payload.new.peserta_id) {
            setChangedIds(new Set([payload.new.peserta_id]));
            setTimeout(() => setChangedIds(new Set()), 3500);

            const cellKey = `${payload.new.peserta_id}_${payload.new.lomba_id}`;
            setChangedCellKey(cellKey);
            setTimeout(() => setChangedCellKey(null), 3000);

            const { data: p } = await supabase
              .from("peserta")
              .select("nama_regu, pangkalan, kategori")
              .eq("id", payload.new.peserta_id)
              .single();

            const { data: l } = await supabase
              .from("lomba")
              .select("nama_lomba")
              .eq("id", payload.new.lomba_id)
              .single();

            if (p && l && p.kategori === kategori) {
              const time = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
              setTickerItems((prev) => [{
                id: Date.now(),
                text: `${p.nama_regu}: ${l.nama_lomba} = ${payload.new.nilai}`,
                time,
              }, ...prev].slice(0, 30));
              setLastUpdate(time);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channelPeserta);
      supabase.removeChannel(channelNilai);
    };
  }, [kategori]);

  // Rank change detection animations for existing items
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
      const timer = setTimeout(() => setChangedIds(new Set()), 1500);
      return () => clearTimeout(timer);
    }

    const newMap = new Map();
    data.forEach((item, index) => {
      newMap.set(item.id, { index, total_nilai: item.total_nilai });
    });
    prevDataRef.current = newMap;
  }, [data]);

  const getNilai = (pesertaId, lombaId) => {
    return nilaiMap[`${pesertaId}_${lombaId}`];
  };

  const today = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const getTotalClass = (score) => {
    if (score === null || score === undefined || score === 0) return "total-mid";
    if (score >= 93) return "total-high";
    if (score >= 70) return "total-mid";
    return "total-low";
  };

  const displayTickerItems = tickerItems.length > 0
    ? tickerItems
    : [
        { id: "t1", text: `Lomba Pramuka Tingkat ${kategori} sedang berlangsung`, time: "" },
        { id: "t2", text: "Klasemen diperbarui secara real-time melalui sistem dewan juri", time: "" }
      ];

  return (
    <div className={`scoreboard-layout theme-${accentColor}`}>
      <div className="scoreboard-container">
        {/* Banner Header */}
        <div className="scoreboard-banner-header">
          <h1 className="banner-title">Lomba Pramuka Kwaran Mekar Baru</h1>
        </div>

        {/* Sidebar Image Overlay */}
        <img src="/sidebar.png" className="scoreboard-sidebar-img" alt="Scout Sidebar" />

        {/* Top Header Meta Info */}
        <header className="scoreboard-header">
          <div className="header-right-meta">
            <div className="live-indicator">
              <span className="live-dot" />
              LIVE
            </div>
            <span className="header-clock">{clock}</span>
            <span className="header-date">{today}</span>
          </div>
        </header>



        {/* Glass Table Container Overlay */}
        <div className="glass-table-container">
          {/* Info Bar at top of glass container */}
          <div className="scoreboard-info-bar">
            <div className="info-bar-left">
              <span className="info-bar-title">KLASEMEN UMUM CABANG {kategori} - LIVE</span>
            </div>
          </div>

          {/* Leaderboard Table Grid */}
          <div className="scoreboard-table-wrap">
            <div className="scoreboard-table-scroll no-scrollbar">
              <table className="scoreboard-table">
                <thead>
                  <tr>
                    <th className="sc-th-rank sticky-col-rank col-rank">Peringkat</th>
                    <th className="sc-th-name sticky-col-name col-name">NAMA SEKOLAH</th>
                    {lombaList.map((lomba) => (
                      <th key={lomba.id} title={lomba.nama_lomba} className="col-lomba">
                        <div className="sc-th-lomba">{lomba.kode_lomba || lomba.nama_lomba.substring(0, 4)}</div>
                      </th>
                    ))}
                    <th className="sc-th-total sticky-col-total col-total">TOTAL<br />AKUMULASI</th>
                  </tr>
                </thead>
                <tbody>
                  {data.length === 0 ? (
                    <tr>
                      <td colSpan={lombaList.length + 3} className="scoreboard-empty">
                        Belum ada regu terdaftar untuk tingkat {kategori}.
                      </td>
                    </tr>
                  ) : (
                    data.map((regu, index) => {
                      const isChanged = changedIds.has(regu.id);
                      return (
                        <tr
                          key={regu.id}
                          id={`row-${regu.id}`}
                          className={`scoreboard-row leaderboard-row ${isChanged ? "rank-changed" : ""}`}
                        >
                          <td className="sticky-col-rank col-rank">
                            <span className="rank-number">{index + 1}</span>
                          </td>
                          <td className="sticky-col-name col-name">
                            <div className="school-name" title={`${regu.nama_regu} (${regu.pangkalan})`}>
                              {regu.nama_regu}
                            </div>
                          </td>
                          {lombaList.map((lomba) => {
                            const val = getNilai(regu.id, lomba.id);
                            const cellKey = `${regu.id}_${lomba.id}`;
                            const isCellChanged = changedCellKey === cellKey;
                            return (
                              <td key={lomba.id} className="col-lomba">
                                <span className={`score-chip ${val === undefined ? "empty" : ""} ${isCellChanged ? "cell-updated" : ""}`}>
                                  {val !== undefined ? val : "\u2014"}
                                </span>
                              </td>
                            );
                          })}
                          <td className="sticky-col-total col-total">
                            <span className={`total-score ${getTotalClass(regu.total_nilai)} ${isChanged ? "score-updated" : ""}`}>
                              {regu.total_nilai ?? 0}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ===== BOTTOM TICKER ===== */}
        <div className={`fixed bottom-0 left-0 right-0 z-50 backdrop-blur-md border-t ${
          accentColor === "emerald" ? "bg-emerald-950/85 border-emerald-900/50" :
          accentColor === "cyan" ? "bg-cyan-950/85 border-cyan-900/50" :
          "bg-purple-950/85 border-purple-900/50"
        }`}>
          <div className="flex items-center h-8 md:h-10">
            <div className="flex-shrink-0 flex items-center gap-1.5 px-2 md:px-4 border-r border-slate-800/40 h-full bg-cyan-950 text-cyan-400 shadow-[5px_0_15px_rgba(0,0,0,0.3)]">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-500" />
              </span>
              <span className="text-[0.55rem] md:text-[0.65rem] font-black tracking-[0.2em]">TICKER</span>
            </div>

            <div className="ticker-wrap flex-1">
              <div className="ticker-content" style={{ "--ticker-duration": `${Math.max(20, displayTickerItems.length * 4)}s` }}>
                {displayTickerItems.map((item, i) => (
                  <div key={`${item.id}-${i}`} className="ticker-item">
                    {item.time && <span className="text-slate-600 text-[0.5rem] md:text-[0.55rem] font-mono">[{item.time}]</span>}
                    <span className="text-[0.55rem] md:text-[0.65rem] font-bold text-cyan-300">
                      {item.text}
                    </span>
                    <span className="text-slate-700 mx-1">/</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
