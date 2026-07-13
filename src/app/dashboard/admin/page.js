"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import { useOnlineStatus } from "@/lib/useOnlineStatus";

export default function DashboardAdmin() {
  const router = useRouter();
  const isOnline = useOnlineStatus();

  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("penilaian"); // "penilaian", "peserta", "juri", "lomba", "laporan", "informasi"

  // Live Ticker & Report states
  const [informasiList, setInformasiList] = useState([]);
  const [newInformasi, setNewInformasi] = useState("");
  const [reportTingkat, setReportTingkat] = useState("SD");
  const [reportGender, setReportGender] = useState("Laki-laki");

  // Data state
  const [pesertaList, setPesertaList] = useState([]);
  const [lombaList, setLombaList] = useState([]);
  const [juriList, setJuriList] = useState([]);
  const [nilaiMap, setNilaiMap] = useState({});
  const [editedNilai, setEditedNilai] = useState({});

  // Filter & Search state (Penilaian)
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTingkat, setFilterTingkat] = useState("SD"); // Default to SD to show clean columns
  const [filterGender, setFilterGender] = useState("Laki-laki");
  const [filterStatus, setFilterStatus] = useState("SEMUA");

  // Forms state
  const [formPeserta, setFormPeserta] = useState({ nomor_dada: "", nama_regu: "", pangkalan: "", kategori: "SD", gender: "Laki-laki" });
  const [formJuri, setFormJuri] = useState({ nama_lengkap: "", email: "", password: "", kategori: "SEMUA", lomba_id: "SEMUA" });
  const [formLomba, setFormLomba] = useState({ nama_lomba: "", kode_lomba: "", kategori: "SD" });

  // UI state
  const [saving, setSaving] = useState(false);
  const [logEntries, setLogEntries] = useState([]);
  const [pesanAdmin, setPesanAdmin] = useState({ type: "", text: "" });
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [verifyingId, setVerifyingId] = useState(null);
  const [noDadaInput, setNoDadaInput] = useState("");

  // Auth check
  useEffect(() => {
    cekAuth();
  }, []);

  const cekAuth = async () => {
    // Try to use cached profile from login page (avoids redundant getSession + profile query)
    try {
      const cached = JSON.parse(sessionStorage.getItem("_profile_cache") || "null");
      if (cached && cached.role === "admin" && (Date.now() - cached.ts) < 30000) {
        sessionStorage.removeItem("_profile_cache");
        setAdmin({ nama_lengkap: cached.nama_lengkap, role: cached.role });
        setLoading(false);
        fetchAllData();
        return;
      }
    } catch (_) { /* ignore parse errors */ }

    // Fallback: normal auth check
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/login");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("nama_lengkap, role")
      .eq("id", session.user.id)
      .single();

    if (profile?.role !== "admin") {
      router.push("/dashboard/juri");
      return;
    }

    setAdmin(profile);
    setLoading(false);
    fetchAllData();
  };

  const fetchAllData = async () => {
    // Run ALL queries in parallel instead of sequential
    const [lombaRes, pesertaRes, penilaianRes, jurisRes, logsRes, informasiRes] = await Promise.all([
      // Fetch all cabang lomba
      supabase
        .from("lomba")
        .select("id, nama_lomba, kode_lomba, kategori")
        .order("nama_lomba", { ascending: true }),

      // Fetch all peserta (including Gudep, CP, is_verified)
      supabase
        .from("peserta")
        .select("id, nomor_dada, nama_regu, pangkalan, kategori, gender, total_nilai, no_gudep, kontak_person, is_verified")
        .order("is_verified", { ascending: true })
        .order("nomor_dada", { ascending: true }),

      // Fetch all penilaian
      supabase
        .from("penilaian")
        .select("peserta_id, lomba_id, nilai"),

      // Fetch all juri from profiles
      supabase
        .from("profiles")
        .select("id, nama_lengkap, assigned_lomba_id, assigned_kategori, assigned_gender, lomba(nama_lomba)")
        .eq("role", "juri")
        .order("nama_lengkap", { ascending: true }),

      // Fetch scoring activity logs (Join tables dynamically)
      supabase
        .from("penilaian")
        .select(`
          created_at,
          nilai,
          peserta (nama_regu, pangkalan),
          lomba (nama_lomba),
          profiles (nama_lengkap)
        `)
        .order("created_at", { ascending: false })
        .limit(30),

      // Fetch all live ticker announcements
      supabase
        .from("informasi")
        .select("id, text, created_at")
        .order("created_at", { ascending: false }),
    ]);

    // Apply all results
    if (lombaRes.data) setLombaList(lombaRes.data);
    if (pesertaRes.data) setPesertaList(pesertaRes.data);
    if (jurisRes.data) setJuriList(jurisRes.data);
    if (logsRes.data) setLogEntries(logsRes.data);
    if (informasiRes.data) setInformasiList(informasiRes.data);

    // Process penilaian map
    if (penilaianRes.data) {
      const map = {};
      const counts = {};
      penilaianRes.data.forEach((p) => {
        const key = `${p.peserta_id}_${p.lomba_id}`;
        if (!map[key]) {
          map[key] = 0;
          counts[key] = 0;
        }
        map[key] += p.nilai;
        counts[key] += 1;
      });
      Object.keys(map).forEach((key) => {
        map[key] = Math.round((map[key] / counts[key]) * 100) / 100;
      });
      setNilaiMap(map);
    }
  };

  // Add local log helper (for simple UI actions)
  const addLog = useCallback((message) => {
    // Keep it for UI events
  }, []);

  const showPesan = (type, text) => {
    setPesanAdmin({ type, text });
    setTimeout(() => setPesanAdmin({ type: "", text: "" }), 5000);
  };

  // Filtered dynamic columns (Lomba) for current category
  const dynamicLombaCols = lombaList.filter((l) => l.kategori === filterTingkat);

  // Filtered Juri dynamic options based on selected Juri Kategori
  const dynamicJuriLombaOptions = formJuri.kategori === "SEMUA" 
    ? lombaList 
    : lombaList.filter((l) => l.kategori === formJuri.kategori);

  // --- HANDLERS: PENILAIAN ---
  const handleNilaiChange = (pesertaId, lombaId, value) => {
    if (value === "") {
      setEditedNilai((prev) => ({ ...prev, [`${pesertaId}_${lombaId}`]: "" }));
      return;
    }
    const numValue = Math.min(100, Math.max(0, Number(value)));
    setEditedNilai((prev) => ({ ...prev, [`${pesertaId}_${lombaId}`]: numValue }));
  };

  const getCellValue = (pesertaId, lombaId) => {
    const key = `${pesertaId}_${lombaId}`;
    if (editedNilai[key] !== undefined) return editedNilai[key];
    if (nilaiMap[key] !== undefined) return nilaiMap[key];
    return "";
  };

  const handleSimpanSemua = async () => {
    if (Object.keys(editedNilai).length === 0) return;
    setSaving(true);

    const { data: { session } } = await supabase.auth.getSession();
    let successCount = 0, errorCount = 0;

    for (const [key, nilai] of Object.entries(editedNilai)) {
      const [pesertaId, lombaId] = key.split("_");

      // 1. Hapus nilai juri lain untuk regu & pos ini agar nilai Admin mendominasi/override
      const { error: deleteError } = await supabase
        .from("penilaian")
        .delete()
        .eq("peserta_id", pesertaId)
        .eq("lomba_id", lombaId);

      if (deleteError) {
        errorCount++;
        continue;
      }

      // 2. Jika nilai tidak kosong, masukkan nilai baru dari Admin
      if (nilai !== "") {
        const { error } = await supabase.from("penilaian").insert({
          peserta_id: pesertaId,
          juri_id: session.user.id,
          lomba_id: lombaId,
          nilai: Number(nilai)
        });

        if (error) {
          errorCount++;
        } else {
          successCount++;
        }
      } else {
        successCount++; // Berhasil dihapus kosong
      }
    }

    setEditedNilai({});
    await fetchAllData();
    setSaving(false);
  };

  // --- HANDLERS: PESERTA ---
  const handleTambahPeserta = async (e) => {
    e.preventDefault();
    if (!formPeserta.nomor_dada || !formPeserta.nama_regu || !formPeserta.pangkalan) {
      showPesan("error", "Lengkapi semua data regu.");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("peserta").insert({
      nomor_dada: Number(formPeserta.nomor_dada),
      nama_regu: formPeserta.nama_regu,
      pangkalan: formPeserta.pangkalan,
      kategori: formPeserta.kategori,
      gender: formPeserta.gender,
      is_verified: true // Admin added participants are verified automatically
    });

    if (error) {
      showPesan("error", "Gagal menambah regu: " + error.message);
    } else {
      showPesan("success", `Regu ${formPeserta.nama_regu} berhasil ditambahkan!`);
      setFormPeserta({ nomor_dada: "", nama_regu: "", pangkalan: "", kategori: "SD", gender: "Laki-laki" });
      await fetchAllData();
    }
    setSaving(false);
  };

  const handleHapusPeserta = async (id, nama) => {
    setSaving(true);
    const { error } = await supabase.from("peserta").delete().eq("id", id);
    if (error) showPesan("error", "Gagal menghapus: " + error.message);
    else {
      showPesan("success", `Regu ${nama} berhasil dihapus.`);
      setConfirmDeleteId(null);
      await fetchAllData();
    }
    setSaving(false);
  };

  const handleVerifikasiPeserta = async (id) => {
    const cleanNoDada = noDadaInput.trim();
    if (!cleanNoDada) {
      showPesan("error", "Masukkan nomor dada terlebih dahulu.");
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("peserta")
      .update({
        nomor_dada: Number(cleanNoDada),
        is_verified: true
      })
      .eq("id", id);

    if (error) {
      showPesan("error", "Gagal melakukan verifikasi: " + error.message);
    } else {
      showPesan("success", "Regu berhasil diverifikasi!");
      setVerifyingId(null);
      setNoDadaInput("");
      await fetchAllData();
    }
    setSaving(false);
  };

  // --- HANDLERS: JURI ---
  const handleTambahJuri = async (e) => {
    e.preventDefault();
    if (!formJuri.nama_lengkap || !formJuri.email || !formJuri.password) {
      showPesan("error", "Lengkapi form akun Juri.");
      return;
    }
    setSaving(true);
    
    // Secondary client to avoid logging admin out
    const authClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      { auth: { persistSession: false, autoRefreshToken: false } }
    );

    const { data: authData, error: authError } = await authClient.auth.signUp({
      email: formJuri.email,
      password: formJuri.password,
    });

    if (authError) {
      showPesan("error", "Gagal membuat Auth: " + authError.message);
      setSaving(false);
      return;
    }

    if (authData.user) {
      // Add to profiles
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: authData.user.id,
        nama_lengkap: formJuri.nama_lengkap,
        role: "juri",
        assigned_kategori: formJuri.kategori !== "SEMUA" ? formJuri.kategori : null,
        assigned_lomba_id: formJuri.lomba_id !== "SEMUA" ? formJuri.lomba_id : null,
        assigned_gender: formJuri.gender,
      });

      if (profileError) {
        showPesan("error", "Akun Auth dibuat, tapi gagal menyimpan Profil: " + profileError.message);
      } else {
        showPesan("success", `Akun Juri ${formJuri.nama_lengkap} berhasil dibuat!`);
        setFormJuri({ nama_lengkap: "", email: "", password: "", kategori: "SEMUA", lomba_id: "SEMUA", gender: "SEMUA" });
        await fetchAllData();
      }
    }
    setSaving(false);
  };

  const handleHapusJuri = async (id, nama) => {
    setSaving(true);
    const { error } = await supabase.from("profiles").delete().eq("id", id);
    if (error) showPesan("error", "Gagal menghapus dewan juri: " + error.message);
    else {
      showPesan("success", `Dewan Juri ${nama} berhasil dihapus.`);
      setConfirmDeleteId(null);
      await fetchAllData();
    }
    setSaving(false);
  };

  // --- HANDLERS: LOMBA (DINAMIS) ---
  const handleTambahLomba = async (e) => {
    e.preventDefault();
    if (!formLomba.nama_lomba || !formLomba.kode_lomba) {
      showPesan("error", "Lengkapi form Cabang Lomba.");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("lomba").insert({
      nama_lomba: formLomba.nama_lomba,
      kode_lomba: formLomba.kode_lomba.toUpperCase(),
      kategori: formLomba.kategori
    });

    if (error) {
      showPesan("error", "Gagal menambah cabang lomba: " + error.message);
    } else {
      showPesan("success", `Cabang Lomba ${formLomba.nama_lomba} (${formLomba.kode_lomba.toUpperCase()}) berhasil ditambahkan!`);
      setFormLomba({ nama_lomba: "", kode_lomba: "", kategori: "SD" });
      await fetchAllData();
    }
    setSaving(false);
  };

  const handleHapusLomba = async (id, nama) => {
    setSaving(true);
    const { error } = await supabase.from("lomba").delete().eq("id", id);
    if (error) showPesan("error", "Gagal menghapus cabang lomba: " + error.message);
    else {
      showPesan("success", `Cabang Lomba ${nama} berhasil dihapus.`);
      setConfirmDeleteId(null);
      await fetchAllData();
    }
    setSaving(false);
  };

  // --- HANDLERS: INFORMASI (LIVE TICKER) ---
  const handleTambahInformasi = async (e) => {
    e.preventDefault();
    const cleanText = newInformasi.trim();
    if (!cleanText) return;
    setSaving(true);
    const { error } = await supabase.from("informasi").insert({ text: cleanText });
    if (error) {
      showPesan("error", "Gagal menambahkan informasi: " + error.message);
    } else {
      showPesan("success", "Informasi berhasil ditambahkan ke Live Ticker!");
      setNewInformasi("");
      await fetchAllData();
    }
    setSaving(false);
  };

  const handleHapusInformasi = async (id) => {
    setSaving(true);
    const { error } = await supabase.from("informasi").delete().eq("id", id);
    if (error) {
      showPesan("error", "Gagal menghapus informasi: " + error.message);
    } else {
      showPesan("success", "Informasi berhasil dihapus.");
      await fetchAllData();
    }
    setSaving(false);
  };

  // --- RENDERING HELPERS: LAPORAN ---
  const getJuaraForLomba = (lombaId) => {
    const activePeserta = pesertaList.filter(
      (p) =>
        p.kategori === reportTingkat &&
        p.gender === reportGender &&
        p.is_verified === true
    );

    const scores = activePeserta.map((p) => {
      const key = `${p.id}_${lombaId}`;
      const score = nilaiMap[key] !== undefined ? nilaiMap[key] : 0;
      return { ...p, score };
    });

    // Sort descending
    scores.sort((a, b) => b.score - a.score);

    return scores.slice(0, 3);
  };

  // --- RENDERING HELPERS ---
  const filteredPesertaMatrix = pesertaList.filter((p) => {
    const matchesSearch = searchQuery === "" ||
      p.nama_regu.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.pangkalan.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(p.nomor_dada).includes(searchQuery);
    const matchesTingkat = filterTingkat === "SEMUA" || p.kategori === filterTingkat;
    const matchesGender = p.gender === filterGender;
    
    let matchesStatus = true;
    if (filterStatus === "SUDAH") {
      matchesStatus = dynamicLombaCols.some((l) => nilaiMap[`${p.id}_${l.id}`] !== undefined);
    } else if (filterStatus === "BELUM") {
      matchesStatus = dynamicLombaCols.every((l) => nilaiMap[`${p.id}_${l.id}`] === undefined);
    }
    return matchesSearch && matchesTingkat && matchesGender && matchesStatus;
  });

  const getAssessedCount = (pesertaId) => {
    return dynamicLombaCols.filter((l) => nilaiMap[`${pesertaId}_${l.id}`] !== undefined).length;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pl-[7.3%]" style={{
        backgroundImage: "linear-gradient(135deg, rgba(3, 7, 18, 0.92) 0%, rgba(3, 7, 18, 0.96) 100%), url('/scout_event_live.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}>
        {/* Sidebar Image */}
        <img src="/sidebar.png" className="fixed left-0 top-0 h-full w-[7.3%] z-30 pointer-events-none" alt="Scout Sidebar" />

        <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen text-slate-200 font-sans pl-[7.3%] relative" style={{
      backgroundImage: "linear-gradient(135deg, rgba(3, 7, 18, 0.92) 0%, rgba(3, 7, 18, 0.96) 100%), url('/scout_event_live.png')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundAttachment: "fixed",
    }}>
      {/* Sidebar Image */}
      <img src="/sidebar.png" className="fixed left-0 top-0 h-full w-[7.3%] z-30 pointer-events-none" alt="Scout Sidebar" />

      {!isOnline && <div className="offline-banner">⚠️ KONEKSI TERPUTUS</div>}

      {/* Navbar */}
      <nav className="sticky top-0 z-40 border-b border-slate-800/50" style={{
        backgroundImage: "url('/header_banner.png')",
        backgroundSize: "100% 100%",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat"
      }}>
        <div className="max-w-[1600px] mx-auto flex justify-between items-center px-4 md:px-8 py-3.5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h1 className="text-sm md:text-base font-black tracking-wider text-white">
                PANEL <span className="text-emerald-400">ADMINISTRATOR</span>
              </h1>
            </div>
          </div>
          <button onClick={async () => { await supabase.auth.signOut(); router.push("/login"); }} className="text-[0.65rem] font-bold tracking-wider bg-red-500/10 text-red-400 px-4 py-2 rounded-lg hover:bg-red-500 hover:text-white transition-all">
            LOGOUT
          </button>
        </div>
      </nav>

      {/* TABS */}
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 pt-6">
        <div className="flex gap-2 overflow-x-auto whitespace-nowrap no-scrollbar py-1.5 px-4 rounded-t-xl" style={{
          backgroundImage: "url('/table_header_banner.png')",
          backgroundSize: "100% 100%",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          borderBottom: "1.5px solid rgba(6, 182, 212, 0.45)"
        }}>
          <button onClick={() => setActiveTab("penilaian")} className={`px-4 py-3 text-xs md:text-sm font-black tracking-wider uppercase border-b-2 transition-colors ${activeTab === "penilaian" ? "border-amber-400 text-amber-300" : "border-transparent text-slate-400 hover:text-slate-200"} flex-shrink-0`}>Matriks Penilaian</button>
          <button onClick={() => setActiveTab("peserta")} className={`px-4 py-3 text-xs md:text-sm font-black tracking-wider uppercase border-b-2 transition-colors ${activeTab === "peserta" ? "border-amber-400 text-amber-300" : "border-transparent text-slate-400 hover:text-slate-200"} flex-shrink-0`}>Manajemen Peserta</button>
          <button onClick={() => setActiveTab("juri")} className={`px-4 py-3 text-xs md:text-sm font-black tracking-wider uppercase border-b-2 transition-colors ${activeTab === "juri" ? "border-amber-400 text-amber-300" : "border-transparent text-slate-400 hover:text-slate-200"} flex-shrink-0`}>Manajemen Juri</button>
          <button onClick={() => setActiveTab("lomba")} className={`px-4 py-3 text-xs md:text-sm font-black tracking-wider uppercase border-b-2 transition-colors ${activeTab === "lomba" ? "border-amber-400 text-amber-300" : "border-transparent text-slate-400 hover:text-slate-200"} flex-shrink-0`}>Cabang Lomba</button>
          <button onClick={() => setActiveTab("laporan")} className={`px-4 py-3 text-xs md:text-sm font-black tracking-wider uppercase border-b-2 transition-colors ${activeTab === "laporan" ? "border-amber-400 text-amber-300" : "border-transparent text-slate-400 hover:text-slate-200"} flex-shrink-0`}>Laporan & Rekap</button>
          <button onClick={() => setActiveTab("informasi")} className={`px-4 py-3 text-xs md:text-sm font-black tracking-wider uppercase border-b-2 transition-colors ${activeTab === "informasi" ? "border-amber-400 text-amber-300" : "border-transparent text-slate-400 hover:text-slate-200"} flex-shrink-0`}>Live Ticker Info</button>
        </div>
      </div>

      <main className="max-w-[1600px] mx-auto px-4 md:px-8 py-6 space-y-6">
        {/* Global Alert */}
        {pesanAdmin.text && (
          <div className={`p-4 rounded-xl text-sm font-bold border flex items-center gap-2 ${pesanAdmin.type === "error" ? "bg-red-500/10 border-red-500/30 text-red-400" : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"}`}>
            {pesanAdmin.text}
          </div>
        )}

        {/* TAB 1: PENILAIAN */}
        {activeTab === "penilaian" && (
          <>
            {/* Stats Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Total Peserta", value: pesertaList.length },
                { label: "Total Cabang Lomba", value: lombaList.length },
                { label: "Cabang Aktif", value: dynamicLombaCols.length },
                { label: "Kategori Klasemen", value: filterTingkat },
              ].map((stat) => (
                <div key={stat.label} className="glass-card p-4">
                  <div className="text-[0.65rem] text-slate-500 font-bold tracking-wider uppercase">{stat.label}</div>
                  <div className="text-2xl font-black text-white mt-1">{stat.value}</div>
                </div>
              ))}
            </div>

            {/* Search & Filters */}
            <div className="glass-card p-4">
              <div className="flex flex-col md:flex-row gap-3">
                <input type="text" placeholder="Cari regu..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="flex-1 bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/50" />
                <select value={filterTingkat} onChange={(e) => { setFilterTingkat(e.target.value); setEditedNilai({}); }} className="bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/50">
                  <option value="SD">SD / MI</option>
                  <option value="SMP">SMP / MTs</option>
                </select>
                <select value={filterGender} onChange={(e) => { setFilterGender(e.target.value); setEditedNilai({}); }} className="bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/50">
                  <option value="Laki-laki">Laki-laki (Putra)</option>
                  <option value="Perempuan">Perempuan (Putri)</option>
                </select>
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/50">
                  <option value="SEMUA">Semua Status</option>
                  <option value="SUDAH">Sudah Dinilai</option>
                  <option value="BELUM">Belum Dinilai</option>
                </select>
              </div>
            </div>

            {/* Score Matrix */}
            <div className="glass-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[1200px]">
                  <thead>
                    <tr className="bg-slate-950/60">
                      <th className="p-3 text-[0.6rem] font-bold text-slate-500 uppercase sticky left-0 bg-slate-950/90 z-10 w-10">#</th>
                      <th className="p-3 text-[0.6rem] font-bold text-slate-500 uppercase sticky left-10 bg-slate-950/90 z-10 min-w-[180px]">Regu</th>
                      <th className="p-3 text-[0.6rem] font-bold text-slate-500 uppercase w-16">Tkt</th>
                      {dynamicLombaCols.map((lomba) => (
                        <th key={lomba.id} className="p-2 text-[0.55rem] font-bold text-slate-500 uppercase text-center min-w-[80px]" title={lomba.nama_lomba}>
                          {lomba.kode_lomba}
                        </th>
                      ))}
                      <th className="p-3 text-[0.6rem] font-bold text-emerald-500 uppercase text-center w-20">Total</th>
                      <th className="p-3 text-[0.6rem] font-bold text-slate-500 uppercase text-center w-16">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPesertaMatrix.length === 0 ? (
                      <tr><td colSpan={dynamicLombaCols.length + 5} className="p-12 text-center text-slate-600 italic">Tidak ada regu.</td></tr>
                    ) : filteredPesertaMatrix.map((peserta) => {
                      const assessedCount = getAssessedCount(peserta.id);
                      return (
                        <tr key={peserta.id} className="border-t border-slate-800/30 hover:bg-slate-800/20">
                          <td className="p-3 text-xs text-slate-500 font-mono sticky left-0 bg-[#0f172a]/90 z-10">{peserta.nomor_dada}</td>
                          <td className="p-3 sticky left-10 bg-[#0f172a]/90 z-10">
                            <div className="text-sm font-bold text-white">{peserta.nama_regu}</div>
                            <div className="text-[0.65rem] text-slate-500">{peserta.pangkalan}</div>
                          </td>
                          <td className="p-3 text-[0.6rem] font-black">{peserta.kategori}</td>
                          {dynamicLombaCols.map((lomba) => (
                            <td key={lomba.id} className="p-1.5 text-center">
                              <input type="number" min="0" max="100" value={getCellValue(peserta.id, lomba.id)} onChange={(e) => handleNilaiChange(peserta.id, lomba.id, e.target.value)} placeholder="—" className={`w-full bg-slate-950/60 border rounded-lg px-1.5 py-2 text-center text-xs font-bold outline-none ${editedNilai[`${peserta.id}_${lomba.id}`] !== undefined ? "border-amber-500/50 text-amber-400" : nilaiMap[`${peserta.id}_${lomba.id}`] !== undefined ? "border-slate-800 text-emerald-400" : "border-slate-800/50 text-slate-600"}`} />
                            </td>
                          ))}
                          <td className="p-3 text-center text-lg font-black text-white">{peserta.total_nilai ?? 0}</td>
                          <td className="p-3 text-center text-[0.6rem] font-bold">{assessedCount}/{dynamicLombaCols.length}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Actions & Logs */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={handleSimpanSemua} disabled={saving || Object.keys(editedNilai).length === 0} className="bg-emerald-500 text-white font-black py-3.5 px-8 rounded-xl disabled:opacity-40 text-sm flex-1">
                {saving ? "MENYIMPAN..." : `SIMPAN NILAI (${Object.keys(editedNilai).length})`}
              </button>
              <button onClick={() => setEditedNilai({})} disabled={Object.keys(editedNilai).length === 0} className="border border-slate-700 text-slate-400 font-bold py-3.5 px-6 rounded-xl text-sm disabled:opacity-30">
                RESET
              </button>
            </div>
            
            <div className="glass-card p-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase">Log Aktivitas Penilaian (30 Terakhir)</h3>
              <div className="mt-2 space-y-1 max-h-60 overflow-y-auto pr-2">
                {logEntries.length === 0 ? (
                  <p className="text-xs text-slate-600 italic py-2">Belum ada aktivitas penilaian tercatat.</p>
                ) : (
                  logEntries.map((e, idx) => {
                    const timeStr = new Date(e.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
                    const dateStr = new Date(e.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short" });
                    const namaJuri = e.profiles?.nama_lengkap || "Sistem/Admin";
                    const namaRegu = e.peserta?.nama_regu || "—";
                    const namaLomba = e.lomba?.nama_lomba || "Pos";
                    return (
                      <div key={idx} className="text-xs py-1.5 border-b border-slate-900 last:border-0 flex items-start gap-2">
                        <span className="text-slate-600 font-mono flex-shrink-0">[{dateStr} {timeStr}]</span>
                        <span className="text-slate-400">
                          Juri <strong className="text-cyan-400">{namaJuri}</strong> menilai <strong className="text-white">{namaRegu}</strong> di pos <strong className="text-purple-400">{namaLomba}</strong> sebesar <strong className="text-emerald-400 font-bold">{e.nilai}</strong>
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </>
        )}

        {/* TAB 2: PESERTA */}
        {activeTab === "peserta" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 glass-card p-6 h-fit">
              <h2 className="text-lg font-black text-white mb-4">Daftar Regu Baru</h2>
              <form onSubmit={handleTambahPeserta} className="space-y-4">
                <div><label className="text-[0.65rem] text-slate-500 font-bold uppercase">Kategori Tingkat</label>
                  <select value={formPeserta.kategori} onChange={(e) => setFormPeserta({...formPeserta, kategori: e.target.value})} className="w-full mt-1 bg-slate-950/80 border border-slate-800 rounded-lg p-3 text-sm text-white outline-none">
                    <option value="SD">SD / MI</option><option value="SMP">SMP / MTs</option>
                  </select>
                </div>
                <div><label className="text-[0.65rem] text-slate-500 font-bold uppercase">Kategori Gender</label>
                  <select value={formPeserta.gender} onChange={(e) => setFormPeserta({...formPeserta, gender: e.target.value})} className="w-full mt-1 bg-slate-950/80 border border-slate-800 rounded-lg p-3 text-sm text-white outline-none">
                    <option value="Laki-laki">Laki-laki (Putra)</option><option value="Perempuan">Perempuan (Putri)</option>
                  </select>
                </div>
                <div><label className="text-[0.65rem] text-slate-500 font-bold uppercase">Nomor Dada</label>
                  <input type="number" required value={formPeserta.nomor_dada} onChange={(e) => setFormPeserta({...formPeserta, nomor_dada: e.target.value})} className="w-full mt-1 bg-slate-950/80 border border-slate-800 rounded-lg p-3 text-sm text-white outline-none" placeholder="101" />
                </div>
                <div><label className="text-[0.65rem] text-slate-500 font-bold uppercase">Nama Regu</label>
                  <input type="text" required value={formPeserta.nama_regu} onChange={(e) => setFormPeserta({...formPeserta, nama_regu: e.target.value})} className="w-full mt-1 bg-slate-950/80 border border-slate-800 rounded-lg p-3 text-sm text-white outline-none" placeholder="Regu Rajawali" />
                </div>
                <div><label className="text-[0.65rem] text-slate-500 font-bold uppercase">Asal Pangkalan / Sekolah</label>
                  <input type="text" required value={formPeserta.pangkalan} onChange={(e) => setFormPeserta({...formPeserta, pangkalan: e.target.value})} className="w-full mt-1 bg-slate-950/80 border border-slate-800 rounded-lg p-3 text-sm text-white outline-none" placeholder="SDN 1 Sukabumi" />
                </div>
                <button type="submit" disabled={saving} className="w-full bg-emerald-500 text-white font-bold py-3 rounded-lg mt-2 disabled:opacity-50">
                  {saving ? "Menyimpan..." : "+ Tambahkan Regu"}
                </button>
              </form>
            </div>
            
            <div className="lg:col-span-2 glass-card overflow-hidden">
              <div className="overflow-x-auto max-h-[600px] mobile-table-scroll">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead className="sticky top-0 bg-slate-900 z-10 shadow-md">
                    <tr>
                      <th className="p-3 text-[0.65rem] font-bold text-slate-500 uppercase">No. Dada</th>
                      <th className="p-3 text-[0.65rem] font-bold text-slate-500 uppercase">Nama Regu</th>
                      <th className="p-3 text-[0.65rem] font-bold text-slate-500 uppercase">Pangkalan & Gudep</th>
                      <th className="p-3 text-[0.65rem] font-bold text-slate-500 uppercase">Kategori</th>
                      <th className="p-3 text-[0.65rem] font-bold text-slate-500 uppercase">Kontak CP</th>
                      <th className="p-3 text-[0.65rem] font-bold text-slate-500 uppercase">Status</th>
                      <th className="p-3 text-[0.65rem] font-bold text-slate-500 uppercase text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pesertaList.map((p) => {
                      const isVerifying = verifyingId === p.id;
                      return (
                        <tr key={p.id} className="border-t border-slate-800/30 hover:bg-slate-800/20">
                          <td className="p-3 text-sm font-mono text-emerald-400">
                            {isVerifying ? (
                              <input 
                                type="number" 
                                placeholder="No" 
                                value={noDadaInput} 
                                onChange={(e) => setNoDadaInput(e.target.value)} 
                                className="w-16 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-white text-xs outline-none focus:border-amber-500"
                              />
                            ) : (
                              p.nomor_dada || "—"
                            )}
                          </td>
                          <td className="p-3 text-sm font-bold text-white">{p.nama_regu}</td>
                          <td className="p-3 text-sm text-slate-400">
                            <div className="font-semibold text-slate-300">{p.pangkalan}</div>
                            {p.no_gudep && <div className="text-[0.65rem] text-slate-500 font-mono">Gudep: {p.no_gudep}</div>}
                          </td>
                          <td className="p-3 text-xs font-black">
                            <div>{p.kategori}</div>
                            <div className="text-slate-500 text-[0.65rem] font-normal">{p.gender === 'Laki-laki' ? '👦 Putra' : '👧 Putri'}</div>
                          </td>
                          <td className="p-3 text-xs font-mono text-slate-300">{p.kontak_person || "—"}</td>
                          <td className="p-3 text-xs">
                            {p.is_verified ? (
                              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded-full font-bold text-[0.6rem] uppercase">
                                ✅ Aktif
                              </span>
                            ) : (
                              <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-1 rounded-full font-bold text-[0.6rem] uppercase">
                                ⏳ Menunggu
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-right">
                            {isVerifying ? (
                              <div className="flex justify-end gap-1">
                                <button 
                                  onClick={() => handleVerifikasiPeserta(p.id)} 
                                  className="text-white bg-emerald-600 hover:bg-emerald-700 px-2 py-1 rounded text-xs font-bold transition-all"
                                >
                                  Simpan
                                </button>
                                <button 
                                  onClick={() => { setVerifyingId(null); setNoDadaInput(""); }} 
                                  className="text-slate-400 bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded text-xs font-bold transition-all"
                                >
                                  Batal
                                </button>
                              </div>
                            ) : (
                              <div className="flex justify-end gap-1.5 text-right items-center">
                                {!p.is_verified && (
                                  <button 
                                    onClick={() => { setVerifyingId(p.id); setNoDadaInput(""); }} 
                                    className="text-amber-400 bg-amber-400/10 hover:bg-amber-400 hover:text-black px-2.5 py-1.5 rounded text-xs font-bold transition-colors"
                                  >
                                    Verifikasi
                                  </button>
                                )}
                                
                                {confirmDeleteId === p.id ? (
                                  <div className="flex justify-end gap-1">
                                    <button onClick={() => handleHapusPeserta(p.id, p.nama_regu)} className="text-white bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-xs font-bold transition-all">
                                      Ya
                                    </button>
                                    <button onClick={() => setConfirmDeleteId(null)} className="text-slate-400 bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded text-xs font-bold transition-all">
                                      Batal
                                    </button>
                                  </div>
                                ) : (
                                  <button onClick={() => setConfirmDeleteId(p.id)} className="text-red-500 bg-red-500/10 hover:bg-red-500 hover:text-white px-2.5 py-1.5 rounded text-xs font-bold transition-colors">
                                    Hapus
                                  </button>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: JURI */}
        {activeTab === "juri" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 glass-card p-6 h-fit">
              <h2 className="text-lg font-black text-white mb-4">Buat Akun Juri</h2>
              <form onSubmit={handleTambahJuri} className="space-y-4">
                <div><label className="text-[0.65rem] text-slate-500 font-bold uppercase">Nama Lengkap</label>
                  <input type="text" required value={formJuri.nama_lengkap} onChange={(e) => setFormJuri({...formJuri, nama_lengkap: e.target.value})} className="w-full mt-1 bg-slate-950/80 border border-slate-800 rounded-lg p-3 text-sm text-white outline-none" placeholder="Kak Budi" />
                </div>
                <div><label className="text-[0.65rem] text-slate-500 font-bold uppercase">Email (Untuk Login)</label>
                  <input type="email" required value={formJuri.email} onChange={(e) => setFormJuri({...formJuri, email: e.target.value})} className="w-full mt-1 bg-slate-950/80 border border-slate-800 rounded-lg p-3 text-sm text-white outline-none" placeholder="juri@pramuka.com" />
                </div>
                <div><label className="text-[0.65rem] text-slate-500 font-bold uppercase">Kata Sandi</label>
                  <input type="password" required value={formJuri.password} onChange={(e) => setFormJuri({...formJuri, password: e.target.value})} className="w-full mt-1 bg-slate-950/80 border border-slate-800 rounded-lg p-3 text-sm text-white outline-none" placeholder="minimal 6 karakter" />
                </div>
                <div><label className="text-[0.65rem] text-slate-500 font-bold uppercase">Tugas Tingkatan</label>
                  <select value={formJuri.kategori} onChange={(e) => setFormJuri({...formJuri, kategori: e.target.value, lomba_id: "SEMUA"})} className="w-full mt-1 bg-slate-950/80 border border-slate-800 rounded-lg p-3 text-sm text-white outline-none">
                    <option value="SEMUA">Bebas Akses (Semua Tingkat)</option>
                    <option value="SD">Khusus SD / MI</option><option value="SMP">Khusus SMP / MTs</option>
                  </select>
                </div>
                <div><label className="text-[0.65rem] text-slate-500 font-bold uppercase">Tugas Cabang Lomba</label>
                  <select value={formJuri.lomba_id} onChange={(e) => setFormJuri({...formJuri, lomba_id: e.target.value})} className="w-full mt-1 bg-slate-950/80 border border-slate-800 rounded-lg p-3 text-sm text-white outline-none">
                    <option value="SEMUA">Bebas Akses (Semua Pos)</option>
                    {dynamicJuriLombaOptions.map((l) => (
                      <option key={l.id} value={l.id}>[{l.kategori}] {l.nama_lomba}</option>
                    ))}
                  </select>
                </div>
                <div><label className="text-[0.65rem] text-slate-500 font-bold uppercase">Tugas Gender Kategori</label>
                  <select value={formJuri.gender} onChange={(e) => setFormJuri({...formJuri, gender: e.target.value})} className="w-full mt-1 bg-slate-950/80 border border-slate-800 rounded-lg p-3 text-sm text-white outline-none">
                    <option value="SEMUA">Bebas Akses (Semua Gender)</option>
                    <option value="Laki-laki">Khusus Laki-laki (Putra)</option>
                    <option value="Perempuan">Khusus Perempuan (Putri)</option>
                  </select>
                </div>
                <button type="submit" disabled={saving} className="w-full bg-cyan-500 text-white font-bold py-3 rounded-lg mt-2 disabled:opacity-50">
                  {saving ? "Membuat Akun..." : "+ Buat Akun Juri"}
                </button>
              </form>
            </div>
            
            <div className="lg:col-span-2 glass-card overflow-hidden">
              <div className="overflow-x-auto max-h-[600px] mobile-table-scroll">
                <table className="w-full text-left border-collapse min-w-[750px]">
                  <thead className="sticky top-0 bg-slate-900 z-10 shadow-md">
                    <tr>
                      <th className="p-4 text-[0.65rem] font-bold text-slate-500 uppercase">Nama Juri</th>
                      <th className="p-4 text-[0.65rem] font-bold text-slate-500 uppercase">Tingkat Ditugaskan</th>
                      <th className="p-4 text-[0.65rem] font-bold text-slate-500 uppercase">Pos Lomba Ditugaskan</th>
                      <th className="p-4 text-[0.65rem] font-bold text-slate-500 uppercase">Gender Ditugaskan</th>
                      <th className="p-4 text-[0.65rem] font-bold text-slate-500 uppercase text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {juriList.map((j) => (
                      <tr key={j.id} className="border-t border-slate-800/30 hover:bg-slate-800/20">
                        <td className="p-4 text-sm font-bold text-white flex items-center gap-2">
                          <svg className="w-4 h-4 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                          {j.nama_lengkap}
                        </td>
                        <td className="p-4 text-xs font-black">{j.assigned_kategori || "SEMUA"}</td>
                        <td className="p-4 text-xs font-black">{j.lomba?.nama_lomba || "SEMUA"}</td>
                        <td className="p-4 text-xs font-black">
                          {j.assigned_gender === "SEMUA" ? "SEMUA" : j.assigned_gender === "Laki-laki" ? "👦 Laki-laki" : "👧 Perempuan"}
                        </td>
                        <td className="p-4 text-right">
                          {confirmDeleteId === j.id ? (
                            <div className="flex justify-end gap-1.5">
                              <button onClick={() => handleHapusJuri(j.id, j.nama_lengkap)} className="text-white bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-all">
                                Ya, Hapus
                              </button>
                              <button onClick={() => setConfirmDeleteId(null)} className="text-slate-400 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-all">
                                Batal
                              </button>
                            </div>
                          ) : (
                            <button onClick={() => setConfirmDeleteId(j.id)} className="text-red-500 bg-red-500/10 hover:bg-red-500 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">
                              Hapus Profil
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {juriList.length === 0 && (
                      <tr><td colSpan="4" className="p-8 text-center text-slate-500 italic">Belum ada akun Juri terdaftar.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: LOMBA (DINAMIS) */}
        {activeTab === "lomba" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 glass-card p-6 h-fit">
              <h2 className="text-lg font-black text-white mb-4">Tambah Cabang Lomba</h2>
              <form onSubmit={handleTambahLomba} className="space-y-4">
                <div><label className="text-[0.65rem] text-slate-500 font-bold uppercase">Kategori Tingkat</label>
                  <select value={formLomba.kategori} onChange={(e) => setFormLomba({...formLomba, kategori: e.target.value})} className="w-full mt-1 bg-slate-950/80 border border-slate-800 rounded-lg p-3 text-sm text-white outline-none">
                    <option value="SD">SD / MI</option><option value="SMP">SMP / MTs</option>
                  </select>
                </div>
                <div><label className="text-[0.65rem] text-slate-500 font-bold uppercase">Nama Cabang Lomba</label>
                  <input type="text" required value={formLomba.nama_lomba} onChange={(e) => setFormLomba({...formLomba, nama_lomba: e.target.value})} className="w-full mt-1 bg-slate-950/80 border border-slate-800 rounded-lg p-3 text-sm text-white outline-none" placeholder="Pionering Darurat" />
                </div>
                <div><label className="text-[0.65rem] text-slate-500 font-bold uppercase">Kode Singkat (3-4 Huruf)</label>
                  <input type="text" required maxLength="5" value={formLomba.kode_lomba} onChange={(e) => setFormLomba({...formLomba, kode_lomba: e.target.value})} className="w-full mt-1 bg-slate-950/80 border border-slate-800 rounded-lg p-3 text-sm text-white outline-none" placeholder="PNR" />
                  <p className="text-[0.6rem] text-slate-500 mt-1">Digunakan untuk judul kolom tabel agar muat banyak.</p>
                </div>
                <button type="submit" disabled={saving} className="w-full bg-purple-500 text-white font-bold py-3 rounded-lg mt-2 disabled:opacity-50">
                  {saving ? "Menyimpan..." : "+ Tambahkan Cabang"}
                </button>
              </form>
            </div>
            
            <div className="lg:col-span-2 glass-card overflow-hidden">
              <div className="overflow-x-auto max-h-[600px] mobile-table-scroll">
                <table className="w-full text-left border-collapse min-w-[550px]">
                  <thead className="sticky top-0 bg-slate-900 z-10 shadow-md">
                    <tr>
                      <th className="p-4 text-[0.65rem] font-bold text-slate-500 uppercase">Nama Cabang Lomba</th>
                      <th className="p-4 text-[0.65rem] font-bold text-slate-500 uppercase">Kode Singkat</th>
                      <th className="p-4 text-[0.65rem] font-bold text-slate-500 uppercase">Tingkatan</th>
                      <th className="p-4 text-[0.65rem] font-bold text-slate-500 uppercase text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lombaList.map((l) => (
                      <tr key={l.id} className="border-t border-slate-800/30 hover:bg-slate-800/20">
                        <td className="p-4 text-sm font-bold text-white">{l.nama_lomba}</td>
                        <td className="p-4 text-sm font-mono text-purple-400">{l.kode_lomba}</td>
                        <td className="p-4 text-xs font-black">{l.kategori}</td>
                        <td className="p-4 text-right">
                          {confirmDeleteId === l.id ? (
                            <div className="flex justify-end gap-1.5">
                              <button onClick={() => handleHapusLomba(l.id, l.nama_lomba)} className="text-white bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-all">
                                Ya, Hapus
                              </button>
                              <button onClick={() => setConfirmDeleteId(null)} className="text-slate-400 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-all">
                                Batal
                              </button>
                            </div>
                          ) : (
                            <button onClick={() => setConfirmDeleteId(l.id)} className="text-red-500 bg-red-500/10 hover:bg-red-500 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">
                              Hapus
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {lombaList.length === 0 && (
                      <tr><td colSpan="4" className="p-8 text-center text-slate-500 italic">Belum ada cabang lomba diinput.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: LAPORAN & REKAPITULASI */}
        {activeTab === "laporan" && (
          <div className="space-y-6">
            {/* Filter & Print Action Banner */}
            <div className="glass-card p-4 flex flex-col md:flex-row gap-4 items-center justify-between no-print">
              <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                <div className="space-y-1">
                  <label className="text-[0.65rem] text-slate-500 font-bold uppercase">Tingkatan</label>
                  <select
                    value={reportTingkat}
                    onChange={(e) => setReportTingkat(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500/50"
                  >
                    <option value="SD">SD / MI</option>
                    <option value="SMP">SMP / MTs</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[0.65rem] text-slate-500 font-bold uppercase">Kategori Regu (Gender)</label>
                  <select
                    value={reportGender}
                    onChange={(e) => setReportGender(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500/50"
                  >
                    <option value="Laki-laki">Putra (Laki-laki)</option>
                    <option value="Perempuan">Putri (Perempuan)</option>
                  </select>
                </div>
              </div>

              <button
                onClick={() => window.print()}
                className="w-full md:w-auto bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-black px-6 py-3 rounded-xl transition-all duration-300 shadow-[0_4px_15px_rgba(245,166,35,0.2)] flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                CETAK LAPORAN (PDF/PRINTER)
              </button>
            </div>

            {/* Printable Report Document Card */}
            <div className="glass-card p-6 md:p-10 border border-amber-500/10 shadow-2xl printable-report print-bg-white print-text-dark">
              {/* Document Header */}
              <div className="text-center border-b-2 border-slate-700/40 pb-6 mb-8 print-border">
                <h1 className="text-xl md:text-2xl font-black text-white uppercase tracking-wider print-text-dark">
                  LAPORAN HASIL PENILAIAN AKHIR
                </h1>
                <p className="text-lg font-bold text-amber-400 uppercase tracking-widest mt-1 print-text-dark">
                  LOMBA TINGKAT II KWARTIR RANTING MEKAR BARU
                </p>
                <div className="flex justify-center gap-6 mt-4 text-xs font-semibold text-slate-400 uppercase tracking-wider print-text-dark">
                  <div>Tingkat: <span className="text-white font-bold print-text-dark">{reportTingkat === "SD" ? "SD / MI" : "SMP / MTs"}</span></div>
                  <div>Golongan: <span className="text-white font-bold print-text-dark">{reportGender === "Laki-laki" ? "👦 PUTRA" : "👧 PUTRI"}</span></div>
                  <div>Tanggal Cetak: <span className="text-white font-bold print-text-dark">{new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span></div>
                </div>
              </div>

              {/* SECTION 1: KLASEMEN AKUMULASI */}
              <div className="space-y-4">
                <h2 className="text-base md:text-lg font-black text-white uppercase tracking-wide border-l-4 border-amber-500 pl-3 print-text-dark print-border">
                  I. Klasemen Akhir Akumulasi Nilai
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse print-table">
                    <thead>
                      <tr className="bg-slate-900/60 text-slate-400 font-bold text-xs uppercase print-text-dark">
                        <th className="p-3 w-16 text-center">Peringkat</th>
                        <th className="p-3 w-20 text-center">No. Dada</th>
                        <th className="p-3">Asal Sekolah / Pangkalan</th>
                        <th className="p-3 w-32 text-center">No. Gudep</th>
                        <th className="p-3 w-32 text-right">Total Nilai</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pesertaList
                        .filter((p) => p.kategori === reportTingkat && p.gender === reportGender && p.is_verified === true)
                        .sort((a, b) => b.total_nilai - a.total_nilai)
                        .map((regu, index) => (
                          <tr key={regu.id} className="border-t border-slate-800/40 text-sm hover:bg-slate-800/10 print-text-dark">
                            <td className="p-3 font-bold text-center">{index + 1}</td>
                            <td className="p-3 font-mono text-center font-bold text-amber-400 print-text-dark">{regu.nomor_dada}</td>
                            <td className="p-3 font-bold text-white print-text-dark">
                              <div>{regu.pangkalan}</div>
                              <span className="text-[0.65rem] text-slate-500 font-normal print-text-dark">Regu: {regu.nama_regu}</span>
                            </td>
                            <td className="p-3 font-mono text-center text-slate-300 print-text-dark">{regu.no_gudep || "—"}</td>
                            <td className="p-3 font-mono font-black text-right text-emerald-400 print-text-dark">{regu.total_nilai}</td>
                          </tr>
                        ))}
                      {pesertaList.filter((p) => p.kategori === reportTingkat && p.gender === reportGender && p.is_verified === true).length === 0 && (
                        <tr>
                          <td colSpan="5" className="p-8 text-center text-slate-500 italic print-text-dark">
                            Belum ada regu terverifikasi untuk kategori ini.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* SECTION 2: JUARA MASING-MASING LOMBA */}
              <div className="space-y-6 mt-10">
                <h2 className="text-base md:text-lg font-black text-white uppercase tracking-wide border-l-4 border-amber-500 pl-3 print-text-dark print-border">
                  II. Rekapitulasi Pemenang Cabang Lomba (Juara 1, 2, 3)
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print-bg-white print-text-dark">
                  {lombaList
                    .filter((l) => l.kategori === reportTingkat)
                    .map((lomba) => {
                      const juaraList = getJuaraForLomba(lomba.id);
                      return (
                        <div key={lomba.id} className="p-4 rounded-xl border border-slate-800 bg-slate-950/40 space-y-3 print-border print-bg-white">
                          <h3 className="text-sm font-black text-white uppercase tracking-wide border-b border-slate-800 pb-2 print-text-dark">
                            🏆 {lomba.nama_lomba} ({lomba.kode_lomba})
                          </h3>
                          <div className="space-y-2">
                            {juaraList.map((juara, idx) => (
                              <div key={juara.id} className="flex justify-between items-center text-xs font-semibold">
                                <span className={`px-2 py-0.5 rounded text-[0.6rem] font-bold ${
                                  idx === 0 ? "bg-amber-400/10 text-amber-400" :
                                  idx === 1 ? "bg-slate-400/10 text-slate-400" :
                                  "bg-amber-700/10 text-amber-700"
                                }`}>
                                  Juara {idx + 1}
                                </span>
                                <span className="text-white font-bold flex-1 px-3 truncate print-text-dark">
                                  {juara.pangkalan} <span className="text-[0.65rem] text-slate-500 font-normal print-text-dark">(Regu: {juara.nama_regu})</span>
                                </span>
                                <span className="font-mono text-emerald-400 font-black print-text-dark">
                                  {juara.score} Pts
                                </span>
                              </div>
                            ))}
                            {juaraList.length === 0 && (
                              <div className="text-center text-slate-500 italic text-xs py-2 print-text-dark">
                                Belum ada penilaian diinput.
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Signature Section */}
              <div className="mt-16 grid grid-cols-2 text-center text-xs font-semibold text-slate-400 tracking-wider no-print md:flex md:justify-around print-border print-text-dark">
                <div className="space-y-20">
                  <div>Ketua Kwartir Ranting</div>
                  <div className="font-black text-white border-t border-slate-700 pt-2 w-48 mx-auto print-text-dark">
                    ( ____________________ )
                  </div>
                </div>
                <div className="space-y-20">
                  <div>Ketua Dewan Juri</div>
                  <div className="font-black text-white border-t border-slate-700 pt-2 w-48 mx-auto print-text-dark">
                    ( ____________________ )
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: MANAJEMEN LIVE TICKER (INFORMASI) */}
        {activeTab === "informasi" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Input Form */}
            <div className="lg:col-span-1 glass-card p-6 h-fit">
              <h2 className="text-lg font-black text-white mb-4">Buat Informasi Pengumuman</h2>
              <form onSubmit={handleTambahInformasi} className="space-y-4">
                <div>
                  <label className="text-[0.65rem] text-slate-500 font-bold uppercase">
                    Isi Informasi Pengumuman
                  </label>
                  <textarea
                    required
                    value={newInformasi}
                    onChange={(e) => setNewInformasi(e.target.value)}
                    rows={4}
                    placeholder="Contoh: Upacara Pembukaan Lomba Tingkat II akan dimulai pukul 08.00 WIB di Lapangan Utama"
                    className="w-full mt-1 bg-slate-950/80 border border-slate-800 rounded-lg p-3 text-sm text-white outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20"
                  />
                  <p className="text-[0.6rem] text-slate-500 mt-1">
                    Informasi ini akan langsung dimunculkan di halaman depan utama pada text berjalan (Live Ticker) dengan lambang 📢.
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={saving || !isOnline}
                  className="w-full bg-cyan-500 text-white font-bold py-3 rounded-lg mt-2 disabled:opacity-50 transition-colors"
                >
                  {saving ? "Menyimpan..." : "+ Munculkan di Ticker"}
                </button>
              </form>
            </div>

            {/* List Table */}
            <div className="lg:col-span-2 glass-card overflow-hidden">
              <div className="overflow-x-auto max-h-[600px] mobile-table-scroll">
                <table className="w-full text-left border-collapse min-w-[500px]">
                  <thead className="sticky top-0 bg-slate-900 z-10 shadow-md">
                    <tr>
                      <th className="p-4 w-28 text-[0.65rem] font-bold text-slate-500 uppercase">Waktu</th>
                      <th className="p-4 text-[0.65rem] font-bold text-slate-500 uppercase">Pesan Pengumuman</th>
                      <th className="p-4 w-24 text-[0.65rem] font-bold text-slate-500 uppercase text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {informasiList.map((info) => (
                      <tr key={info.id} className="border-t border-slate-800/30 hover:bg-slate-800/20">
                        <td className="p-4 text-xs font-mono text-slate-500">
                          {new Date(info.created_at).toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </td>
                        <td className="p-4 text-sm font-bold text-slate-100 flex items-center gap-2">
                          <span className="text-base flex-shrink-0">📢</span>
                          {info.text}
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleHapusInformasi(info.id)}
                            className="text-red-500 bg-red-500/10 hover:bg-red-500 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                          >
                            Hapus
                          </button>
                        </td>
                      </tr>
                    ))}
                    {informasiList.length === 0 && (
                      <tr>
                        <td colSpan="3" className="p-8 text-center text-slate-500 italic">
                          Belum ada pengumuman kustom diinput. Ticker hanya menampilkan aktivitas dewan juri secara default.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}