"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useOnlineStatus } from "@/lib/useOnlineStatus";

// Official LT-II Kwartir Ranting Mekar Baru 2026 Competition Definitions & Rubrics
export const OFFICIAL_LOMBA_DEFINITIONS = [
  {
    kode: "HMN",
    nama_lomba: "Menyanyi Hymne & Mars Tangerang",
    kategori_kelompok: "Mental Spiritual & Patriotisme",
    rules: {
      SD: "8 Orang/Regu. Menyanyikan lagu Hymne Pramuka dan Mars Kabupaten Tangerang. Pakaian Seragam Pramuka Lengkap.",
      SMP: "8 Orang/Regu. Menyanyikan lagu Hymne Pramuka dan Mars Kabupaten Tangerang. Pakaian Seragam Pramuka Lengkap.",
    },
    rubrik: [
      { id: "vokal", name: "Vokal (5-40)", min: 5, max: 40, weight: 40, hint: "Kejelasan artikulasi, intonasi" },
      { id: "teknik", name: "Teknik (5-20)", min: 5, max: 20, weight: 20, hint: "Pernapasan, tempo, & ritme" },
      { id: "ekspresi", name: "Ekspresi (5-20)", min: 5, max: 20, weight: 20, hint: "Penjiwaan & pendalaman lagu" },
      { id: "penampilan", name: "Penampilan (5-20)", min: 5, max: 20, weight: 20, hint: "Kerapihan seragam & keserasian" },
    ],
  },
  {
    kode: "TSB",
    nama_lomba: "Pentas Seni Budaya (Tari Kreasi)",
    kategori_kelompok: "Mental Spiritual & Patriotisme",
    rules: {
      SD: "Menampilkan Tarian Nusantara Propinsi. Menyiapkan & mengonfirmasi file musik saat registrasi.",
      SMP: "Menampilkan Tarian Nusantara Propinsi. Menyiapkan & mengonfirmasi file musik saat registrasi.",
    },
    rubrik: [
      { id: "wiraga", name: "Wiraga (5-20)", min: 5, max: 20, weight: 20, hint: "Keluwesan & ketepatan gerak tari" },
      { id: "wirama", name: "Wirama (5-20)", min: 5, max: 20, weight: 20, hint: "Kesesuaian gerak dengan tempo irama" },
      { id: "wirasa", name: "Wirasa (5-20)", min: 5, max: 20, weight: 20, hint: "Ekspresi & penjiwaan karakter" },
      { id: "wirupa", name: "Wirupa (5-20)", min: 5, max: 20, weight: 20, hint: "Kesesuaian kostum & rias" },
      { id: "kreativitas", name: "Kreativitas (5-20)", min: 5, max: 20, weight: 20, hint: "Keunikan Pola lantai & variasi" },
    ],
  },
  {
    kode: "PNR",
    nama_lomba: "Pionering & Tali-Temali",
    kategori_kelompok: "Keterampilan Kepramukaan",
    rules: {
      SD: "4 orang/Regu. Membuat tiang bendera 10 tongkat TANPA PASAK. Waktu maksimal 15 Menit.",
      SMP: "4 orang/Regu. Membuat Pionering dari 3 model pilihan panitia (diumumkan saat TM). Waktu maksimal 30 Menit.",
    },
    rubrik: [
      { id: "simpul", name: "Ketepatan Simpul (5-25)", min: 5, max: 25, weight: 25, hint: "Kebenaran ikatan pangkal, jangkar" },
      { id: "kekuatan", name: "Kekuatan (5-30)", min: 5, max: 30, weight: 30, hint: "Kekokohan & kestabilan bangunan" },
      { id: "kerapihan", name: "Kerapihan (5-25)", min: 5, max: 25, weight: 25, hint: "Kerapihan gulungan & simpul akhir" },
      { id: "kreativitas", name: "Kreativitas (5-20)", min: 5, max: 20, weight: 20, hint: "Kreativitas & keserasian proporsi" },
    ],
  },
  {
    kode: "PGD",
    nama_lomba: "PPPK / PPGD",
    kategori_kelompok: "Keterampilan Kepramukaan",
    rules: {
      SD: "3 orang/Regu (1 korban, 2 penolong). Penanganan Korban Kecelakaan TANPA membuat tandu darurat.",
      SMP: "5 orang/Regu (1 korban, 2 penolong, 2 pembuat tandu). Penanganan korban + Tandu darurat + Laporan kejadian.",
    },
    rubrik: [
      { id: "simpul", name: "Ketepatan Simpul (5-25)", min: 5, max: 25, weight: 25, hint: "Ketepatan ikatan mitela & balutan" },
      { id: "kekuatan", name: "Kekuatan (5-20)", min: 5, max: 20, weight: 20, hint: "Kekuatan fisik tandu & ketenangan" },
      { id: "kerapihan", name: "Kerapihan (5-25)", min: 5, max: 25, weight: 25, hint: "Kerapihan & kebersihan balutan" },
      { id: "pembidaian", name: "Pembidaian (5-30)", min: 5, max: 30, weight: 30, hint: "Ketepatan posisi bidai patah tulang" },
    ],
  },
  {
    kode: "SND",
    nama_lomba: "Sandi-Sandi",
    kategori_kelompok: "Keterampilan Kepramukaan",
    rules: {
      SD: "2 orang/Regu. Memecahkan 3 soal sandi (Kotak 2, A-N, Angka). Waktu maksimal 15 Menit.",
      SMP: "2 orang/Regu. Memecahkan 3 soal sandi (Kimia, A-Z, Jam). Waktu maksimal 15 Menit.",
    },
    rubrik: [
      { id: "ketepatan", name: "Ketepatan Jawaban", min: 0, max: 70, weight: 70, hint: "Kebenaran terjemahan sandi" },
      { id: "kecepatan", name: "Kecepatan Waktu", min: 0, max: 30, weight: 30, hint: "Bonus kecepatan penyelesaian" },
    ],
  },
  {
    kode: "NAV",
    nama_lomba: "Orienteering Navigasi",
    kategori_kelompok: "Keterampilan Kepramukaan",
    rules: {
      SD: "2 orang/Regu. Mengerjakan tugas dengan titik kontrol/sudut yang diberikan Panitia (Kartu Kontrol).",
      SMP: "2 orang/Regu. Menggunakan Peta & Kartu Kontrol dari Panitia untuk mencari titik kontrol/sudut.",
    },
    rubrik: [
      { id: "ketepatan", name: "Ketepatan Jawaban", min: 0, max: 70, weight: 70, hint: "Akurasi plot sudut azimuth" },
      { id: "kecepatan", name: "Kecepatan Waktu", min: 0, max: 30, weight: 30, hint: "Waktu tempuh di lapangan" },
    ],
  },
  {
    kode: "TKS",
    nama_lomba: "Menaksir",
    kategori_kelompok: "Keterampilan Kepramukaan",
    rules: {
      SD: "2 orang/Regu. Memperkirakan ukuran TINGGI benda dari panitia. Toleransi 10 cm. Waktu 15 Menit.",
      SMP: "2 orang/Regu. Memperkirakan ukuran LEBAR benda dari panitia. Toleransi 10 cm. Waktu 15 Menit.",
    },
    rubrik: [
      { id: "ketepatan", name: "Ketepatan (Toleransi 10cm)", min: 0, max: 70, weight: 70, hint: "Kebenaran perhitungan rumus" },
      { id: "kecepatan", name: "Kecepatan Waktu", min: 0, max: 30, weight: 30, hint: "Efisiensi pengerjaan" },
    ],
  },
  {
    kode: "SMP",
    nama_lomba: "Semaphore",
    kategori_kelompok: "Keterampilan Kepramukaan",
    rules: {
      SD: "2 orang/Regu. Menjawab soal semaphore jumlah 10 kotak (huruf & angka).",
      SMP: "2 orang/Regu. Menjawab soal semaphore jumlah 15 kotak (huruf & angka).",
    },
    rubrik: [
      { id: "ketepatan", name: "Ketepatan Jawaban", min: 0, max: 70, weight: 70, hint: "Jumlah huruf/angka benar" },
      { id: "kecepatan", name: "Kecepatan Waktu", min: 0, max: 30, weight: 30, hint: "Waktu penyelesaian" },
    ],
  },
  {
    kode: "MRS",
    nama_lomba: "Morse Pluit",
    kategori_kelompok: "Keterampilan Kepramukaan",
    rules: {
      SD: "2 orang/Regu. Menjawab soal sandi Morse bunyi pluit jumlah 10 kotak.",
      SMP: "2 orang/Regu. Menjawab soal sandi Morse bunyi pluit jumlah 25 kotak.",
    },
    rubrik: [
      { id: "ketepatan", name: "Ketepatan Jawaban", min: 0, max: 70, weight: 70, hint: "Kode Morse benar" },
      { id: "kecepatan", name: "Kecepatan Waktu", min: 0, max: 30, weight: 30, hint: "Waktu penyerahan" },
    ],
  },
  {
    kode: "KIM",
    nama_lomba: "Obat Tradisional & KIM",
    kategori_kelompok: "Keterampilan Kepramukaan",
    rules: {
      SD: "2 orang/Regu. Mengamati KIM Penglihat 15 Benda & mengenali obat tradisional.",
      SMP: "2 orang/Regu. Mengamati KIM Penglihat 25 Benda & mengenali obat tradisional.",
    },
    rubrik: [
      { id: "ketepatan_kim", name: "Ketepatan KIM", min: 0, max: 40, weight: 40, hint: "Tebak Benda KIM" },
      { id: "presentasi", name: "Ketepatan Presentasi", min: 0, max: 30, weight: 30, hint: "Kelancaran presentasi" },
      { id: "obat_tradisional", name: "Obat Tradisional", min: 0, max: 30, weight: 30, hint: "Mengenali Obat Tradisional" },
    ],
  },
  {
    kode: "KRN",
    nama_lomba: "Karnaval",
    kategori_kelompok: "Keterampilan Kepramukaan",
    rules: {
      SD: "7 orang/Regu. Menggunakan kostum yang telah dibuat di pangkalan masing-masing.",
      SMP: "7 orang/Regu. Menggunakan kostum yang telah dibuat di pangkalan masing-masing.",
    },
    rubrik: [
      { id: "bahan", name: "Komposisi Bahan (5-30)", min: 5, max: 30, weight: 30, hint: "Kreativitas pemanfaatan bahan" },
      { id: "kreativitas", name: "Kreativitas (5-30)", min: 5, max: 30, weight: 30, hint: "Keunikan & estetika bentuk" },
      { id: "kesulitan", name: "Kesulitan (5-20)", min: 5, max: 20, weight: 20, hint: "Kerumitan detail" },
      { id: "kerapihan", name: "Kerapihan (5-20)", min: 5, max: 20, weight: 20, hint: "Peragaan & kekompakan" },
    ],
  },
  {
    kode: "PCK",
    nama_lomba: "Packing Perlengkapan",
    kategori_kelompok: "Keterampilan Kepramukaan",
    rules: {
      SD: "Mengemas ransel & perlengkapan regu dengan rapi, efisien, kedap air, dan seimbang.",
      SMP: "Mengemas ransel & perlengkapan regu dengan rapi, efisien, kedap air, dan seimbang.",
    },
    rubrik: [
      { id: "kerapihan", name: "Kerapihan", min: 0, max: 60, weight: 60, hint: "Kerapihan Packing" },
      { id: "kecepatan", name: "Ketepatan Waktu", min: 0, max: 40, weight: 40, hint: "Kecepatan & Ketepatan Waktu" },
    ],
  },
  {
    kode: "ADM",
    nama_lomba: "Administrasi Regu",
    kategori_kelompok: "Manajemen Regu",
    rules: {
      SD: "Dikumpulkan maks 4 hari sebelum acara. Menggunakan MAP HIJAU. Berisi data anggota, notulen, logbook, iuran, SK LT-I.",
      SMP: "Dikumpulkan maks 4 hari sebelum acara. Menggunakan MAP MERAH. Berisi data anggota, notulen, logbook, iuran, SK LT-I.",
    },
    rubrik: [
      { id: "ketepatan", name: "Ketepatan", min: 0, max: 50, weight: 50, hint: "Ketepatan Berkas" },
      { id: "kelengkapan", name: "Kelengkapan", min: 0, max: 50, weight: 50, hint: "Kelengkapan Berkas" },
    ],
  },
  {
    kode: "FRP",
    nama_lomba: "Forum Penggalang",
    kategori_kelompok: "Manajemen Regu",
    rules: {
      SD: "Musyawarah/Diskusi Penggalang mengenai kepemimpinan regu, evaluasi kegiatan, dan penyampaian gagasan.",
      SMP: "Musyawarah/Diskusi Penggalang mengenai kepemimpinan regu, evaluasi kegiatan, dan penyampaian gagasan.",
    },
    rubrik: [
      { id: "argumen", name: "Kualitas Argumen", min: 0, max: 40, weight: 40, hint: "Bobot usulan" },
      { id: "keaktifan", name: "Keaktifan", min: 0, max: 30, weight: 30, hint: "Partisipasi" },
      { id: "etika", name: "Sikap & Etika", min: 0, max: 30, weight: 30, hint: "Sikap saat forum" },
    ],
  },
  {
    kode: "MSK",
    nama_lomba: "Masak Nusantara",
    kategori_kelompok: "Keterampilan Teknologi",
    rules: {
      SD: "2 orang/Regu. Membuat NASI GORENG. Dilarang membawa catatan resep.",
      SMP: "2 orang/Regu. Memasak Masakan Nusantara Lengkap (Nasi, Lauk Pauk, Sayur). DILARANG BUMBU INSTAN (Hanya sasa, garam, royco/masako).",
    },
    rubrik: [
      { id: "rasa", name: "Cita Rasa", min: 5, max: 30, weight: 30, hint: "Kelezatan" },
      { id: "penampilan", name: "Penampilan/Tekstur", min: 5, max: 30, weight: 30, hint: "Platting & Tekstur" },
      { id: "kekompakan", name: "Kekompakan Tim", min: 5, max: 20, weight: 20, hint: "Kerjasama Tim" },
      { id: "kreativitas", name: "Kreativitas", min: 5, max: 20, weight: 20, hint: "Inovasi Masakan" },
    ],
  },
];


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
  
  // Rubrik & Nilai Breakdown State
  const [rubrikScores, setRubrikScores] = useState({});
  const [manualOverrideTotal, setManualOverrideTotal] = useState(null);
  const [catatanJuri, setCatatanJuri] = useState("");

  // State UI
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pesan, setPesan] = useState({ type: "", text: "" });
  const [showSuccess, setShowSuccess] = useState(false);
  const [riwayat, setRiwayat] = useState([]);

  useEffect(() => {
    cekAuthDanAmbilData();
  }, []);

  // Selected Lomba Object & Rubric Definition
  const currentLombaObj = useMemo(() => {
    if (!selectedLombaId) return null;
    return lombaList.find((l) => l.id === selectedLombaId) || null;
  }, [selectedLombaId, lombaList]);

  const currentLombaDef = useMemo(() => {
    if (!currentLombaObj) return OFFICIAL_LOMBA_DEFINITIONS[0];
    const match = OFFICIAL_LOMBA_DEFINITIONS.find(
      (d) => d.kode === currentLombaObj.kode_lomba || currentLombaObj.nama_lomba.toLowerCase().includes(d.nama_lomba.toLowerCase())
    );
    return match || OFFICIAL_LOMBA_DEFINITIONS[0];
  }, [currentLombaObj]);

  // Initialize Rubrik Scores when Lomba Changes
  useEffect(() => {
    if (currentLombaDef) {
      const initialRubrik = {};
      currentLombaDef.rubrik.forEach((r) => {
        initialRubrik[r.id] = Math.round(r.weight * 0.7); // default ~70% score
      });
      setRubrikScores(initialRubrik);
      setManualOverrideTotal(null);
    }
  }, [currentLombaDef]);

  // Calculate Total Score dynamically from Rubrik Breakdown
  const totalScoreCalculated = useMemo(() => {
    if (manualOverrideTotal !== null) return manualOverrideTotal;
    if (!currentLombaDef) return 0;
    
    let sum = 0;
    currentLombaDef.rubrik.forEach((r) => {
      sum += Number(rubrikScores[r.id] || 0);
    });
    return Math.min(100, Math.max(0, sum));
  }, [rubrikScores, manualOverrideTotal, currentLombaDef]);

  // Update default selected lomba when kategori changes
  useEffect(() => {
    if (juri && !juri.assigned_lomba_id && lombaList.length > 0) {
      const matching = lombaList.find((l) => l.kategori === selectedKategori);
      if (matching) setSelectedLombaId(matching.id);
      else setSelectedLombaId(lombaList[0]?.id || "");
    }
  }, [selectedKategori, lombaList, juri]);

  const cekAuthDanAmbilData = async () => {
    let userId = null;
    try {
      const cached = JSON.parse(sessionStorage.getItem("_profile_cache") || "null");
      if (cached && cached.role === "juri" && (Date.now() - cached.ts) < 30000) {
        sessionStorage.removeItem("_profile_cache");
        userId = cached.id;
      }
    } catch (_) { /* ignore */ }

    if (!userId) {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }
      userId = session.user.id;
    }

    const [profileRes, lombaRes, pesertaRes] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, nama_lengkap, role, assigned_lomba_id, assigned_kategori, assigned_gender, lomba(nama_lomba, kode_lomba)")
        .eq("id", userId)
        .single(),
      supabase
        .from("lomba")
        .select("id, nama_lomba, kode_lomba, kategori")
        .order("nama_lomba", { ascending: true }),
      supabase
        .from("peserta")
        .select("id, nomor_dada, nama_regu, pangkalan, kategori, gender")
        .eq("is_verified", true)
        .order("nomor_dada", { ascending: true }),
    ]);

    const profile = profileRes.data;
    if (profile?.role !== "juri") {
      router.push("/dashboard/admin");
      return;
    }
    setJuri(profile);

    let loadedLomba = lombaRes.data || [];
    // If DB has no lomba records yet, build virtual lomba list from definitions
    if (loadedLomba.length === 0) {
      loadedLomba = OFFICIAL_LOMBA_DEFINITIONS.flatMap((def) => [
        { id: `def-sd-${def.kode}`, nama_lomba: def.nama_lomba, kode_lomba: def.kode, kategori: "SD" },
        { id: `def-smp-${def.kode}`, nama_lomba: def.nama_lomba, kode_lomba: def.kode, kategori: "SMP" },
      ]);
    }

    setLombaList(loadedLomba);
    if (profile.assigned_lomba_id) {
      setSelectedLombaId(profile.assigned_lomba_id);
    } else if (loadedLomba.length > 0) {
      const matching = loadedLomba.find((l) => l.kategori === (profile.assigned_kategori || "SD"));
      setSelectedLombaId(matching ? matching.id : loadedLomba[0].id);
    }

    if (profile.assigned_kategori) setSelectedKategori(profile.assigned_kategori);
    if (profile.assigned_gender && profile.assigned_gender !== "SEMUA") {
      setSelectedGender(profile.assigned_gender);
    }

    if (pesertaRes.data) setPesertaList(pesertaRes.data);
    setLoading(false);
  };

  const handleRubrikChange = (rubrikId, value, maxVal) => {
    const num = Math.min(maxVal, Math.max(0, Number(value)));
    setRubrikScores((prev) => ({
      ...prev,
      [rubrikId]: num,
    }));
    setManualOverrideTotal(null); // Clear override when adjusting rubriks
  };

  const handleSimpanNilai = async (e) => {
    e.preventDefault();
    if (!selectedPeserta) {
      setPesan({ type: "error", text: "Harap pilih regu peserta terlebih dahulu!" });
      return;
    }
    if (!selectedLombaId) {
      setPesan({ type: "error", text: "Cabang lomba belum dipilih / tidak valid." });
      return;
    }
    if (!isOnline) {
      setPesan({ type: "error", text: "Koneksi internet terputus! Nilai tidak dapat dikirim." });
      return;
    }

    setSaving(true);
    setPesan({ type: "", text: "" });

    const finalScore = Number(totalScoreCalculated);

    // If using simulated/fallback ID that is not yet real UUID in DB
    let targetLombaId = selectedLombaId;
    if (String(selectedLombaId).startsWith("def-") || String(selectedLombaId).startsWith("fallback-")) {
      const lombaDef = lombaList.find((l) => l.id === selectedLombaId) || currentLombaObj;
      if (lombaDef) {
        const { data: insertedLomba } = await supabase
          .from("lomba")
          .upsert(
            { nama_lomba: lombaDef.nama_lomba, kode_lomba: lombaDef.kode_lomba || "LMB", kategori: lombaDef.kategori || selectedKategori },
            { onConflict: "nama_lomba, kategori" }
          )
          .select("id")
          .single();
        if (insertedLomba) targetLombaId = insertedLomba.id;
      }
    }


    // Upsert score in Supabase
    const { error } = await supabase
      .from("penilaian")
      .upsert({
        peserta_id: selectedPeserta,
        juri_id: juri.id,
        lomba_id: targetLombaId,
        nilai: finalScore,
      }, { onConflict: "peserta_id, juri_id, lomba_id" });

    if (error) {
      setPesan({ type: "error", text: "Gagal menyimpan nilai: " + error.message });
    } else {
      const pesertaData = pesertaList.find((p) => p.id === selectedPeserta);
      const reguName = pesertaData ? pesertaData.nama_regu : "Regu";
      const lombaName = currentLombaDef ? currentLombaDef.nama_lomba : "Pos Lomba";

      setPesan({ type: "success", text: `Skor ${finalScore} berhasil dikunci untuk ${reguName} (${lombaName})!` });
      setShowSuccess(true);

      // Add to history
      setRiwayat((prev) => [{
        id: Date.now(),
        regu: reguName,
        pos: lombaName,
        nilai: finalScore,
        time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      }, ...prev].slice(0, 10));

      setSelectedPeserta("");
      setCatatanJuri("");
      setManualOverrideTotal(null);

      setTimeout(() => setShowSuccess(false), 1600);
    }
    setSaving(false);
    setTimeout(() => setPesan({ type: "", text: "" }), 4500);
  };

  // Stepper controls for overall score override
  const stepDown = (amount) => setManualOverrideTotal((prev) => Math.max(0, (prev ?? totalScoreCalculated) - amount));
  const stepUp = (amount) => setManualOverrideTotal((prev) => Math.min(100, (prev ?? totalScoreCalculated) + amount));

  // Locking checks
  const isLockedPos = juri?.assigned_lomba_id != null;
  const isLockedGender = juri?.assigned_gender != null && juri?.assigned_gender !== 'SEMUA';
  const filteredLomba = isLockedPos 
    ? lombaList.filter((l) => l.id === juri.assigned_lomba_id)
    : lombaList.filter((l) => l.kategori === selectedKategori);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-200 font-sans relative overflow-hidden" style={{
        backgroundImage: "linear-gradient(135deg, rgba(3, 7, 18, 0.96) 0%, rgba(15, 23, 42, 0.98) 100%), url('/scout_event_live.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}>
        <div className="text-center space-y-4">
          <div className="w-14 h-14 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mx-auto shadow-[0_0_20px_rgba(245,166,35,0.3)]" />
          <p className="text-xs font-bold text-amber-400 uppercase tracking-widest animate-pulse">Memuat Panel Penilaian Juri...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-slate-200 font-sans relative overflow-x-hidden bg-slate-950" style={{
      backgroundImage: "linear-gradient(135deg, rgba(3, 7, 18, 0.95) 0%, rgba(15, 23, 42, 0.97) 100%), url('/scout_event_live.png')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundAttachment: "fixed",
    }}>
      {/* Background ambient lighting effects */}
      <div className="fixed top-[-10%] left-[-5%] w-[450px] h-[450px] bg-amber-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-5%] w-[450px] h-[450px] bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none" />

      {!isOnline && (
        <div className="offline-banner sticky top-0 z-50">
          ⚠️ KONEKSI TERPUTUS — Nilai tidak dapat dikirim ke server. Form tetap dapat diisi.
        </div>
      )}

      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md pointer-events-none animate-in fade-in duration-200">
          <div className="bg-slate-900/95 border-2 border-emerald-500 text-white rounded-3xl p-8 md:p-10 shadow-[0_0_80px_rgba(16,185,129,0.35)] text-center space-y-3 max-w-md mx-4">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-2 border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-black tracking-wider text-emerald-400 uppercase">NILAI TERKUNCI & TERSIMPAN!</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Data penilaian berhasil disinkronkan secara real-time ke Live Leaderboard.
            </p>
          </div>
        </div>
      )}

      {/* Modern Glassmorphism Navbar */}
      <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-xl border-b border-amber-500/20 shadow-2xl transition-all">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
          
          {/* Brand & Logos */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <img src="/logo_wosm.png" alt="WOSM" className="h-9 md:h-10 w-auto object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]" />
              <img src="/logo_kwarran_mekarbaru.png" alt="Kwarran Mekar Baru" className="h-9 md:h-10 w-auto object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]" />
              <img src="/logo_lt2.png" alt="LT-II 2026" className="h-9 md:h-10 w-auto object-contain drop-shadow-[0_0_10px_rgba(245,166,35,0.5)]" />
              <img src="/logo_65.png" alt="HUT 65 Pramuka" className="h-9 md:h-10 w-auto object-contain drop-shadow-[0_0_10px_rgba(245,166,35,0.5)]" />
            </div>
            
            <div className="border-l border-slate-800 pl-3">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-[0.6rem] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                  LT-II MEKAR BARU 2026
                </span>
                <span className="text-[0.6rem] text-slate-400 font-medium hidden sm:inline">25-27 SEP 2026</span>
              </div>
              <h1 className="text-xs md:text-sm font-black tracking-wide text-white uppercase mt-0.5">
                PANEL PENILAIAN <span className="text-amber-400">DEWAN JURI</span>
              </h1>
            </div>
          </div>

          {/* Juri Profile Pill & Actions */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs">
              <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-black text-[0.65rem] border border-amber-500/30">
                ⚖️
              </div>
              <div>
                <div className="text-[0.65rem] text-slate-400 uppercase leading-none">Dewan Juri</div>
                <div className="font-bold text-white text-xs leading-tight">{juri?.nama_lengkap || "Dewan Juri"}</div>
              </div>
            </div>

            <button
              onClick={async () => { await supabase.auth.signOut(); router.push("/login"); }}
              className="text-xs font-bold bg-red-500/10 hover:bg-red-500 border border-red-500/20 hover:border-red-500 text-red-400 hover:text-white px-3.5 py-1.5 rounded-xl transition-all duration-200 flex items-center gap-1.5 shadow-sm"
              title="Keluar dari panel juri"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>LOGOUT</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Scoring Workspace */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-5">
        
        {/* Top Active Task Strip */}
        <div className="bg-slate-900/70 border border-amber-500/20 rounded-2xl p-3.5 mb-5 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="text-slate-400 font-bold uppercase text-[0.65rem] tracking-wider">Penugasan Saat Ini:</span>
            <span className="bg-amber-500/15 border border-amber-500/30 text-amber-300 font-black px-2.5 py-1 rounded-lg">
              🏆 {currentLombaDef?.nama_lomba || "Pos Lomba"}
            </span>
            <span className="bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-bold px-2.5 py-1 rounded-lg">
              🏫 {selectedKategori === "SD" ? "SD / MI" : "SMP / MTs"}
            </span>
            <span className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold px-2.5 py-1 rounded-lg">
              {selectedGender === "Laki-laki" ? "👦 Putra (Laki-laki)" : "👧 Putri (Perempuan)"}
            </span>
          </div>

          <div className="text-[0.68rem] text-slate-400 italic hidden md:block">
            "Satyaku Kudarmakan Darmaku Kubaktikan"
          </div>
        </div>

        {/* Content Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          {/* Kolom Kiri: Pengaturan & JUKLAK (Col 4) */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* Card Aturan JUKLAK */}
            {currentLombaDef && (
              <div className="bg-slate-900/80 border border-cyan-500/25 rounded-2xl p-4 shadow-lg backdrop-blur-md relative overflow-hidden">
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-[0.65rem] font-black rounded uppercase">
                      {currentLombaDef.kode}
                    </span>
                    <span className="text-[0.68rem] text-slate-400 font-bold uppercase tracking-wider">
                      {currentLombaDef.kategori_kelompok}
                    </span>
                  </div>
                  <span className="text-[0.65rem] text-cyan-400 font-bold bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
                    SOP JUKLAK
                  </span>
                </div>

                <h3 className="text-sm font-black text-white mb-2 flex items-center gap-1.5">
                  <span>📖</span> {currentLombaDef.nama_lomba}
                </h3>

                <div className="bg-slate-950/90 border border-slate-800/80 p-3 rounded-xl text-xs text-slate-300 leading-relaxed space-y-1.5">
                  <p className="font-bold text-amber-400 flex items-center gap-1.5 text-[0.68rem] uppercase tracking-wider">
                    <svg className="w-3.5 h-3.5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Ketentuan Tingkat {selectedKategori}:
                  </p>
                  <p className="text-[0.72rem] text-slate-300">
                    {currentLombaDef.rules[selectedKategori] || currentLombaDef.rules.SD}
                  </p>
                </div>
              </div>
            )}

            {/* Card Pengaturan Filter (Jika Juri memiliki akses multi lomba) */}
            {!isLockedPos && (
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg backdrop-blur-md space-y-3">
                <h3 className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span>⚙️</span> Ganti Pos Lomba / Kategori
                </h3>
                
                <div className="space-y-2.5">
                  <div>
                    <label className="block text-[0.65rem] text-slate-400 font-bold uppercase mb-1">Mata Lomba</label>
                    <select
                      value={selectedLombaId}
                      onChange={(e) => setSelectedLombaId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-amber-300 font-bold text-xs focus:ring-1 focus:ring-amber-500 outline-none"
                    >
                      {filteredLomba.map((l) => (
                        <option key={l.id} value={l.id}>{l.nama_lomba}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[0.65rem] text-slate-400 font-bold uppercase mb-1">Tingkat</label>
                      <select
                        value={selectedKategori}
                        onChange={(e) => { setSelectedKategori(e.target.value); setSelectedPeserta(""); }}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-white text-xs font-bold focus:ring-1 focus:ring-amber-500 outline-none"
                      >
                        <option value="SD">SD / MI</option>
                        <option value="SMP">SMP / MTs</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[0.65rem] text-slate-400 font-bold uppercase mb-1">Gender</label>
                      <select
                        value={selectedGender}
                        onChange={(e) => { setSelectedGender(e.target.value); setSelectedPeserta(""); }}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-white text-xs font-bold focus:ring-1 focus:ring-amber-500 outline-none"
                      >
                        <option value="Laki-laki">👦 PUTRA</option>
                        <option value="Perempuan">👧 PUTRI</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Card Riwayat Sesi Ini */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg backdrop-blur-md">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <span>⏱️</span> Riwayat Sesi Ini
                </h3>
                <span className="text-[0.65rem] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-bold">
                  {riwayat.length} Regu
                </span>
              </div>

              <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                {riwayat.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-2 text-center">Belum ada regu yang dinilai di sesi ini.</p>
                ) : (
                  riwayat.map((r) => (
                    <div key={r.id} className="flex items-center justify-between text-xs p-2.5 bg-slate-950/60 rounded-xl border border-slate-800/60 hover:border-slate-700 transition-colors">
                      <div>
                        <div className="text-white font-bold">{r.regu}</div>
                        <div className="text-[0.62rem] text-slate-400">{r.pos} • {r.time}</div>
                      </div>
                      <span className="text-emerald-400 font-black text-sm bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-lg">
                        {r.nilai}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* Kolom Kanan: Lembar Penilaian Real-Time (Col 8) */}
          <div className="lg:col-span-8">
            <div className="bg-slate-900/85 border border-amber-500/25 rounded-3xl p-5 md:p-7 shadow-2xl backdrop-blur-xl relative overflow-hidden">
              
              {/* Notifikasi Pesan */}
              {pesan.text && (
                <div className={`p-3.5 rounded-xl mb-4 text-xs font-bold border flex items-center gap-2.5 ${pesan.type === "error" ? "bg-red-500/10 border-red-500/30 text-red-400" : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"}`}>
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {pesan.text}
                </div>
              )}

              <form onSubmit={handleSimpanNilai} className="space-y-5">
                
                {/* 1. Pilih Regu Peserta */}
                <div className="bg-slate-950/80 border-2 border-slate-800 focus-within:border-amber-500/70 rounded-2xl p-4 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <span>🎯</span> PILIH REGU PESERTA (YANG SEDANG TAMPIL DI POS)
                    </label>
                    <span className="text-[0.65rem] text-slate-400">
                      Tersedia: {pesertaList.filter((p) => p.kategori === selectedKategori && p.gender === selectedGender).length} Regu
                    </span>
                  </div>

                  <select
                    value={selectedPeserta}
                    onChange={(e) => setSelectedPeserta(e.target.value)}
                    required
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm md:text-base text-white font-bold focus:border-amber-500 outline-none transition-all cursor-pointer"
                  >
                    <option value="">— Ketuk untuk Memilih Regu Peserta —</option>
                    {pesertaList
                      .filter((p) => p.kategori === selectedKategori && p.gender === selectedGender)
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          Kapling {p.nomor_dada ? String(p.nomor_dada).padStart(3, "0") : "—"} : {p.nama_regu} ({p.pangkalan})
                        </option>
                      ))}
                  </select>

                  {selectedPeserta && (
                    <div className="mt-2.5 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        Regu Terpilih Siap Dinilai
                      </span>
                      <span className="text-slate-400 text-[0.68rem]">
                        Pastikan nomor kapling & nama regu sesuai sebelum menyimpan
                      </span>
                    </div>
                  )}
                </div>

                {/* 2. Rubrik Aspek Penilaian */}
                {currentLombaDef && (
                  <div className="space-y-3 pt-1">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <h3 className="text-xs font-black text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                        <span>📊</span> Rubrik Aspek Penilaian (JUKLAK)
                      </h3>
                      <span className="text-[0.65rem] text-slate-400">
                        Geser slider atau masukkan angka langsung
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {currentLombaDef.rubrik.map((r) => {
                        const val = rubrikScores[r.id] ?? Math.round(r.weight * 0.7);
                        return (
                          <div key={r.id} className="bg-slate-950/70 border border-slate-800/90 hover:border-amber-500/40 p-3.5 rounded-2xl space-y-2 transition-all">
                            <div className="flex justify-between items-center">
                              <label className="text-xs font-bold text-white">
                                {r.name}
                              </label>
                              <span className="text-xs font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
                                {val} / {r.max}
                              </span>
                            </div>
                            
                            <p className="text-[0.65rem] text-slate-400 italic line-clamp-1">
                              {r.hint}
                            </p>

                            <div className="flex items-center gap-2.5 pt-1">
                              <input
                                type="range"
                                min={r.min || 0}
                                max={r.max}
                                value={val}
                                onChange={(e) => handleRubrikChange(r.id, e.target.value, r.max)}
                                className="w-full accent-amber-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                              />
                              <input
                                type="number"
                                min={r.min || 0}
                                max={r.max}
                                value={val}
                                onChange={(e) => handleRubrikChange(r.id, e.target.value, r.max)}
                                className="w-14 bg-slate-900 border border-slate-700 rounded-xl py-1 text-center text-xs text-amber-300 font-black focus:border-amber-500 outline-none"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 3. Total Skor & Ringkasan */}
                <div className="bg-gradient-to-br from-slate-950/90 to-amber-950/20 border border-amber-500/30 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-inner">
                  <div className="space-y-1 w-full sm:w-auto">
                    <span className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest block">
                      Total Nilai Terkalkulasi
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl md:text-4xl font-black text-amber-400 drop-shadow-[0_0_12px_rgba(245,166,35,0.4)]">
                        {totalScoreCalculated}
                      </span>
                      <span className="text-xs text-slate-500 font-bold">/ 100 Poin</span>
                    </div>
                    <div className="w-48 bg-slate-800 rounded-full h-2 overflow-hidden mt-1">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-300"
                        style={{ width: `${totalScoreCalculated}%` }}
                      />
                    </div>
                  </div>

                  <div className="w-full sm:flex-1 sm:max-w-xs space-y-1">
                    <label className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-wider block">
                      Catatan Juri (Opsional)
                    </label>
                    <input
                      type="text"
                      placeholder="Catatan pengerjaan regu..."
                      value={catatanJuri}
                      onChange={(e) => setCatatanJuri(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:border-amber-500/60 outline-none"
                    />
                  </div>
                </div>

                {/* 4. Tombol Kunci & Simpan */}
                <button
                  type="submit"
                  disabled={saving || !isOnline || !selectedPeserta}
                  className="w-full bg-gradient-to-r from-amber-500 via-amber-600 to-emerald-600 hover:from-amber-400 hover:to-emerald-500 text-slate-950 font-black py-4 px-6 rounded-2xl transition-all duration-300 shadow-[0_8px_30px_rgba(245,166,35,0.3)] hover:shadow-[0_12px_40px_rgba(245,166,35,0.45)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 tracking-wider text-sm uppercase flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <span className="flex items-center gap-2 text-white">
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      MENYIMPAN & MENYINKRONKAN NILAI...
                    </span>
                  ) : (
                    <>
                      <span>🔒</span>
                      <span>KUNCI NILAI & SIMPAN KE REKAPITULASI</span>
                    </>
                  )}
                </button>

                {!selectedPeserta && (
                  <p className="text-center text-[0.68rem] text-slate-500 italic">
                    * Pilih salah satu Regu Peserta di bagian atas sebelum mengunci nilai.
                  </p>
                )}

              </form>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}