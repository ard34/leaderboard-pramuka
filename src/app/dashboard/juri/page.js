"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useOnlineStatus } from "@/lib/useOnlineStatus";

export default function DashboardJuri() {
  const router = useRouter();
  const isOnline = useOnlineStatus();

  const [juri, setJuri] = useState(null);
  const [pesertaList, setPesertaList] = useState([]);
  const [lombaList, setLombaList] = useState([]);

  // State Form Input
  const [selectedKategori, setSelectedKategori] = useState("SD");
  const [selectedGender, setSelectedGender] = useState("Laki-laki");
  const [selectedLombaId, setSelectedLombaId] = useState("");
  const [selectedPeserta, setSelectedPeserta] = useState("");
  const [nilai, setNilai] = useState(0);

  // State UI
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pesan, setPesan] = useState({ type: "", text: "" });
  const [showSuccess, setShowSuccess] = useState(false);
  const [riwayat, setRiwayat] = useState([]);

  useEffect(() => {
    cekAuthDanAmbilData();
  }, []);

  // Update default selected lomba when kategori changes
  useEffect(() => {
    if (juri && !juri.assigned_lomba_id && lombaList.length > 0) {
      const matching = lombaList.find((l) => l.kategori === selectedKategori);
      if (matching) setSelectedLombaId(matching.id);
      else setSelectedLombaId("");
    }
  }, [selectedKategori, lombaList, juri]);

  const cekAuthDanAmbilData = async () => {
    // Try to use cached profile from login page to skip getSession
    let userId = null;
    try {
      const cached = JSON.parse(sessionStorage.getItem("_profile_cache") || "null");
      if (cached && cached.role === "juri" && (Date.now() - cached.ts) < 30000) {
        sessionStorage.removeItem("_profile_cache");
        userId = cached.id;
      }
    } catch (_) { /* ignore */ }

    // If no cache, do normal session check
    if (!userId) {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }
      userId = session.user.id;
    }

    // Fetch profile, lomba, and peserta ALL in parallel
    const [profileRes, lombaRes, pesertaRes] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, nama_lengkap, role, assigned_lomba_id, assigned_kategori, assigned_gender, lomba(nama_lomba)")
        .eq("id", userId)
        .single(),
      supabase
        .from("lomba")
        .select("id, nama_lomba, kode_lomba, kategori")
        .order("nama_lomba", { ascending: true }),
      supabase
        .from("peserta")
        .select("id, nomor_dada, nama_regu, pangkalan, kategori, gender")
        .order("nomor_dada", { ascending: true }),
    ]);

    const profile = profileRes.data;
    if (profile?.role !== "juri") {
      router.push("/dashboard/admin");
      return;
    }
    setJuri(profile);

    if (lombaRes.data) {
      setLombaList(lombaRes.data);
      if (profile.assigned_lomba_id) {
        setSelectedLombaId(profile.assigned_lomba_id);
      }
    }

    if (profile.assigned_kategori) {
      setSelectedKategori(profile.assigned_kategori);
    }

    if (profile.assigned_gender && profile.assigned_gender !== "SEMUA") {
      setSelectedGender(profile.assigned_gender);
    }

    if (pesertaRes.data) setPesertaList(pesertaRes.data);
    setLoading(false);
  };

  const handleSimpanNilai = async (e) => {
    e.preventDefault();
    if (!selectedPeserta) {
      setPesan({ type: "error", text: "Pilih regu peserta terlebih dahulu!" });
      return;
    }
    if (!selectedLombaId) {
      setPesan({ type: "error", text: "Cabang lomba belum dipilih / belum ada." });
      return;
    }
    if (!isOnline) {
      setPesan({ type: "error", text: "Koneksi internet terputus! Nilai tidak bisa dikirim." });
      return;
    }

    setSaving(true);
    setPesan({ type: "", text: "" });

    // Upsert penilaian
    const { error } = await supabase
      .from("penilaian")
      .upsert({
        peserta_id: selectedPeserta,
        juri_id: juri.id,
        lomba_id: selectedLombaId,
        nilai: Number(nilai)
      }, { onConflict: "peserta_id, juri_id, lomba_id" });

    if (error) {
      setPesan({ type: "error", text: "Gagal menyimpan nilai: " + error.message });
    } else {
      const pesertaData = pesertaList.find((p) => p.id === selectedPeserta);
      const reguName = pesertaData ? pesertaData.nama_regu : "—";
      const lombaData = lombaList.find((l) => l.id === selectedLombaId);
      const lombaName = lombaData ? lombaData.nama_lomba : "Pos";

      setPesan({ type: "success", text: `Skor ${nilai} berhasil disimpan untuk Pos ${lombaName}!` });
      setShowSuccess(true);

      // Add to history
      setRiwayat((prev) => [{
        id: Date.now(),
        regu: reguName,
        pos: lombaName,
        nilai: Number(nilai),
        time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      }, ...prev].slice(0, 10));

      setNilai(0);
      setSelectedPeserta("");

      setTimeout(() => setShowSuccess(false), 1500);
    }
    setSaving(false);
    setTimeout(() => setPesan({ type: "", text: "" }), 4000);
  };

  // Stepper controls
  const stepDown = (amount) => setNilai((prev) => Math.max(0, prev - amount));
  const stepUp = (amount) => setNilai((prev) => Math.min(100, prev + amount));

  // Locking checks
  const isLockedPos = juri?.assigned_lomba_id != null;
  const isLockedGender = juri?.assigned_gender != null && juri?.assigned_gender !== 'SEMUA';
  const filteredLomba = isLockedPos 
    ? lombaList.filter((l) => l.id === juri.assigned_lomba_id)
    : lombaList.filter((l) => l.kategori === selectedKategori);

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
      {!isOnline && (
        <div className="offline-banner">
          ⚠️ KONEKSI TERPUTUS — Nilai tidak dapat dikirim. Data form tetap aman.
        </div>
      )}

      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-emerald-500/10 backdrop-blur-sm pointer-events-none">
          <div className="bg-emerald-500 text-white rounded-2xl p-8 shadow-[0_0_60px_rgba(16,185,129,0.5)]">
            <div className="flex items-center gap-3">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-xl font-black tracking-wider">TERSIMPAN!</span>
            </div>
          </div>
        </div>
      )}

      {/* Navbar */}
      <nav className="sticky top-0 z-40 border-b border-slate-800/50" style={{
        backgroundImage: "url('/header_banner.png')",
        backgroundSize: "100% 100%",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat"
      }}>
        <div className="max-w-4xl mx-auto flex justify-between items-center px-4 md:px-8 py-3.5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div>
              <h1 className="text-sm md:text-base font-black tracking-wider text-white">
                PANEL <span className="text-emerald-400">JURI</span>
              </h1>
              <p className="text-[0.65rem] text-slate-500 tracking-wider uppercase">
                {juri?.nama_lengkap}
              </p>
            </div>
          </div>
          <button onClick={async () => { await supabase.auth.signOut(); router.push("/login"); }} className="text-[0.65rem] font-bold tracking-wider bg-red-500/10 text-red-400 px-4 py-2 rounded-lg hover:bg-red-500 hover:text-white transition-all">
            LOGOUT
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 md:px-8 py-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-4">
          <div className="glass-card p-5">
            <h2 className="text-[0.65rem] font-black text-slate-500 mb-4 uppercase tracking-[0.15em]">
              Konfigurasi Penugasan
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-[0.65rem] mb-1.5 text-slate-500 font-bold tracking-wider uppercase">
                  Pos Cabang Lomba {isLockedPos && <span className="text-amber-400 ml-1">🔒 TERKUNCI</span>}
                </label>
                <select
                  value={selectedLombaId}
                  onChange={(e) => setSelectedLombaId(e.target.value)}
                  disabled={isLockedPos}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-emerald-400 font-bold text-sm focus:ring-1 focus:ring-emerald-500 outline-none"
                >
                  {filteredLomba.length === 0 ? (
                    <option value="">— Belum ada Cabang Lomba —</option>
                  ) : (
                    filteredLomba.map((l) => (
                      <option key={l.id} value={l.id}>{l.nama_lomba}</option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block text-[0.65rem] mb-1.5 text-slate-500 font-bold tracking-wider uppercase">
                  Tingkat Sekolah {juri?.assigned_kategori != null && <span className="text-amber-400 ml-1">🔒 TERKUNCI</span>}
                </label>
                <select
                  value={selectedKategori}
                  onChange={(e) => { setSelectedKategori(e.target.value); setSelectedPeserta(""); }}
                  disabled={juri?.assigned_kategori != null}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-white text-sm focus:ring-1 focus:ring-emerald-500 outline-none"
                >
                  <option value="SD">Tingkat SD / MI</option>
                  <option value="SMP">Tingkat SMP / MTs</option>
                  <option value="SMK">Tingkat SMA / SMK / MA</option>
                </select>
              </div>

              <div>
                <label className="block text-[0.65rem] mb-1.5 text-slate-500 font-bold tracking-wider uppercase">
                  Kategori Gender {isLockedGender && <span className="text-amber-400 ml-1">🔒 TERKUNCI</span>}
                </label>
                <select
                  value={selectedGender}
                  onChange={(e) => { setSelectedGender(e.target.value); setSelectedPeserta(""); }}
                  disabled={isLockedGender}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-white text-sm focus:ring-1 focus:ring-emerald-500 outline-none"
                >
                  <option value="Laki-laki">Laki-laki (Putra)</option>
                  <option value="Perempuan">Perempuan (Putri)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="glass-card p-5">
            <h2 className="text-[0.65rem] font-black text-slate-500 mb-3 uppercase tracking-[0.15em]">
              Riwayat Input Terakhir
            </h2>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {riwayat.length === 0 ? (
                <p className="text-xs text-slate-600 italic">Belum ada riwayat...</p>
              ) : (
                riwayat.map((r) => (
                  <div key={r.id} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-800/30 last:border-0">
                    <div>
                      <div className="text-white font-bold">{r.regu}</div>
                      <div className="text-slate-500">{r.pos} • {r.time}</div>
                    </div>
                    <span className="text-emerald-400 font-black text-lg">{r.nilai}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="glass-card p-6 md:p-8 relative overflow-hidden shadow-[0_0_60px_rgba(16,185,129,0.05)]">
            <h2 className="text-xl md:text-2xl font-black text-white mb-6 flex items-center gap-2">
              <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Form Input Nilai
            </h2>

            {pesan.text && (
              <div className={`p-4 rounded-xl mb-6 text-sm font-bold border flex items-center gap-2 ${pesan.type === "error" ? "bg-red-500/10 border-red-500/30 text-red-400" : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"}`}>
                {pesan.text}
              </div>
            )}

            <form onSubmit={handleSimpanNilai} className="space-y-6">
              <div>
                <label className="block text-[0.7rem] font-black text-slate-500 mb-2 uppercase tracking-[0.15em]">
                  Regu Peserta
                </label>
                <select
                  value={selectedPeserta}
                  onChange={(e) => setSelectedPeserta(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-base text-white focus:ring-2 focus:ring-emerald-500/30 outline-none"
                >
                  <option value="">— Pilih Regu yang Sedang Tampil —</option>
                  {pesertaList
                    .filter((p) => p.kategori === selectedKategori && p.gender === selectedGender)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        No. {p.nomor_dada} — {p.nama_regu} ({p.pangkalan}) [{p.gender === 'Laki-laki' ? 'Putra' : 'Putri'}]
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-[0.7rem] font-black text-slate-500 mb-3 uppercase tracking-[0.15em]">
                  Total Skor Mutlak (0 – 100)
                </label>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => stepDown(5)} className="stepper-btn w-14 h-14 md:w-16 md:h-16 bg-slate-800 text-white text-xl">-5</button>
                  <button type="button" onClick={() => stepDown(1)} className="stepper-btn w-12 h-12 md:w-14 md:h-14 bg-slate-800/70 text-slate-300 text-lg">-1</button>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={nilai}
                    onChange={(e) => setNilai(Math.min(100, Math.max(0, Number(e.target.value))))}
                    className="flex-1 bg-slate-950/80 border-2 border-slate-800 rounded-2xl p-4 text-center text-4xl md:text-5xl font-black text-emerald-400 focus:border-emerald-500 outline-none"
                  />
                  <button type="button" onClick={() => stepUp(1)} className="stepper-btn w-12 h-12 md:w-14 md:h-14 bg-slate-800/70 text-slate-300 text-lg">+1</button>
                  <button type="button" onClick={() => stepUp(5)} className="stepper-btn w-14 h-14 md:w-16 md:h-16 bg-slate-800 text-white text-xl">+5</button>
                </div>
                <div className="mt-3 w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-300" style={{ width: `${nilai}%` }} />
                </div>
              </div>

              <button
                type="submit"
                disabled={saving || !isOnline}
                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-black py-5 px-6 rounded-xl transition-all duration-300 shadow-[0_10px_30px_rgba(16,185,129,0.25)] disabled:opacity-40"
              >
                {saving ? "MENYIMPAN DATA..." : "KUNCI NILAI & KIRIM KE SERVER"}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}