"use client";

import { useEffect, useState, useLayoutEffect, useRef, useCallback, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";

const TABS = [
  { key: "SD", label: "SD / MI", color: "emerald" },
  { key: "SMP", label: "SMP / MTs", color: "cyan" },
  { key: "SMK", label: "SMA / SMK / MA", color: "purple" },
];

// Auto-rotation sequence: cycles through all 6 combinations
const ROTATION_SEQUENCE = [
  { tab: "SD", gender: "Laki-laki", label: "SD / MI", genderLabel: "PUTRA", color: "emerald", genderColor: "cyan" },
  { tab: "SD", gender: "Perempuan", label: "SD / MI", genderLabel: "PUTRI", color: "emerald", genderColor: "rose" },
  { tab: "SMP", gender: "Laki-laki", label: "SMP / MTs", genderLabel: "PUTRA", color: "cyan", genderColor: "cyan" },
  { tab: "SMP", gender: "Perempuan", label: "SMP / MTs", genderLabel: "PUTRI", color: "cyan", genderColor: "rose" },
  { tab: "SMK", gender: "Laki-laki", label: "SMA / SMK / MA", genderLabel: "PUTRA", color: "purple", genderColor: "cyan" },
  { tab: "SMK", gender: "Perempuan", label: "SMA / SMK / MA", genderLabel: "PUTRI", color: "purple", genderColor: "rose" },
];

const ROTATION_INTERVAL_MS = 60 * 1000; // 1 menit (60 detik)


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
      {/* Sweeping diagonal bars */}
      <div className="wipe-bar-gold" />
      <div className="wipe-bar-dark" />

      {/* Center Shield Pop */}
      {isActive && (
        <div className="wipe-shield">
          {/* Outer glowing shield container */}
          <div className="shield-glow border-2 border-amber-500/40 bg-slate-950/90 rounded-2xl p-6 flex flex-col items-center gap-3 shadow-[0_0_50px_rgba(245,166,35,0.25)]">
            
            {/* Double Scout Icons side-by-side or combined */}
            <div className="flex gap-4 items-center justify-center mb-1">
              <ScoutFleurDeLis />
              <div className="w-px h-8 bg-amber-500/30" />
              <TunasKelapa />
            </div>

            {/* Transition Category Info */}
            <div className="text-[0.65rem] font-bold text-amber-500/70 tracking-[0.25em] uppercase">
              REPLAY PENILAIAN
            </div>
            
            <div className="text-xl md:text-3xl font-black text-white tracking-wider uppercase whitespace-nowrap">
              {nextItem.label}
            </div>

            <div className="flex items-center gap-2">
              <span className={`text-[0.7rem] font-black tracking-widest px-3.5 py-1 rounded-full border ${
                nextItem.gender === "Laki-laki"
                  ? "text-cyan-400 bg-cyan-500/10 border-cyan-500/30"
                  : "text-rose-400 bg-rose-500/10 border-rose-500/30"
              }`}>
                {nextItem.gender === "Laki-laki" ? "👦 PUTRA" : "👧 PUTRI"}
              </span>
            </div>

          </div>
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


  // Auto-rotation state
  const [rotationIndex, setRotationIndex] = useState(0);
  const [showTransition, setShowTransition] = useState(false);
  const [transitionTarget, setTransitionTarget] = useState(null);
  const [tableTransitionClass, setTableTransitionClass] = useState("");

  const rotationTimerRef = useRef(null);

  const prevBounds = useRef({});
  const prevTab = useRef("SD");
  const prevGender = useRef("Laki-laki");

  // Get next rotation item
  const getNextRotationItem = useCallback(() => {
    const nextIdx = (rotationIndex + 1) % ROTATION_SEQUENCE.length;
    return { item: ROTATION_SEQUENCE[nextIdx], index: nextIdx };
  }, [rotationIndex]);

  // Execute the transition to next category
  const executeRotation = useCallback(() => {
    const currentIdx = rotationIndex;
    const nextIdx = (currentIdx + 1) % ROTATION_SEQUENCE.length;
    const nextItem = ROTATION_SEQUENCE[nextIdx];

    // Phase 1: Show sports wipe overlay + fade out current table simultaneously
    setTransitionTarget(nextItem);
    setShowTransition(true);
    setTableTransitionClass("table-transitioning-out");

    // Phase 2: At midpoint of hold phase (1000ms), switch the actual data
    setTimeout(() => {
      setActiveTab(nextItem.tab);
      setActiveGender(nextItem.gender);
      setRotationIndex(nextIdx);
    }, 1000);

    // Phase 3: Start fading in the new table as the sweep begins to open (1900ms)
    setTimeout(() => {
      setTableTransitionClass("table-transitioning-in");
    }, 1900);

    // Phase 4: Clean up transition overlay (matches 2.6s wipe duration)
    setTimeout(() => {
      setShowTransition(false);
      setTransitionTarget(null);
    }, 2600);

    // Phase 5: Clean up transition class
    setTimeout(() => {
      setTableTransitionClass("");
    }, 2900);
  }, [rotationIndex]);

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
      let initTab = "SD";
      let initGender = "Laki-laki";
      let locked = false;

      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const urlKategori = params.get("kategori") || params.get("tab") || params.get("tingkat");
        const urlGender = params.get("gender") || params.get("k");

        if (urlKategori) {
          const katUpper = urlKategori.toUpperCase();
          if (katUpper === "SD" || katUpper === "SMP" || katUpper === "SMK") {
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
      }

      await fetchData(initTab, initGender);
      setLoading(false);
    };
    loadAwal();
  }, []);

  // Fetch data secara senyap ketika tab atau gender diganti (tanpa memunculkan loading screen hitam)
  useEffect(() => {
    fetchData(activeTab, activeGender);
  }, [activeTab, activeGender]);

  // Realtime subscription (Membaca perubahan secara background)
  useEffect(() => {
    const handleRealtimeChange = async (payload) => {
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
              .select("nama_regu, pangkalan, kategori, gender")
              .eq("id", payload.new.peserta_id)
              .single();

            const { data: l } = await supabase
              .from("lomba")
              .select("nama_lomba")
              .eq("id", payload.new.lomba_id)
              .single();

            if (p && l && p.kategori === activeTab && p.gender === activeGender) {
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
        .select("id, nomor_dada, nama_regu, pangkalan, total_nilai, gender")
        .eq("kategori", kategori)
        .eq("gender", gender)
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

  // Current category info for display badge
  const currentRotation = ROTATION_SEQUENCE[rotationIndex];

  // Ticker items
  const defaultTicker = [
    { id: 1, text: "Menunggu data penilaian masuk...", time: "" },
    { id: 2, text: "Skor akan muncul secara real-time", time: "" },
    { id: 3, text: "Klasemen diperbarui otomatis tanpa refresh", time: "" },
  ];
  const displayTicker = tickerItems.length > 0 ? tickerItems : defaultTicker;
  const allTicker = [...displayTicker, ...displayTicker];

  return (
    <div className="min-h-screen bg-[#030712] text-slate-200 font-sans flex relative overflow-hidden">
      {/* Transition Overlay */}
      <TransitionOverlay isActive={showTransition} nextItem={transitionTarget} />

      {/* Background effects */}
      <div className="absolute top-[-10%] left-[10%] w-[800px] h-[300px] bg-gradient-to-r from-cyan-500/10 via-emerald-500/10 to-transparent blur-[120px] rounded-full pointer-events-none" />
      <div className="bg-grid absolute inset-0 pointer-events-none opacity-40" />

      {/* ===== LEFT SIDEBAR (SCOUT ICON STRIPE) — Hidden on mobile ===== */}
      <aside className="hidden lg:flex w-20 bg-gradient-to-b from-[#3a1d18] to-[#120705] border-r-2 border-r-cyan-500/40 flex-col items-center py-8 gap-10 z-20 shadow-[5px_0_25px_rgba(0,0,0,0.5)]">
        <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-600/20 border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
          <ScoutFleurDeLis />
        </div>
        <div className="flex flex-col gap-8 mt-10">
          <TunasKelapa />
          <ScoutFleurDeLis />
          <TunasKelapa />
          <ScoutFleurDeLis />
          <TunasKelapa />
        </div>
      </aside>

      {/* ===== MAIN CONTENT WRAPPER ===== */}
      <div className="flex-1 flex flex-col min-h-screen relative z-10 overflow-hidden pb-12">

        {/* ===== TOP HEADER BAR ===== */}
        <header className="relative z-20 bg-[#030712]/90 backdrop-blur-xl border-b border-slate-800/60">
          {/* Desktop header: 3-column grid with true centering */}
          <div className="hidden md:grid grid-cols-[auto_1fr_auto] items-center max-w-[1900px] mx-auto px-4 lg:px-6 py-3 gap-4">

            {/* LEFT: Logo slots */}
            <div className="flex items-center gap-2 lg:gap-3 flex-shrink-0">
              <div className="logo-slot">
                <img src="/logos/logo1.png" alt="Logo 1" className="w-full h-full object-contain" onError={(e) => { e.target.style.display = 'none'; }} />
              </div>
              <div className="logo-slot">
                <img src="/logos/logo2.png" alt="Logo 2" className="w-full h-full object-contain" onError={(e) => { e.target.style.display = 'none'; }} />
              </div>
              <div className="logo-slot">
                <img src="/logos/logo3.png" alt="Logo 3" className="w-full h-full object-contain" onError={(e) => { e.target.style.display = 'none'; }} />
              </div>
              <div className="logo-slot">
                <img src="/logos/logo4.png" alt="Logo 4" className="w-full h-full object-contain" onError={(e) => { e.target.style.display = 'none'; }} />
              </div>
              <div className="logo-slot">
                <img src="/logos/logo5.png" alt="Logo 5" className="w-full h-full object-contain" onError={(e) => { e.target.style.display = 'none'; }} />
              </div>
            </div>

            {/* CENTER: Title + Category Badge — always centered */}
            <div className="flex flex-col items-center gap-1 justify-self-center">
              <h1 className="text-lg lg:text-2xl font-black tracking-wider text-white leading-tight text-center whitespace-nowrap">
                LEADBOARD LIVE PENILAIAN <span className="text-gradient-gold">LOMBA PRAMUKA</span>
              </h1>
              <div className="flex items-center gap-2 flex-wrap justify-center">
                <div className="flex items-center gap-1.5 bg-red-500/15 border border-red-500/30 px-2.5 py-0.5 rounded-full">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500" />
                  </span>
                  <span className="text-red-400 text-[0.6rem] font-black tracking-wider">LIVE</span>
                </div>
                <span className="text-[0.6rem] text-slate-500 font-semibold">{today}</span>
                <div className="w-px h-3 bg-slate-800" />
                <span className={`text-[0.6rem] font-black tracking-[0.15em] px-2.5 py-0.5 rounded-full border ${
                  accentColor === "emerald"
                    ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/30"
                    : accentColor === "cyan"
                    ? "text-cyan-400 bg-cyan-500/10 border-cyan-500/30"
                    : "text-purple-400 bg-purple-500/10 border-purple-500/30"
                }`}>
                  {currentRotation.label}
                </span>
                <span className={`text-[0.6rem] font-black tracking-[0.15em] px-2.5 py-0.5 rounded-full border ${
                  activeGender === "Laki-laki"
                    ? "text-cyan-400 bg-cyan-500/10 border-cyan-500/30"
                    : "text-rose-400 bg-rose-500/10 border-rose-500/30"
                }`}>
                  {activeGender === "Laki-laki" ? "👦 PUTRA" : "👧 PUTRI"}
                </span>
                {isLocked && (
                  <span className="text-[0.6rem] font-black tracking-[0.15em] px-2.5 py-0.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400">
                    📌 TERKUNCI (FOKUS)
                  </span>
                )}
              </div>
            </div>

            {/* RIGHT: Clock */}
            <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
              <span className="text-xl lg:text-3xl font-black text-emerald-400 font-mono tracking-wider drop-shadow-[0_0_10px_rgba(16,185,129,0.4)]">
                {clock}
              </span>
              <span className="text-[0.55rem] text-slate-600 font-bold uppercase tracking-widest">LIVE CLOCK</span>
            </div>
          </div>

          {/* Mobile header: stacked layout */}
          <div className="md:hidden px-3 py-2 flex flex-col gap-2">
            {/* Top row: logos + clock */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="logo-slot">
                  <img src="/logos/logo1.png" alt="Logo 1" className="w-full h-full object-contain" onError={(e) => { e.target.style.display = 'none'; }} />
                </div>
                <div className="logo-slot">
                  <img src="/logos/logo2.png" alt="Logo 2" className="w-full h-full object-contain" onError={(e) => { e.target.style.display = 'none'; }} />
                </div>
                <div className="logo-slot">
                  <img src="/logos/logo3.png" alt="Logo 3" className="w-full h-full object-contain" onError={(e) => { e.target.style.display = 'none'; }} />
                </div>
                <div className="logo-slot">
                  <img src="/logos/logo4.png" alt="Logo 4" className="w-full h-full object-contain" onError={(e) => { e.target.style.display = 'none'; }} />
                </div>
                <div className="logo-slot">
                  <img src="/logos/logo5.png" alt="Logo 5" className="w-full h-full object-contain" onError={(e) => { e.target.style.display = 'none'; }} />
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-lg font-black text-emerald-400 font-mono tracking-wider drop-shadow-[0_0_10px_rgba(16,185,129,0.4)]">
                  {clock}
                </span>
              </div>
            </div>

            {/* Title row — centered */}
            <div className="text-center">
              <h1 className="text-[0.7rem] xs:text-sm font-black tracking-wider text-white leading-tight">
                LEADBOARD LIVE PENILAIAN <span className="text-gradient-gold">LOMBA PRAMUKA</span>
              </h1>
            </div>

            {/* Badges row */}
            <div className="flex items-center gap-1.5 justify-center flex-wrap">
              <div className="flex items-center gap-1 bg-red-500/15 border border-red-500/30 px-2 py-0.5 rounded-full">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500" />
                </span>
                <span className="text-red-400 text-[0.55rem] font-black tracking-wider">LIVE</span>
              </div>
              <span className="text-[0.55rem] text-slate-500 font-semibold">{today}</span>
              <span className={`text-[0.55rem] font-black tracking-[0.1em] px-2 py-0.5 rounded-full border ${
                accentColor === "emerald"
                  ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/30"
                  : accentColor === "cyan"
                  ? "text-cyan-400 bg-cyan-500/10 border-cyan-500/30"
                  : "text-purple-400 bg-purple-500/10 border-purple-500/30"
              }`}>
                {currentRotation.label}
              </span>
              <span className={`text-[0.55rem] font-black tracking-[0.1em] px-2 py-0.5 rounded-full border ${
                activeGender === "Laki-laki"
                  ? "text-cyan-400 bg-cyan-500/10 border-cyan-500/30"
                  : "text-rose-400 bg-rose-500/10 border-rose-500/30"
              }`}>
                {activeGender === "Laki-laki" ? "👦 PUTRA" : "👧 PUTRI"}
              </span>
              {isLocked && (
                <span className="text-[0.55rem] font-black tracking-[0.1em] px-2 py-0.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400">
                  📌 TERKUNCI
                </span>
              )}
            </div>
          </div>
        </header>

        {/* ===== FULL-WIDTH LEADERBOARD TABLE ===== */}
        <main className="flex-1 max-w-[1900px] w-full mx-auto px-2 md:px-4 lg:px-6 py-2 md:py-4 flex flex-col">
          <div className={`flex-1 glass-card flex flex-col overflow-hidden shadow-[0_10px_35px_rgba(0,0,0,0.4)] ${tableTransitionClass}`}>
            {loading ? (
              <div className="flex-1 flex items-center justify-center py-32">
                <div className="w-10 h-10 border-4 rounded-full animate-spin border-t-emerald-500" />
              </div>
            ) : (
              <div className="overflow-x-auto flex-1 mobile-table-scroll">
                <table className="w-full text-left asean-table mobile-table">
                  <thead>
                    <tr className="asean-header-row sticky top-0 z-10">
                      <th className="p-2 md:p-3 text-center w-12 md:w-16 sticky left-0 bg-[#005fa9] z-20">
                        <span className="hidden md:inline">PERINGKAT</span>
                        <span className="md:hidden">#</span>
                      </th>
                      <th className="p-2 md:p-3 text-left sticky left-12 md:left-16 bg-[#005fa9] z-20 min-w-[120px] md:min-w-[180px]">
                        <span className="hidden md:inline">NAMA SEKOLAH</span>
                        <span className="md:hidden">NAMA</span>
                      </th>
                      {currentLombaCols.map((lomba) => (
                        <th
                          key={lomba.id}
                          className="p-1.5 md:p-2 text-center min-w-[55px] md:min-w-[75px]"
                          title={lomba.nama_lomba}
                        >
                          {lomba.kode_lomba}
                        </th>
                      ))}
                      <th className="p-2 md:p-3 text-center w-20 md:w-28">
                        <span className="hidden md:inline">TOTAL AKUMULASI</span>
                        <span className="md:hidden">TOTAL</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {peserta.length === 0 ? (
                      <tr>
                        <td colSpan={currentLombaCols.length + 3} className="p-8 md:p-16 text-center text-slate-600 italic text-sm md:text-base">
                          Belum ada regu terdaftar untuk tingkat {activeTab}.
                        </td>
                      </tr>
                    ) : (
                      peserta.map((regu, index) => {
                        const isChanged = changedIds.has(regu.id);

                        return (
                          <tr
                            key={regu.id}
                            id={`row-${regu.id}`}
                            className={`asean-row leaderboard-row ${isChanged ? "rank-changed" : ""}`}
                          >
                            <td className="p-2 md:p-3 text-center sticky left-0 z-10 font-black text-cyan-400 text-xs md:text-base">
                              {index + 1}
                            </td>

                            <td className="p-2 md:p-3 sticky left-12 md:left-16 z-10">
                              <div className="text-[0.65rem] md:text-sm font-bold text-white leading-tight">{regu.nama_regu}</div>
                              <div className="text-[0.5rem] md:text-[0.6rem] text-slate-400 leading-tight truncate max-w-[100px] md:max-w-none">{regu.pangkalan}</div>
                            </td>

                            {currentLombaCols.map((lomba) => {
                              const val = getNilai(regu.id, lomba.id);
                              const cellKey = `${regu.id}_${lomba.id}`;
                              const isCellChanged = changedCellKey === cellKey;
                              return (
                                <td key={lomba.id} className="p-1.5 md:p-2 text-center">
                                  <span className={`text-[0.6rem] md:text-xs font-bold text-white tabular-nums ${
                                    isCellChanged ? "cell-updated" : ""
                                  }`}>
                                    {val !== undefined ? val : "—"}
                                  </span>
                                </td>
                              );
                            })}

                            <td className="p-2 md:p-3 text-center">
                              <span className={`text-[0.7rem] md:text-sm font-black text-amber-400 tabular-nums ${
                                isChanged ? "score-updated" : ""
                              }`}>
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
        </main>
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
            <div className="ticker-content" style={{ "--ticker-duration": `${Math.max(20, displayTicker.length * 4)}s` }}>
              {allTicker.map((item, i) => (
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
  );
}
