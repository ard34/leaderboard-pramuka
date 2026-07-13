"use client";

import { useEffect, useState, useLayoutEffect, useRef, useCallback, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";

const TABS = [
  { key: "SD", label: "SD / MI", color: "emerald" },
  { key: "SMP", label: "SMP / MTs", color: "cyan" },
];

// Auto-rotation sequence: cycles through all 4 combinations
const ROTATION_SEQUENCE = [
  { tab: "SD", gender: "Laki-laki", label: "SD / MI", genderLabel: "PUTRA", color: "emerald", genderColor: "cyan" },
  { tab: "SD", gender: "Perempuan", label: "SD / MI", genderLabel: "PUTRI", color: "emerald", genderColor: "rose" },
  { tab: "SMP", gender: "Laki-laki", label: "SMP / MTs", genderLabel: "PUTRA", color: "cyan", genderColor: "cyan" },
  { tab: "SMP", gender: "Perempuan", label: "SMP / MTs", genderLabel: "PUTRI", color: "cyan", genderColor: "rose" },
];

const ROTATION_INTERVAL_MS = 3 * 60 * 1000; // 3 menit (180 detik)


// Scout Fleur-de-lis SVG Component (Gold Scout Emblem)
const ScoutFleurDeLis = () => (
  <svg className="w-8 h-8 text-amber-500/60 hover:text-amber-400 transition-colors drop-shadow-[0_0_8px_rgba(245,166,35,0.3)]" viewBox="0 0 100 100" fill="currentColor">
    <path d="M50 12c-1.5 8.5-7.5 17.5-12.5 24-4.5 5.8-9 10.2-12.5 15.5-5.5 8.2-7 18-3.5 27 3.2 8 11.5 13.5 20.5 13.5h16c9 0 17.2-5.5 20.5-13.5 3.5-9 2-18.8-3.5-27-3.5-5.3-8-9.7-12.5-15.5-5-6.5-11-15.5-12.5-24zm0 65c-15.5 0-24-8.5-24-8.5s6.2-4.2 12-4.2c9.2 0 12 3.5 12 3.5s2.8-3.5 12-3.5c5.8 0 12 4.2 12 4.2s-8.5 8.5-24 8.5zm-4-11h8v8h-8z" />
  </svg>
);

// Tunas Kelapa SVG Component (Indonesian Scout Bud)
const TunasKelapa = () => (
  <svg className="w-8 h-8 text-amber-500/60 hover:text-amber-400 transition-colors drop-shadow-[0_0_8px_rgba(245,166,35,0.3)]" viewBox="0 0 100 100" fill="currentColor">
    <path d="M50 15c-3 15-18 20-18 38 0 15 10 24 22 24s22-9 22-24c0-18-15-23-18-38zm-6 50c-2.5 0-4.5-2-4.5-4.5s2-4.5 4.5-4.5 4.5 2 4.5 4.5-2 4.5-4.5 4.5zm12 0c-2.5 0-4.5-2-4.5-4.5s2-4.5 4.5-4.5 4.5 2 4.5 4.5-2 4.5-4.5 4.5z" />
  </svg>
);

// Transition overlay component for Sports Broadcast Replay Style
const TransitionOverlay = ({ isActive, nextItem }) => {
  if (!nextItem) return null;

  return (
    <div className={`sports-wipe-overlay ${isActive ? "active" : ""}`}>
      {/* Sliding Glass Curtain */}
      <div className="wipe-curtain" />

      {/* Center Shield Pop */}
      {isActive && (
        <div className="wipe-shield">
            {/* Logo HUT 65 without any enclosing card/box */}
            <img 
              src="/logo_65.png" 
              alt="Logo 65 HUT Pramuka" 
              className="h-64 md:h-80 w-auto object-contain drop-shadow-[0_0_35px_rgba(245,166,35,0.6)]" 
            />
        </div>
      )}
    </div>
  );
};

export default function Home() {
  const [activeTab, setActiveTab] = useState("SD");
  const [peserta, setPeserta] = useState([]);
  const [lombaList, setLombaList] = useState([]);
  const [nilaiMap, setNilaiMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [clock, setClock] = useState("");
  const [lastUpdate, setLastUpdate] = useState("—");
  const [tickerItems, setTickerItems] = useState([]);
  const [changedIds, setChangedIds] = useState(new Set());
  const [changedCellKey, setChangedCellKey] = useState(null);
  const [activeGender, setActiveGender] = useState("Laki-laki");
  const [isLocked, setIsLocked] = useState(false);
  const [availableCounts, setAvailableCounts] = useState({});
  const [announcements, setAnnouncements] = useState([]);


  // Auto-rotation state
  const [rotationIndex, setRotationIndex] = useState(0);
  const [showTransition, setShowTransition] = useState(false);
  const [transitionTarget, setTransitionTarget] = useState(null);
  const [tableTransitionClass, setTableTransitionClass] = useState("");

  const rotationTimerRef = useRef(null);

  const prevBounds = useRef({});
  const prevTab = useRef("SD");
  const prevGender = useRef("Laki-laki");

  // Find next rotation item (cycles sequentially through all 4 categories)
  const findNextRotationIndex = useCallback((fromIdx) => {
    const len = ROTATION_SEQUENCE.length;
    return (fromIdx + 1) % len;
  }, []);

  // Execute the transition to next category
  const executeRotation = useCallback(() => {
    const nextIdx = findNextRotationIndex(rotationIndex);
    if (nextIdx === -1 || nextIdx === rotationIndex) return; // Skip if nothing to rotate to

    const nextItem = ROTATION_SEQUENCE[nextIdx];

    // Phase 1: Show sports wipe overlay + fade out current table simultaneously
    setTransitionTarget(nextItem);
    setShowTransition(true);
    setTableTransitionClass("table-transitioning-out");

    // Phase 2: At midpoint of hold phase (1300ms), switch the actual data
    setTimeout(() => {
      setActiveTab(nextItem.tab);
      setActiveGender(nextItem.gender);
      setRotationIndex(nextIdx);
      // Persist current view so refresh stays on this category
      try {
        sessionStorage.setItem("_lb_state", JSON.stringify({ tab: nextItem.tab, gender: nextItem.gender, rotIdx: nextIdx }));
      } catch (_) {}
    }, 1300);

    // Phase 3: Start fading in the new table as the overlay begins to fade out (2100ms)
    setTimeout(() => {
      setTableTransitionClass("table-transitioning-in");
    }, 2100);

    // Phase 4: Clean up transition overlay (matches 2.6s duration)
    setTimeout(() => {
      setShowTransition(false);
      setTransitionTarget(null);
    }, 2600);

    // Phase 5: Clean up transition class
    setTimeout(() => {
      setTableTransitionClass("");
    }, 2900);
  }, [rotationIndex, findNextRotationIndex]);

  // Initialize auto-rotation on mount
  useEffect(() => {
    if (!loading && !isLocked) {
      rotationTimerRef.current = setInterval(() => {
        executeRotation();
      }, ROTATION_INTERVAL_MS);
    }

    return () => {
      if (rotationTimerRef.current) clearInterval(rotationTimerRef.current);
    };
  }, [loading, isLocked, executeRotation]);

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

  // Fetch data awal sekali saja saat website pertama dibuka, cek URL query params
  useEffect(() => {
    const loadAwal = async () => {
      // Fetch participant counts for all 6 combos to know which categories have data
      const countMap = {};
      try {
        const { data: countData } = await supabase
          .from("peserta")
          .select("kategori, gender")
          .eq("is_verified", true);
        if (countData) {
          countData.forEach((p) => {
            const key = `${p.kategori}_${p.gender}`;
            countMap[key] = (countMap[key] || 0) + 1;
          });
        }
      } catch (_) {}
      setAvailableCounts(countMap);

      let initTab = "SD";
      let initGender = "Laki-laki";
      let initRotIdx = 0;
      let locked = false;

      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const urlKategori = params.get("kategori") || params.get("tab") || params.get("tingkat");
        const urlGender = params.get("gender") || params.get("k");

        if (urlKategori) {
          const katUpper = urlKategori.toUpperCase();
          if (katUpper === "SD" || katUpper === "SMP") {
            initTab = katUpper;
            locked = true;
          }
        }

        if (urlGender) {
          const genLower = urlGender.toLowerCase();
          if (
            genLower === "laki-laki" ||
            genLower === "laki" ||
            genLower === "l" ||
            genLower === "putra" ||
            genLower === "putera"
          ) {
            initGender = "Laki-laki";
            locked = true;
          } else if (
            genLower === "perempuan" ||
            genLower === "p" ||
            genLower === "putri"
          ) {
            initGender = "Perempuan";
            locked = true;
          }
        }

        // If no URL params, restore from sessionStorage (survive refresh)
        if (!locked) {
          try {
            const saved = JSON.parse(sessionStorage.getItem("_lb_state") || "null");
            if (saved && saved.tab && saved.gender) {
              const validTabs = ["SD", "SMP"];
              const validGenders = ["Laki-laki", "Perempuan"];
              if (validTabs.includes(saved.tab) && validGenders.includes(saved.gender)) {
                initTab = saved.tab;
                initGender = saved.gender;
                if (typeof saved.rotIdx === "number") initRotIdx = saved.rotIdx;
              }
            }
          } catch (_) {}
        }
      }

      if (locked) {
        setActiveTab(initTab);
        setActiveGender(initGender);
        setIsLocked(true);
        const matchIdx = ROTATION_SEQUENCE.findIndex(
          (item) => item.tab === initTab && item.gender === initGender
        );
        if (matchIdx !== -1) {
          setRotationIndex(matchIdx);
        }
      } else {
        setActiveTab(initTab);
        setActiveGender(initGender);
        setRotationIndex(initRotIdx);
      }

      await fetchData(initTab, initGender);
      setLoading(false);
    };
    loadAwal();
  }, []);

  // Persist active view to sessionStorage so refresh stays on same category
  useEffect(() => {
    if (loading) return;
    try {
      sessionStorage.setItem("_lb_state", JSON.stringify({ tab: activeTab, gender: activeGender, rotIdx: rotationIndex }));
    } catch (_) {}
  }, [activeTab, activeGender, rotationIndex, loading]);

  // Fetch data secara senyap ketika tab atau gender diganti (tanpa memunculkan loading screen hitam)
  useEffect(() => {
    fetchData(activeTab, activeGender);
  }, [activeTab, activeGender]);

  // Realtime subscription (Membaca perubahan secara background)
  useEffect(() => {
    const handleRealtimeChange = async (payload) => {
      // Ignore updates for unverified participants
      if (payload?.new && !payload.new.is_verified) {
        return;
      }
      await fetchData(activeTab, activeGender);
      if (payload?.new?.id) {
        setChangedIds(new Set([payload.new.id]));
        setTimeout(() => setChangedIds(new Set()), 3500);
      }
    };

    const channelPeserta = supabase
      .channel(`realtime-home-peserta-${activeTab}-${activeGender}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "peserta", filter: `kategori=eq.${activeTab}` },
        handleRealtimeChange
      )
      .subscribe();

    const channelNilai = supabase
      .channel(`realtime-home-nilai-${activeTab}-${activeGender}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "penilaian" },
        async (payload) => {
          await fetchData(activeTab, activeGender);

          if (payload.new && payload.new.peserta_id) {
            setChangedIds(new Set([payload.new.peserta_id]));
            setTimeout(() => setChangedIds(new Set()), 3500);

            const cellKey = `${payload.new.peserta_id}_${payload.new.lomba_id}`;
            setChangedCellKey(cellKey);
            setTimeout(() => setChangedCellKey(null), 3000);

            const { data: p } = await supabase
              .from("peserta")
              .select("nama_regu, pangkalan, kategori, gender, is_verified")
              .eq("id", payload.new.peserta_id)
              .single();

            const { data: l } = await supabase
              .from("lomba")
              .select("nama_lomba")
              .eq("id", payload.new.lomba_id)
              .single();

            if (p && l && p.is_verified && p.kategori === activeTab && p.gender === activeGender) {
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
  }, [activeTab, activeGender]);

  useLayoutEffect(() => {
    if (prevTab.current !== activeTab || prevGender.current !== activeGender) {
      prevTab.current = activeTab;
      prevGender.current = activeGender;
      prevBounds.current = {};
      return;
    }

    if (Object.keys(prevBounds.current).length === 0) return;

    peserta.forEach((p) => {
      const el = document.getElementById(`row-${p.id}`);
      if (!el) return;

      const prevTop = prevBounds.current[p.id];
      if (prevTop === undefined) return;

      const currentTop = el.getBoundingClientRect().top;
      const deltaY = prevTop - currentTop;

      if (deltaY !== 0) {
        const scale = deltaY > 0 ? 1.06 : 0.94;
        const zIndex = deltaY > 0 ? 50 : 10;
        const rotate = deltaY > 0 ? -1.8 : 0;
        el.style.transform = `translateY(${deltaY}px) scale(${scale}) rotate(${rotate}deg)`;
        el.style.zIndex = zIndex;
        el.style.position = "relative";
        el.style.transition = "none";

        if (deltaY > 0) {
          el.classList.add("row-floating-up");
        } else {
          el.classList.add("row-sliding-down");
        }

        el.offsetHeight;

        requestAnimationFrame(() => {
          el.style.transform = "translateY(0px) scale(1) rotate(0deg)";
          el.style.transition = "transform 1.8s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.5s ease";

          setTimeout(() => {
            el.classList.remove("row-floating-up");
            el.classList.remove("row-sliding-down");
            el.style.transform = "";
            el.style.transition = "";
            el.style.zIndex = "";
            el.style.position = "";
          }, 1800);
        });
      }
    });

    prevBounds.current = {};
  }, [peserta]);

  const fetchData = async (kategori, gender) => {
    try {
      const { data: lombaData } = await supabase
        .from("lomba")
        .select("id, nama_lomba, kode_lomba, kategori")
        .order("nama_lomba", { ascending: true });

      if (lombaData) setLombaList(lombaData);

      const { data: pesertaData } = await supabase
        .from("peserta")
        .select("id, nomor_dada, nama_regu, pangkalan, total_nilai, gender, no_gudep")
        .eq("kategori", kategori)
        .eq("gender", gender)
        .eq("is_verified", true)
        .order("total_nilai", { ascending: false });

      if (pesertaData) {
        const bounds = {};
        peserta.forEach((p) => {
          const el = document.getElementById(`row-${p.id}`);
          if (el) {
            bounds[p.id] = el.getBoundingClientRect().top;
          }
        });
        prevBounds.current = bounds;
        setPeserta(pesertaData);
        // Update available counts so auto-rotation knows which categories have data
        setAvailableCounts((prev) => ({ ...prev, [`${kategori}_${gender}`]: pesertaData.length }));
      }

      if (pesertaData && pesertaData.length > 0) {
        const ids = pesertaData.map((p) => p.id);
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

      // Fetch recent scores for ticker
      const { data: recentScores } = await supabase
        .from("penilaian")
        .select(`
          id,
          nilai,
          updated_at,
          peserta!inner (nama_regu, pangkalan, kategori, gender),
          lomba:lomba_id (nama_lomba)
        `)
        .eq("peserta.kategori", kategori)
        .order("updated_at", { ascending: false })
        .limit(15);
 
      const { data: infoData } = await supabase
        .from("informasi")
        .select("id, text, created_at")
        .order("created_at", { ascending: false })
        .limit(5);
 
      if (infoData) {
        setAnnouncements(infoData);
      }
 
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
      console.error(e);
    }
  };

  const getNilai = (pesertaId, lombaId) => {
    return nilaiMap[`${pesertaId}_${lombaId}`];
  };

  const today = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const accentColor = activeTab === "SD" ? "emerald" : activeTab === "SMP" ? "cyan" : "purple";
  const currentLombaCols = lombaList.filter((l) => l.kategori === activeTab);

  // Helper: determine total score color class
  const getTotalClass = (score) => {
    if (score === null || score === undefined || score === 0) return "total-mid";
    if (score >= 93) return "total-high";
    if (score >= 70) return "total-mid";
    return "total-low";
  };

  // Current category info (used by TransitionOverlay)
  const currentRotation = ROTATION_SEQUENCE[rotationIndex];

  // Combine custom announcements and real-time scores
  const announcementItems = announcements.map((info) => ({
    id: info.id,
    text: `📢 ${info.text}`,
    time: info.created_at
      ? new Date(info.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
      : "",
  }));
 
  const displayTickerItemsList = [
    ...announcementItems,
    ...tickerItems
  ].slice(0, 15);
 
  const displayTickerItems = displayTickerItemsList.length > 0
    ? displayTickerItemsList
    : [
        { id: "t1", text: "Lomba Tingkat II Kwartir Ranting Mekar Baru sedang berlangsung", time: "" },
        { id: "t2", text: "Klasemen diperbarui secara real-time melalui sistem dewan juri", time: "" }
      ];

  return (
    <div className={`scoreboard-layout theme-${accentColor}`}>
      <div className="scoreboard-container">
        {/* Transition Overlay */}
        <TransitionOverlay isActive={showTransition} nextItem={transitionTarget} />

        {/* Banner Header */}
        <div className="scoreboard-banner-header">
          <h1 className="banner-title">Lomba Tingkat II Kwartir Ranting Mekar Baru</h1>
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
        <div className={`glass-table-container ${tableTransitionClass}`}>
          {/* Info Bar at top of glass container */}
          <div className="scoreboard-info-bar">
            <div className="info-bar-left">
              <span className="info-bar-title">KLASEMEN UMUM CABANG {activeTab} {activeGender === "Laki-laki" ? "PUTRA" : "PUTRI"}</span>
            </div>
          </div>

          {/* Leaderboard Table Grid */}
          <div className="scoreboard-table-wrap">
            {loading ? (
              <div className="scoreboard-loading">
                <div className="scoreboard-spinner" />
              </div>
            ) : (
              <div className="scoreboard-table-scroll no-scrollbar">
                <table className="scoreboard-table">
                  <thead>
                    <tr>
                      <th className="sc-th-rank sticky-col-rank col-rank">Peringkat</th>
                      <th className="sc-th-name sticky-col-name col-name">NO. GUDEP</th>
                      {currentLombaCols.map((lomba) => (
                        <th key={lomba.id} title={lomba.nama_lomba} className="col-lomba">
                          <div className="sc-th-lomba">{lomba.kode_lomba || lomba.nama_lomba.substring(0, 4)}</div>
                        </th>
                      ))}
                      <th className="sc-th-total sticky-col-total col-total">TOTAL<br />AKUMULASI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {peserta.length === 0 ? (
                      <tr>
                        <td colSpan={currentLombaCols.length + 3} className="scoreboard-empty">
                          Belum ada regu terdaftar untuk tingkat {activeTab} {activeGender === "Laki-laki" ? "Putra" : "Putri"}.
                        </td>
                      </tr>
                    ) : (
                      peserta.map((regu, index) => {
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
                              <div className="school-name text-xs md:text-sm font-mono font-bold text-white" title={`Regu: ${regu.nama_regu} | Sekolah: ${regu.pangkalan}`}>
                                {regu.no_gudep || "—"}
                              </div>
                            </td>
                            {currentLombaCols.map((lomba) => {
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
            )}
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
