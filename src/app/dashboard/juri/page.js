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
      { id: "vokal", name: "Vokal", min: 5, max: 40, weight: 40, hint: "Kejelasan artikulasi, intonasi, & nada (5-40)" },
      { id: "teknik", name: "Teknik Menyanyi", min: 5, max: 20, weight: 20, hint: "Pernapasan, tempo, & ritme (5-20)" },
      { id: "ekspresi", name: "Pembawaan / Ekspresi", min: 5, max: 20, weight: 20, hint: "Penjiwaan & pendalaman lagu (5-20)" },
      { id: "penampilan", name: "Penampilan", min: 5, max: 20, weight: 20, hint: "Kerapihan seragam & keserasian (5-20)" },
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
      { id: "wiraga", name: "Wiraga (Raga/Gerak)", min: 5, max: 20, weight: 20, hint: "Keluwesan & ketepatan gerak tari (5-20)" },
      { id: "wirama", name: "Wirama (Irama/Musik)", min: 5, max: 20, weight: 20, hint: "Kesesuaian gerak dengan tempo irama (5-20)" },
      { id: "wirasa", name: "Wirasa (Rasa/Penjiwaan)", min: 5, max: 20, weight: 20, hint: "Ekspresi & penjiwaan karakter (5-20)" },
      { id: "wirupa", name: "Wirupa (Rupa/Busana)", min: 5, max: 20, weight: 20, hint: "Kesesuaian kostum & rias (5-20)" },
      { id: "kreativitas", name: "Kreativitas Koreografi", min: 5, max: 20, weight: 20, hint: "Keunikan Pola lantai & variasi (5-20)" },
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
      { id: "simpul", name: "Ketepatan Simpul & Ikatan", min: 5, max: 25, weight: 25, hint: "Kebenaran ikatan pangkal, jangkar, silang (5-25)" },
      { id: "kekuatan", name: "Kekuatan Konstruksi", min: 5, max: 30, weight: 30, hint: "Kekokohan & kestabilan bangunan (5-30)" },
      { id: "kerapihan", name: "Kerapihan Sisa Tali", min: 5, max: 25, weight: 25, hint: "Kerapihan gulungan & simpul akhir (5-25)" },
      { id: "kreativitas", name: "Nilai Kreativitas / Bentuk", min: 5, max: 20, weight: 20, hint: "Kreativitas & keserasian proporsi (5-20)" },
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
      { id: "simpul", name: "Ketepatan Simpul & Ikatan Tandu", min: 5, max: 25, weight: 25, hint: "Ketepatan ikatan mitela & balutan (5-25)" },
      { id: "kekuatan", name: "Kekuatan Tandu / Penanganan", min: 5, max: 20, weight: 20, hint: "Kekuatan fisik tandu & ketenangan (5-20)" },
      { id: "kerapihan", name: "Kerapihan Balutan & Pemindahan", min: 5, max: 25, weight: 25, hint: "Kerapihan & kebersihan balutan (5-25)" },
      { id: "pembidaian", name: "Pembidaian & Penanganan Korban", min: 5, max: 30, weight: 30, hint: "Ketepatan posisi bidai patah tulang (5-30)" },
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
      { id: "ketepatan", name: "Ketepatan Jawaban", min: 0, max: 70, weight: 70, hint: "Kebenaran terjemahan sandi (0-70)" },
      { id: "kecepatan", name: "Kecepatan Waktu", min: 0, max: 30, weight: 30, hint: "Bonus kecepatan penyelesaian (0-30)" },
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
      { id: "ketepatan", name: "Ketepatan Jawaban & Titik Kontrol", min: 0, max: 70, weight: 70, hint: "Akurasi plot sudut azimuth & lokasi (0-70)" },
      { id: "kecepatan", name: "Kecepatan Waktu Tiba", min: 0, max: 30, weight: 30, hint: "Waktu tempuh di lapangan (0-30)" },
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
      { id: "ketepatan", name: "Ketepatan Jawaban (Rumus & Hasil)", min: 0, max: 70, weight: 70, hint: "Kebenaran perhitungan rumus & toleransi 10cm (0-70)" },
      { id: "kecepatan", name: "Kecepatan Waktu", min: 0, max: 30, weight: 30, hint: "Efisiensi pengerjaan (0-30)" },
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
      { id: "ketepatan", name: "Ketepatan Jawaban Huruf/Angka", min: 0, max: 70, weight: 70, hint: "Jumlah huruf/angka yang benar (0-70)" },
      { id: "kecepatan", name: "Kecepatan Waktu Respon", min: 0, max: 30, weight: 30, hint: "Kecepatan waktu penerimaan (0-30)" },
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
      { id: "ketepatan", name: "Ketepatan Jawaban Kode Morse", min: 0, max: 70, weight: 70, hint: "Kebenaran terjemahan bunyi pluit (0-70)" },
      { id: "kecepatan", name: "Kecepatan Waktu", min: 0, max: 30, weight: 30, hint: "Waktu penyerahan lembar jawab (0-30)" },
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
      { id: "ketepatan", name: "Ketepatan Jawaban Nama Benda", min: 0, max: 70, weight: 70, hint: "Jumlah benda & obat tradisional yang benar (0-70)" },
      { id: "presentasi", name: "Ketepatan Presentasi / Penjelasan", min: 0, max: 30, weight: 30, hint: "Kelancaran & penjelasan manfaat obat (0-30)" },
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
      { id: "bahan", name: "Komposisi Bahan & Daur Ulang", min: 5, max: 30, weight: 30, hint: "Kreativitas pemanfaatan bahan daur ulang/alam (5-30)" },
      { id: "kreativitas", name: "Kreativitas Desain Kostum", min: 5, max: 30, weight: 30, hint: "Keunikan & estetika bentuk kostum (5-30)" },
      { id: "kesulitan", name: "Tingkat Kesulitan Pembuatan", min: 5, max: 20, weight: 20, hint: "Kerumitan detail & kerapihan karya (5-20)" },
      { id: "kerapihan", name: "Kerapihan & Kekompakan Barisan", min: 5, max: 20, weight: 20, hint: "Peragaan & kekompakan saat pawai (5-20)" },
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
      { id: "kelengkapan", name: "Kelengkapan Barang Ransel", min: 0, max: 40, weight: 40, hint: "Kelengkapan perlengkapan wajib perorangan/regu (0-40)" },
      { id: "kerapihan", name: "Kerapihan & Kepadatan Packing", min: 0, max: 30, weight: 30, hint: "Kepadatan bentuk ransel & kerapihan lipatan (0-30)" },
      { id: "keseimbangan", name: "Keseimbangan & Proteksi Kedap Air", min: 0, max: 30, weight: 30, hint: "Keseimbangan beban kiri-kanan & kantong plastik (0-30)" },
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
      { id: "kelengkapan", name: "Kelengkapan Berkas & Map", min: 0, max: 60, weight: 60, hint: "Kesesuaian warna map & kelengkapan isi (0-60)" },
      { id: "ketepatan", name: "Ketepatan & Kerapihan Pembukuan", min: 0, max: 40, weight: 40, hint: "Kerapihan notulen, logbook, & iuran (0-40)" },
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
      { id: "partisipasi", name: "Keaktifan & Partisipasi Regu", min: 0, max: 40, weight: 40, hint: "Keaktifan anggota dalam diskusi (0-40)" },
      { id: "etika", name: "Etika & Ketaatan Tata Tertib", min: 0, max: 30, weight: 30, hint: "Sikap saling menghargai & sopan santun (0-30)" },
      { id: "gagasan", name: "Bobot Gagasan & Solusi", min: 0, max: 30, weight: 30, hint: "Kualitas usulan & pemecahan masalah (0-30)" },
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
      { id: "rasa", name: "Cita Rasa Kuliner", min: 5, max: 30, weight: 30, hint: "Kelezatan, keharmonisan bumbu, & tingkat kematangan (5-30)" },
      { id: "penampilan", name: "Penampilan & Tekstur Platting", min: 5, max: 30, weight: 30, hint: "Keindahan penyajian, warna, & kerapihan piring (5-30)" },
      { id: "kekompakan", name: "Kekompakan & Kebersihan Tim", min: 5, max: 20, weight: 20, hint: "Kerjasama, kebersihan area masak, & Higienitas (5-20)" },
      { id: "kreativitas", name: "Kreativitas Resep & Bahan", min: 5, max: 20, weight: 20, hint: "Inovasi kreasi menu Nusantara (5-20)" },
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
      <div className="min-h-screen flex items-center justify-center pl-[7.3%]" style={{
        backgroundImage: "linear-gradient(135deg, rgba(3, 7, 18, 0.94) 0%, rgba(3, 7, 18, 0.98) 100%), url('/scout_event_live.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}>
        <img src="/sidebar.png" className="fixed left-0 top-0 h-full w-[7.3%] z-30 pointer-events-none" alt="Scout Sidebar" />
        <div className="w-12 h-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen text-slate-200 font-sans pl-[7.3%] relative" style={{
      backgroundImage: "linear-gradient(135deg, rgba(3, 7, 18, 0.94) 0%, rgba(3, 7, 18, 0.98) 100%), url('/scout_event_live.png')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundAttachment: "fixed",
    }}>
      <img src="/sidebar.png" className="fixed left-0 top-0 h-full w-[7.3%] z-30 pointer-events-none" alt="Scout Sidebar" />
      
      {!isOnline && (
        <div className="offline-banner">
          ⚠️ KONEKSI TERPUTUS — Nilai tidak dapat dikirim ke server. Form tetap dapat diisi.
        </div>
      )}

      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-emerald-500/15 backdrop-blur-md pointer-events-none animate-in fade-in duration-200">
          <div className="bg-slate-900 border-2 border-emerald-500 text-white rounded-3xl p-8 md:p-10 shadow-[0_0_80px_rgba(16,185,129,0.4)] text-center space-y-3">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-2">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-black tracking-wider text-emerald-400">NILAI TERLINDUNGI & TERKUNCI!</h3>
            <p className="text-xs text-slate-400 uppercase tracking-widest">Data berhasil disinkronkan ke Supabase Live Leaderboard</p>
          </div>
        </div>
      )}

      {/* Navbar Banner LT-II Mekar Baru 2026 */}
      <nav className="sticky top-0 z-40 border-b border-amber-500/20 shadow-xl" style={{
        backgroundImage: "url('/header_banner.png')",
        backgroundSize: "100% 100%",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat"
      }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center px-4 md:px-8 py-3 gap-3">
          <div className="flex items-center gap-2 md:gap-3">
            <img src="/logo_wosm.png" alt="WOSM" className="h-10 md:h-12 w-auto object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]" />
            <img src="/logo_kwarran_mekarbaru.png" alt="Kwarran Mekar Baru" className="h-10 md:h-12 w-auto object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]" />
            <img src="/logo_lt2.png" alt="LT-II 2026" className="h-10 md:h-12 w-auto object-contain drop-shadow-[0_0_10px_rgba(245,166,35,0.5)]" />
            <img src="/logo_65.png" alt="HUT 65 Pramuka" className="h-10 md:h-12 w-auto object-contain drop-shadow-[0_0_10px_rgba(245,166,35,0.5)]" />
            <div>

              <div className="flex items-center gap-2">
                <span className="bg-amber-500/20 border border-amber-500/40 text-amber-400 text-[0.6rem] px-2 py-0.5 rounded-full font-black tracking-widest uppercase">
                  LT-II MEKAR BARU 2026
                </span>
                <span className="text-[0.65rem] text-slate-400 hidden sm:inline">| 25-27 SEP 2026</span>
              </div>
              <h1 className="text-sm md:text-base font-black tracking-wider text-white uppercase">
                PANEL PENILAIAN <span className="text-amber-400">DEWAN JURI</span>
              </h1>
              <p className="text-[0.65rem] text-slate-400 tracking-wider uppercase">
                Juri: <span className="text-white font-bold">{juri?.nama_lengkap}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <div className="text-right hidden lg:block">
              <p className="text-[0.6rem] font-bold text-amber-300 tracking-wider">
                "SATYAKU KUDARMAKAN DARMAKU KUBAKTIKAN"
              </p>
              <p className="text-[0.58rem] text-slate-400">
                Memantapkan Langkah Organisasi Menuju Indonesia Emas 2045
              </p>
            </div>
            <button
              onClick={async () => { await supabase.auth.signOut(); router.push("/login"); }}
              className="text-[0.65rem] font-black tracking-wider bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-md"
            >
              LOGOUT
            </button>
          </div>
        </div>
      </nav>

      {/* Content Grid */}
      <main className="max-w-6xl mx-auto px-4 md:px-8 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Config & JUKLAK Info */}
        <div className="lg:col-span-4 space-y-5">
          {/* Penugasan Card */}
          <div className="glass-card p-5 border border-amber-500/20 shadow-lg">
            <h2 className="text-[0.7rem] font-black text-amber-400 mb-4 uppercase tracking-[0.15em] flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              </svg>
              Penugasan Juri
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-[0.65rem] mb-1.5 text-slate-400 font-bold tracking-wider uppercase">
                  Mata Lomba {isLockedPos && <span className="text-amber-400 ml-1">🔒 TERKUNCI</span>}
                </label>
                <select
                  value={selectedLombaId}
                  onChange={(e) => setSelectedLombaId(e.target.value)}
                  disabled={isLockedPos}
                  className="w-full bg-slate-950/90 border border-slate-800 rounded-xl p-3 text-amber-300 font-bold text-sm focus:ring-1 focus:ring-amber-500 outline-none"
                >
                  {filteredLomba.map((l) => (
                    <option key={l.id} value={l.id}>{l.nama_lomba}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[0.65rem] mb-1.5 text-slate-400 font-bold tracking-wider uppercase">
                    Tingkatan {juri?.assigned_kategori != null && <span className="text-amber-400 ml-1">🔒</span>}
                  </label>
                  <select
                    value={selectedKategori}
                    onChange={(e) => { setSelectedKategori(e.target.value); setSelectedPeserta(""); }}
                    disabled={juri?.assigned_kategori != null}
                    className="w-full bg-slate-950/90 border border-slate-800 rounded-xl p-3 text-white text-xs font-bold focus:ring-1 focus:ring-amber-500 outline-none"
                  >
                    <option value="SD">SD / MI</option>
                    <option value="SMP">SMP / MTs</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[0.65rem] mb-1.5 text-slate-400 font-bold tracking-wider uppercase">
                    Kategori Regu {isLockedGender && <span className="text-amber-400 ml-1">🔒</span>}
                  </label>
                  <select
                    value={selectedGender}
                    onChange={(e) => { setSelectedGender(e.target.value); setSelectedPeserta(""); }}
                    disabled={isLockedGender}
                    className="w-full bg-slate-950/90 border border-slate-800 rounded-xl p-3 text-white text-xs font-bold focus:ring-1 focus:ring-amber-500 outline-none"
                  >
                    <option value="Laki-laki">👦 PUTRA</option>
                    <option value="Perempuan">👧 PUTRI</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* JUKLAK Rules Card */}
          {currentLombaDef && (
            <div className="glass-card p-5 border border-cyan-500/20 bg-gradient-to-br from-slate-950/80 to-cyan-950/20 shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-[0.6rem] font-black rounded uppercase">
                  {currentLombaDef.kode}
                </span>
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                  {currentLombaDef.kategori_kelompok}
                </span>
              </div>
              <h3 className="text-sm font-black text-white mb-2">
                {currentLombaDef.nama_lomba}
              </h3>
              <div className="bg-slate-950/90 border border-slate-800/80 p-3 rounded-xl text-xs text-slate-300 leading-relaxed space-y-1.5">
                <p className="font-bold text-amber-400 flex items-center gap-1.5 text-[0.68rem] uppercase tracking-wider">
                  <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Aturan JUKLAK ({selectedKategori}):
                </p>
                <p className="text-[0.72rem] text-slate-300">
                  {currentLombaDef.rules[selectedKategori] || currentLombaDef.rules.SD}
                </p>
              </div>
            </div>
          )}

          {/* Riwayat Penilaian Card */}
          <div className="glass-card p-5 border border-slate-800">
            <h2 className="text-[0.65rem] font-black text-slate-400 mb-3 uppercase tracking-[0.15em] flex items-center justify-between">
              <span>Riwayat Sesi Ini</span>
              <span className="text-amber-400">{riwayat.length} Regu</span>
            </h2>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {riwayat.length === 0 ? (
                <p className="text-xs text-slate-600 italic">Belum ada nilai yang dikirim...</p>
              ) : (
                riwayat.map((r) => (
                  <div key={r.id} className="flex items-center justify-between text-xs py-2 px-3 bg-slate-950/50 rounded-xl border border-slate-800/50">
                    <div>
                      <div className="text-white font-bold">{r.regu}</div>
                      <div className="text-[0.65rem] text-slate-400">{r.pos} • {r.time}</div>
                    </div>
                    <span className="text-emerald-400 font-black text-base">{r.nilai}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Scoring Form */}
        <div className="lg:col-span-8">
          <div className="glass-card p-6 md:p-8 relative overflow-hidden border border-amber-500/20 shadow-2xl">
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 mb-6 border-b border-slate-800 gap-2">
              <div>
                <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-2">
                  <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Lembar Penilaian Juri
                </h2>
                <p className="text-xs text-slate-400 uppercase tracking-wider mt-0.5">
                  Pos: <span className="text-amber-300 font-bold">{currentLombaDef?.nama_lomba}</span> ({selectedKategori} {selectedGender === 'Laki-laki' ? 'PUTRA' : 'PUTRI'})
                </p>
              </div>

              {/* Total Score Badge */}
              <div className="bg-gradient-to-br from-amber-500/20 to-emerald-500/20 border border-amber-500/40 rounded-2xl px-5 py-2 text-right">
                <div className="text-[0.6rem] font-bold text-slate-400 uppercase tracking-widest">Total Skor</div>
                <div className="text-3xl font-black text-amber-400 drop-shadow-[0_0_12px_rgba(245,166,35,0.4)]">
                  {totalScoreCalculated} <span className="text-xs text-slate-500 font-normal">/100</span>
                </div>
              </div>
            </div>

            {pesan.text && (
              <div className={`p-4 rounded-xl mb-6 text-xs font-bold border flex items-center gap-2.5 ${pesan.type === "error" ? "bg-red-500/10 border-red-500/30 text-red-400" : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"}`}>
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {pesan.text}
              </div>
            )}

            <form onSubmit={handleSimpanNilai} className="space-y-6">
              
              {/* Select Regu */}
              <div className="space-y-2">
                <label className="block text-[0.7rem] font-black text-slate-400 uppercase tracking-[0.15em]">
                  PILIH REGU PESERTA (YANG SEDANG TAMPIL)
                </label>
                <select
                  value={selectedPeserta}
                  onChange={(e) => setSelectedPeserta(e.target.value)}
                  required
                  className="w-full bg-slate-950/90 border-2 border-slate-800 rounded-xl p-4 text-base text-white font-bold focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 outline-none transition-all"
                >
                  <option value="">— Silakan Pilih Regu Peserta —</option>
                  {pesertaList
                    .filter((p) => p.kategori === selectedKategori && p.gender === selectedGender)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        Kapling {p.nomor_dada ? String(p.nomor_dada).padStart(3, "0") : "—"} — {p.nama_regu} ({p.pangkalan})
                      </option>

                    ))}
                </select>
              </div>

              {/* Dynamic Rubric Scoring Breakdown */}
              {currentLombaDef && (
                <div className="space-y-4 pt-2">
                  <h3 className="text-xs font-black text-slate-300 uppercase tracking-[0.15em] flex items-center justify-between border-b border-slate-800/80 pb-2">
                    <span>Rubrik Aspek Penilaian (JUKLAK)</span>
                    <span className="text-[0.65rem] text-slate-400 font-normal">Geser slider atau atur nilai per aspek</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentLombaDef.rubrik.map((r) => {
                      const val = rubrikScores[r.id] ?? Math.round(r.weight * 0.7);
                      return (
                        <div key={r.id} className="bg-slate-950/70 border border-slate-800/80 p-4 rounded-2xl space-y-2 hover:border-slate-700 transition-colors">
                          <div className="flex justify-between items-center">
                            <label className="text-xs font-bold text-white flex items-center gap-1.5">
                              {r.name}
                            </label>
                            <span className="text-xs font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                              {val} / {r.max}
                            </span>
                          </div>
                          
                          <p className="text-[0.62rem] text-slate-400 italic">
                            {r.hint}
                          </p>

                          <div className="flex items-center gap-2 pt-1">
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
                              className="w-14 bg-slate-900 border border-slate-700 rounded-lg p-1 text-center text-xs text-amber-300 font-bold focus:border-amber-500 outline-none"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Total Score Display */}
              <div className="bg-slate-950/90 border border-amber-500/30 p-5 rounded-2xl space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-[0.7rem] font-black text-amber-300 uppercase tracking-[0.15em]">
                    Total Skor Akhir (Otomatis dari Rubrik)
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={totalScoreCalculated}
                    readOnly
                    className="flex-1 bg-slate-900/50 border-2 border-slate-700 rounded-2xl p-3 text-center text-4xl md:text-5xl font-black text-amber-400 outline-none cursor-not-allowed opacity-80"
                  />
                </div>

                <div className="w-full bg-slate-800/80 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400 transition-all duration-300"
                    style={{ width: `${totalScoreCalculated}%` }}
                  />
                </div>
              </div>

              {/* Optional Catatan Juri */}
              <div className="space-y-1.5">
                <label className="block text-[0.65rem] font-bold text-slate-400 uppercase tracking-wider">
                  Catatan Juri (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Ikatan simpul sangat rapi, waktu pengerjaan 12 menit..."
                  value={catatanJuri}
                  onChange={(e) => setCatatanJuri(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:border-amber-500/50 outline-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={saving || !isOnline || !selectedPeserta}
                className="w-full bg-gradient-to-r from-amber-500 via-amber-600 to-emerald-600 hover:from-amber-400 hover:to-emerald-500 text-white font-black py-5 px-6 rounded-2xl transition-all duration-300 shadow-[0_10px_35px_rgba(245,166,35,0.3)] hover:shadow-[0_14px_45px_rgba(245,166,35,0.4)] disabled:opacity-40 tracking-wider text-base uppercase"
              >
                {saving ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-5 h-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    MENULISKAN SKOR & REKAPITULASI...
                  </span>
                ) : (
                  "🔒 KUNCI NILAI & SYNC REAPITULASI REAL-TIME"
                )}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}