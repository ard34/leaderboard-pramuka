"use client";

import React, { useEffect, useState, useCallback, useMemo, Fragment } from "react";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useOnlineStatus } from "@/lib/useOnlineStatus";
import { parseTimeToMs, getSavedTimeForPesertaLomba } from "@/lib/timeUtils";
import { getNoGudepByGender } from "@/lib/gudepUtils";

// Official 4 Groups of Competition Activities (13 Cabang Lomba Resmi LT-II 2026)
const OFFICIAL_GROUP_ORDER = {
  HMN: { order: 1, group: "G1", groupName: "1. Agama & Patriotisme", short: "Agama & Patriotisme", color: "amber" },
  TSB: { order: 2, group: "G1", groupName: "1. Agama & Patriotisme", short: "Agama & Patriotisme", color: "amber" },
  PNR: { order: 3, group: "G2", groupName: "2. Keterampilan Kepramukaan", short: "Kepramukaan", color: "cyan" },
  PGD: { order: 4, group: "G2", groupName: "2. Keterampilan Kepramukaan", short: "Kepramukaan", color: "cyan" },
  SND: { order: 5, group: "G2", groupName: "2. Keterampilan Kepramukaan", short: "Kepramukaan", color: "cyan" },
  NAV: { order: 6, group: "G2", groupName: "2. Keterampilan Kepramukaan", short: "Kepramukaan", color: "cyan" },
  TKS: { order: 7, group: "G2", groupName: "2. Keterampilan Kepramukaan", short: "Kepramukaan", color: "cyan" },
  SMP: { order: 8, group: "G2", groupName: "2. Keterampilan Kepramukaan", short: "Kepramukaan", color: "cyan" },
  MRS: { order: 9, group: "G2", groupName: "2. Keterampilan Kepramukaan", short: "Kepramukaan", color: "cyan" },
  KIM: { order: 10, group: "G2", groupName: "2. Keterampilan Kepramukaan", short: "Kepramukaan", color: "cyan" },
  KRN: { order: 11, group: "G2", groupName: "2. Keterampilan Kepramukaan", short: "Kepramukaan", color: "cyan" },
  ADM: { order: 12, group: "G3", groupName: "3. Manajemen Regu", short: "Manajemen Regu", color: "emerald" },
  MSK: { order: 13, group: "G4", groupName: "4. Keterampilan & Kuliner", short: "Teknologi & Kuliner", color: "purple" },
};

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
  const [reportGender, setReportGender] = useState("Gabungan");
  const [reportView, setReportView] = useState("regu"); // "regu", "pangkalan", "semua"

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

  // Filter & Search state (Manajemen Peserta)
  const [pesertaSearch, setPesertaSearch] = useState("");
  const [pesertaFilterStatus, setPesertaFilterStatus] = useState("SEMUA");
  const [pesertaFilterTingkat, setPesertaFilterTingkat] = useState("SEMUA");


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
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [noDadaInput, setNoDadaInput] = useState("");
  const [showWinners, setShowWinners] = useState(false);
  const [verifyingJuriId, setVerifyingJuriId] = useState(null);
  const [juriPasswordInput, setJuriPasswordInput] = useState("");

  // States for checking berkas
  const [checkingBerkasId, setCheckingBerkasId] = useState(null);
  const [berkasStatus, setBerkasStatus] = useState({});
  const [catatanBerkas, setCatatanBerkas] = useState("");

  // States for publish nilai dewan juri
  const [publishedJuriIds, setPublishedJuriIds] = useState([]);
  const [publishAll, setPublishAll] = useState(false);
  const [publishingJuriId, setPublishingJuriId] = useState(null);
  const [globalPublishing, setGlobalPublishing] = useState(false);
  const [penilaianList, setPenilaianList] = useState([]);
  const [seedingPeserta, setSeedingPeserta] = useState(false);
  const [clearingData, setClearingData] = useState(false);

  // State Edit Email & Kirim Ulang Peserta
  const [modalEmailPeserta, setModalEmailPeserta] = useState({ open: false, peserta: null, emailInput: "" });
  const [resendingEmailId, setResendingEmailId] = useState(null);

  // State Ganti Password & Reset Token Admin
  const [modalPasswordOpen, setModalPasswordOpen] = useState(false);
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [confirmAdminPassword, setConfirmAdminPassword] = useState("");
  const [adminPasswordSaving, setAdminPasswordSaving] = useState(false);
  const [adminPasswordMsg, setAdminPasswordMsg] = useState({ type: "", text: "" });
  const [generatedResetUrl, setGeneratedResetUrl] = useState("");
  const [generatedToken, setGeneratedToken] = useState("");
  const [generatingToken, setGeneratingToken] = useState(false);
  const [tokenCopied, setTokenCopied] = useState(false);

  const handleGenerateNewToken = async () => {
    setGeneratingToken(true);
    try {
      const res = await fetch("/api/admin/reset-password-token?action=generate");
      const data = await res.json();
      if (res.ok && data.success) {
        setGeneratedResetUrl(data.resetUrl);
        setGeneratedToken(data.token);
      }
    } catch (_) {}
    finally {
      setGeneratingToken(false);
    }
  };

  const handleChangeAdminPassword = async (e) => {
    e.preventDefault();
    if (!newAdminPassword || newAdminPassword.length < 6) {
      setAdminPasswordMsg({ type: "error", text: "Kata sandi baru minimal 6 karakter." });
      return;
    }
    if (newAdminPassword !== confirmAdminPassword) {
      setAdminPasswordMsg({ type: "error", text: "Konfirmasi kata sandi tidak cocok." });
      return;
    }
    setAdminPasswordSaving(true);
    setAdminPasswordMsg({ type: "", text: "" });
    try {
      // 1. Perbarui hash di server dengan token otorisasi admin
      let sessionToken = null;
      try {
        const raw = sessionStorage.getItem("_admin_session");
        if (raw) sessionToken = JSON.parse(raw)?.token;
      } catch (_) {}

      const res = await fetch("/api/admin/update-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {}),
        },
        body: JSON.stringify({
          newPassword: newAdminPassword,
          token: sessionToken,
        }),
      });

      const resData = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(resData.error || "Gagal memperbarui kata sandi di server.");
      }

      // 2. Coba perbarui di Supabase Auth jika sesi ada
      try {
        await supabase.auth.updateUser({ password: newAdminPassword });
      } catch (_) {}

      setAdminPasswordMsg({ type: "success", text: "Kata sandi Admin berhasil diperbarui!" });
      showPesan("success", "🔑 Kata sandi akun Admin berhasil diperbarui!");
      setTimeout(() => {
        setModalPasswordOpen(false);
        setNewAdminPassword("");
        setConfirmAdminPassword("");
        setAdminPasswordMsg({ type: "", text: "" });
      }, 1500);
    } catch (err) {
      setAdminPasswordMsg({ type: "error", text: "Kesalahan: " + err.message });
    } finally {
      setAdminPasswordSaving(false);
    }
  };

  const handleToggleShowWinners = async () => {
    const nextState = !showWinners;
    setShowWinners(nextState);

    // Update server-backed publishState
    try {
      await fetch("/api/admin/publish-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle_show_winners", showWinners: nextState }),
      });
    } catch (_) {}

    if (nextState) {
      try {
        await supabase.from("informasi").delete().eq("text", "__CONFIG_SHOW_WINNERS:false");
        await supabase.from("informasi").insert({ text: "__CONFIG_SHOW_WINNERS:true" });
      } catch (_) {}
      showPesan("success", "🏆 MODUS PENGUMUMAN JUARA AKTIF! Total Akumulasi Nilai & Tangga Juara Top 3 kini tampil di layar broadcast.");
    } else {
      try {
        await supabase.from("informasi").delete().eq("text", "__CONFIG_SHOW_WINNERS:true");
        await supabase.from("informasi").delete().eq("text", "__SHOW_WINNERS__");
      } catch (_) {}
      showPesan("info", "🔒 Modus Pengumuman Juara Non-Aktif. Tampilan broadcast kembali ke No. Urut.");
    }
    const { data: freshInfo } = await supabase.from("informasi").select("id, text, created_at").order("created_at", { ascending: false });
    if (freshInfo) setInformasiList(freshInfo);
  };

  const handlePublishJuri = async (juriId, juriNama = "Juri") => {
    setPublishingJuriId(juriId);
    try {
      const res = await fetch("/api/admin/publish-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "publish", juri_id: juriId }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showPesan("success", `👁️ Nilai dari ${juriNama} sekarang DITAMPILKAN di Leaderboard!`);
        await fetchAllData();
      } else {
        showPesan("error", "Gagal menampilkan nilai: " + (data.error || "Terjadi kesalahan"));
      }
    } catch (err) {
      showPesan("error", "Kesalahan koneksi: " + err.message);
    } finally {
      setPublishingJuriId(null);
    }
  };

  const handleUnpublishJuri = async (juriId, juriNama = "Juri") => {
    setPublishingJuriId(juriId);
    try {
      const res = await fetch("/api/admin/publish-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "unpublish", juri_id: juriId }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showPesan("info", `⏸️ Nilai dari ${juriNama} DITAHAN (disembunyikan dari Leaderboard).`);
        await fetchAllData();
      } else {
        showPesan("error", "Gagal menyembunyikan nilai: " + (data.error || "Terjadi kesalahan"));
      }
    } catch (err) {
      showPesan("error", "Kesalahan koneksi: " + err.message);
    } finally {
      setPublishingJuriId(null);
    }
  };

  const handlePublishAll = async () => {
    if (!confirm("Tampilkan seluruh nilai dari SEMUA Dewan Juri ke Leaderboard Utama?")) return;
    setGlobalPublishing(true);
    try {
      const res = await fetch("/api/admin/publish-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "publish_all" }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showPesan("success", "👁️ Seluruh nilai juri sekarang DITAMPILKAN di Leaderboard Utama!");
        await fetchAllData();
      } else {
        showPesan("error", "Gagal menampilkan nilai: " + (data.error || "Terjadi kesalahan"));
      }
    } catch (err) {
      showPesan("error", "Kesalahan: " + err.message);
    } finally {
      setGlobalPublishing(false);
    }
  };

  const handleUnpublishAll = async () => {
    if (!confirm("Tahan / sembunyikan seluruh nilai juri dari Leaderboard Utama?")) return;
    setGlobalPublishing(true);
    try {
      const res = await fetch("/api/admin/publish-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "unpublish_all" }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showPesan("info", "⏸️ Seluruh nilai juri DITAHAN (disembunyikan dari Leaderboard Utama).");
        await fetchAllData();
      } else {
        showPesan("error", "Gagal menyembunyikan: " + (data.error || "Terjadi kesalahan"));
      }
    } catch (err) {
      showPesan("error", "Kesalahan: " + err.message);
    } finally {
      setGlobalPublishing(false);
    }
  };



  const handleBersihkanDataPeserta = async () => {
    if (!confirm("⚠️ PERINGATAN PEMBERSIHAN DATA:\nApakah Anda yakin ingin MENGHAPUS SELURUH data peserta dan penilaian uji coba? Seluruh peserta akan dikosongkan.")) {
      return;
    }
    setClearingData(true);
    try {
      // 1. Delete all penilaian
      await supabase.from("penilaian").delete().neq("id", 0);

      // 2. Delete all peserta
      const { error: delError } = await supabase
        .from("peserta")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000");
      if (delError) throw delError;

      // 3. Reset publish flags
      await supabase.from("informasi").delete().like("text", "__PUBLISH%");
      await supabase.from("informasi").delete().like("text", "__CONFIG_%");
      await supabase.from("informasi").delete().eq("text", "__SHOW_WINNERS__");

      showPesan("success", "🧹 Seluruh data peserta dan nilai uji coba berhasil dibersihkan total!");
      await fetchAllData();
    } catch (err) {
      showPesan("error", "Gagal membersihkan data: " + err.message);
    } finally {
      setClearingData(false);
    }
  };

  const handleBersihkanJuriTest = async () => {
    if (!confirm("⚠️ PERINGATAN HAPUS JURI TEST:\nApakah Anda yakin ingin MENGHAPUS SELURUH akun dewan juri uji coba? (Akun Admin Utama tetap aman).")) {
      return;
    }
    setClearingData(true);
    try {
      const { error: delError } = await supabase
        .from("profiles")
        .delete()
        .eq("role", "juri");
      if (delError) throw delError;

      showPesan("success", "🧹 Seluruh akun dewan juri uji coba berhasil dibersihkan!");
      await fetchAllData();
    } catch (err) {
      showPesan("error", "Gagal membersihkan juri: " + err.message);
    } finally {
      setClearingData(false);
    }
  };


  // Set viewport to desktop scale (1280px) on mobile so admin dashboard appears like desktop mode
  useEffect(() => {
    let meta = document.querySelector('meta[name="viewport"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'viewport';
      document.head.appendChild(meta);
    }
    const prevContent = meta.content;
    meta.content = 'width=1280, initial-scale=0.35, maximum-scale=3, user-scalable=yes';

    return () => {
      if (meta) {
        meta.content = prevContent || 'width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes';
      }
    };
  }, []);

  // Auth check
  useEffect(() => {
    cekAuth();
  }, []);

  // Auto-sync next nomor kapling when peserta list updates or is emptied (starts from 001 for Putra, 002 for Putri)
  useEffect(() => {
    if (!formPeserta.nama_regu) {
      setFormPeserta((prev) => ({
        ...prev,
        nomor_dada: getNextKaplingFormatted(prev.gender, pesertaList),
      }));
    }
  }, [pesertaList]);

  const cekAuth = async () => {
    // 1. Cek sesi lokal dan verifikasi keabsahan kriptografis token sesi
    let verifiedAdminUser = null;
    let localAdminSession = null;
    try {
      const raw = sessionStorage.getItem("_admin_session");
      if (raw) localAdminSession = JSON.parse(raw);
    } catch (_) {}

    // Verifikasi token sesi dengan server jika ada token lokal
    if (localAdminSession?.token) {
      try {
        const verifyRes = await fetch("/api/admin/login", {
          headers: { Authorization: `Bearer ${localAdminSession.token}` },
        });
        const vData = await verifyRes.json();
        if (verifyRes.ok && vData.valid && vData.user) {
          verifiedAdminUser = vData.user;
        }
      } catch (_) {}
    }

    // 2. Verifikasi sesi autentikasi resmi dari Supabase Auth
    if (!verifiedAdminUser) {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (!sessionError && session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("id, nama_lengkap, role")
          .eq("id", session.user.id)
          .maybeSingle();

        if (profile && profile.role === "admin") {
          verifiedAdminUser = profile;
        }
      }
    }

    // Jika tidak terverifikasi sama sekali, bersihkan sesi dan redirect ke halaman login
    if (!verifiedAdminUser) {
      try {
        sessionStorage.removeItem("_profile_cache");
        sessionStorage.removeItem("_admin_session");
      } catch (_) {}
      await supabase.auth.signOut().catch(() => {});
      router.replace("/login");
      return;
    }

    setAdmin(verifiedAdminUser);
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

      // Fetch all peserta (including Gudep, CP, Email, is_verified)
      supabase
        .from("peserta")
        .select("id, nomor_dada, nama_regu, pangkalan, kategori, gender, total_nilai, no_gudep, kontak_person, email, is_verified, created_at, status_berkas, catatan_berkas, berkas_ketersediaan, berkas_pendaftaran, berkas_biodata_peserta, berkas_biodata_pembina, berkas_bukti_pembayaran")
        .order("is_verified", { ascending: true })
        .order("nomor_dada", { ascending: true }),

      // Fetch all penilaian in parallel chunks (fast concurrent loading)
      (async () => {
        const [c1, c2] = await Promise.all([
          supabase.from("penilaian").select("id, peserta_id, juri_id, lomba_id, nilai").range(0, 999),
          supabase.from("penilaian").select("id, peserta_id, juri_id, lomba_id, nilai").range(1000, 1999),
        ]);
        const allScores = [...(c1.data || []), ...(c2.data || [])];
        return { data: allScores, error: c1.error || c2.error };
      })(),

      // Fetch all juri from profiles via API to get emails
      fetch("/api/juri/get-all").then(res => res.json()).then(res => ({ data: res.data, error: res.error })),

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
    if (lombaRes.data) {
      const filtered = lombaRes.data.filter((l) => OFFICIAL_GROUP_ORDER[l.kode_lomba?.toUpperCase()]);
      filtered.sort((a, b) => {
        const orderA = OFFICIAL_GROUP_ORDER[a.kode_lomba?.toUpperCase()]?.order || 99;
        const orderB = OFFICIAL_GROUP_ORDER[b.kode_lomba?.toUpperCase()]?.order || 99;
        return orderA - orderB;
      });
      setLombaList(filtered);
    }

    if (pesertaRes.error) console.error("Error fetching peserta:", pesertaRes.error);
    const dbPeserta = pesertaRes.data || [];
    setPesertaList(dbPeserta);
    
    if (jurisRes.error) console.error("Error fetching juri:", jurisRes.error);
    if (jurisRes.data) setJuriList(jurisRes.data);
    
    if (logsRes.error) console.error("Error fetching logs:", logsRes.error);
    if (logsRes.data) setLogEntries(logsRes.data);

    let allPenilaian = [...(penilaianRes?.data || [])];
    try {
      if (typeof window !== "undefined") {
        const rawOffline = JSON.parse(localStorage.getItem("offline_penilaian") || "[]");
        const validOffline = rawOffline.filter((off) => dbPeserta.some((p) => p.id === off.peserta_id));
        validOffline.forEach((off) => {
          if (!allPenilaian.some((s) => s.peserta_id === off.peserta_id && s.lomba_id === off.lomba_id)) {
            allPenilaian.push(off);
          }
        });
      }
    } catch (_) {}

    setPenilaianList(allPenilaian);

    // Sync publish status from /api/admin/publish-score
    try {
      const pubRes = await fetch("/api/admin/publish-score");
      if (pubRes.ok) {
        const pubData = await pubRes.json();
        if (pubData.publishAll !== undefined) setPublishAll(pubData.publishAll);
        if (pubData.publishedJuriIds) setPublishedJuriIds(pubData.publishedJuriIds);
        if (pubData.showWinners !== undefined) setShowWinners(pubData.showWinners);
      }
    } catch (_) {}

    if (informasiRes.data) {
      setInformasiList(informasiRes.data);
      const active = informasiRes.data.some((i) => i.text === "__CONFIG_SHOW_WINNERS:true" || i.text === "__SHOW_WINNERS__");
      if (active) setShowWinners(true);

      const pubJuriIds = [];
      let pubAll = false;
      informasiRes.data.forEach((item) => {
        if (item.text === "__PUBLISH_ALL_SCORES__:true") pubAll = true;
        if (item.text && item.text.startsWith("__PUBLISHED_JURI__:")) {
          pubJuriIds.push(item.text.replace("__PUBLISHED_JURI__:", "").trim());
        }
      });
      if (pubAll) setPublishAll(true);
      if (pubJuriIds.length > 0) {
        setPublishedJuriIds((prev) => Array.from(new Set([...prev, ...pubJuriIds])));
      }
    }


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

    let currentUserId = "da882421-cecc-48ea-a032-8b6db1bf9697";
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) currentUserId = session.user.id;
    } catch (_) {}

    // Update offline_penilaian in localStorage so changes persist locally
    try {
      if (typeof window !== "undefined") {
        const offlinePenilaian = JSON.parse(localStorage.getItem("offline_penilaian") || "[]");
        for (const [key, nilai] of Object.entries(editedNilai)) {
          const [pesertaId, lombaId] = key.split("_");
          const idx = offlinePenilaian.findIndex((o) => o.peserta_id === pesertaId && o.lomba_id === lombaId);
          if (idx !== -1) offlinePenilaian.splice(idx, 1);
          if (nilai !== "") {
            offlinePenilaian.push({
              id: `admin-${Date.now()}-${Math.random().toString(36).substring(7)}`,
              peserta_id: pesertaId,
              juri_id: currentUserId,
              lomba_id: lombaId,
              nilai: Number(nilai),
              updated_at: new Date().toISOString(),
            });
          }
        }
        localStorage.setItem("offline_penilaian", JSON.stringify(offlinePenilaian));
      }
    } catch (_) {}

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
          juri_id: currentUserId,
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

    try {
      // 1. Dapatkan data peserta untuk mengambil URL berkasnya
      const peserta = pesertaList.find(p => p.id === id);
      if (peserta) {
        const pathsToDelete = [];
        const extractPath = (url) => {
          if (url && url.includes("/berkas_peserta/")) {
            return url.split("/berkas_peserta/")[1];
          }
          return null;
        };
        
        const p1 = extractPath(peserta.berkas_ketersediaan);
        const p2 = extractPath(peserta.berkas_pendaftaran);
        const p3 = extractPath(peserta.berkas_biodata_peserta);
        const p4 = extractPath(peserta.berkas_biodata_pembina);
        
        if (p1) pathsToDelete.push(p1);
        if (p2) pathsToDelete.push(p2);
        if (p3) pathsToDelete.push(p3);
        if (p4) pathsToDelete.push(p4);
        
        if (pathsToDelete.length > 0) {
          // 2. Hapus file-file dari storage
          await supabase.storage.from("berkas_peserta").remove(pathsToDelete);
        }
      }

      // 3. Hapus data dari database
      const { error } = await supabase.from("peserta").delete().eq("id", id);
      if (error) throw error;
      
      showPesan("success", `Regu ${nama} dan berkasnya berhasil dihapus.`);
      setConfirmDeleteId(null);
      await fetchAllData();
    } catch (err) {
      showPesan("error", "Gagal menghapus: " + err.message);
    }
    
    setSaving(false);
  };

  // --- KAPLING AUTO-ASSIGNMENT (Maksimal 53: Putra = Ganjil 1..53, Putri = Genap 2..52, mengisi nomor terkecil yang belum terisi/kosong) ---
  const getNextKapling = (gender, list = pesertaList) => {
    const isPutra = gender?.toLowerCase().includes("laki") || gender?.toLowerCase().includes("putra");
    const validKaplings = new Set(
      (list || [])
        .map((p) => Number(p.nomor_dada))
        .filter((n) => !isNaN(n) && n > 0)
    );

    if (isPutra) {
      // Cari nomor kapling ganjil terkecil yang belum terisi (1 s.d. 53)
      for (let n = 1; n <= 53; n += 2) {
        if (!validKaplings.has(n)) return n;
      }
      // Jika 1..53 sudah penuh, cari slot ganjil berikutnya
      let n = 55;
      while (validKaplings.has(n)) n += 2;
      return n;
    } else {
      // Cari nomor kapling genap terkecil yang belum terisi (2 s.d. 52)
      for (let n = 2; n <= 52; n += 2) {
        if (!validKaplings.has(n)) return n;
      }
      // Jika 2..52 sudah penuh, cari slot genap berikutnya
      let n = 54;
      while (validKaplings.has(n)) n += 2;
      return n;
    }
  };

  const getNextKaplingFormatted = (gender, list = pesertaList) => {
    return String(getNextKapling(gender, list)).padStart(3, "0");
  };



  // --- HELPER: WHATSAPP KONFIRMASI PESERTA ---
  const getWaPesertaUrl = (peserta, type = "auto", currentBerkasStatus = null, currentCatatan = null) => {
    if (!peserta || !peserta.kontak_person) return null;
    let cleanPhone = String(peserta.kontak_person).replace(/\D/g, "");
    if (cleanPhone.startsWith("0")) {
      cleanPhone = "62" + cleanPhone.slice(1);
    } else if (!cleanPhone.startsWith("62")) {
      cleanPhone = "62" + cleanPhone;
    }
    if (cleanPhone.length < 9) return null;

    const statusObj = currentBerkasStatus || peserta.status_berkas || {};
    const catatan = currentCatatan !== null ? currentCatatan : (peserta.catatan_berkas || "");

    const berkasLabels = {
      ketersediaan: "Form Ketersediaan Pangkalan",
      pendaftaran: "Form Pendaftaran Regu",
      biodata_peserta: "Biodata & Foto Peserta",
      biodata_pembina: "Biodata Pembina Pendamping",
      bukti_pembayaran: "Bukti Pembayaran / Administrasi",
    };

    const isComplete = Boolean(
      statusObj.ketersediaan &&
      statusObj.pendaftaran &&
      statusObj.biodata_peserta &&
      statusObj.biodata_pembina &&
      statusObj.bukti_pembayaran
    );

    const actualType = type === "auto" ? (peserta.is_verified || isComplete ? "selesai" : "belum") : type;

    // Sinkronisasi No. Gudep sesuai jenis kelamin regu
    const rawGudep = peserta.no_gudep || (pesertaList || []).find((p) => p.pangkalan === peserta.pangkalan && p.no_gudep)?.no_gudep;
    const effectiveGudep = getNoGudepByGender(rawGudep, peserta.gender) || "-";

    let message = "";
    if (actualType === "selesai") {
      const kaplingFormatted = peserta.nomor_dada ? String(peserta.nomor_dada).padStart(3, '0') : '-';
      const cetakUrl = `https://www.siloti-kwaranmekarbaru.my.id/peserta/cetak/${peserta.id}`;
      message = 
`Halo Kak Pembina Regu *${peserta.nama_regu}* (${peserta.pangkalan}),

Salam Pramuka! ⚜️
Panitia Lomba Tingkat II (LT-II) Kwartir Ranting Mekar Baru Tahun 2026 menginformasikan bahwa pendaftaran dan berkas regu Kakak telah *DIVERIFIKASI RESMI & LENGKAP*. ✅

📋 *INFORMASI PENDAFTARAN & KAPLING:*
• Nama Regu: *${peserta.nama_regu}* (${peserta.gender === 'Laki-laki' ? '👦 Putra' : '👧 Putri'})
• Pangkalan: *${peserta.pangkalan}*
• No. Gudep: *${effectiveGudep}*
• Tingkat: *${peserta.kategori}*
• No. Kapling Tenda: *#${kaplingFormatted}*
• Status: *TERVERIFIKASI RESMI* ✅

📄 *BUKTI PENDAFTARAN RESMI (UNDUH / CETAK):*
Silakan buka dan unduh Bukti Pendaftaran resmi regu Kakak melalui tautan di bawah ini:
👉 ${cetakUrl}

*(Catatan: Bukti Pendaftaran fisik wajib dicetak dan dibawa saat Pendaftaran Ulang di Bumi Perkemahan untuk mendapatkan Surat Izin Mendirikan Tenda di Kapling #${kaplingFormatted}).*

👥 *GRUP WHATSAPP RESMI PEMBINA PENDAMPING:*
Mohon Kakak Pembina Pendamping segera bergabung ke grup koordinasi resmi melalui tautan berikut:
👉 https://chat.whatsapp.com/G8fYg03xvHjL2lsVKCorPG?s=cl&p=a&mlu=4&ilr=4

Terima kasih atas partisipasinya dan salam Pramuka! ⛺⚜️
_Panitia Pelaksana LT-II Kwarran Mekar Baru 2026_`;
    } else {
      const missingKeys = Object.keys(berkasLabels).filter((k) => !statusObj[k]);
      let missingListStr = "";
      if (missingKeys.length > 0) {
        missingListStr = `\n📌 *Berkas yang belum lengkap / perlu dilengkapi:*\n` +
          missingKeys.map((k) => `• ❌ ${berkasLabels[k]}`).join("\n") + "\n";
      } else {
        missingListStr = `\n📌 *Status Berkas:* Sedang dalam tahap verifikasi / peninjauan panitia.\n`;
      }

      let noteStr = "";
      if (catatan && catatan.trim()) {
        noteStr = `\n📝 *Catatan Panitia:*\n"${catatan.trim()}"\n`;
      }

      message = 
`Halo Kak Pembina Regu *${peserta.nama_regu}* (${peserta.pangkalan} - Gudep: ${effectiveGudep}),

Salam Pramuka! ⚜️
Panitia Lomba Tingkat II (LT-II) Kwarran Mekar Baru menginformasikan terkait status berkas persyaratan pendaftaran regu Kakak:

⚠️ *Status: BELUM SELESAI / BELUM LENGKAP*
${missingListStr}${noteStr}
Untuk melengkapi atau merevisi berkas yang kurang tersebut, mohon *KIRIMKAN LANGSUNG DOKUMEN / FOTO BERKASNYA KE CHAT WHATSAPP ADMIN INI* agar panitia dapat segera memeriksa dan memverifikasi data regu Kakak secara resmi.

Terima kasih atas kerja samanya! Salam Pramuka! ⚜️🙏`;
    }

    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  // --- HELPER: WHATSAPP NOTIFIKASI VERIFIKASI DEWAN JURI ---
  const getWaJuriUrl = (j, customPassword = "") => {
    if (!j || !j.no_wa) return null;
    let cleanPhone = String(j.no_wa).replace(/\D/g, "");
    if (cleanPhone.startsWith("0")) {
      cleanPhone = "62" + cleanPhone.slice(1);
    } else if (!cleanPhone.startsWith("62")) {
      cleanPhone = "62" + cleanPhone;
    }
    if (cleanPhone.length < 9) return null;

    const emailLogin = j.email && j.email !== "No Email" ? j.email : "-";
    const passText = customPassword ? customPassword : "(Gunakan kata sandi yang telah didaftarkan oleh Admin)";

    const message = 
`Salam Pramuka, Kak ${j.nama_lengkap || "Dewan Juri"}! 🙏

Pemberitahuan Resmi Panitia Pelaksana Lomba Tingkat II (LT-II) Kwartir Ranting Mekar Baru Tahun 2026.

Akun Dewan Juri Kakak telah berhasil diverifikasi dan saat ini sudah aktif dalam Sistem Penilaian Real-Time.

Berikut rincian data akses login Kakak:
━━━━━━━━━━━━━━━━━━━━━━
👤 *Username / Email* : ${emailLogin}
🔑 *Kata Sandi*       : ${passText}
🔗 *Link Login Panel* : https://kwaranmekarbaru.my.id/login
━━━━━━━━━━━━━━━━━━━━━━

*Petunjuk Akses Penilaian:*
1. Buka tautan login di atas menggunakan browser di perangkat HP atau Laptop Kakak.
2. Masukkan Email dan Kata Sandi sesuai rincian di atas.
3. Silakan memulai penilaian peserta sesuai dengan cabang lomba dan petunjuk teknis yang ditugaskan.

Apabila Kakak memerlukan bantuan teknis saat login maupun pengisian nilai, silakan langsung menghubungi Panitia / Administrator.

Terima kasih banyak atas partisipasi, integritas, dan dedikasi Kakak dalam menyukseskan LT-II Kwarran Mekar Baru 2026.
_Satyaku Kudarmakan, Darmaku Kubaktikan._ ⚜️`;

    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  // --- HANDLERS: CEK BERKAS PESERTA ---
  const handleStartCekBerkas = (p) => {
    setCheckingBerkasId(p.id);
    setBerkasStatus(p.status_berkas || {
      ketersediaan: false,
      pendaftaran: false,
      biodata_peserta: false,
      biodata_pembina: false,
      bukti_pembayaran: false,
    });
    setCatatanBerkas(p.catatan_berkas || "");
  };

  const handleSimpanBerkas = async (id) => {
    setSaving(true);
    try {
      // 1. Simpan melalui Server API (terjamin berhasil tanpa terblokir RLS)
      const apiRes = await fetch("/api/peserta/update-berkas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          status_berkas: berkasStatus,
          catatan_berkas: catatanBerkas,
        }),
      });

      const apiData = await apiRes.json().catch(() => ({}));

      if (!apiRes.ok || !apiData.success) {
        throw new Error(apiData.error || "Gagal menyimpan ke server.");
      }

      // 2. Perbarui state lokal secara instan agar tidak pernah kembali tidak terceklist
      setPesertaList((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, status_berkas: { ...berkasStatus }, catatan_berkas: catatanBerkas }
            : p
        )
      );

      // 3. Cadangan: simpan langsung via client jika sesi Supabase aktif
      try {
        await supabase
          .from("peserta")
          .update({
            status_berkas: berkasStatus,
            catatan_berkas: catatanBerkas,
          })
          .eq("id", id);
      } catch (_) {}

      showPesan("success", "✅ Status berkas berhasil disimpan permanen!");
      setCheckingBerkasId(null);
      await fetchAllData();
    } catch (err) {
      showPesan("error", "Gagal menyimpan berkas: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleStartVerifikasi = (peserta) => {
    setVerifyingId(peserta.id);
    const suggestedKapling = peserta.nomor_dada
      ? String(peserta.nomor_dada).padStart(3, "0")
      : getNextKaplingFormatted(peserta.gender, pesertaList);
    setNoDadaInput(suggestedKapling);
  };

  const handleVerifikasiPeserta = async (id) => {
    setSaving(true);
    try {
      const cleanKapling = noDadaInput ? Number(noDadaInput) : undefined;
      const res = await fetch("/api/peserta/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ peserta_id: id, nomor_kapling: cleanKapling }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const finalKaplingNum = data.nomor_kapling || cleanKapling;
        const currentP = (pesertaList || []).find((p) => p.id === id);
        let waUrl = null;
        if (currentP) {
          const updatedP = {
            ...currentP,
            nomor_dada: finalKaplingNum,
            is_verified: true,
          };
          waUrl = getWaPesertaUrl(updatedP, "selesai");
        }

        showPesan(
          "success",
          `🎉 Regu berhasil diverifikasi! Nomor Kapling: #${data.nomor_kapling_formatted || String(cleanKapling).padStart(3, "0")}. Membuka pesan WhatsApp Bukti Pendaftaran untuk Pembina...`
        );
        
        // Buka otomatis WhatsApp chat dengan tautan Bukti Pendaftaran resmi
        if (waUrl) {
          window.open(waUrl, "_blank");
        }
        
        setVerifyingId(null);
        setNoDadaInput("");
        await fetchAllData();
      } else {
        showPesan("error", "Gagal melakukan verifikasi: " + (data.error || "Terjadi kesalahan"));
      }
    } catch (err) {
      showPesan("error", "Gagal memproses verifikasi: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleOpenEditEmail = (peserta) => {
    setModalEmailPeserta({
      open: true,
      peserta,
      emailInput: peserta.email || "",
    });
  };

  const handleSimpanEmailPeserta = async (shouldResend = false) => {
    const { peserta, emailInput } = modalEmailPeserta;
    if (!peserta) return;
    const cleanEmail = (emailInput || "").trim();
    if (!cleanEmail) {
      showPesan("error", "Alamat email tidak boleh kosong.");
      return;
    }

    setSaving(true);
    try {
      // 1. Simpan email baru ke database
      const res = await fetch("/api/peserta/update-berkas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: peserta.id, email: cleanEmail }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Gagal menyimpan email.");
      }

      // 2. Jika peserta sudah terverifikasi dan admin memilih untuk kirim ulang email
      if (shouldResend && peserta.is_verified) {
        showPesan("info", `Mengirimkan ulang email bukti pendaftaran resmi ke ${cleanEmail}...`);
        const resVerify = await fetch("/api/peserta/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ peserta_id: peserta.id, nomor_kapling: peserta.nomor_dada }),
        });
        const dataVerify = await resVerify.json();
        if (dataVerify.success && dataVerify.emailSent) {
          showPesan("success", `✅ Email peserta ${peserta.nama_regu} diperbarui & Bukti Pendaftaran berhasil dikirim ke ${cleanEmail}!`);
        } else {
          showPesan("success", `✅ Email peserta berhasil diperbarui. ${dataVerify.emailMessage || ""}`);
        }
      } else {
        showPesan("success", `✅ Email peserta ${peserta.nama_regu} berhasil diperbarui menjadi ${cleanEmail}!`);
      }

      setModalEmailPeserta({ open: false, peserta: null, emailInput: "" });
      await fetchAllData();
    } catch (err) {
      showPesan("error", "Gagal memperbarui email: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleKirimUlangEmail = async (peserta) => {
    if (!peserta.email) {
      showPesan("error", "Peserta ini belum memiliki email terdaftar. Silakan masukkan email terlebih dahulu.");
      handleOpenEditEmail(peserta);
      return;
    }
    setResendingEmailId(peserta.id);
    showPesan("info", `Sedang mengirim ulang email bukti pendaftaran ke ${peserta.email}...`);
    try {
      const res = await fetch("/api/peserta/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ peserta_id: peserta.id, nomor_kapling: peserta.nomor_dada }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (data.emailSent) {
          showPesan("success", `✅ Surat Bukti Pendaftaran resmi berhasil dikirimkan ulang ke ${peserta.email}!`);
        } else {
          showPesan("info", `Status pengiriman: ${data.emailMessage || "Diproses"}`);
        }
      } else {
        showPesan("error", "Gagal mengirim email: " + (data.error || "Terjadi kesalahan"));
      }
    } catch (err) {
      showPesan("error", "Gagal mengirim email: " + err.message);
    } finally {
      setResendingEmailId(null);
    }
  };

  const handleStartReject = (peserta) => {
    setRejectingId(peserta.id);
    setRejectReason("");
  };

  const handleRejectPeserta = async (id) => {
    if (!rejectReason.trim()) {
      showPesan("error", "Alasan penolakan tidak boleh kosong.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/peserta/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ peserta_id: id, reason: rejectReason }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showPesan("success", `❌ Regu berhasil ditolak! ${data.emailMessage || ""}`);
        if (data.mailtoUrl && !data.emailSent) {
          window.open(data.mailtoUrl, "_blank");
        }
        setRejectingId(null);
        setRejectReason("");
        await fetchAllData();
      } else {
        showPesan("error", "Gagal melakukan penolakan: " + (data.error || "Terjadi kesalahan"));
      }
    } catch (err) {
      showPesan("error", "Gagal memproses penolakan: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleVerifikasiJuri = async (id) => {
    if (!juriPasswordInput || juriPasswordInput.length < 6) {
      showPesan("error", "Password minimal 6 karakter.");
      return;
    }
    const targetJuri = juriList.find((j) => j.id === id);
    const pwdToSave = juriPasswordInput;
    setSaving(true);
    try {
      const res = await fetch("/api/juri/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: id,
          password: pwdToSave,
          email: targetJuri?.email && targetJuri.email !== "No Email" ? targetJuri.email : undefined,
          nama_lengkap: targetJuri?.nama_lengkap,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showPesan("success", `🎉 Juri berhasil diverifikasi! ${data.emailMessage || ""}`);
        
        // Buka WhatsApp konfirmasi langsung ke dewan juri dengan pesan lengkap & sopan
        if (targetJuri?.no_wa) {
          const waUrl = getWaJuriUrl(targetJuri, pwdToSave);
          if (waUrl) {
            window.open(waUrl, "_blank");
          }
        } else if (data.mailtoUrl && !data.emailSent) {
          window.open(data.mailtoUrl, "_blank");
        }

        setVerifyingJuriId(null);
        setJuriPasswordInput("");
        await fetchAllData();
      } else {
        showPesan("error", "Gagal memverifikasi: " + (data.error || "Terjadi kesalahan"));
      }
    } catch (err) {
      showPesan("error", "Gagal memproses verifikasi: " + err.message);
    } finally {
      setSaving(false);
    }
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
      // Add to profiles with is_verified = true
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: authData.user.id,
        nama_lengkap: formJuri.nama_lengkap,
        role: "juri",
        assigned_kategori: formJuri.kategori !== "SEMUA" ? formJuri.kategori : null,
        assigned_lomba_id: formJuri.lomba_id !== "SEMUA" ? formJuri.lomba_id : null,
        assigned_gender: formJuri.gender,
        is_verified: true,
      });

      if (profileError) {
        showPesan("error", "Akun Auth dibuat, tapi gagal menyimpan Profil: " + profileError.message);
      } else {
        // Kirim email notifikasi akses login ke dewan juri yang baru didaftarkan
        try {
          const verifyRes = await fetch("/api/juri/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: authData.user.id,
              password: formJuri.password,
              email: formJuri.email,
              nama_lengkap: formJuri.nama_lengkap,
            }),
          });
          const verifyData = await verifyRes.json().catch(() => ({}));
          showPesan("success", `Akun Juri ${formJuri.nama_lengkap} berhasil dibuat! ${verifyData.emailMessage || ""}`);
        } catch (_) {
          showPesan("success", `Akun Juri ${formJuri.nama_lengkap} berhasil dibuat!`);
        }
        setFormJuri({ nama_lengkap: "", email: "", password: "", kategori: "SEMUA", lomba_id: "SEMUA", gender: "SEMUA" });
        await fetchAllData();
      }
    }
    setSaving(false);
  };

  const handleHapusJuri = async (id, nama) => {
    setSaving(true);
    try {
      const res = await fetch("/api/juri/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: id }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        showPesan("success", `✅ Akun Dewan Juri ${nama} dan akses autentikasinya berhasil dihapus permanen.`);
        setConfirmDeleteId(null);
        await fetchAllData();
      } else {
        // Fallback delete direct
        const { error } = await supabase.from("profiles").delete().eq("id", id);
        if (error) throw error;
        showPesan("success", `Dewan Juri ${nama} berhasil dihapus.`);
        setConfirmDeleteId(null);
        await fetchAllData();
      }
    } catch (err) {
      showPesan("error", "Gagal menghapus dewan juri: " + err.message);
    } finally {
      setSaving(false);
    }
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

  // --- RENDERING HELPERS: LAPORAN KLASEMEN & JUARA UMUM ---
  const getPesertaScoreDynamic = useCallback((pesertaId, fallbackVal = 0) => {
    const relLomba = lombaList.filter((l) => l.kategori === reportTingkat);
    let total = 0;
    let count = 0;
    relLomba.forEach((l) => {
      const key = `${pesertaId}_${l.id}`;
      if (editedNilai[key] !== undefined && editedNilai[key] !== "") {
        total += Number(editedNilai[key]);
        count++;
      } else if (nilaiMap[key] !== undefined) {
        total += Number(nilaiMap[key]);
        count++;
      }
    });
    if (count > 0) return Math.round(total * 10) / 10;
    return Number(fallbackVal) || 0;
  }, [lombaList, reportTingkat, editedNilai, nilaiMap]);

  const activeReportLomba = useMemo(() => {
    return lombaList.filter((l) => l.kategori === reportTingkat);
  }, [lombaList, reportTingkat]);

  const getScoreForReguLomba = useCallback((reguId, lombaId) => {
    const key = `${reguId}_${lombaId}`;
    if (editedNilai[key] !== undefined && editedNilai[key] !== "") {
      return Number(editedNilai[key]);
    }
    if (nilaiMap[key] !== undefined) {
      return Number(nilaiMap[key]);
    }
    return "—";
  }, [editedNilai, nilaiMap]);

  const getPredikatOfficial = (index) => {
    const rank = index + 1;
    if (rank === 1) return { title: "JUARA 1", medal: "🥇" };
    if (rank === 2) return { title: "JUARA 2", medal: "🥈" };
    if (rank === 3) return { title: "JUARA 3", medal: "🥉" };
    return { title: `JUARA ${rank}`, medal: "" };
  };

  const rankedReguList = useMemo(() => {
    const filtered = pesertaList.filter(
      (p) => p.kategori === reportTingkat && p.gender === reportGender && p.is_verified === true
    );

    const withScores = filtered.map((p) => {
      const score = getPesertaScoreDynamic(p.id, p.total_nilai);
      let totalTimeMs = 0;
      activeReportLomba.forEach((l) => {
        const tMs = parseTimeToMs(getSavedTimeForPesertaLomba(p.id, l.id));
        if (tMs !== Infinity) totalTimeMs += tMs;
      });
      return { ...p, calculatedScore: score, totalTimeMs };
    });

    // Urutkan nilai tertinggi ke terendah secara mutlak.
    // Jika ada nilai yang sama: Pemenang ditentukan dari waktu tercepat (totalTimeMs terendah)!
    withScores.sort((a, b) => {
      if (b.calculatedScore !== a.calculatedScore) {
        return b.calculatedScore - a.calculatedScore;
      }
      return a.totalTimeMs - b.totalTimeMs;
    });
    return withScores;
  }, [pesertaList, reportTingkat, reportGender, getPesertaScoreDynamic, activeReportLomba]);

  const rankedPangkalanList = useMemo(() => {
    const filtered = pesertaList.filter(
      (p) => p.kategori === reportTingkat && p.is_verified === true
    );

    const pangkalanMap = {};
    filtered.forEach((p) => {
      const pName = (p.pangkalan || "Tanpa Pangkalan").trim();
      if (!pangkalanMap[pName]) {
        pangkalanMap[pName] = {
          pangkalan: pName,
          no_gudep_pa: "",
          no_gudep_pi: "",
          scorePutra: 0,
          scorePutri: 0,
          reguPaList: [],
          reguPiList: [],
          allPeserta: [],
          totalScore: 0,
          lombaScores: {},
        };
      }
      const score = getPesertaScoreDynamic(p.id, p.total_nilai);
      pangkalanMap[pName].allPeserta.push(p);

      if (p.gender === "Laki-laki") {
        pangkalanMap[pName].scorePutra += score;
        if (p.nama_regu && !pangkalanMap[pName].reguPaList.includes(p.nama_regu)) {
          pangkalanMap[pName].reguPaList.push(p.nama_regu);
        }
        if (p.no_gudep && p.no_gudep !== "—") {
          pangkalanMap[pName].no_gudep_pa = getNoGudepByGender(p.no_gudep, "Laki-laki");
        }
      } else {
        pangkalanMap[pName].scorePutri += score;
        if (p.nama_regu && !pangkalanMap[pName].reguPiList.includes(p.nama_regu)) {
          pangkalanMap[pName].reguPiList.push(p.nama_regu);
        }
        if (p.no_gudep && p.no_gudep !== "—") {
          pangkalanMap[pName].no_gudep_pi = getNoGudepByGender(p.no_gudep, "Perempuan");
        }
      }
      pangkalanMap[pName].totalScore += score;
      pangkalanMap[pName].totalScore = Math.round(pangkalanMap[pName].totalScore * 10) / 10;
    });

    Object.values(pangkalanMap).forEach((item) => {
      let cumulativeTimeMs = 0;
      activeReportLomba.forEach((l) => {
        let totalLomba = 0;
        let hasScore = false;
        item.allPeserta.forEach((p) => {
          const s = getScoreForReguLomba(p.id, l.id);
          if (s !== "—") {
            totalLomba += Number(s);
            hasScore = true;
          }
          const tMs = parseTimeToMs(getSavedTimeForPesertaLomba(p.id, l.id));
          if (tMs !== Infinity) cumulativeTimeMs += tMs;
        });
        item.lombaScores[l.id] = hasScore ? Math.round(totalLomba * 10) / 10 : "—";
      });
      item.totalTimeMs = cumulativeTimeMs;
    });

    const list = Object.values(pangkalanMap);
    // Peringkat klasemen: Akumulasi nilai tertinggi. Jika sama, waktu tercepat!
    list.sort((a, b) => {
      if (b.totalScore !== a.totalScore) {
        return b.totalScore - a.totalScore;
      }
      return a.totalTimeMs - b.totalTimeMs;
    });
    return list;
  }, [pesertaList, reportTingkat, getPesertaScoreDynamic, activeReportLomba, getScoreForReguLomba]);

  // Unified list for display based on reportGender
  const displayKlasemenList = useMemo(() => {
    if (reportGender === "Gabungan") {
      return rankedPangkalanList.map((item) => {
        let gudepStr = "—";
        if (item.no_gudep_pa && item.no_gudep_pi) {
          gudepStr = `${item.no_gudep_pa} / ${item.no_gudep_pi}`;
        } else {
          gudepStr = item.no_gudep_pa || item.no_gudep_pi || "—";
        }
        const paStr = item.reguPaList.length > 0 ? item.reguPaList.join(", ") : "—";
        const piStr = item.reguPiList.length > 0 ? item.reguPiList.join(", ") : "—";

        return {
          id: item.pangkalan,
          pangkalan: item.pangkalan,
          no_gudep: gudepStr,
          subText: `Regu: ${paStr} (Pa) & ${piStr} (Pi)`,
          scorePa: item.scorePutra,
          scorePi: item.scorePutri,
          calculatedScore: item.totalScore,
          getLombaScore: (lombaId) => item.lombaScores[lombaId] ?? "—",
        };
      });
    }
    return rankedReguList.map((regu) => ({
      id: regu.id,
      pangkalan: regu.pangkalan,
      no_gudep: getNoGudepByGender(regu.no_gudep, regu.gender) || "—",
      subText: `Regu: ${regu.nama_regu} (${regu.gender === "Laki-laki" ? "Putra" : "Putri"})`,
      calculatedScore: regu.calculatedScore,
      getLombaScore: (lombaId) => getScoreForReguLomba(regu.id, lombaId),
    }));
  }, [reportGender, rankedPangkalanList, rankedReguList, getScoreForReguLomba]);

  const getJuaraForLomba = (lombaId) => {
    if (reportGender === "Gabungan") {
      const pangkalanScores = rankedPangkalanList.map((item) => {
        const val = item.lombaScores[lombaId];
        const paStr = item.reguPaList.length > 0 ? item.reguPaList.join(", ") : "—";
        const piStr = item.reguPiList.length > 0 ? item.reguPiList.join(", ") : "—";
        return {
          id: item.pangkalan,
          pangkalan: item.pangkalan,
          nama_regu: `${paStr} & ${piStr}`,
          score: val === "—" ? 0 : Number(val),
        };
      });
      pangkalanScores.sort((a, b) => b.score - a.score);
      return pangkalanScores.slice(0, 3);
    }

    const activePeserta = pesertaList.filter(
      (p) =>
        p.kategori === reportTingkat &&
        p.gender === reportGender &&
        p.is_verified === true
    );

    const scores = activePeserta.map((p) => {
      const key = `${p.id}_${lombaId}`;
      let score = 0;
      if (editedNilai[key] !== undefined && editedNilai[key] !== "") {
        score = Number(editedNilai[key]);
      } else if (nilaiMap[key] !== undefined) {
        score = Number(nilaiMap[key]);
      }
      return { ...p, score };
    });

    // Peringkat per cabang lomba: Nilai tertinggi. Jika nilai sama, waktu tercepat!
    scores.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      const timeA = parseTimeToMs(getSavedTimeForPesertaLomba(a.id, lombaId));
      const timeB = parseTimeToMs(getSavedTimeForPesertaLomba(b.id, lombaId));
      return timeA - timeB;
    });
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

  const filteredPesertaList = useMemo(() => {
    return pesertaList.filter((p) => {
      if (pesertaSearch.trim()) {
        const q = pesertaSearch.toLowerCase();
        const matchName = p.nama_regu?.toLowerCase().includes(q);
        const matchSchool = p.pangkalan?.toLowerCase().includes(q);
        const matchGudep = p.no_gudep?.toLowerCase().includes(q);
        const matchNo = p.nomor_dada?.toString().includes(q);
        const matchKontak = p.kontak_person?.toLowerCase().includes(q);
        if (!matchName && !matchSchool && !matchGudep && !matchNo && !matchKontak) return false;
      }
      if (pesertaFilterTingkat !== "SEMUA" && p.kategori !== pesertaFilterTingkat) return false;
      if (pesertaFilterStatus === "VERIFIED" && !p.is_verified) return false;
      if (pesertaFilterStatus === "PENDING" && p.is_verified) return false;
      return true;
    });
  }, [pesertaList, pesertaSearch, pesertaFilterTingkat, pesertaFilterStatus]);


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pl-[7.3%]" style={{
        backgroundImage: "linear-gradient(135deg, rgba(3, 7, 18, 0.92) 0%, rgba(3, 7, 18, 0.96) 100%), url('/scout_event_live.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}>
        <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen min-w-[1240px] text-slate-200 font-sans relative overflow-x-auto" style={{
      backgroundImage: "linear-gradient(135deg, rgba(3, 7, 18, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%), url('/scout_event_live.png')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundAttachment: "fixed",
    }}>
      {!isOnline && <div className="offline-banner sticky top-0 z-50">⚠️ KONEKSI TERPUTUS</div>}

      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-xl border-b border-emerald-500/20 shadow-2xl no-print">
        <div className="max-w-[1600px] mx-auto px-3 md:px-8 py-2 md:py-3">
          {/* Top row: brand + logout */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
              {/* Logos Cluster - Proporsional simetris di Android HP & Desktop */}
              <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                <img src="/logo_wosm.png" alt="WOSM" className="h-7 sm:h-9 md:h-12 max-h-7 sm:max-h-9 md:max-h-12 w-auto object-contain drop-shadow-[0_0_6px_rgba(255,255,255,0.3)]" />
                <img src="/logo_kwarran_mekarbaru.png" alt="Kwarran Mekar Baru" className="h-7 sm:h-9 md:h-12 max-h-7 sm:max-h-9 md:max-h-12 w-auto object-contain drop-shadow-[0_0_6px_rgba(255,255,255,0.3)]" />
                <img src="/logo_lt2.png" alt="LT-II 2026" className="h-7 sm:h-9 md:h-12 max-h-7 sm:max-h-9 md:max-h-12 w-auto object-contain drop-shadow-[0_0_8px_rgba(245,166,35,0.4)]" />
                <img src="/logo_65.png" alt="HUT 65 Pramuka" className="h-7 sm:h-9 md:h-12 max-h-7 sm:max-h-9 md:max-h-12 w-auto object-contain drop-shadow-[0_0_8px_rgba(245,166,35,0.4)]" />
              </div>
              <div className="min-w-0 border-l border-slate-800 pl-2 md:pl-3">
                <h1 className="text-xs sm:text-sm md:text-base font-black tracking-wider text-white truncate">
                  PANEL <span className="text-emerald-400">ADMINISTRATOR</span>
                </h1>
                <p className="text-[0.55rem] sm:text-[0.65rem] text-slate-400 tracking-wider truncate">LT-II Kwartir Ranting Mekar Baru 2026</p>
              </div>
            </div>

            {/* Logout always visible */}
            <button
              onClick={async () => {
                try {
                  sessionStorage.removeItem("_profile_cache");
                  sessionStorage.removeItem("_admin_session");
                } catch (_) {}
                await supabase.auth.signOut().catch(() => {});
                router.push("/login");
              }}
              className="text-[0.6rem] sm:text-xs font-bold tracking-wider bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl border border-red-500/20 hover:border-red-500 transition-all shrink-0 shadow-sm"
            >
              LOGOUT
            </button>
          </div>

          {/* Bottom row: action buttons - scrollable on mobile */}
          <div className="flex items-center gap-2 mt-2 overflow-x-auto no-scrollbar pb-0.5">

            <button
              onClick={() => {
                try {
                  localStorage.setItem("_cetak_cache", JSON.stringify({
                    lombaList,
                    pesertaList,
                    juriList,
                    penilaianList,
                    ts: Date.now(),
                  }));
                } catch (_) {}
                router.push("/dashboard/admin/cetak-rekap");
              }}
              className="text-[0.65rem] sm:text-xs font-bold tracking-wider px-3 py-1.5 sm:py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500 text-cyan-300 hover:text-slate-950 border border-cyan-500/30 transition-all shadow-sm flex items-center gap-1.5 shrink-0 whitespace-nowrap"
              title="Buka halaman cetak laporan hasil rekap nilai resmi per mata lomba"
            >
              <span>🖨️ Cetak Rekap</span>
            </button>

            <button
              onClick={handleToggleShowWinners}
              className={`text-[0.65rem] sm:text-xs font-black tracking-wider px-3 py-1.5 sm:py-2 rounded-xl transition-all shadow-md flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
                showWinners
                  ? "bg-amber-400 text-slate-950 hover:bg-amber-300 shadow-amber-500/30 animate-pulse"
                  : "bg-slate-800/90 text-slate-300 border border-slate-700 hover:bg-slate-700"
              }`}
              title="Klik untuk mengaktifkan/menonaktifkan pengumuman juara & total akumulasi di layar utama broadcast"
            >
              <span>{showWinners ? "🏆 MODE JUARA: AKTIF" : "🔒 MODE JUARA: OFF"}</span>
            </button>

            <button
              onClick={() => {
                setModalPasswordOpen(true);
                setNewAdminPassword("");
                setConfirmAdminPassword("");
                setAdminPasswordMsg({ type: "", text: "" });
                setTokenCopied(false);
                handleGenerateNewToken();
              }}
              className="text-[0.65rem] sm:text-xs font-bold tracking-wider px-3 py-1.5 sm:py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-500/30 transition-all shadow-sm flex items-center gap-1.5 shrink-0 whitespace-nowrap"
              title="Ganti kata sandi akun Admin & buat token baru"
            >
              <span>🔑 Ganti Password</span>
            </button>
          </div>

        </div>
      </nav>

      {/* TABS */}
      <div className="max-w-[1600px] mx-auto px-2.5 sm:px-4 md:px-8 pt-3 sm:pt-6 no-print">
        <div className="flex gap-1.5 sm:gap-2 overflow-x-auto whitespace-nowrap no-scrollbar py-1 sm:py-1.5 px-2 sm:px-4 rounded-t-xl" style={{
          backgroundImage: "url('/table_header_banner.png')",
          backgroundSize: "100% 100%",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          borderBottom: "1.5px solid rgba(6, 182, 212, 0.45)"
        }}>
          <button onClick={() => setActiveTab("penilaian")} className={`px-2.5 sm:px-4 py-2 sm:py-3 text-[0.7rem] sm:text-xs md:text-sm font-black tracking-wider uppercase border-b-2 transition-colors ${activeTab === "penilaian" ? "border-amber-400 text-amber-300 bg-amber-500/10 rounded-t-lg" : "border-transparent text-slate-400 hover:text-slate-200"} flex-shrink-0 flex items-center gap-1.5`}>
            <span>📊</span> Matriks Penilaian
          </button>
          <button onClick={() => setActiveTab("peserta")} className={`px-2.5 sm:px-4 py-2 sm:py-3 text-[0.7rem] sm:text-xs md:text-sm font-black tracking-wider uppercase border-b-2 transition-colors ${activeTab === "peserta" ? "border-amber-400 text-amber-300 bg-amber-500/10 rounded-t-lg" : "border-transparent text-slate-400 hover:text-slate-200"} flex-shrink-0 flex items-center gap-1.5`}>
            <span>👥</span> Manajemen Peserta
          </button>
          <button onClick={() => setActiveTab("juri")} className={`px-2.5 sm:px-4 py-2 sm:py-3 text-[0.7rem] sm:text-xs md:text-sm font-black tracking-wider uppercase border-b-2 transition-colors ${activeTab === "juri" ? "border-amber-400 text-amber-300 bg-amber-500/10 rounded-t-lg" : "border-transparent text-slate-400 hover:text-slate-200"} flex-shrink-0 flex items-center gap-1.5`}>
            <span>⚖️</span> Manajemen Juri
          </button>
          <button onClick={() => setActiveTab("lomba")} className={`px-2.5 sm:px-4 py-2 sm:py-3 text-[0.7rem] sm:text-xs md:text-sm font-black tracking-wider uppercase border-b-2 transition-colors ${activeTab === "lomba" ? "border-amber-400 text-amber-300 bg-amber-500/10 rounded-t-lg" : "border-transparent text-slate-400 hover:text-slate-200"} flex-shrink-0 flex items-center gap-1.5`}>
            <span>🏆</span> Cabang Lomba
          </button>
          <button onClick={() => setActiveTab("laporan")} className={`px-2.5 sm:px-4 py-2 sm:py-3 text-[0.7rem] sm:text-xs md:text-sm font-black tracking-wider uppercase border-b-2 transition-colors ${activeTab === "laporan" ? "border-amber-400 text-amber-300 bg-amber-500/10 rounded-t-lg" : "border-transparent text-slate-400 hover:text-slate-200"} flex-shrink-0 flex items-center gap-1.5`}>
            <span>📑</span> Laporan & Rekap
          </button>
          <button onClick={() => setActiveTab("informasi")} className={`px-2.5 sm:px-4 py-2 sm:py-3 text-[0.7rem] sm:text-xs md:text-sm font-black tracking-wider uppercase border-b-2 transition-colors ${activeTab === "informasi" ? "border-amber-400 text-amber-300 bg-amber-500/10 rounded-t-lg" : "border-transparent text-slate-400 hover:text-slate-200"} flex-shrink-0 flex items-center gap-1.5`}>
            <span>📢</span> Live Ticker Info
          </button>
        </div>
      </div>

      <main className="max-w-[1600px] mx-auto px-4 md:px-8 py-6 space-y-6">
        {/* Global Alert */}
        {pesanAdmin.text && (
          <div className={`p-4 rounded-xl text-sm font-bold border flex items-center gap-2 no-print ${pesanAdmin.type === "error" ? "bg-red-500/10 border-red-500/30 text-red-400" : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"}`}>
            {pesanAdmin.text}
          </div>
        )}

        {/* TAB 1: PENILAIAN */}
        {activeTab === "penilaian" && (
          <>
            {/* Stats Summary - Desktop 4 Columns */}
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: "Total Peserta", value: pesertaList.length },
                { label: "Total Cabang Lomba", value: lombaList.length },
                { label: "Cabang Aktif", value: dynamicLombaCols.length },
                { label: "Kategori Klasemen", value: filterTingkat },
              ].map((stat) => (
                <div key={stat.label} className="glass-card p-3 sm:p-4">
                  <div className="text-[0.65rem] text-slate-500 font-bold tracking-wider uppercase">{stat.label}</div>
                  <div className="text-xl sm:text-2xl font-black text-white mt-1">{stat.value}</div>
                </div>
              ))}
            </div>

            {/* Search & Filters - Desktop Row */}
            <div className="glass-card p-3 sm:p-4">
              <div className="flex flex-row items-center gap-3">
                <input type="text" placeholder="🔍 Cari regu..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="flex-1 bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/50" />
                <div className="flex items-center gap-3">
                  <select value={filterTingkat} onChange={(e) => { setFilterTingkat(e.target.value); setEditedNilai({}); }} className="bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/50">
                    <option value="SD">SD / MI</option>
                    <option value="SMP">SMP / MTs</option>
                  </select>
                  <select value={filterGender} onChange={(e) => { setFilterGender(e.target.value); setEditedNilai({}); }} className="bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/50">
                    <option value="Laki-laki">Putra</option>
                    <option value="Perempuan">Putri</option>
                  </select>
                  <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/50">
                    <option value="SEMUA">Semua</option>
                    <option value="SUDAH">Dinilai</option>
                    <option value="BELUM">Belum</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Score Matrix Table */}
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="lg:col-span-1 glass-card p-4 sm:p-6 h-fit">
              <h2 className="text-base sm:text-lg font-black text-white mb-3 sm:mb-4 flex items-center gap-2">
                <span>➕</span> Daftar Regu Baru
              </h2>
              <form onSubmit={handleTambahPeserta} className="space-y-3 sm:space-y-4">
                <div><label className="text-[0.65rem] sm:text-xs text-slate-400 font-bold uppercase">Kategori Tingkat</label>
                  <select value={formPeserta.kategori} onChange={(e) => setFormPeserta({...formPeserta, kategori: e.target.value})} className="w-full mt-1 bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 sm:p-3 text-xs sm:text-sm text-white outline-none focus:border-emerald-500/50">
                    <option value="SD">SD / MI</option><option value="SMP">SMP / MTs</option>
                  </select>
                </div>
                <div><label className="text-[0.65rem] sm:text-xs text-slate-400 font-bold uppercase">Kategori Gender</label>
                  <select value={formPeserta.gender} onChange={(e) => {
                      const newGender = e.target.value;
                      setFormPeserta({...formPeserta, gender: newGender, nomor_dada: getNextKaplingFormatted(newGender, pesertaList)});
                  }} className="w-full mt-1 bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 sm:p-3 text-xs sm:text-sm text-white outline-none focus:border-emerald-500/50">
                    <option value="Laki-laki">Laki-laki (Putra - Kapling Ganjil)</option><option value="Perempuan">Perempuan (Putri - Kapling Genap)</option>
                  </select>
                </div>
                <div><label className="text-[0.65rem] sm:text-xs text-slate-400 font-bold uppercase">Nomor Kapling (Urut Tenda: 001, 002, dst.)</label>
                  <input type="text" required value={formPeserta.nomor_dada} onChange={(e) => setFormPeserta({...formPeserta, nomor_dada: e.target.value})} className="w-full mt-1 bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 sm:p-3 text-xs sm:text-sm text-amber-400 font-mono font-bold outline-none focus:border-amber-500" placeholder="001" />
                </div>
                <div><label className="text-[0.65rem] sm:text-xs text-slate-400 font-bold uppercase">Nama Regu</label>
                  <input type="text" required value={formPeserta.nama_regu} onChange={(e) => setFormPeserta({...formPeserta, nama_regu: e.target.value})} className="w-full mt-1 bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 sm:p-3 text-xs sm:text-sm text-white outline-none focus:border-emerald-500/50" placeholder="Regu Rajawali" />
                </div>
                <div><label className="text-[0.65rem] sm:text-xs text-slate-400 font-bold uppercase">Asal Pangkalan / Sekolah</label>
                  <input type="text" required value={formPeserta.pangkalan} onChange={(e) => setFormPeserta({...formPeserta, pangkalan: e.target.value})} className="w-full mt-1 bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 sm:p-3 text-xs sm:text-sm text-white outline-none focus:border-emerald-500/50" placeholder="SDN 1 Sukabumi" />
                </div>
                <button type="submit" disabled={saving} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-2.5 sm:py-3 rounded-xl mt-2 disabled:opacity-50 text-xs sm:text-sm uppercase tracking-wider transition-all shadow-md">
                  {saving ? "Menyimpan..." : "+ Tambahkan Regu"}
                </button>
              </form>
            </div>
            
            <div className="lg:col-span-2 glass-card overflow-hidden flex flex-col">
              {/* Search & Filter Bar */}
              <div className="p-4 border-b border-slate-800/80 bg-slate-900/50 flex flex-wrap gap-3 items-center justify-between">
                <div className="flex-1 min-w-[200px]">
                  <input
                    type="text"
                    value={pesertaSearch}
                    onChange={(e) => setPesertaSearch(e.target.value)}
                    placeholder="🔍 Cari regu, pangkalan, gudep..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 outline-none focus:border-amber-500/50"
                  />
                </div>
                <div className="flex gap-2 flex-wrap">
                  <select
                    value={pesertaFilterTingkat}
                    onChange={(e) => setPesertaFilterTingkat(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 outline-none"
                  >
                    <option value="SEMUA">Semua Tingkat</option>
                    <option value="SD">SD / MI</option>
                    <option value="SMP">SMP / MTs</option>
                  </select>
                  <select
                    value={pesertaFilterStatus}
                    onChange={(e) => setPesertaFilterStatus(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 outline-none"
                  >
                    <option value="SEMUA">Semua Status</option>
                    <option value="VERIFIED">✅ Aktif (Verified)</option>
                    <option value="PENDING">⏳ Menunggu Verifikasi</option>
                  </select>

                  <button
                    type="button"
                    onClick={handleBersihkanDataPeserta}
                    disabled={seedingPeserta || clearingData}
                    className="bg-red-500/10 hover:bg-red-500 hover:text-white text-red-400 border border-red-500/30 px-3 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1.5 whitespace-nowrap shadow-sm"
                    title="Hapus seluruh data peserta & nilai testing agar bersih total"
                  >
                    {clearingData ? "Membersihkan..." : "🗑️ Bersihkan Semua Peserta"}
                  </button>
                </div>
              </div>

              {/* Tampilan Khusus Mobile: Kartu Peserta Rapi & Simetris */}
              <div className="md:hidden p-2.5 sm:p-3 space-y-2.5 max-h-[600px] overflow-y-auto">
                {filteredPesertaList.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500 italic bg-slate-950/40 rounded-xl border border-slate-800">
                    Tidak ada data peserta yang cocok dengan kriteria pencarian/filter.
                  </div>
                ) : (
                  filteredPesertaList.map((p) => {
                    const isVerifying = verifyingId === p.id;
                    const isRejecting = rejectingId === p.id;
                    return (
                      <div key={p.id} className={`p-3 rounded-xl border transition-all ${checkingBerkasId === p.id ? 'bg-slate-900/90 border-cyan-500/50' : 'bg-slate-950/70 border-slate-800'}`}>
                        {/* Header Kartu: Kapling, Regu, Gender & Status */}
                        <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-800/80">
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-mono text-xs font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                                #{p.nomor_dada ? String(p.nomor_dada).padStart(3, "0") : "—"}
                              </span>
                              <span className="text-xs font-bold text-white truncate">{p.nama_regu}</span>
                            </div>
                            <div className="text-[0.68rem] text-slate-400 mt-0.5 flex items-center gap-1 flex-wrap">
                              <span>🏫 {p.pangkalan}</span>
                              {(() => {
                                const rawG = p.no_gudep || (pesertaList || []).find((other) => other.pangkalan === p.pangkalan && other.no_gudep)?.no_gudep;
                                const gVal = getNoGudepByGender(rawG, p.gender);
                                return gVal && gVal !== "—" ? (
                                  <span className="text-amber-400/90 font-mono font-bold">• Gudep: {gVal}</span>
                                ) : null;
                              })()}
                            </div>
                          </div>
                          <div className="shrink-0 flex flex-col items-end gap-1">
                            {p.is_verified ? (
                              <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold text-[0.6rem] uppercase">
                                ✅ Aktif
                              </span>
                            ) : (
                              <span className={`px-2 py-0.5 rounded-full font-bold text-[0.6rem] uppercase ${p.catatan_berkas?.startsWith('DITOLAK') ? 'bg-red-500/15 text-red-400 border border-red-500/30' : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'}`}>
                                {p.catatan_berkas?.startsWith('DITOLAK') ? '❌ Ditolak' : '⏳ Menunggu'}
                              </span>
                            )}
                            <span className="text-[0.6rem] font-bold text-slate-400">
                              {p.kategori} • {p.gender === 'Laki-laki' ? '👦 PA' : '👧 PI'}
                            </span>
                          </div>
                        </div>

                        {/* Kontak & Email Lengkap */}
                        <div className="py-2 space-y-1.5 border-t border-slate-800/60 text-xs">
                          <div className="flex items-center justify-between gap-1.5 bg-slate-900/90 px-2.5 py-1.5 rounded-lg border border-cyan-500/30">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="text-cyan-400 text-xs shrink-0">✉️</span>
                              <span className="font-mono text-cyan-300 font-bold text-xs select-all break-all">{p.email || "⚠️ Belum ada email"}</span>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleOpenEditEmail(p)}
                                title="Edit / Ganti Email Peserta"
                                className="px-1.5 py-0.5 rounded bg-slate-800 text-[0.65rem] text-slate-300 hover:text-cyan-300 border border-slate-700 font-sans"
                              >
                                ✏️ Ubah
                              </button>
                              {p.is_verified && p.email && (
                                <button
                                  type="button"
                                  disabled={resendingEmailId === p.id}
                                  onClick={() => handleKirimUlangEmail(p)}
                                  title="Kirim Ulang Email Bukti Pendaftaran (PDF)"
                                  className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-[0.65rem] text-emerald-300 hover:bg-emerald-500 hover:text-white border border-emerald-500/30 font-sans disabled:opacity-50"
                                >
                                  {resendingEmailId === p.id ? "⏳..." : "🔄 Kirim Ulang"}
                                </button>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <div className="min-w-0">
                              <span className="text-xs text-slate-300 font-semibold truncate block">
                                👤 {p.kontak_person || "—"}
                              </span>
                            </div>
                            {getWaPesertaUrl(p, "auto") && (
                              <a
                                href={getWaPesertaUrl(p, "auto")}
                                target="_blank"
                                rel="noopener noreferrer"
                                title={p.is_verified ? "Kirim Bukti Pendaftaran Resmi ke WhatsApp Pembina" : "Chat WhatsApp Pembina"}
                                className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm ${
                                  p.is_verified
                                    ? "bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-black shadow-emerald-500/20"
                                    : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500 hover:text-white"
                                }`}
                              >
                                <span>{p.is_verified ? "📲 Kirim Bukti ke WA" : "💬 Chat WA"}</span>
                              </a>
                            )}
                          </div>
                        </div>

                        {/* Aksi Mobile */}
                        <div className="pt-2 border-t border-slate-800/80">
                          {isVerifying ? (
                            <div className="flex flex-col gap-2">
                              <div className="flex items-center gap-2">
                                <label className="text-[0.65rem] text-slate-400">No. Kapling:</label>
                                <input 
                                  type="text" 
                                  placeholder="001" 
                                  value={noDadaInput} 
                                  onChange={(e) => setNoDadaInput(e.target.value)} 
                                  className="w-20 bg-slate-950 border border-amber-500 rounded-lg px-2 py-1 text-amber-300 text-xs font-mono font-bold outline-none text-center"
                                />
                              </div>
                              <div className="flex gap-1.5">
                                <button 
                                  onClick={() => handleVerifikasiPeserta(p.id)} 
                                  className="flex-1 text-white bg-emerald-600 hover:bg-emerald-700 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm"
                                >
                                  Simpan & Verifikasi
                                </button>
                                <button 
                                  onClick={() => { setVerifyingId(null); setNoDadaInput(""); }} 
                                  className="text-slate-400 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                                >
                                  Batal
                                </button>
                              </div>
                            </div>
                          ) : isRejecting ? (
                            <div className="flex flex-col gap-2">
                              <input 
                                type="text" 
                                value={rejectReason} 
                                onChange={(e) => setRejectReason(e.target.value)} 
                                placeholder="Alasan penolakan..." 
                                className="text-xs px-2.5 py-1.5 bg-slate-900 border border-red-500/40 text-white rounded-lg w-full outline-none"
                              />
                              <div className="flex gap-1.5">
                                <button 
                                  onClick={() => handleRejectPeserta(p.id)} 
                                  className="flex-1 text-white bg-red-600 hover:bg-red-700 py-1.5 rounded-lg text-xs font-bold transition-all"
                                >
                                  Tolak & Kirim Email
                                </button>
                                <button 
                                  onClick={() => { setRejectingId(null); setRejectReason(""); }} 
                                  className="text-slate-400 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                                >
                                  Batal
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 sm:flex sm:items-center gap-1.5">
                              <button 
                                onClick={() => handleStartCekBerkas(p)} 
                                className="w-full sm:flex-1 text-cyan-400 bg-cyan-400/10 hover:bg-cyan-400 hover:text-black py-2 px-2 rounded-lg text-xs font-bold transition-colors border border-cyan-500/30 text-center whitespace-nowrap flex items-center justify-center gap-1 shadow-sm"
                              >
                                📄 Cek Berkas
                              </button>

                              {!p.is_verified && (
                                <>
                                  <button 
                                    onClick={() => handleStartVerifikasi(p)} 
                                    disabled={!p.status_berkas?.ketersediaan || !p.status_berkas?.pendaftaran || !p.status_berkas?.biodata_peserta || !p.status_berkas?.biodata_pembina || !p.status_berkas?.bukti_pembayaran}
                                    className="w-full sm:flex-1 text-amber-400 bg-amber-400/10 hover:bg-amber-400 hover:text-black py-2 px-2 rounded-lg text-xs font-bold transition-colors border border-amber-500/30 disabled:opacity-30 disabled:cursor-not-allowed text-center whitespace-nowrap flex items-center justify-center gap-1 shadow-sm"
                                  >
                                    ⚡ Verifikasi
                                  </button>
                                  <button 
                                    onClick={() => handleStartReject(p)} 
                                    className="w-full sm:w-auto text-red-400 bg-red-400/10 hover:bg-red-500 hover:text-white py-2 px-3 rounded-lg text-xs font-bold transition-colors border border-red-500/30 text-center whitespace-nowrap flex items-center justify-center gap-1 shadow-sm"
                                  >
                                    ❌ Tolak
                                  </button>
                                </>
                              )}

                              {confirmDeleteId === p.id ? (
                                <div className="col-span-2 sm:col-span-1 flex gap-1.5">
                                  <button onClick={() => handleHapusPeserta(p.id, p.nama_regu)} className="flex-1 text-white bg-red-600 hover:bg-red-700 py-2 px-2 rounded-lg text-xs font-bold shadow-sm">
                                    Ya, Hapus
                                  </button>
                                  <button onClick={() => setConfirmDeleteId(null)} className="flex-1 text-slate-400 bg-slate-800 hover:bg-slate-700 py-2 px-2 rounded-lg text-xs font-bold">
                                    Batal
                                  </button>
                                </div>
                              ) : (
                                <button onClick={() => setConfirmDeleteId(p.id)} className="w-full sm:w-auto text-red-400 bg-red-500/10 hover:bg-red-500 hover:text-white py-2 px-3 rounded-lg text-xs font-bold border border-red-500/30 text-center whitespace-nowrap flex items-center justify-center gap-1 shadow-sm">
                                  🗑️ Hapus
                                </button>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Inline Pengecekan Berkas untuk Mobile */}
                        {checkingBerkasId === p.id && (
                          <div className="mt-2.5 pt-2.5 border-t border-cyan-500/30 bg-slate-950/90 p-2.5 rounded-xl">
                            <h4 className="text-cyan-400 font-bold text-xs mb-2.5 flex items-center gap-1.5">
                              <span>📋</span> Berkas Persyaratan: {p.nama_regu}
                            </h4>
                            <div className="space-y-1.5 mb-2.5">
                              {[
                                { key: "ketersediaan", label: "Form Ketersediaan", url: p.berkas_ketersediaan },
                                { key: "pendaftaran", label: "Form Pendaftaran", url: p.berkas_pendaftaran },
                                { key: "biodata_peserta", label: "Biodata Peserta", url: p.berkas_biodata_peserta },
                                { key: "biodata_pembina", label: "Biodata Pembina", url: p.berkas_biodata_pembina },
                                { key: "bukti_pembayaran", label: "Bukti Pembayaran", url: p.berkas_bukti_pembayaran },
                              ].map((b) => {
                                const isValid = p.status_berkas?.[b.key] || false;
                                return (
                                  <div key={b.key} className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                                    <div className="flex items-center gap-1.5 truncate mr-2">
                                      <span className={isValid ? "text-emerald-400" : "text-slate-500"}>
                                        {isValid ? "✅" : "⏳"}
                                      </span>
                                      <span className="text-white text-[0.7rem] truncate">{b.label}</span>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                      {b.url ? (
                                        <a href={b.url} target="_blank" rel="noopener noreferrer" className="px-2 py-0.5 rounded text-[0.65rem] bg-cyan-500/20 text-cyan-300 font-bold">
                                          Buka
                                        </a>
                                      ) : (
                                        <span className="text-[0.6rem] text-slate-500 italic">Kosong</span>
                                      )}
                                      <button
                                        type="button"
                                        onClick={() => handleToggleStatusBerkas(p.id, b.key, !isValid)}
                                        className={`px-2 py-0.5 rounded text-[0.65rem] font-bold ${
                                          isValid ? "bg-emerald-500/20 text-emerald-300" : "bg-slate-800 text-slate-400"
                                        }`}
                                      >
                                        {isValid ? "Sah ✓" : "Validasi"}
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                            <button
                              type="button"
                              onClick={() => setCheckingBerkasId(null)}
                              className="w-full text-center py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg font-bold"
                            >
                              Tutup Berkas
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Tampilan Desktop: Tabel Lengkap Peserta (Tampil di Semua Perangkat) */}
              <div className="block overflow-x-auto max-h-[650px] mobile-table-scroll flex-1">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead className="sticky top-0 bg-slate-900 z-10 shadow-md">
                    <tr>
                      <th className="p-3 text-[0.65rem] font-bold text-slate-500 uppercase">NO. KAPLING</th>
                      <th className="p-3 text-[0.65rem] font-bold text-slate-500 uppercase">Nama Regu</th>
                      <th className="p-3 text-[0.65rem] font-bold text-slate-500 uppercase">Pangkalan & Gudep</th>
                      <th className="p-3 text-[0.65rem] font-bold text-slate-500 uppercase">Kategori</th>
                      <th className="p-3 text-[0.65rem] font-bold text-slate-500 uppercase">Email & Kontak</th>
                      <th className="p-3 text-[0.65rem] font-bold text-slate-500 uppercase">Status</th>
                      <th className="p-3 text-[0.65rem] font-bold text-slate-500 uppercase text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPesertaList.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-6 text-center text-xs text-slate-500 italic">
                          Tidak ada data peserta yang cocok dengan kriteria pencarian/filter.
                        </td>
                      </tr>
                    ) : (
                      filteredPesertaList.map((p) => {
                      const isVerifying = verifyingId === p.id;
                      const isRejecting = rejectingId === p.id;
                      return (
                        <React.Fragment key={p.id}>
                        <tr className={`border-t border-slate-800/30 hover:bg-slate-800/20 ${checkingBerkasId === p.id ? 'bg-slate-800/40' : ''}`}>
                          <td className="p-3 text-sm font-mono font-bold text-amber-400">
                            {isVerifying ? (
                              <input 
                                type="text" 
                                placeholder="001" 
                                value={noDadaInput} 
                                onChange={(e) => setNoDadaInput(e.target.value)} 
                                className="w-16 bg-slate-950 border border-amber-500 rounded px-2 py-1 text-amber-300 text-xs font-mono font-bold outline-none text-center shadow-inner"
                                title="Nomor Kapling Tenda"
                              />
                            ) : (
                              p.nomor_dada ? String(p.nomor_dada).padStart(3, "0") : "—"
                            )}
                          </td>
                          <td className="p-3 text-sm font-bold text-white">{p.nama_regu}</td>
                          <td className="p-3 text-sm text-slate-400">
                            <div className="font-semibold text-slate-300">{p.pangkalan}</div>
                            {(() => {
                              const rawG = p.no_gudep || (pesertaList || []).find((other) => other.pangkalan === p.pangkalan && other.no_gudep)?.no_gudep;
                              const gVal = getNoGudepByGender(rawG, p.gender);
                              return gVal && gVal !== "—" ? (
                                <div className="text-[0.65rem] text-amber-400/90 font-mono font-bold">Gudep: {gVal}</div>
                              ) : null;
                            })()}
                          </td>
                          <td className="p-3 text-xs font-black">
                            <div>{p.kategori}</div>
                            <div className="text-slate-500 text-[0.65rem] font-normal">{p.gender === 'Laki-laki' ? '👦 Putra' : '👧 Putri'}</div>
                          </td>
                          <td className="p-3 text-xs font-mono text-slate-300">
                            <div className="space-y-1.5 min-w-[200px]">
                              {/* Email Pembina / Pangkalan (Jelas, Menonjol & Bisa Diedit / Dikirim Ulang) */}
                              <div className="flex items-center justify-between gap-1.5 bg-slate-900/90 px-2 py-1 rounded-md border border-cyan-500/30">
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <span className="text-cyan-400 text-xs shrink-0">✉️</span>
                                  {p.email ? (
                                    <span className="font-mono text-cyan-300 font-bold text-xs select-all break-all" title="Email terdaftar untuk pengiriman surat resmi">{p.email}</span>
                                  ) : (
                                    <span className="text-red-400 font-sans text-[0.65rem] italic font-semibold">⚠️ Email Belum Diisi</span>
                                  )}
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEditEmail(p)}
                                    title="Edit / Ganti Email Peserta"
                                    className="p-1 rounded bg-slate-800 hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-300 transition-colors text-[0.65rem]"
                                  >
                                    ✏️
                                  </button>
                                  {p.is_verified && p.email && (
                                    <button
                                      type="button"
                                      disabled={resendingEmailId === p.id}
                                      onClick={() => handleKirimUlangEmail(p)}
                                      title="Kirim Ulang Email Bukti Pendaftaran (PDF)"
                                      className="p-1 rounded bg-slate-800 hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-300 transition-colors text-[0.65rem] disabled:opacity-50"
                                    >
                                      {resendingEmailId === p.id ? "⏳" : "🔄"}
                                    </button>
                                  )}
                                </div>
                              </div>

                              {/* Kontak WhatsApp & Pembina */}
                              {p.kontak_person ? (
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="font-semibold text-slate-200 text-xs">👤 {p.kontak_person}</span>
                                    {getWaPesertaUrl(p, "auto") && (
                                      <a
                                        href={getWaPesertaUrl(p, "auto")}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        title={p.is_verified ? "Kirim Bukti Pendaftaran Resmi ke WhatsApp Pembina" : "Chat WhatsApp: Konfirmasi Berkas Belum Selesai"}
                                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-sans font-bold transition-all shadow-sm ${
                                          p.is_verified
                                            ? "bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-black shadow-emerald-500/20"
                                            : "bg-amber-500/20 text-amber-300 hover:bg-amber-500 hover:text-black border border-amber-500/40"
                                        }`}
                                      >
                                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                                          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                                        </svg>
                                        <span>{p.is_verified ? "📲 Kirim Bukti ke WA" : "💬 Chat WA"}</span>
                                      </a>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1.5 text-[0.6rem] font-sans">
                                    <span className="text-slate-500">Kirim status:</span>
                                    <a
                                      href={getWaPesertaUrl(p, "selesai") || "#"}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      title="Kirim Pesan WA: Berkas Selesai & Terverifikasi"
                                      className="text-emerald-400 hover:text-emerald-300 hover:underline font-bold"
                                    >
                                      ✓ Selesai
                                    </a>
                                    <span className="text-slate-600">|</span>
                                    <a
                                      href={getWaPesertaUrl(p, "belum") || "#"}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      title="Kirim Pesan WA: Berkas Belum Selesai / Kurang"
                                      className="text-amber-400 hover:text-amber-300 hover:underline font-bold"
                                    >
                                      ✗ Belum
                                    </a>
                                  </div>
                                </div>
                              ) : (
                                <div className="text-slate-600 text-xs italic">No HP —</div>
                              )}
                            </div>
                          </td>
                          <td className="p-3 text-xs">
                            {p.is_verified ? (
                              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded-full font-bold text-[0.6rem] uppercase">
                                ✅ Aktif
                              </span>
                            ) : (
                              <span className={`px-2 py-1 rounded-full font-bold text-[0.6rem] uppercase ${p.catatan_berkas?.startsWith('DITOLAK') ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                                {p.catatan_berkas?.startsWith('DITOLAK') ? '❌ Ditolak' : '⏳ Menunggu'}
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-right">
                            {isVerifying ? (
                              <div className="flex justify-end gap-1.5 items-center">
                                <span className="text-[0.65rem] text-amber-400 font-mono font-bold mr-1">#{noDadaInput || "—"}</span>
                                <button 
                                  onClick={() => handleVerifikasiPeserta(p.id)} 
                                  className="text-white bg-emerald-600 hover:bg-emerald-700 px-2.5 py-1 rounded text-xs font-bold transition-all shadow-sm"
                                >
                                  Simpan & Verifikasi
                                </button>
                                <button 
                                  onClick={() => { setVerifyingId(null); setNoDadaInput(""); }} 
                                  className="text-slate-400 bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded text-xs font-bold transition-all"
                                >
                                  Batal
                                </button>
                              </div>
                            ) : isRejecting ? (
                              <div className="flex flex-col gap-1 items-end min-w-[200px]">
                                <input 
                                  type="text" 
                                  value={rejectReason} 
                                  onChange={(e) => setRejectReason(e.target.value)} 
                                  placeholder="Alasan penolakan..." 
                                  className="text-xs px-2 py-1 bg-slate-900 border border-red-500/30 text-white rounded w-full focus:outline-none focus:border-red-500"
                                />
                                <div className="flex justify-end gap-1 items-center mt-1">
                                  <button 
                                    onClick={() => handleRejectPeserta(p.id)} 
                                    className="text-white bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-xs font-bold transition-all"
                                  >
                                    Tolak & Email
                                  </button>
                                  <button 
                                    onClick={() => { setRejectingId(null); setRejectReason(""); }} 
                                    className="text-slate-400 bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded text-xs font-bold transition-all"
                                  >
                                    Batal
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex justify-end gap-1.5 text-right items-center">
                                {/* Tombol Cek Berkas selalu tersedia untuk semua peserta */}
                                <button 
                                  onClick={() => handleStartCekBerkas(p)} 
                                  className="text-cyan-400 bg-cyan-400/10 hover:bg-cyan-400 hover:text-black px-2.5 py-1.5 rounded text-xs font-bold transition-colors"
                                  title="Lihat & periksa berkas persyaratan dokumen peserta"
                                >
                                  📄 Cek Berkas
                                </button>

                                {!p.is_verified && (
                                  <>
                                    <button 
                                      onClick={() => handleStartVerifikasi(p)} 
                                      disabled={!p.status_berkas?.ketersediaan || !p.status_berkas?.pendaftaran || !p.status_berkas?.biodata_peserta || !p.status_berkas?.biodata_pembina || !p.status_berkas?.bukti_pembayaran}
                                      title={(!p.status_berkas?.ketersediaan || !p.status_berkas?.pendaftaran || !p.status_berkas?.biodata_peserta || !p.status_berkas?.biodata_pembina || !p.status_berkas?.bukti_pembayaran) ? "Periksa dan centang semua berkas terlebih dahulu" : "Verifikasi Peserta"}
                                      className="text-amber-400 bg-amber-400/10 hover:bg-amber-400 hover:text-black px-2.5 py-1.5 rounded text-xs font-bold transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                      ⚡ Verifikasi & Email
                                    </button>
                                    <button 
                                      onClick={() => handleStartReject(p)} 
                                      className="text-red-400 bg-red-400/10 hover:bg-red-500 hover:text-white px-2.5 py-1.5 rounded text-xs font-bold transition-colors"
                                    >
                                      ❌ Tolak
                                    </button>
                                  </>
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

                        {checkingBerkasId === p.id && (
                          <tr className="bg-slate-900 border-b border-slate-800">
                            <td colSpan={7} className="p-4">
                              <div className="bg-slate-950/80 p-5 rounded-xl border border-cyan-500/30">
                                <h4 className="text-cyan-400 font-bold text-sm mb-4">PENGECEKAN BERKAS PERSYARATAN: {p.nama_regu}</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                  
                                  {[
                                    { key: "ketersediaan", label: "Form Ketersediaan", url: p.berkas_ketersediaan },
                                    { key: "pendaftaran", label: "Form Pendaftaran", url: p.berkas_pendaftaran },
                                    { key: "biodata_peserta", label: "Biodata Peserta", url: p.berkas_biodata_peserta },
                                    { key: "biodata_pembina", label: "Biodata Pembina", url: p.berkas_biodata_pembina },
                                    { key: "bukti_pembayaran", label: "Bukti Pembayaran", url: p.berkas_bukti_pembayaran }
                                  ].map((berkas) => (
                                    <div key={berkas.key} className="flex items-center justify-between bg-slate-900 p-3 rounded-lg border border-slate-800">
                                      <div className="flex flex-col">
                                        <span className="text-xs font-semibold text-slate-300">{berkas.label}</span>
                                        {berkas.url ? (
                                          <a href={berkas.url} target="_blank" rel="noopener noreferrer" className="text-[0.65rem] text-amber-400 hover:underline">
                                            Lihat Dokumen ↗
                                          </a>
                                        ) : (
                                          <span className="text-[0.65rem] text-red-400">Tidak dilampirkan</span>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <label className="text-[0.65rem] text-slate-400">Sesuai?</label>
                                        <input 
                                          type="checkbox" 
                                          checked={berkasStatus[berkas.key] || false}
                                          onChange={(e) => setBerkasStatus({...berkasStatus, [berkas.key]: e.target.checked})}
                                          className="w-4 h-4 rounded accent-cyan-500"
                                        />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                
                                <div className="space-y-2 mb-4">
                                  <label className="text-xs font-semibold text-slate-400">Catatan Penolakan/Kekurangan (opsional)</label>
                                  <textarea 
                                    value={catatanBerkas}
                                    onChange={(e) => setCatatanBerkas(e.target.value)}
                                    placeholder="Contoh: Form pendaftaran tidak ditandatangani..."
                                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-xs text-white outline-none focus:border-cyan-500/50"
                                    rows={2}
                                  />
                                </div>

                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                                      <svg className="w-3.5 h-3.5 text-emerald-400 fill-current" viewBox="0 0 24 24">
                                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                                      </svg>
                                      Chat WA Pembina:
                                    </span>
                                    {p.kontak_person ? (
                                      <>
                                        <a
                                          href={getWaPesertaUrl(p, "selesai", berkasStatus, catatanBerkas) || "#"}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          title="Buka WhatsApp: Kirim konfirmasi berkas SELESAI & LENGKAP"
                                          className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 rounded text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                                        >
                                          <span>✅ WA: Selesai / Lengkap</span>
                                        </a>
                                        <a
                                          href={getWaPesertaUrl(p, "belum", berkasStatus, catatanBerkas) || "#"}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          title="Buka WhatsApp: Kirim rincian berkas BELUM SELESAI / REVISI"
                                          className="px-3 py-1.5 bg-amber-600/20 hover:bg-amber-600 text-amber-300 hover:text-black border border-amber-500/40 rounded text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                                        >
                                          <span>⚠️ WA: Belum Selesai / Revisi</span>
                                        </a>
                                      </>
                                    ) : (
                                      <span className="text-xs text-slate-500 italic">(Nomor WA belum dicantumkan)</span>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-2 self-end sm:self-auto">
                                    <button 
                                      onClick={() => setCheckingBerkasId(null)}
                                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-bold transition-all"
                                    >
                                      Tutup
                                    </button>
                                    <button 
                                      onClick={() => handleSimpanBerkas(p.id)}
                                      disabled={saving}
                                      className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-bold transition-all disabled:opacity-50"
                                    >
                                      {saving ? "Menyimpan..." : "Simpan Status Berkas"}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                        </React.Fragment>
                      );
                    })
                  )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: JURI */}
        {activeTab === "juri" && (
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            <div className="xl:col-span-1 glass-card p-5 md:p-6 h-fit shadow-lg border border-slate-800/80">
              <div className="flex items-center gap-2 mb-4 border-b border-slate-800/80 pb-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                </div>
                <div>
                  <h2 className="text-sm md:text-base font-black text-white uppercase tracking-wider">Buat Akun Juri</h2>
                  <p className="text-[0.65rem] text-slate-400">Daftarkan akun dewan juri baru</p>
                </div>
              </div>

              <form onSubmit={handleTambahJuri} className="space-y-3.5">
                <div>
                  <label className="text-[0.65rem] text-slate-400 font-bold uppercase tracking-wider">Nama Lengkap & Gelar</label>
                  <input type="text" required value={formJuri.nama_lengkap} onChange={(e) => setFormJuri({...formJuri, nama_lengkap: e.target.value})} className="w-full mt-1 bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-cyan-500/50" placeholder="Kak Budi Santoso, S.Pd." />
                </div>
                <div>
                  <label className="text-[0.65rem] text-slate-400 font-bold uppercase tracking-wider">Email (Untuk Akses Login)</label>
                  <input type="email" required value={formJuri.email} onChange={(e) => setFormJuri({...formJuri, email: e.target.value})} className="w-full mt-1 bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-cyan-500/50" placeholder="juri@pramuka.com" />
                </div>
                <div>
                  <label className="text-[0.65rem] text-slate-400 font-bold uppercase tracking-wider">Kata Sandi Awal</label>
                  <input type="password" required value={formJuri.password} onChange={(e) => setFormJuri({...formJuri, password: e.target.value})} className="w-full mt-1 bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-cyan-500/50" placeholder="minimal 6 karakter" />
                </div>
                <div>
                  <label className="text-[0.65rem] text-slate-400 font-bold uppercase tracking-wider">Tugas Tingkatan</label>
                  <select value={formJuri.kategori} onChange={(e) => setFormJuri({...formJuri, kategori: e.target.value, lomba_id: "SEMUA"})} className="w-full mt-1 bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-cyan-500/50">
                    <option value="SEMUA">Bebas Akses (Semua Tingkat)</option>
                    <option value="SD">Khusus SD / MI</option>
                    <option value="SMP">Khusus SMP / MTs</option>
                  </select>
                </div>
                <div>
                  <label className="text-[0.65rem] text-slate-400 font-bold uppercase tracking-wider">Tugas Cabang Lomba</label>
                  <select value={formJuri.lomba_id} onChange={(e) => setFormJuri({...formJuri, lomba_id: e.target.value})} className="w-full mt-1 bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-cyan-500/50">
                    <option value="SEMUA">Bebas Akses (Semua Pos / Pengawas)</option>
                    {dynamicJuriLombaOptions.map((l) => (
                      <option key={l.id} value={l.id}>[{l.kode_lomba || "LMB"}] {l.nama_lomba}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[0.65rem] text-slate-400 font-bold uppercase tracking-wider">Tugas Gender Kategori</label>
                  <select value={formJuri.gender} onChange={(e) => setFormJuri({...formJuri, gender: e.target.value})} className="w-full mt-1 bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-cyan-500/50">
                    <option value="SEMUA">Bebas Akses (Semua Gender: Pa & Pi)</option>
                    <option value="Laki-laki">Khusus Laki-laki (Putra)</option>
                    <option value="Perempuan">Khusus Perempuan (Putri)</option>
                  </select>
                </div>
                <button type="submit" disabled={saving} className="w-full bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-white font-bold py-3 rounded-xl mt-2 disabled:opacity-50 transition-all shadow-md text-xs tracking-wider uppercase">
                  {saving ? "Memproses..." : "+ Buat & Kirim Akses Akun Juri"}
                </button>
              </form>
            </div>
            
            <div className="xl:col-span-3 glass-card overflow-hidden flex flex-col shadow-lg border border-slate-800/80">
              {/* Toolbar Moderasi Nilai Juri */}
              <div className="p-4 border-b border-slate-800/80 bg-slate-900/70 flex flex-wrap gap-3 items-center justify-between">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[0.7rem] font-bold text-slate-400 uppercase tracking-wider">STATUS PUBLIKASI:</span>
                  {publishAll ? (
                    <span className="text-[0.65rem] font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 shadow-sm whitespace-nowrap">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      🟢 Semua Nilai Tampil di Leaderboard
                    </span>
                  ) : publishedJuriIds.length > 0 ? (
                    <span className="text-[0.65rem] font-bold px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center gap-1.5 shadow-sm whitespace-nowrap">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                      🟡 {publishedJuriIds.length} Juri Tampil (Parsial)
                    </span>
                  ) : (
                    <span className="text-[0.65rem] font-bold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1.5 shadow-sm whitespace-nowrap">
                      <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                      ⏸️ Semua Nilai Ditahan
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {publishAll ? (
                    <button
                      onClick={handleUnpublishAll}
                      disabled={globalPublishing || clearingData}
                      className="px-3 py-1.5 text-xs font-bold bg-amber-500/10 hover:bg-amber-500 hover:text-black text-amber-400 border border-amber-500/30 rounded-lg transition-all disabled:opacity-50 flex items-center gap-1.5 shadow-sm whitespace-nowrap"
                      title="Sembunyikan / tahan seluruh nilai juri dari papan klasemen leaderboard"
                    >
                      {globalPublishing ? "Memproses..." : "⏸️ Sembunyikan Semua Nilai"}
                    </button>
                  ) : (
                    <button
                      onClick={handlePublishAll}
                      disabled={globalPublishing || clearingData}
                      className="px-3 py-1.5 text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg shadow-md hover:shadow-emerald-500/25 transition-all disabled:opacity-50 flex items-center gap-1.5 whitespace-nowrap"
                      title="Tampilkan seluruh nilai juri ke papan klasemen utama / leaderboard"
                    >
                      {globalPublishing ? "Memproses..." : "👁️ Tampilkan Semua Nilai"}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleBersihkanJuriTest}
                    disabled={clearingData}
                    className="px-3 py-1.5 text-xs font-bold bg-red-500/10 hover:bg-red-500 hover:text-white text-red-400 border border-red-500/30 rounded-lg transition-all disabled:opacity-50 flex items-center gap-1.5 shadow-sm whitespace-nowrap"
                    title="Hapus seluruh profil dewan juri uji coba"
                  >
                    {clearingData ? "Membersihkan..." : "🗑️ Bersihkan Juri Test"}
                  </button>
                </div>
              </div>

              {/* Tampilan Khusus Mobile: Kartu Dewan Juri Rapi & Simetris */}
              <div className="md:hidden p-2.5 sm:p-3 space-y-2.5 max-h-[650px] overflow-y-auto">
                {juriList.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500 italic bg-slate-950/40 rounded-xl border border-slate-800">
                    Belum ada akun Juri terdaftar.
                  </div>
                ) : (
                  juriList.map((j) => {
                    const isPublished = publishAll || publishedJuriIds.includes(j.id);
                    const scoreCount = penilaianList.filter(p => p.juri_id === j.id).length;
                    return (
                      <div key={j.id} className="p-3 rounded-xl border border-slate-800 bg-slate-950/70 space-y-2.5 shadow-sm">
                        {/* Header: Nama Juri & Status */}
                        <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-800/80">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-7 h-7 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-xs text-cyan-300 font-black shrink-0">
                              {j.nama_lengkap ? j.nama_lengkap.charAt(0).toUpperCase() : "J"}
                            </span>
                            <div className="min-w-0">
                              <h3 className="text-xs font-bold text-white truncate">{j.nama_lengkap}</h3>
                              <p className="text-[0.62rem] text-slate-400 font-mono truncate">{j.email || "No Email"}</p>
                            </div>
                          </div>
                          <div className="shrink-0">
                            {j.is_verified ? (
                              <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold text-[0.6rem] uppercase flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                Aktif
                              </span>
                            ) : (
                              <span className="bg-amber-500/15 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold text-[0.6rem] uppercase flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                                Menunggu
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Penugasan Lomba, Tingkat & Gender */}
                        <div className="grid grid-cols-2 gap-1.5 text-[0.65rem] bg-slate-900/60 p-2 rounded-lg border border-slate-800/60">
                          <div>
                            <span className="text-slate-500 block uppercase">Pos Lomba:</span>
                            <span className="text-slate-200 font-bold truncate block">{j.lomba?.nama_lomba || "Semua Pos"}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block uppercase">Tingkat:</span>
                            <span className="text-cyan-300 font-bold">{j.assigned_kategori || "SEMUA"}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block uppercase">Gender:</span>
                            <span className="text-slate-300 font-medium">
                              {j.assigned_gender === "SEMUA" || !j.assigned_gender ? "Bebas (Pa & Pi)" : j.assigned_gender === "Laki-laki" ? "👦 Putra" : "👧 Putri"}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500 block uppercase">WhatsApp:</span>
                            {j.no_wa ? (
                              <a href={`https://wa.me/${String(j.no_wa).replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer" className="text-emerald-400 font-mono font-bold hover:underline">
                                {j.no_wa}
                              </a>
                            ) : (
                              <span className="text-slate-600 italic">—</span>
                            )}
                          </div>
                        </div>

                        {/* Status Publikasi Nilai */}
                        <div className="flex items-center justify-between text-xs py-1 px-1.5 bg-slate-900/40 rounded-lg">
                          <span className="text-[0.65rem] text-slate-400 font-medium">
                            Progres: <strong className="text-white">{scoreCount} Nilai</strong>
                          </span>
                          {j.is_verified && (
                            <span className={`text-[0.6rem] font-bold px-2 py-0.5 rounded-full border ${isPublished ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-amber-500/20 text-amber-400 border-amber-500/30"}`}>
                              {isPublished ? "🟢 Tampil di Live" : "⏸️ Ditahan"}
                            </span>
                          )}
                        </div>

                        {/* Action Buttons Mobile */}
                        <div className="pt-2 border-t border-slate-800/80">
                          {verifyingJuriId === j.id ? (
                            <div className="flex flex-col gap-2">
                              <input 
                                type="text" 
                                placeholder="Set Password Juri" 
                                value={juriPasswordInput} 
                                onChange={(e) => setJuriPasswordInput(e.target.value)} 
                                className="w-full bg-slate-950 border border-amber-500 rounded-lg px-2.5 py-1.5 text-amber-300 text-xs font-bold outline-none"
                              />
                              <div className="flex gap-1.5">
                                <button onClick={() => handleVerifikasiJuri(j.id)} className="flex-1 text-white bg-emerald-600 hover:bg-emerald-700 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm">
                                  Simpan
                                </button>
                                <button onClick={() => { setVerifyingJuriId(null); setJuriPasswordInput(""); }} className="text-slate-400 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-all">
                                  Batal
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {j.is_verified && (
                                <button
                                  onClick={() => {
                                    try {
                                      const juriScores = penilaianList.filter((p) => p.juri_id === j.id);
                                      localStorage.setItem("_cetak_cache", JSON.stringify({
                                        lombaList,
                                        pesertaList,
                                        juriList: [j],
                                        penilaianList: juriScores,
                                        ts: Date.now(),
                                      }));
                                    } catch (_) {}
                                    window.open(`/dashboard/admin/cetak-rekap?juriName=${encodeURIComponent(j.nama_lengkap)}&juriId=${j.id}`, '_blank');
                                  }}
                                  className="text-[0.65rem] font-bold bg-cyan-500/15 hover:bg-cyan-500 text-cyan-300 hover:text-slate-950 border border-cyan-500/30 px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-all"
                                >
                                  <span>🖨️ Cetak</span>
                                </button>
                              )}

                              {j.is_verified && (
                                isPublished ? (
                                  <button
                                    type="button"
                                    onClick={() => handleUnpublishJuri(j.id, j.nama_lengkap)}
                                    disabled={publishingJuriId === j.id}
                                    className="flex-1 px-2.5 py-1.5 text-[0.65rem] font-bold bg-amber-500/10 hover:bg-amber-500 hover:text-black text-amber-400 border border-amber-500/30 rounded-lg transition-all text-center"
                                  >
                                    {publishingJuriId === j.id ? "..." : "⏸️ Tahan Nilai"}
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handlePublishJuri(j.id, j.nama_lengkap)}
                                    disabled={publishingJuriId === j.id}
                                    className="flex-1 px-2.5 py-1.5 text-[0.65rem] font-bold bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 border border-emerald-500/30 rounded-lg transition-all text-center"
                                  >
                                    {publishingJuriId === j.id ? "..." : "👁️ Tampilkan Nilai"}
                                  </button>
                                )
                              )}

                              {!j.is_verified && (
                                <button onClick={() => setVerifyingJuriId(j.id)} className="flex-1 text-amber-300 bg-amber-500/15 hover:bg-amber-500 hover:text-black border border-amber-500/30 px-2.5 py-1.5 rounded-lg text-[0.65rem] font-bold transition-all text-center">
                                  ⚡ Verifikasi
                                </button>
                              )}

                              {confirmDeleteId === j.id ? (
                                <div className="flex gap-1">
                                  <button onClick={() => handleHapusJuri(j.id, j.nama_lengkap)} className="text-white bg-red-600 hover:bg-red-700 px-2 py-1.5 rounded-lg text-[0.65rem] font-bold">
                                    Ya
                                  </button>
                                  <button onClick={() => setConfirmDeleteId(null)} className="text-slate-400 bg-slate-800 hover:bg-slate-700 px-2 py-1.5 rounded-lg text-[0.65rem] font-bold">
                                    Batal
                                  </button>
                                </div>
                              ) : (
                                <button onClick={() => setConfirmDeleteId(j.id)} className="text-red-400 bg-red-500/10 hover:bg-red-500 hover:text-white border border-red-500/30 px-2.5 py-1.5 rounded-lg text-[0.65rem] font-bold transition-all">
                                  🗑️ Hapus
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Tampilan Desktop: Tabel Lengkap */}
              <div className="hidden md:block overflow-x-auto max-h-[650px] mobile-table-scroll flex-1">
                <table className="w-full text-left border-collapse min-w-[1100px]">
                  <thead className="sticky top-0 bg-slate-900/95 backdrop-blur z-10 shadow-md border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-3 text-[0.68rem] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap min-w-[170px]">Nama Juri</th>
                      <th className="px-4 py-3 text-[0.68rem] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap min-w-[130px]">No. WhatsApp</th>
                      <th className="px-4 py-3 text-[0.68rem] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap min-w-[170px]">Email Login</th>
                      <th className="px-4 py-3 text-[0.68rem] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap min-w-[110px]">Tingkat</th>
                      <th className="px-4 py-3 text-[0.68rem] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap min-w-[170px]">Pos Lomba</th>
                      <th className="px-4 py-3 text-[0.68rem] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap min-w-[120px]">Gender</th>
                      <th className="px-4 py-3 text-[0.68rem] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap min-w-[100px]">Status</th>
                      <th className="px-4 py-3 text-[0.68rem] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap min-w-[90px]">Cetak</th>
                      <th className="px-4 py-3 text-[0.68rem] font-bold text-emerald-400 uppercase tracking-wider whitespace-nowrap min-w-[160px]">Tampilkan Nilai</th>
                      <th className="px-4 py-3 text-[0.68rem] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap min-w-[160px] text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {juriList.map((j) => (
                      <tr key={j.id} className="border-t border-slate-800/40 hover:bg-slate-800/30 transition-colors">
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <div className="text-xs md:text-sm font-bold text-white flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-[10px] text-cyan-300 font-black">
                              {j.nama_lengkap ? j.nama_lengkap.charAt(0).toUpperCase() : "J"}
                            </span>
                            {j.nama_lengkap}
                          </div>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          {j.no_wa ? (
                            <a 
                              href={getWaJuriUrl(j)} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-xs text-amber-400 flex items-center gap-1.5 font-mono hover:text-amber-300 hover:underline transition-colors w-fit"
                              title="Kirim Rincian Akun & Link Login via WhatsApp Resmi"
                            >
                              <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                              <span>{j.no_wa} (💬 Kirim Akses WA)</span>
                            </a>
                          ) : (
                            <span className="text-xs text-slate-600 italic">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          {j.email && j.email !== "No Email" ? (
                            <div className="text-xs text-slate-300 flex items-center gap-1.5 font-mono">
                              <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                              {j.email}
                            </div>
                          ) : (
                            <span className="text-xs text-slate-600 italic">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className={`text-[0.65rem] font-bold px-2 py-0.5 rounded-full border ${
                            j.assigned_kategori === "SD" ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30" :
                            j.assigned_kategori === "SMP" ? "bg-cyan-500/10 text-cyan-300 border-cyan-500/30" :
                            "bg-purple-500/10 text-purple-300 border-purple-500/30"
                          }`}>
                            {j.assigned_kategori || "SEMUA"}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className="text-xs font-semibold text-slate-200">
                            {j.lomba?.nama_lomba || "SEMUA POS LOMBA"}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className="text-xs font-semibold text-slate-300">
                            {j.assigned_gender === "SEMUA" || !j.assigned_gender ? "Bebas (Pa & Pi)" : j.assigned_gender === "Laki-laki" ? "👦 Putra" : "👧 Putri"}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          {j.is_verified ? (
                            <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-full font-bold text-[0.65rem] uppercase flex items-center gap-1 w-fit">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                              Aktif
                            </span>
                          ) : (
                            <span className="bg-amber-500/15 text-amber-400 border border-amber-500/30 px-2.5 py-1 rounded-full font-bold text-[0.65rem] uppercase flex items-center gap-1 w-fit">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                              Menunggu
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          {j.is_verified ? (
                            <button
                              onClick={() => {
                                try {
                                  const juriScores = penilaianList.filter((p) => p.juri_id === j.id);
                                  localStorage.setItem("_cetak_cache", JSON.stringify({
                                    lombaList,
                                    pesertaList,
                                    juriList: [j],
                                    penilaianList: juriScores,
                                    ts: Date.now(),
                                  }));
                                } catch (_) {}
                                window.open(`/dashboard/admin/cetak-rekap?juriName=${encodeURIComponent(j.nama_lengkap)}&juriId=${j.id}`, '_blank');
                              }}
                              className="text-xs font-bold bg-cyan-500/15 hover:bg-cyan-500 text-cyan-300 hover:text-slate-950 border border-cyan-500/30 px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-all shadow-sm"
                            >
                              <span>🖨️ Cetak</span>
                            </button>
                          ) : (
                            <span className="text-[0.65rem] text-slate-500 italic">—</span>
                          )}
                        </td>
                        {/* Kolom Tampilkan Nilai */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          {j.is_verified ? (
                            (() => {
                              const isPublished = publishAll || publishedJuriIds.includes(j.id);
                              const scoreCount = penilaianList.filter(p => p.juri_id === j.id).length;
                              return (
                                <div className="flex flex-col gap-1.5 min-w-[150px]">
                                  <div className="flex items-center gap-1.5 text-[0.65rem]">
                                    {isPublished ? (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                        🟢 Tampil ({scoreCount} Nilai)
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold">
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                                        ⏸️ Ditahan ({scoreCount} Nilai)
                                      </span>
                                    )}
                                  </div>
                                  {isPublished ? (
                                    <button
                                      type="button"
                                      onClick={() => handleUnpublishJuri(j.id, j.nama_lengkap)}
                                      disabled={publishingJuriId === j.id}
                                      className="px-2.5 py-1 text-[0.65rem] font-bold bg-amber-500/10 hover:bg-amber-500 hover:text-black text-amber-400 border border-amber-500/30 rounded-lg transition-all flex items-center justify-center gap-1 whitespace-nowrap disabled:opacity-50 shadow-sm"
                                      title="Tahan / sembunyikan nilai juri ini dari leaderboard"
                                    >
                                      {publishingJuriId === j.id ? "Memproses..." : "⏸️ Sembunyikan"}
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => handlePublishJuri(j.id, j.nama_lengkap)}
                                      disabled={publishingJuriId === j.id}
                                      className="px-2.5 py-1 text-[0.65rem] font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg shadow-md hover:shadow-emerald-500/25 transition-all flex items-center justify-center gap-1 whitespace-nowrap disabled:opacity-50"
                                      title="Tampilkan nilai juri ini ke papan klasemen leaderboard publik"
                                    >
                                      {publishingJuriId === j.id ? "Memproses..." : "👁️ Tampilkan"}
                                    </button>
                                  )}
                                </div>
                              );
                            })()
                          ) : (
                            <span className="text-[0.65rem] text-slate-500 italic">Belum Verif</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-right whitespace-nowrap">
                          {verifyingJuriId === j.id ? (
                            <div className="flex justify-end gap-1.5 items-center">
                              <input 
                                type="text" 
                                placeholder="Set Password" 
                                value={juriPasswordInput} 
                                onChange={(e) => setJuriPasswordInput(e.target.value)} 
                                className="w-28 bg-slate-950 border border-amber-500 rounded px-2 py-1.5 text-amber-300 text-xs font-bold outline-none"
                              />
                              <button onClick={() => handleVerifikasiJuri(j.id)} className="text-white bg-emerald-600 hover:bg-emerald-700 px-2.5 py-1.5 rounded text-xs font-bold transition-all shadow-sm">
                                Simpan
                              </button>
                              <button onClick={() => { setVerifyingJuriId(null); setJuriPasswordInput(""); }} className="text-slate-400 bg-slate-800 hover:bg-slate-700 px-2 py-1.5 rounded text-xs font-bold transition-all">
                                Batal
                              </button>
                            </div>
                          ) : confirmDeleteId === j.id ? (
                            <div className="flex justify-end gap-1.5 items-center">
                              <button onClick={() => handleHapusJuri(j.id, j.nama_lengkap)} className="text-white bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md">
                                Ya, Hapus
                              </button>
                              <button onClick={() => setConfirmDeleteId(null)} className="text-slate-400 bg-slate-800 hover:bg-slate-700 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all">
                                Batal
                              </button>
                            </div>
                          ) : (
                            <div className="flex justify-end gap-1.5 items-center">
                              {!j.is_verified && (
                                <button onClick={() => setVerifyingJuriId(j.id)} className="text-amber-300 bg-amber-500/15 hover:bg-amber-500 hover:text-black border border-amber-500/30 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm">
                                  ⚡ Verifikasi
                                </button>
                              )}
                              <button onClick={() => setConfirmDeleteId(j.id)} className="text-red-400 bg-red-500/10 hover:bg-red-500 hover:text-white border border-red-500/30 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm">
                                🗑️ Hapus
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                    {juriList.length === 0 && (
                      <tr><td colSpan="10" className="p-8 text-center text-slate-500 italic">Belum ada akun Juri terdaftar.</td></tr>
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
                      <th className="p-4 text-[0.65rem] font-bold text-slate-500 uppercase">Kelompok Kegiatan</th>
                      <th className="p-4 text-[0.65rem] font-bold text-slate-500 uppercase">Nama Cabang Lomba</th>
                      <th className="p-4 text-[0.65rem] font-bold text-slate-500 uppercase">Kode Singkat</th>
                      <th className="p-4 text-[0.65rem] font-bold text-slate-500 uppercase">Tingkatan</th>
                      <th className="p-4 text-[0.65rem] font-bold text-slate-500 uppercase text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lombaList.map((l) => {
                      const meta = OFFICIAL_GROUP_ORDER[l.kode_lomba?.toUpperCase()] || { groupName: "Lainnya", color: "slate" };
                      const badgeColor =
                        meta.color === "amber" ? "bg-amber-500/10 text-amber-300 border-amber-500/20" :
                        meta.color === "cyan" ? "bg-cyan-500/10 text-cyan-300 border-cyan-500/20" :
                        meta.color === "emerald" ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20" :
                        "bg-purple-500/10 text-purple-300 border-purple-500/20";
                      return (
                        <tr key={l.id} className="border-t border-slate-800/30 hover:bg-slate-800/20">
                          <td className="p-4 text-xs font-bold">
                            <span className={`px-2.5 py-1 rounded-full border text-[0.65rem] ${badgeColor}`}>
                              {meta.groupName}
                            </span>
                          </td>
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
                    );
                  })}

                    {lombaList.length === 0 && (
                      <tr><td colSpan="5" className="p-8 text-center text-slate-500 italic">Belum ada cabang lomba diinput.</td></tr>
                    )}

                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: LAPORAN & REKAPITULASI KLASEMEN */}
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
                    <option value="SD">SD / MI (Penggalang Ramu)</option>
                    <option value="SMP">SMP / MTs (Penggalang Rakit/Terap)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[0.65rem] text-slate-500 font-bold uppercase">Kategori Klasemen</label>
                  <select
                    value={reportGender}
                    onChange={(e) => setReportGender(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500/50 font-bold"
                  >
                    <option value="Gabungan">🏆 Gabungan Putra &amp; Putri (Juara Umum)</option>
                    <option value="Laki-laki">👦 Regu Putra</option>
                    <option value="Perempuan">👧 Regu Putri</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[0.65rem] text-slate-500 font-bold uppercase">Tampilan Laporan</label>
                  <select
                    value={reportView}
                    onChange={(e) => setReportView(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500/50"
                  >
                    <option value="regu">🏅 Rekapitulasi Klasemen Lengkap</option>
                    <option value="semua">📑 Lengkap (Klasemen + Rekap Juara Pos Lomba)</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-2 w-full md:w-auto">
                <button
                  onClick={() => {
                    const genderLabel = reportGender === "Gabungan" ? "Gabungan Putra & Putri" : reportGender === "Laki-laki" ? "Putra" : "Putri";
                    document.title = `Rekapitulasi Klasemen Juara Umum LT-II 2026 - Tingkat ${reportTingkat} ${genderLabel}`.replace(/[\\/:*?"<>|]+/g, "-").trim();
                    window.print();
                  }}
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black px-6 py-3 rounded-xl transition-all duration-300 shadow-[0_4px_15px_rgba(245,166,35,0.3)] flex items-center justify-center gap-2 text-sm"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  🖨️ CETAK REKAPITULASI JUARA UMUM
                </button>
                
                <button
                  onClick={() => {
                    try {
                      localStorage.setItem("_cetak_cache", JSON.stringify({
                        lombaList,
                        pesertaList,
                        juriList,
                        penilaianList,
                        ts: Date.now(),
                      }));
                    } catch (_) {}
                    window.open('/dashboard/admin/cetak-rekap', '_blank');
                  }}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 font-bold px-6 py-2.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 text-xs"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  📋 Cetak Form Rubrik Per Pos Juri
                </button>
              </div>
            </div>

            {/* Printable Report Document Card */}
            <div className="bg-white text-slate-900 p-6 md:p-10 border border-slate-300 shadow-2xl rounded-2xl printable-report font-serif text-[11pt]">
              
              {/* KOP SURAT RESMI GERAKAN PRAMUKA MEKAR BARU */}
              <div className="flex items-center justify-between pb-3 mb-6" style={{ borderBottom: "5px double black" }}>
                <div className="flex-shrink-0 ml-2">
                  <img 
                    src="/tunas_kelapa.jpg" 
                    alt="Logo Tunas Kelapa" 
                    className="w-[85px] h-[85px] object-contain" 
                  />
                </div>
                <div className="flex-1 text-center px-2" style={{ fontFamily: "Arial, sans-serif" }}>
                  <h1 className="text-[20px] md:text-[22px] font-bold uppercase tracking-[0.2em] leading-tight text-black">
                    G E R A K A N &nbsp; P R A M U K A
                  </h1>
                  <h2 className="text-[18px] md:text-[20px] font-bold uppercase tracking-wider leading-tight mt-0.5 text-black">
                    KWARTIR RANTING MEKAR BARU
                  </h2>
                  <p className="text-[12px] md:text-[13px] font-bold uppercase tracking-wide mt-1 text-black">
                    PANITIA PELAKSANA LOMBA TINGKAT II (LT-II) TAHUN 2026
                  </p>
                  <p className="text-[11px] font-medium leading-tight text-slate-700">
                    Jl. KH. Suhaemi Ds. Mekar Baru Kec. Mekar Baru Kabupaten Tangerang - Banten 15550
                  </p>
                  <p className="text-[10px] font-bold italic leading-tight text-blue-800">
                    <span className="text-black">Website:</span> mekarbaru.kwarcabtangerang.or.id &nbsp;<span className="text-black">// Email:</span> kwarran.mekarbaru@gmail.com
                  </p>
                </div>
                <div className="flex-shrink-0 mr-2">
                  <img 
                    src="/logo_wosm.png" 
                    alt="Logo WOSM" 
                    className="w-[85px] h-[85px] object-contain" 
                  />
                </div>
              </div>

              {/* JUDUL SURAT KEPUTUSAN RESMI */}
              <div className="text-center mb-6" style={{ fontFamily: "Arial, sans-serif" }}>
                <h2 className="text-base md:text-lg font-black uppercase tracking-wider text-black underline underline-offset-4">
                  SURAT KEPUTUSAN HASIL PENILAIAN AKHIR KLASEMEN
                </h2>
                <p className="text-xs md:text-sm font-bold uppercase tracking-widest mt-1 text-slate-800">
                  PENETAPAN {reportGender === "Gabungan" ? "JUARA UMUM PANGKALAN" : "REGU JUARA"} LOMBA TINGKAT II (LT-II) TAHUN 2026
                </p>
                <div className="flex flex-wrap justify-center gap-4 md:gap-8 mt-3 text-xs font-bold text-slate-700 uppercase tracking-wider">
                  <div>Tingkat: <span className="text-black">{reportTingkat === "SD" ? "SD / MI (Penggalang Ramu)" : "SMP / MTs (Penggalang Rakit/Terap)"}</span></div>
                  <div>Kategori: <span className="text-black">{reportGender === "Gabungan" ? "🏆 GABUNGAN PUTRA & PUTRI (JUARA UMUM)" : (reportGender === "Laki-laki" ? "👦 REGU PUTRA" : "👧 REGU PUTRI")}</span></div>
                  <div>Tanggal Keputusan: <span className="text-black">{new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span></div>
                </div>
              </div>

              {/* KOTAK PENETAPAN JUARA UMUM (PODIUM HONOR BOX) */}
              <div className="podium-box border-2 border-black rounded-lg p-4 mb-8 bg-slate-50 print:bg-white text-black" style={{ fontFamily: "Arial, sans-serif" }}>
                <div className="text-center font-black text-sm uppercase tracking-wider border-b-2 border-black pb-2 mb-3">
                  🏆 KEPUTUSAN DEWAN JURI: PENETAPAN {reportGender === "Gabungan" ? "JUARA UMUM (GABUNGAN PUTRA & PUTRI)" : `REGU JUARA (${reportGender.toUpperCase()})`}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Juara 1 */}
                  <div className="border border-amber-600 rounded p-3 bg-amber-50/80 text-left">
                    <div className="text-xs font-black text-amber-800 uppercase flex items-center justify-between">
                      <span className="text-sm font-black">🥇 JUARA 1</span>
                      {reportGender === "Gabungan" && <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded font-black">JUARA UMUM</span>}
                    </div>
                    {displayKlasemenList[0] ? (
                      <div className="mt-2 space-y-0.5">
                        <div className="font-black text-sm text-black">{displayKlasemenList[0].pangkalan}</div>
                        <div className="text-xs text-slate-700">{displayKlasemenList[0].subText} (No. Gudep: {displayKlasemenList[0].no_gudep || "—"})</div>
                        <div className="text-xs font-mono font-black text-emerald-800 pt-1">
                          Total Nilai: {displayKlasemenList[0].calculatedScore} Pts
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-500 italic mt-2">Belum ada data</div>
                    )}
                  </div>

                  {/* Juara 2 */}
                  <div className="border border-slate-400 rounded p-3 bg-slate-100/80 text-left">
                    <div className="text-xs font-black text-slate-800 uppercase flex items-center justify-between">
                      <span className="text-sm font-black">🥈 JUARA 2</span>
                    </div>
                    {displayKlasemenList[1] ? (
                      <div className="mt-2 space-y-0.5">
                        <div className="font-black text-sm text-black">{displayKlasemenList[1].pangkalan}</div>
                        <div className="text-xs text-slate-700">{displayKlasemenList[1].subText} (No. Gudep: {displayKlasemenList[1].no_gudep || "—"})</div>
                        <div className="text-xs font-mono font-black text-emerald-800 pt-1">
                          Total Nilai: {displayKlasemenList[1].calculatedScore} Pts
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-500 italic mt-2">Belum ada data</div>
                    )}
                  </div>

                  {/* Juara 3 */}
                  <div className="border border-amber-800 rounded p-3 bg-amber-50/50 text-left">
                    <div className="text-xs font-black text-amber-950 uppercase flex items-center justify-between">
                      <span className="text-sm font-black">🥉 JUARA 3</span>
                    </div>
                    {displayKlasemenList[2] ? (
                      <div className="mt-2 space-y-0.5">
                        <div className="font-black text-sm text-black">{displayKlasemenList[2].pangkalan}</div>
                        <div className="text-xs text-slate-700">{displayKlasemenList[2].subText} (No. Gudep: {displayKlasemenList[2].no_gudep || "—"})</div>
                        <div className="text-xs font-mono font-black text-emerald-800 pt-1">
                          Total Nilai: {displayKlasemenList[2].calculatedScore} Pts
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-500 italic mt-2">Belum ada data</div>
                    )}
                  </div>
                </div>
              </div>

              {/* TABEL REKAPITULASI KLASEMEN AKHIR (NILAI SEMUA LOMBA & TOTAL AKUMULASI) */}
              <div className="space-y-3 mb-10 overflow-x-auto print:overflow-visible print:mb-6">
                <div className="flex justify-between items-center border-b-2 border-black pb-1">
                  <h3 className="text-sm md:text-base font-black uppercase text-black" style={{ fontFamily: "Arial, sans-serif" }}>
                    I. Rekapitulasi Klasemen Akhir {reportGender === "Gabungan" ? "Juara Umum (Gabungan Putra & Putri)" : `Regu ${reportGender === "Laki-laki" ? "Putra" : "Putri"}`}
                  </h3>
                  <span className="text-xs font-semibold text-slate-600">Urutan: Juara 1 s/d Seterusnya (Nilai Tertinggi ke Terendah)</span>
                </div>

                <table className="w-full text-left border-collapse print-table" style={{ width: "100%", tableLayout: "fixed" }}>
                  <colgroup>
                    <col style={{ width: "7.5%" }} />
                    <col style={{ width: "22.5%" }} />
                    {activeReportLomba.map((lomba) => (
                      <col key={lomba.id} style={{ width: `${62 / (activeReportLomba.length || 1)}%` }} />
                    ))}
                    <col style={{ width: "8%" }} />
                  </colgroup>
                  <thead>
                    <tr className="bg-slate-100 text-black font-bold text-[8pt] uppercase" style={{ fontFamily: "Arial, sans-serif" }}>
                      <th rowSpan={2} className="p-1 text-center border border-black font-black">
                        Juara
                      </th>
                      <th rowSpan={2} className="p-1 border border-black font-black">
                        Asal Sekolah (No. Gudep)
                      </th>
                      <th colSpan={activeReportLomba.length} className="p-0.5 text-center border border-black font-black bg-slate-200 text-[7.5pt]">
                        {reportGender === "Gabungan" ? "Nilai Akhir Tiap Cabang Lomba (Gabungan Pa + Pi)" : "Nilai Akhir Tiap Cabang Lomba"}
                      </th>
                      <th rowSpan={2} className="p-1 text-center border border-black font-black bg-amber-100 text-amber-950">
                        Total Akumulasi
                      </th>
                    </tr>
                    <tr className="bg-slate-50 text-black font-bold text-[7pt] uppercase" style={{ fontFamily: "Arial, sans-serif" }}>
                      {activeReportLomba.map((lomba) => (
                        <th 
                          key={lomba.id} 
                          className="p-0.5 text-center border border-black font-bold whitespace-nowrap overflow-hidden text-ellipsis"
                          title={lomba.nama_lomba}
                        >
                          {lomba.kode_lomba}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {displayKlasemenList.map((item, index) => {
                      const predikat = getPredikatOfficial(index);
                      return (
                        <tr 
                          key={item.id} 
                          className={`border-t border-black text-xs print-text-dark ${
                            index === 0 ? "bg-amber-50/80 font-semibold" : 
                            index === 1 ? "bg-slate-50/80" : 
                            index === 2 ? "bg-amber-50/40" : ""
                          }`}
                        >
                          {/* 1. Kolom Juara */}
                          <td className="p-1 text-center border border-black whitespace-nowrap overflow-hidden">
                            <div className="font-black text-black text-[8pt] flex items-center justify-center gap-0.5">
                              {predikat.medal && <span className="text-[9pt]">{predikat.medal}</span>}
                              <span>{predikat.title}</span>
                            </div>
                          </td>

                          {/* 2. Asal Sekolah (No. Gudep) */}
                          <td className="p-1 border border-black overflow-hidden">
                            <div className="font-bold text-black text-[8.5pt] leading-tight truncate">
                              {item.pangkalan}
                            </div>
                            <div className="text-[6.5pt] text-slate-700 mt-0.5 leading-tight truncate">
                              <span className="font-semibold">Gudep: {item.no_gudep || "—"}</span>
                              <span className="text-slate-400 mx-0.5">•</span>
                              <span className="italic">{item.subText}</span>
                            </div>
                          </td>

                          {/* 3. Runtutan Semua Lomba (Nilai Akhir) */}
                          {activeReportLomba.map((lomba) => {
                            const val = item.getLombaScore(lomba.id);
                            return (
                              <td 
                                key={lomba.id} 
                                className={`p-0.5 font-mono text-center border border-black text-[7.5pt] ${
                                  val === "—" ? "text-slate-400" : "font-bold text-black"
                                }`}
                              >
                                {val}
                              </td>
                            );
                          })}

                          {/* 4. Nilai Akumulasi / Total Semua Lomba (di ujung) */}
                          <td className="p-1 font-mono font-black text-center border border-black text-[9pt] bg-amber-50/70 text-black whitespace-nowrap">
                            {item.calculatedScore}
                          </td>
                        </tr>
                      );
                    })}

                    {displayKlasemenList.length === 0 && (
                      <tr>
                        <td colSpan={activeReportLomba.length + 3} className="p-8 text-center text-slate-500 italic border border-black">
                          Belum ada data terverifikasi untuk kategori ini.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* TABEL 2: REKAPITULASI JUARA PER CABANG LOMBA */}
              {reportView === "semua" && (
                <div className="space-y-4 mb-10 print-avoid-break">
                  <div className="flex justify-between items-center border-b-2 border-black pb-1">
                    <h3 className="text-sm md:text-base font-black uppercase text-black" style={{ fontFamily: "Arial, sans-serif" }}>
                      II. Rekapitulasi Pemenang Cabang Lomba (Juara 1, 2, 3)
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {lombaList
                      .filter((l) => l.kategori === reportTingkat)
                      .map((lomba) => {
                        const juaraList = getJuaraForLomba(lomba.id);
                        return (
                          <div key={lomba.id} className="p-2.5 rounded border border-black bg-slate-50/50 space-y-1.5">
                            <div className="text-xs font-black text-black uppercase tracking-wide border-b border-black pb-1 flex justify-between">
                              <span>🏆 {lomba.nama_lomba}</span>
                              <span className="font-mono text-slate-600">[{lomba.kode_lomba}]</span>
                            </div>
                            <div className="space-y-1 text-xs">
                              {juaraList.map((juara, idx) => (
                                <div key={juara.id} className="flex justify-between items-center">
                                  <span className="font-bold text-[10px] w-14">
                                    {idx === 0 ? "🥇 Juara 1" : idx === 1 ? "🥈 Juara 2" : "🥉 Juara 3"}
                                  </span>
                                  <span className="flex-1 px-1 font-semibold truncate text-black">
                                    {juara.pangkalan} <span className="text-[10px] text-slate-600">({juara.nama_regu})</span>
                                  </span>
                                  <span className="font-mono font-bold text-right text-black w-14">
                                    {juara.score} Pts
                                  </span>
                                </div>
                              ))}
                              {juaraList.length === 0 && (
                                <div className="text-center text-slate-500 italic text-[10px] py-1">
                                  Belum ada nilai terinput.
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* LEMBAR PENGESAHAN RESMI (2 TANDA TANGAN) */}
              <div className="mt-8 print-signature-block text-black" style={{ fontFamily: "Arial, sans-serif" }}>
                <div className="text-right text-xs mb-6 text-black font-semibold">
                  <p>Ditetapkan di : <strong>Mekar Baru</strong></p>
                  <p>Pada Tanggal : <strong>{new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</strong></p>
                </div>

                <div className="grid grid-cols-2 text-center text-xs font-semibold gap-12 mb-4">
                  {/* Kiri: Ketua Kwarran (Mengetahui & Mengesahkan) */}
                  <div className="space-y-20">
                    <div>
                      <p className="text-slate-700">Mengetahui &amp; Mengesahkan,</p>
                      <p className="font-black text-black uppercase mt-0.5">
                        Ketua Kwartir Ranting Gerakan Pramuka Mekar Baru
                      </p>
                    </div>
                    <div>
                      <p className="font-black text-black underline uppercase text-sm tracking-wider">( &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; )</p>
                    </div>
                  </div>

                  {/* Kanan: Ketua Pelaksana (Panitia Pelaksana) */}
                  <div className="space-y-20">
                    <div>
                      <p className="text-slate-700">Panitia Pelaksana,</p>
                      <p className="font-bold text-black uppercase mt-0.5">Ketua Pelaksana LT-II 2026</p>
                    </div>
                    <div>
                      <p className="font-black text-black underline uppercase text-sm tracking-wider">( &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; )</p>
                    </div>
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

      {/* MODAL GANTI PASSWORD & RESET TOKEN ADMIN */}
      {modalPasswordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in no-print overflow-y-auto">
          <div className="glass-card max-w-lg w-full p-6 md:p-8 border border-amber-500/30 shadow-2xl relative my-8">
            <button
              type="button"
              onClick={() => setModalPasswordOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-800 transition-colors"
            >
              ✕
            </button>

            <div className="text-center space-y-2 mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-1">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-lg font-black tracking-wider text-white uppercase">
                Ganti Kata Sandi & Token Admin
              </h2>
              <p className="text-xs text-slate-400">
                Setiap klik ganti password, token baru 1-kali pakai langsung dibuat otomatis
              </p>
            </div>

            {/* SEKSI 1: TOKEN RESET 1-KALI PAKAI */}
            <div className="mb-6 p-4 rounded-xl bg-slate-900/90 border border-amber-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[0.7rem] font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  Token Baru Aktif (1-Kali Pakai)
                </span>
                <button
                  type="button"
                  onClick={handleGenerateNewToken}
                  disabled={generatingToken}
                  className="text-[0.65rem] font-bold text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1 disabled:opacity-50"
                  title="Buat token reset acak baru lainnya"
                >
                  <span>{generatingToken ? "Membuat..." : "🔄 Buat Token Baru"}</span>
                </button>
              </div>

              {generatedResetUrl ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={generatedResetUrl}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-300 select-all outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (navigator.clipboard) {
                          navigator.clipboard.writeText(generatedResetUrl);
                        }
                        setTokenCopied(true);
                        setTimeout(() => setTokenCopied(false), 2500);
                      }}
                      className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1 flex-shrink-0 ${
                        tokenCopied
                          ? "bg-emerald-600 text-white shadow-emerald-500/30"
                          : "bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-sm"
                      }`}
                    >
                      <span>{tokenCopied ? "✅ Tersalin!" : "📋 Salin Link"}</span>
                    </button>
                  </div>
                  <div className="flex items-center justify-between text-[0.65rem] text-slate-400">
                    <span>Masa berlaku: 48 jam (Hangus setelah 1x reset)</span>
                    <a
                      href={generatedResetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-400 hover:underline font-bold"
                    >
                      Buka Halaman Reset ↗
                    </a>
                  </div>
                </div>
              ) : (
                <div className="text-center py-2 text-xs text-slate-500 italic">
                  {generatingToken ? "Membuat token keamanan baru..." : "Klik tombol 'Buat Token Baru' untuk membuat token."}
                </div>
              )}
            </div>

            <div className="relative flex py-2 items-center mb-4">
              <div className="flex-grow border-t border-slate-800"></div>
              <span className="flex-shrink mx-3 text-[0.65rem] font-bold uppercase tracking-wider text-slate-500">
                Atau Ubah Langsung di Panel Ini
              </span>
              <div className="flex-grow border-t border-slate-800"></div>
            </div>

            {adminPasswordMsg.text && (
              <div
                className={`p-3.5 rounded-xl text-xs font-semibold mb-4 text-center ${
                  adminPasswordMsg.type === "error"
                    ? "bg-red-500/10 border border-red-500/30 text-red-400"
                    : "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                }`}
              >
                {adminPasswordMsg.text}
              </div>
            )}

            <form onSubmit={handleChangeAdminPassword} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[0.7rem] font-bold text-slate-400 uppercase tracking-wider">
                  Kata Sandi Baru
                </label>
                <input
                  type="password"
                  value={newAdminPassword}
                  onChange={(e) => setNewAdminPassword(e.target.value)}
                  required
                  placeholder="Minimal 6 karakter"
                  autoComplete="new-password"
                  className="w-full bg-slate-950/90 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[0.7rem] font-bold text-slate-400 uppercase tracking-wider">
                  Konfirmasi Kata Sandi Baru
                </label>
                <input
                  type="password"
                  value={confirmAdminPassword}
                  onChange={(e) => setConfirmAdminPassword(e.target.value)}
                  required
                  placeholder="Ketik ulang kata sandi baru"
                  autoComplete="new-password"
                  className="w-full bg-slate-950/90 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50 text-sm"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalPasswordOpen(false)}
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold py-3 px-4 rounded-xl text-xs transition-colors"
                >
                  Tutup
                </button>
                <button
                  type="submit"
                  disabled={adminPasswordSaving}
                  className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3 px-4 rounded-xl text-xs transition-all shadow-md disabled:opacity-50 uppercase tracking-wider"
                >
                  {adminPasswordSaving ? "Menyimpan..." : "Simpan Sandi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDIT & KIRIM ULANG EMAIL PESERTA */}
      {modalEmailPeserta.open && modalEmailPeserta.peserta && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in no-print overflow-y-auto">
          <div className="glass-card max-w-md w-full p-6 border border-cyan-500/40 shadow-2xl relative my-8 bg-slate-950/95">
            <button
              type="button"
              onClick={() => setModalEmailPeserta({ open: false, peserta: null, emailInput: "" })}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-800 transition-colors"
            >
              ✕
            </button>

            <div className="text-center space-y-1.5 mb-5">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mb-1">
                <span className="text-xl">✉️</span>
              </div>
              <h2 className="text-base font-black tracking-wider text-white uppercase">
                Ubah Alamat Email Peserta
              </h2>
              <p className="text-xs text-slate-400">
                Regu <strong className="text-white">{modalEmailPeserta.peserta.nama_regu}</strong> ({modalEmailPeserta.peserta.pangkalan})
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[0.7rem] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Alamat Email Baru (Untuk Pengiriman Bukti & Surat)
                </label>
                <input
                  type="email"
                  value={modalEmailPeserta.emailInput}
                  onChange={(e) => setModalEmailPeserta((prev) => ({ ...prev, emailInput: e.target.value }))}
                  placeholder="contoh: sdnjenggot1@gmail.com"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm font-mono focus:outline-none focus:border-cyan-500 shadow-inner"
                />
                <p className="text-[0.68rem] text-slate-400 mt-1.5">
                  💡 <em>Penting:</em> Gunakan email <strong>@gmail.com</strong> biasa yang aktif dan penyimpanannya tidak penuh. Hindari email @belajar.id karena sering diblokir otomatis oleh kementerian.
                </p>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                {modalEmailPeserta.peserta.is_verified && (
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => handleSimpanEmailPeserta(true)}
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 px-4 rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <span>💾 Simpan & Kirim Ulang Bukti (PDF)</span>
                  </button>
                )}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setModalEmailPeserta({ open: false, peserta: null, emailInput: "" })}
                    className="flex-1 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold py-2.5 px-4 rounded-xl text-xs transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => handleSimpanEmailPeserta(false)}
                    className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all shadow-md disabled:opacity-50"
                  >
                    {saving ? "Menyimpan..." : "Hanya Simpan Email"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}