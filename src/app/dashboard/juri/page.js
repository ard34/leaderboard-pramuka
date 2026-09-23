"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useOnlineStatus } from "@/lib/useOnlineStatus";
import { generateExampleTime } from "@/lib/timeUtils";

// Helper untuk mengambil rubrik sesuai tingkat (SD vs SMP)
export function getLombaRubrik(lombaDef, kategori = "SD") {
  if (!lombaDef) return [];
  let rubriks = [];
  if (lombaDef.rubrikByKategori && lombaDef.rubrikByKategori[kategori]) {
    rubriks = [...lombaDef.rubrikByKategori[kategori]];
  } else {
    rubriks = [...(lombaDef.rubrik || [])];
  }
  // Pastikan SEMUA cabang lomba untuk SD/MI & SMP/MTs memiliki kriteria Kecepatan Waktu
  const hasTime = rubriks.some((r) => r.isTime);
  if (!hasTime) {
    rubriks.push({
      id: "waktu",
      name: "Kecepatan Waktu",
      unit: "jam:menit:detik.milidetik",
      isTime: true,
      hint: "Waktu penyelesaian regu format jam:menit:detik.milidetik (penentu peringkat jika nilai ketepatan sama)",
    });
  }
  return rubriks;
}

// Helper untuk mencocokkan objek lomba (dari DB / penugasan) dengan Definisi Rubrik Resmi
export function findOfficialLombaDef(lombaObj) {
  if (!lombaObj) return OFFICIAL_LOMBA_DEFINITIONS[0];
  const objKode = (lombaObj.kode_lomba || lombaObj.kode || "").trim().toUpperCase();
  const objNama = (lombaObj.nama_lomba || "").toLowerCase().trim();

  const match = OFFICIAL_LOMBA_DEFINITIONS.find((d) => {
    const defKode = (d.kode || "").trim().toUpperCase();
    const defNama = (d.nama_lomba || "").toLowerCase().trim();
    return (
      (objKode && defKode && objKode === defKode) ||
      objNama.includes(defNama) ||
      defNama.includes(objNama) ||
      (objNama.includes("pioner") && defKode === "PNR") ||
      (objNama.includes("administrasi") && defKode === "ADM") ||
      (objNama.includes("hymne") && defKode === "HMN") ||
      (objNama.includes("suara") && defKode === "HMN") ||
      (objNama.includes("tari") && defKode === "TSB") ||
      (objNama.includes("seni") && defKode === "TSB") ||
      (objNama.includes("ppgd") && defKode === "PGD") ||
      (objNama.includes("pppk") && defKode === "PGD") ||
      (objNama.includes("sandi") && defKode === "SND") ||
      (objNama.includes("taksir") && defKode === "TKS") ||
      (objNama.includes("semaphore") && defKode === "SMP") ||
      (objNama.includes("morse") && defKode === "MRS") ||
      (objNama.includes("kim") && defKode === "KIM") ||
      (objNama.includes("karnaval") && defKode === "KRN") ||
      (objNama.includes("pack") && defKode === "PCK") ||
      (objNama.includes("forum") && defKode === "FRP") ||
      (objNama.includes("masak") && defKode === "MSK") ||
      (objNama.includes("navigasi") && defKode === "NAV") ||
      (objNama.includes("orienteering") && defKode === "NAV")
    );
  });
  return match || OFFICIAL_LOMBA_DEFINITIONS[0];
}

// Official LT-II Kwartir Ranting Mekar Baru 2026 Competition Definitions & Rubrics
export const OFFICIAL_LOMBA_DEFINITIONS = [
  {
    kode: "HMN",
    nama_lomba: "Lomba Paduan Suara",
    kategori_kelompok: "Mental Spiritual & Patriotisme",
    rules: {
      SD: "8 Orang/Regu. Sesuai Juknis: Menyanyikan lagu Hymne Pramuka dan Mars Kabupaten Tangerang. Pakaian Seragam Pramuka Lengkap.",
      SMP: "8 Orang/Regu. Sesuai Juknis: Menyanyikan lagu Hymne Pramuka dan Mars Kabupaten Tangerang. Pakaian Seragam Pramuka Lengkap.",
    },
    rubrik: [
      { id: "vokal", name: "Vokal (5–40)", min: 5, max: 40, weight: 40, hint: "Kejelasan artikulasi, intonasi & harmoni vokal" },
      { id: "teknik", name: "Teknik Menyanyi (5–20)", min: 5, max: 20, weight: 20, hint: "Pernapasan, tempo, birama & ritme" },
      { id: "ekspresi", name: "Pembawaan / Ekspresi (5–20)", min: 5, max: 20, weight: 20, hint: "Penjiwaan, dinamika, & pendalaman lagu" },
      { id: "penampilan", name: "Penampilan (5–20)", min: 5, max: 20, weight: 20, hint: "Kerapihan seragam & keserasian panggung" },
    ],
  },
  {
    kode: "TSB",
    nama_lomba: "Lomba Tari Nusantara",
    kategori_kelompok: "Mental Spiritual & Patriotisme",
    rules: {
      SD: "Sesuai Juknis: Menampilkan Tarian Nusantara Propinsi. Menyiapkan & mengonfirmasi file musik saat registrasi.",
      SMP: "Sesuai Juknis: Menampilkan Tarian Nusantara Propinsi. Menyiapkan & mengonfirmasi file musik saat registrasi.",
    },
    rubrik: [
      { id: "wiraga", name: "Wiraga (5–20)", min: 5, max: 20, weight: 20, hint: "Keluwesan & ketepatan gerak tari" },
      { id: "wirama", name: "Wirama (5–20)", min: 5, max: 20, weight: 20, hint: "Kesesuaian gerak dengan tempo & irama musik" },
      { id: "wirasa", name: "Wirasa (5–20)", min: 5, max: 20, weight: 20, hint: "Ekspresi wajah & penjiwaan karakter" },
      { id: "wirupa", name: "Wirupa (5–20)", min: 5, max: 20, weight: 20, hint: "Kesesuaian busana daerah & tata rias" },
      { id: "kreativitas", name: "Kreativitas (5–20)", min: 5, max: 20, weight: 20, hint: "Keunikan koreografi & pola lantai" },
    ],
  },
  {
    kode: "PNR",
    nama_lomba: "Lomba Pionering",
    kategori_kelompok: "Keterampilan Kepramukaan",
    rules: {
      SD: "4 orang/Regu. Sesuai Juknis: Membuat tiang bendera 10 tongkat TANPA PASAK. Waktu maksimal 15 Menit.",
      SMP: "4 orang/Regu. Sesuai Juknis: Membuat Pionering dari model pilihan panitia. Waktu maksimal 30 Menit.",
    },
    rubrik: [
      { id: "simpul", name: "Ketepatan Simpul dan Ikatan (5–25)", min: 5, max: 25, weight: 25, hint: "Kebenaran ikatan pangkal, jangkar, palang, & silang" },
      { id: "kekuatan", name: "Kekuatan (5–30)", min: 5, max: 30, weight: 30, hint: "Kekokohan ikatan & kestabilan bangunan" },
      { id: "kerapihan", name: "Kerapihan (5–25)", min: 5, max: 25, weight: 25, hint: "Kerapihan gulungan & kuncian simpul akhir" },
      { id: "kreativitas", name: "Nilai Kreativitas (5–20)", min: 5, max: 20, weight: 20, hint: "Keindahan proporsi & keserasian bangunan" },
    ],
  },
  {
    kode: "PGD",
    nama_lomba: "PPGD",
    kategori_kelompok: "Keterampilan Kepramukaan",
    rules: {
      SD: "3 orang/Regu (1 korban, 2 penolong). Sesuai Juknis: Penanganan Korban Kecelakaan (Pembidaian dan Kerapihan).",
      SMP: "5 orang/Regu (1 korban, 2 penolong, 2 pembuat tandu). Sesuai Juknis: Penanganan korban + Tandu darurat + Laporan kejadian.",
    },
    rubrikByKategori: {
      SD: [
        { id: "pembidaian", name: "Pembidaian", min: 0, max: 50, weight: 50, hint: "Ketepatan penanganan bidai & korban patah tulang" },
        { id: "kerapihan", name: "Kerapihan", min: 0, max: 50, weight: 50, hint: "Kerapihan & kebersihan pembalutan mitela" },
      ],
      SMP: [
        { id: "simpul", name: "Ketepatan Simpul dan Ikatan (5–25)", min: 5, max: 25, weight: 25, hint: "Ketepatan ikatan mitela & simpul tandu darurat" },
        { id: "kekuatan", name: "Kekuatan (5–20)", min: 5, max: 20, weight: 20, hint: "Kekuatan fisik tandu & kestabilan evakuasi korban" },
        { id: "kerapihan", name: "Kerapihan (5–25)", min: 5, max: 25, weight: 25, hint: "Kerapihan & kebersihan balutan luka" },
        { id: "pembidaian", name: "Pembidaian (5–30)", min: 5, max: 30, weight: 30, hint: "Ketepatan posisi bidai patah tulang melingkupi dua sendi" },
      ],
    },
    rubrik: [
      { id: "simpul", name: "Ketepatan Simpul dan Ikatan (5–25)", min: 5, max: 25, weight: 25, hint: "Ketepatan ikatan mitela & balutan" },
      { id: "kekuatan", name: "Kekuatan (5–20)", min: 5, max: 20, weight: 20, hint: "Kekuatan fisik tandu & ketenangan" },
      { id: "kerapihan", name: "Kerapihan (5–25)", min: 5, max: 25, weight: 25, hint: "Kerapihan & kebersihan balutan" },
      { id: "pembidaian", name: "Pembidaian (5–30)", min: 5, max: 30, weight: 30, hint: "Ketepatan posisi bidai patah tulang" },
    ],
  },
  {
    kode: "SND",
    nama_lomba: "Sandi - Sandi",
    kategori_kelompok: "Keterampilan Kepramukaan",
    hasTimeInput: true,
    rules: {
      SD: "2 orang/Regu. Memecahkan 3 soal sandi (Kotak 2, A-N, Angka). Waktu maksimal 15 Menit.",
      SMP: "2 orang/Regu. Memecahkan 3 soal sandi (Kimia, A-Z, Jam). Waktu maksimal 15 Menit.",
    },
    rubrikByKategori: {
      SD: [
        { id: "ketepatan", name: "Ketepatan Jawaban (0–30)", min: 0, max: 30, weight: 30, isScore: true, hint: "Kebenaran terjemahan sandi (Skor 0 - 30)" },
        { id: "waktu", name: "Kecepatan Waktu", unit: "jam:menit:detik.milidetik", isTime: true, hint: "Waktu penyelesaian regu format jam:menit:detik.milidetik" },
      ],
      SMP: [
        { id: "ketepatan", name: "Ketepatan Jawaban (0–30)", min: 0, max: 30, weight: 30, isScore: true, hint: "Kebenaran terjemahan sandi (Skor 0 - 30)" },
        { id: "waktu", name: "Kecepatan Waktu", unit: "jam:menit:detik.milidetik", isTime: true, hint: "Waktu penyelesaian regu format jam:menit:detik.milidetik" },
      ],
    },
    rubrik: [
      { id: "ketepatan", name: "Ketepatan Jawaban (0–30)", min: 0, max: 30, weight: 30, isScore: true, hint: "Kebenaran terjemahan sandi (Skor 0 - 30)" },
      { id: "waktu", name: "Kecepatan Waktu", unit: "jam:menit:detik.milidetik", isTime: true, hint: "Waktu penyelesaian regu format jam:menit:detik.milidetik" },
    ],
  },
  {
    kode: "NAV",
    nama_lomba: "Orienteering Navigasi",
    kategori_kelompok: "Keterampilan Kepramukaan",
    hasTimeInput: true,
    rules: {
      SD: "2 orang/Regu. Mengerjakan tugas dengan titik kontrol/sudut yang diberikan Panitia (Kartu Kontrol).",
      SMP: "2 orang/Regu. Menggunakan Peta & Kartu Kontrol dari Panitia untuk mencari titik kontrol/sudut.",
    },
    rubrikByKategori: {
      SD: [
        { id: "ketepatan", name: "Ketepatan Jawaban (0–40)", min: 0, max: 40, weight: 40, isScore: true, hint: "Akurasi plot sudut azimuth & titik kontrol (Skor 0 - 40)" },
        { id: "waktu", name: "Kecepatan Waktu", unit: "jam:menit:detik.milidetik", isTime: true, hint: "Waktu tempuh di lapangan format jam:menit:detik.milidetik" },
      ],
      SMP: [
        { id: "ketepatan", name: "Ketepatan Jawaban (0–40)", min: 0, max: 40, weight: 40, isScore: true, hint: "Akurasi plot sudut azimuth & titik kontrol (Skor 0 - 40)" },
        { id: "waktu", name: "Kecepatan Waktu", unit: "jam:menit:detik.milidetik", isTime: true, hint: "Waktu tempuh di lapangan format jam:menit:detik.milidetik" },
      ],
    },
    rubrik: [
      { id: "ketepatan", name: "Ketepatan Jawaban (0–40)", min: 0, max: 40, weight: 40, isScore: true, hint: "Akurasi plot sudut azimuth & titik kontrol (Skor 0 - 40)" },
      { id: "waktu", name: "Kecepatan Waktu", unit: "jam:menit:detik.milidetik", isTime: true, hint: "Waktu tempuh di lapangan format jam:menit:detik.milidetik" },
    ],
  },
  {
    kode: "TKS",
    nama_lomba: "Menaksir",
    kategori_kelompok: "Keterampilan Kepramukaan",
    hasTimeInput: true,
    rules: {
      SD: "2 orang/Regu. Memperkirakan ukuran TINGGI benda dari panitia. Toleransi 10 cm. Waktu 15 Menit.",
      SMP: "2 orang/Regu. Memperkirakan ukuran LEBAR benda dari panitia. Toleransi 10 cm. Waktu 15 Menit.",
    },
    rubrikByKategori: {
      SD: [
        { id: "ketepatan", name: "Ketepatan Jawaban (0–10)", min: 0, max: 10, weight: 10, isScore: true, hint: "Kebenaran perhitungan rumus taksir & toleransi (Skor 0 - 10)" },
        { id: "waktu", name: "Kecepatan Waktu", unit: "jam:menit:detik.milidetik", isTime: true, hint: "Waktu penyelesaian regu format jam:menit:detik.milidetik" },
      ],
      SMP: [
        { id: "ketepatan", name: "Ketepatan Jawaban (0–10)", min: 0, max: 10, weight: 10, isScore: true, hint: "Kebenaran perhitungan rumus taksir & toleransi (Skor 0 - 10)" },
        { id: "waktu", name: "Kecepatan Waktu", unit: "jam:menit:detik.milidetik", isTime: true, hint: "Waktu penyelesaian regu format jam:menit:detik.milidetik" },
      ],
    },
    rubrik: [
      { id: "ketepatan", name: "Ketepatan Jawaban (0–10)", min: 0, max: 10, weight: 10, isScore: true, hint: "Kebenaran perhitungan rumus taksir & toleransi (Skor 0 - 10)" },
      { id: "waktu", name: "Kecepatan Waktu", unit: "jam:menit:detik.milidetik", isTime: true, hint: "Waktu penyelesaian regu format jam:menit:detik.milidetik" },
    ],
  },
  {
    kode: "SMP",
    nama_lomba: "Semaphore",
    kategori_kelompok: "Keterampilan Kepramukaan",
    hasTimeInput: true,
    rules: {
      SD: "2 orang/Regu. Menjawab soal semaphore jumlah 10 kotak (huruf & angka).",
      SMP: "2 orang/Regu. Menjawab soal semaphore jumlah 15 kotak (huruf & angka).",
    },
    rubrikByKategori: {
      SD: [
        { id: "ketepatan", name: "Ketepatan Jawaban (0–10)", min: 0, max: 10, weight: 10, isScore: true, hint: "Jumlah huruf/angka benar (Skor 0 - 10 untuk SD)" },
        { id: "waktu", name: "Kecepatan Waktu", unit: "jam:menit:detik.milidetik", isTime: true, hint: "Waktu penyelesaian regu format jam:menit:detik.milidetik" },
      ],
      SMP: [
        { id: "ketepatan", name: "Ketepatan Jawaban (0–15)", min: 0, max: 15, weight: 15, isScore: true, hint: "Jumlah huruf/angka benar (Skor 0 - 15 untuk SMP)" },
        { id: "waktu", name: "Kecepatan Waktu", unit: "jam:menit:detik.milidetik", isTime: true, hint: "Waktu penyelesaian regu format jam:menit:detik.milidetik" },
      ],
    },
    rubrik: [
      { id: "ketepatan", name: "Ketepatan Jawaban (0–15)", min: 0, max: 15, weight: 15, isScore: true, hint: "Jumlah huruf/angka benar" },
      { id: "waktu", name: "Kecepatan Waktu", unit: "jam:menit:detik.milidetik", isTime: true, hint: "Waktu penyelesaian regu format jam:menit:detik.milidetik" },
    ],
  },
  {
    kode: "MRS",
    nama_lomba: "Morse",
    kategori_kelompok: "Keterampilan Kepramukaan",
    hasTimeInput: true,
    rules: {
      SD: "2 orang/Regu. Menjawab soal sandi Morse bunyi pluit jumlah 10 kotak.",
      SMP: "2 orang/Regu. Menjawab soal sandi Morse bunyi pluit jumlah 25 kotak.",
    },
    rubrikByKategori: {
      SD: [
        { id: "ketepatan", name: "Ketepatan Jawaban (0–10)", min: 0, max: 10, weight: 10, isScore: true, hint: "Jumlah kode Morse benar (Skor 0 - 10 untuk SD)" },
        { id: "waktu", name: "Kecepatan Waktu", unit: "jam:menit:detik.milidetik", isTime: true, hint: "Waktu penyerahan lembar jawaban format jam:menit:detik.milidetik" },
      ],
      SMP: [
        { id: "ketepatan", name: "Ketepatan Jawaban (0–25)", min: 0, max: 25, weight: 25, isScore: true, hint: "Jumlah kode Morse benar (Skor 0 - 25 untuk SMP)" },
        { id: "waktu", name: "Kecepatan Waktu", unit: "jam:menit:detik.milidetik", isTime: true, hint: "Waktu penyerahan lembar jawaban format jam:menit:detik.milidetik" },
      ],
    },
    rubrik: [
      { id: "ketepatan", name: "Ketepatan Jawaban (0–25)", min: 0, max: 25, weight: 25, isScore: true, hint: "Jumlah kode Morse benar" },
      { id: "waktu", name: "Kecepatan Waktu", unit: "jam:menit:detik.milidetik", isTime: true, hint: "Waktu penyerahan lembar jawaban format jam:menit:detik.milidetik" },
    ],
  },
  {
    kode: "KIM",
    nama_lomba: "Lomba KIM",
    kategori_kelompok: "Keterampilan Kepramukaan",
    hasTimeInput: true,
    rules: {
      SD: "2 orang/Regu. Mengamati KIM Penglihat 15 Benda & mengenali obat tradisional.",
      SMP: "2 orang/Regu. Mengamati KIM Penglihat 25 Benda & mengenali obat tradisional.",
    },
    rubrikByKategori: {
      SD: [
        { id: "ketepatan", name: "Ketepatan Jawaban (0–15)", min: 0, max: 15, weight: 15, isScore: true, hint: "Ketepatan tebakan benda KIM & obat (Skor 0 - 15 untuk SD)" },
        { id: "waktu", name: "Kecepatan Waktu", unit: "jam:menit:detik.milidetik", isTime: true, hint: "Waktu penyelesaian regu format jam:menit:detik.milidetik" },
      ],
      SMP: [
        { id: "ketepatan", name: "Ketepatan Jawaban (0–25)", min: 0, max: 25, weight: 25, isScore: true, hint: "Ketepatan tebakan benda KIM & obat (Skor 0 - 25 untuk SMP)" },
        { id: "waktu", name: "Kecepatan Waktu", unit: "jam:menit:detik.milidetik", isTime: true, hint: "Waktu penyelesaian regu format jam:menit:detik.milidetik" },
      ],
    },
    rubrik: [
      { id: "ketepatan", name: "Ketepatan Jawaban (0–25)", min: 0, max: 25, weight: 25, isScore: true, hint: "Ketepatan tebakan benda KIM" },
      { id: "waktu", name: "Kecepatan Waktu", unit: "jam:menit:detik.milidetik", isTime: true, hint: "Waktu penyelesaian regu format jam:menit:detik.milidetik" },
    ],
  },
  {
    kode: "KRN",
    nama_lomba: "Lomba Karnaval",
    kategori_kelompok: "Keterampilan Kepramukaan",
    rules: {
      SD: "7 orang/Regu. Sesuai Juknis: Menggunakan kostum yang telah dibuat di pangkalan masing-masing.",
      SMP: "7 orang/Regu. Sesuai Juknis: Menggunakan kostum yang telah dibuat di pangkalan masing-masing.",
    },
    rubrik: [
      { id: "bahan", name: "Komposisi Bahan (5–30)", min: 5, max: 30, weight: 30, hint: "Kreativitas pemanfaatan bahan & estetika" },
      { id: "kreativitas", name: "Kreativitas (5–30)", min: 5, max: 30, weight: 30, hint: "Keunikan rancangan & keserasian tema" },
      { id: "kesulitan", name: "Tingkat Kesulitan (5–20)", min: 5, max: 20, weight: 20, hint: "Kerumitan detail kostum & aksesoris" },
      { id: "kerapihan", name: "Kerapihan (5–20)", min: 5, max: 20, weight: 20, hint: "Peragaan jalan, kekompakan barisan & keselarasan" },
    ],
  },
  {
    kode: "MSK",
    nama_lomba: "Masak Nusantara",
    kategori_kelompok: "Keterampilan Teknologi",
    rules: {
      SD: "2 orang/Regu. Sesuai Juknis: Membuat NASI GORENG. Dilarang membawa catatan resep.",
      SMP: "2 orang/Regu. Sesuai Juknis: Memasak Masakan Nusantara Lengkap (Nasi, Lauk Pauk, Sayur). DILARANG BUMBU INSTAN.",
    },
    rubrik: [
      { id: "rasa", name: "Cita Rasa", min: 5, max: 30, weight: 30, hint: "Kelezatan cita rasa masakan & kematangan" },
      { id: "penampilan", name: "Penampilan / Tekstur", min: 5, max: 30, weight: 30, hint: "Platting garnish, kebersihan & tekstur" },
      { id: "kekompakan", name: "Kekompakan Tim", min: 5, max: 20, weight: 20, hint: "Kerjasama tim & kebersihan area masak" },
      { id: "kreativitas", name: "Kreativitas", min: 5, max: 20, weight: 20, hint: "Inovasi olahan rempah & variasi hidangan" },
    ],
  },
  // Lomba Manajemen Regu & Ketangkasan
  {
    kode: "ADM",
    nama_lomba: "Administrasi Regu",
    kategori_kelompok: "Manajemen Regu",
    rules: {
      SD: "Dikumpulkan maks 4 hari sebelum acara. Menggunakan MAP HIJAU. Berisi data anggota, notulen, logbook, iuran, SK LT-I.",
      SMP: "Dikumpulkan maks 4 hari sebelum acara. Menggunakan MAP MERAH. Berisi data anggota, notulen, logbook, iuran, SK LT-I.",
    },
    rubrik: [
      { id: "ketepatan", name: "Ketepatan (0-50)", min: 0, max: 50, weight: 50, hint: "Ketepatan Berkas administrasi" },
      { id: "kelengkapan", name: "Kelengkapan (0-50)", min: 0, max: 50, weight: 50, hint: "Kelengkapan Berkas regu" },
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
  const [selectedGender, setSelectedGender] = useState("SEMUA");
  const [selectedLombaId, setSelectedLombaId] = useState("");
  const [selectedPeserta, setSelectedPeserta] = useState("");
  
  // Rubrik & Nilai Breakdown State
  const [rubrikScores, setRubrikScores] = useState({});
  const [manualOverrideTotal, setManualOverrideTotal] = useState(null);
  const [catatanJuri, setCatatanJuri] = useState("");

  // Juri Scoring Map (peserta_id -> { id, nilai, updated_at })
  const [juriScoresMap, setJuriScoresMap] = useState({});
  const [pesertaFilterTab, setPesertaFilterTab] = useState("ALL"); // ALL, UNSCORED, SCORED
  const [pesertaSearch, setPesertaSearch] = useState("");

  // State UI
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pesan, setPesan] = useState({ type: "", text: "" });
  const [showSuccess, setShowSuccess] = useState(false);
  const [riwayat, setRiwayat] = useState([]);

  useEffect(() => {
    cekAuthDanAmbilData();
  }, []);

  // Penilaian raw list state
  const [penilaianList, setPenilaianList] = useState([]);

  // Selected Lomba Object & Rubric Definition
  const currentLombaObj = useMemo(() => {
    if (!selectedLombaId) return null;
    return lombaList.find((l) => l.id === selectedLombaId) || null;
  }, [selectedLombaId, lombaList]);

  const currentLombaDef = useMemo(() => {
    return findOfficialLombaDef(currentLombaObj);
  }, [currentLombaObj]);

  // Map skor khusus untuk lomba yang sedang aktif
  const activeScoresMap = useMemo(() => {
    const map = {};
    penilaianList.forEach((s) => {
      if (!selectedLombaId || s.lomba_id === selectedLombaId) {
        map[s.peserta_id] = s;
      }
    });
    return map;
  }, [penilaianList, selectedLombaId]);

  // Initialize Rubrik Scores when Lomba or Kategori Changes
  useEffect(() => {
    if (currentLombaDef) {
      const activeRubriks = getLombaRubrik(currentLombaDef, selectedKategori);
      const initialRubrik = {};
      activeRubriks.forEach((r) => {
        if (r.isTime) {
          initialRubrik[r.id] = generateExampleTime(selectedPeserta || "sample", selectedLombaId);
        } else {
          const maxVal = r.max || r.weight || 100;
          initialRubrik[r.id] = Math.round(maxVal * 0.7); // default ~70% score
        }
      });
      setRubrikScores(initialRubrik);
      setManualOverrideTotal(null);
    }
  }, [currentLombaDef, selectedKategori]);

  // Calculate Total Score dynamically from Rubrik Breakdown
  const totalScoreCalculated = useMemo(() => {
    if (manualOverrideTotal !== null) return manualOverrideTotal;
    if (!currentLombaDef) return 0;
    
    const activeRubriks = getLombaRubrik(currentLombaDef, selectedKategori);
    const scoreRubriks = activeRubriks.filter((r) => !r.isTime);
    const maxScore = scoreRubriks.reduce((acc, r) => acc + (r.max || r.weight || 100), 0) || 100;

    let sum = 0;
    scoreRubriks.forEach((r) => {
      sum += Number(rubrikScores[r.id] || 0);
    });
    return Math.min(maxScore, Math.max(0, sum));
  }, [rubrikScores, manualOverrideTotal, currentLombaDef, selectedKategori]);

  // Update selected lomba intelligently when kategori changes
  useEffect(() => {
    if (juri && !juri.assigned_lomba_id && lombaList.length > 0) {
      const currentKode = currentLombaDef?.kode;
      const matchingSameCode = lombaList.find(
        (l) => l.kategori === selectedKategori && l.kode_lomba === currentKode
      );
      if (matchingSameCode) {
        setSelectedLombaId(matchingSameCode.id);
      } else {
        const matchingKategori = lombaList.find((l) => l.kategori === selectedKategori);
        if (matchingKategori) setSelectedLombaId(matchingKategori.id);
        else setSelectedLombaId(lombaList[0]?.id || "");
      }
    }
  }, [selectedKategori, lombaList, juri]);

  const cekAuthDanAmbilData = async () => {
    try {
      // 1. Verifikasi sesi autentikasi resmi dari Supabase Auth
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        try { sessionStorage.removeItem("_profile_cache"); } catch (_) {}
        router.replace("/login");
        return;
      }

      const userId = session.user.id;

      const [profileRes, lombaRes, pesertaRes, penilaianRes] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, nama_lengkap, role, assigned_lomba_id, assigned_kategori, assigned_gender, lomba(nama_lomba, kode_lomba)")
          .eq("id", userId)
          .maybeSingle(),
        supabase
          .from("lomba")
          .select("id, nama_lomba, kode_lomba, kategori")
          .order("nama_lomba", { ascending: true }),
        supabase
          .from("peserta")
          .select("id, nomor_dada, nama_regu, pangkalan, kategori, gender")
          .eq("is_verified", true)
          .order("nomor_dada", { ascending: true }),
        supabase
          .from("penilaian")
          .select("id, peserta_id, lomba_id, nilai, updated_at")
          .eq("juri_id", userId),
      ]);

      const profile = profileRes?.data;
      if (!profile || (profile.role !== "juri" && profile.role !== "admin")) {
        try { sessionStorage.removeItem("_profile_cache"); } catch (_) {}
        await supabase.auth.signOut();
        router.replace("/login");
        return;
      }

      const activeRole = profile.role || "juri";
      setJuri(profile);

      const official13Codes = new Set(OFFICIAL_LOMBA_DEFINITIONS.map((d) => d.kode));
      let loadedLomba = (lombaRes.data || [])
        .filter((l) => official13Codes.has(l.kode_lomba?.toUpperCase()))
        .map((l) => {
          const def = findOfficialLombaDef(l);
          return {
            ...l,
            nama_lomba: def ? def.nama_lomba : l.nama_lomba,
          };
        });

      // If DB has no lomba records yet, build virtual lomba list from definitions
      if (loadedLomba.length === 0) {
        loadedLomba = OFFICIAL_LOMBA_DEFINITIONS.flatMap((def) => [
          { id: `def-sd-${def.kode}`, nama_lomba: def.nama_lomba, kode_lomba: def.kode, kategori: "SD" },
          { id: `def-smp-${def.kode}`, nama_lomba: def.nama_lomba, kode_lomba: def.kode, kategori: "SMP" },
        ]);
      }

      setLombaList(loadedLomba);
      const defaultKategori = (profile.assigned_kategori && profile.assigned_kategori !== "SEMUA") 
        ? profile.assigned_kategori 
        : selectedKategori;
      if (profile.assigned_kategori && profile.assigned_kategori !== "SEMUA") {
        setSelectedKategori(profile.assigned_kategori);
      }
      if (profile.assigned_gender && profile.assigned_gender !== "SEMUA") {
        setSelectedGender(profile.assigned_gender);
      }

      if (profile.assigned_lomba_id && profile.assigned_lomba_id !== "SEMUA" && loadedLomba.some((l) => l.id === profile.assigned_lomba_id)) {
        setSelectedLombaId(profile.assigned_lomba_id);
      } else if (loadedLomba.length > 0) {
        const matching = loadedLomba.find((l) => l.kategori === defaultKategori);
        setSelectedLombaId(matching ? matching.id : loadedLomba[0].id);
      }

      // Ambil data peserta resmi yang terverifikasi langsung dari database Supabase
      const combinedPeserta = [...(pesertaRes?.data || [])];
      setPesertaList(combinedPeserta);

      // Merge DB scores and local offline scores (hanya untuk peserta yang benar-benar ada di DB)
      let offlineScores = [];
      try {
        if (typeof window !== "undefined") {
          const rawOffline = JSON.parse(localStorage.getItem("offline_penilaian") || "[]");
          offlineScores = rawOffline.filter((off) =>
            combinedPeserta.some((p) => p.id === off.peserta_id)
          );
        }
      } catch (_) {}

      let allScores = [...(penilaianRes?.data || [])];
      if (activeRole === "admin") {
        const [c1, c2] = await Promise.all([
          supabase.from("penilaian").select("id, peserta_id, lomba_id, nilai, updated_at").range(0, 999),
          supabase.from("penilaian").select("id, peserta_id, lomba_id, nilai, updated_at").range(1000, 1999),
        ]);
        const fetchedScores = [...(c1.data || []), ...(c2.data || [])];
        if (fetchedScores.length > 0) {
          allScores = fetchedScores;
        }
      }
      offlineScores.forEach((off) => {
        if (!allScores.some((s) => s.peserta_id === off.peserta_id && s.lomba_id === off.lomba_id)) {
          allScores.push(off);
        }
      });

      setPenilaianList(allScores);
      const map = {};
      allScores.forEach((s) => {
        map[s.peserta_id] = s;
      });
      setJuriScoresMap(map);

      const recentRiwayat = allScores
        .slice(0, 10)
        .map((s) => {
          const pesertaData = combinedPeserta.find((p) => p.id === s.peserta_id);
          const lombaData = loadedLomba.find((l) => l.id === s.lomba_id);
          return {
            id: s.id,
            regu: pesertaData ? pesertaData.nama_regu : "Regu",
            pos: lombaData ? lombaData.nama_lomba : "Pos Lomba",
            nilai: s.nilai,
            time: s.updated_at ? new Date(s.updated_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) : "—",
          };
        });
      setRiwayat(recentRiwayat);
    } catch (err) {
      console.error("Gagal memuat data juri:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPeserta = (pesertaId) => {
    setSelectedPeserta(pesertaId);
    setPesan({ type: "", text: "" });

    const existing = activeScoresMap[pesertaId];
    const activeRubriks = getLombaRubrik(currentLombaDef, selectedKategori);

    if (existing) {
      setManualOverrideTotal(existing.nilai);
      if (currentLombaDef && activeRubriks) {
        let loadedRubrik = null;
        try {
          const saved = typeof window !== "undefined" ? localStorage.getItem(`rubrik_scores_${pesertaId}_${existing.lomba_id || selectedLombaId}`) : null;
          if (saved) {
            loadedRubrik = JSON.parse(saved);
          }
        } catch (_) {}

        if (loadedRubrik) {
          setRubrikScores(loadedRubrik);
        } else {
          const hasTime = activeRubriks.some((r) => r.isTime);
          const updatedRubrik = {};
          if (hasTime) {
            const scoreItem = activeRubriks.find((r) => r.isScore) || activeRubriks[0];
            updatedRubrik[scoreItem.id] = Math.min(scoreItem.max, Number(existing.nilai));
            const timeItem = activeRubriks.find((r) => r.isTime);
            if (timeItem) updatedRubrik[timeItem.id] = generateExampleTime(pesertaId, selectedLombaId);
          } else {
            const ratio = Math.min(1, Math.max(0, existing.nilai / 100));
            activeRubriks.forEach((r) => {
              updatedRubrik[r.id] = Math.round((r.weight || r.max) * ratio);
            });
          }
          setRubrikScores(updatedRubrik);
        }
      }
    } else {
      setManualOverrideTotal(null);
      if (currentLombaDef && activeRubriks) {
        const initialRubrik = {};
        activeRubriks.forEach((r) => {
          if (r.isTime) {
            initialRubrik[r.id] = generateExampleTime(pesertaId, selectedLombaId);
          } else {
            const maxVal = r.max || r.weight || 100;
            initialRubrik[r.id] = Math.round(maxVal * 0.7);
          }
        });
        setRubrikScores(initialRubrik);
      }
    }
  };

  const handleRubrikChange = (rubrikId, value, maxVal) => {
    if (maxVal === undefined || maxVal === null) {
      // Input waktu (menit) bebas diisi sendiri oleh juri
      setRubrikScores((prev) => ({
        ...prev,
        [rubrikId]: value,
      }));
    } else {
      const num = Math.min(maxVal, Math.max(0, Number(value)));
      setRubrikScores((prev) => ({
        ...prev,
        [rubrikId]: num,
      }));
      setManualOverrideTotal(null); // Clear override when adjusting rubriks
    }
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

    // Validasi Kecepatan Waktu: Wajib diisi jika lomba memiliki aspek waktu
    if (currentLombaDef) {
      const activeRubriks = getLombaRubrik(currentLombaDef, selectedKategori);
      const timeRubrik = activeRubriks.find((r) => r.isTime);
      if (timeRubrik) {
        const val = rubrikScores[timeRubrik.id];
        if (!val || String(val).trim() === "") {
          setPesan({
            type: "error",
            text: "⚠️ Kecepatan waktu WAJIB diisi! Masukkan waktu pengerjaan (jam:menit:detik.milidetik) sebelum nilai dapat dikunci dan diupload.",
          });
          return;
        }
      }
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


    // Pastikan session ID juri sah
    const targetJuriId = juri?.id;
    if (!targetJuriId) {
      setPesan({ type: "error", text: "Sesi juri tidak valid. Silakan login kembali." });
      setSaving(false);
      return;
    }

    // Upsert score in Supabase
    try {
      await supabase
        .from("penilaian")
        .upsert({
          peserta_id: selectedPeserta,
          juri_id: targetJuriId,
          lomba_id: targetLombaId,
          nilai: finalScore,
        }, { onConflict: "peserta_id, juri_id, lomba_id" });
    } catch (e) {
      console.warn("DB upsert notice:", e);
    }

    // Update local offline storage so data is never lost
    try {
      if (typeof window !== "undefined") {
        const offlinePenilaian = JSON.parse(localStorage.getItem("offline_penilaian") || "[]");
        const filteredOffline = offlinePenilaian.filter(
          (o) => !(o.peserta_id === selectedPeserta && o.lomba_id === targetLombaId)
        );
        filteredOffline.push({
          id: `local-${Date.now()}`,
          peserta_id: selectedPeserta,
          juri_id: targetJuriId,
          lomba_id: targetLombaId,
          nilai: finalScore,
          updated_at: new Date().toISOString(),
        });
        localStorage.setItem("offline_penilaian", JSON.stringify(filteredOffline));
      }
    } catch (_) {}

    {
      const pesertaData = pesertaList.find((p) => p.id === selectedPeserta);
      const reguName = pesertaData ? pesertaData.nama_regu : "Regu";
      const lombaName = currentLombaDef ? currentLombaDef.nama_lomba : "Pos Lomba";

      try {
        if (typeof window !== "undefined") {
          localStorage.setItem(`rubrik_scores_${selectedPeserta}_${targetLombaId}`, JSON.stringify(rubrikScores));
          const allTime = JSON.parse(localStorage.getItem("all_time_scores") || "{}");
          if (rubrikScores["waktu"]) {
            allTime[`${selectedPeserta}_${targetLombaId}`] = rubrikScores["waktu"];
            localStorage.setItem("all_time_scores", JSON.stringify(allTime));
          }
        }
      } catch (_) {}

      // Update local penilaian raw list
      setPenilaianList((prev) => {
        const filtered = prev.filter(
          (item) => !(item.peserta_id === selectedPeserta && item.lomba_id === targetLombaId)
        );
        return [
          {
            id: Date.now().toString(),
            peserta_id: selectedPeserta,
            lomba_id: targetLombaId,
            nilai: finalScore,
            updated_at: new Date().toISOString(),
          },
          ...filtered,
        ];
      });

      const updatedScores = {
        ...activeScoresMap,
        [selectedPeserta]: { nilai: finalScore, updated_at: new Date().toISOString(), lomba_id: targetLombaId }
      };
      setJuriScoresMap(updatedScores);
      setShowSuccess(true);

      // Add to history
      setRiwayat((prev) => [{
        id: Date.now(),
        regu: reguName,
        pos: lombaName,
        nilai: finalScore,
        time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      }, ...prev].slice(0, 10));

      // Find next unscored school in active category to allow continuous grading 1 by 1
      const activeSchools = pesertaList.filter(
        (p) => p.kategori === selectedKategori && (selectedGender === "SEMUA" || p.gender === selectedGender)
      );
      const nextUnscored = activeSchools.find(
        (p) => p.id !== selectedPeserta && !updatedScores[p.id]
      );

      if (nextUnscored) {
        setSelectedPeserta(nextUnscored.id);
        setManualOverrideTotal(null);
        if (currentLombaDef) {
          const activeRubriks = getLombaRubrik(currentLombaDef, selectedKategori);
          const initialRubrik = {};
          activeRubriks.forEach((r) => {
            if (r.isTime) {
              initialRubrik[r.id] = generateExampleTime(nextUnscored.id, targetLombaId);
            } else {
              const maxVal = r.max || r.weight || 100;
              initialRubrik[r.id] = Math.round(maxVal * 0.7);
            }
          });
          setRubrikScores(initialRubrik);
        }
        setPesan({
          type: "success",
          text: `Skor ${finalScore} untuk ${reguName} tersimpan! Lanjut menilai regu berikutnya: ${nextUnscored.nama_regu} (${nextUnscored.pangkalan}).`
        });
      } else {
        setSelectedPeserta("");
        setManualOverrideTotal(null);
        setPesan({
          type: "success",
          text: `Skor ${finalScore} untuk ${reguName} tersimpan! Semua regu pada sesi ini telah selesai dinilai! 🎉`
        });
      }

      setCatatanJuri("");
      setTimeout(() => setShowSuccess(false), 1500);
    }
    setSaving(false);
    setTimeout(() => setPesan({ type: "", text: "" }), 5000);
  };

  // Stepper controls for overall score override
  const stepDown = (amount) => setManualOverrideTotal((prev) => Math.max(0, (prev ?? totalScoreCalculated) - amount));
  const stepUp = (amount) => setManualOverrideTotal((prev) => Math.min(100, (prev ?? totalScoreCalculated) + amount));

  // Locking checks: Seluruh juri dan admin memiliki akses penuh ke semua cabang, tingkat, & gender
  const isLockedPos = false;
  const isLockedGender = false;
  const OFFICIAL_ACTIVE_KODES = [
    "HMN", "TSB", "PNR", "PGD", "SND", "NAV", "TKS", 
    "SMP", "MRS", "KIM", "KRN", "PCK", "ADM", "FRP", "MSK"
  ];
  const filteredLomba = lombaList
    .filter((l) => l.kategori === selectedKategori)
    .sort((a, b) => {
      const idxA = OFFICIAL_ACTIVE_KODES.indexOf(a.kode_lomba);
      const idxB = OFFICIAL_ACTIVE_KODES.indexOf(b.kode_lomba);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return (a.nama_lomba || "").localeCompare(b.nama_lomba || "");
    });

  // Filtered Peserta Calculations
  const availableInCategory = useMemo(() => {
    return pesertaList.filter((p) => p.kategori === selectedKategori);
  }, [pesertaList, selectedKategori]);

  const scoredInCategory = useMemo(() => {
    return availableInCategory.filter((p) => activeScoresMap[p.id]);
  }, [availableInCategory, activeScoresMap]);

  const unscoredInCategory = useMemo(() => {
    return availableInCategory.filter((p) => !activeScoresMap[p.id]);
  }, [availableInCategory, activeScoresMap]);

  const displayPesertaList = useMemo(() => {
    let list = availableInCategory;
    if (selectedGender !== "SEMUA") {
      list = list.filter((p) => p.gender === selectedGender);
    }
    if (pesertaFilterTab === "UNSCORED") {
      list = list.filter((p) => !activeScoresMap[p.id]);
    } else if (pesertaFilterTab === "SCORED") {
      list = list.filter((p) => activeScoresMap[p.id]);
    }
    if (pesertaSearch.trim()) {
      const q = pesertaSearch.toLowerCase();
      list = list.filter((p) =>
        p.nama_regu.toLowerCase().includes(q) ||
        p.pangkalan.toLowerCase().includes(q) ||
        String(p.nomor_dada).includes(q)
      );
    }
    return list;
  }, [availableInCategory, selectedGender, pesertaFilterTab, pesertaSearch, activeScoresMap]);

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
        <div className="max-w-7xl mx-auto px-3 md:px-6 py-2 md:py-2.5">
          {/* Top row: brand + logout */}
          <div className="flex items-center justify-between gap-2">
            {/* Brand & Logos */}
            <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
              {/* Logos Cluster - Proporsional simetris di Android HP & Desktop */}
              <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                <img src="/logo_wosm.png" alt="WOSM" className="h-6 sm:h-8 md:h-10 w-auto object-contain drop-shadow-[0_0_6px_rgba(255,255,255,0.3)]" />
                <img src="/logo_kwarran_mekarbaru.png" alt="Kwarran Mekar Baru" className="h-6 sm:h-8 md:h-10 w-auto object-contain drop-shadow-[0_0_6px_rgba(255,255,255,0.3)]" />
                <img src="/logo_lt2.png" alt="LT-II 2026" className="h-6 sm:h-8 md:h-10 w-auto object-contain drop-shadow-[0_0_8px_rgba(245,166,35,0.4)]" />
                <img src="/logo_65.png" alt="HUT 65 Pramuka" className="h-6 sm:h-8 md:h-10 w-auto object-contain drop-shadow-[0_0_8px_rgba(245,166,35,0.4)]" />
              </div>
              
              <div className="min-w-0 border-l border-slate-800 pl-2 md:pl-3">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-[0.55rem] sm:text-[0.6rem] font-black px-1.5 sm:px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                    LT-II MEKAR BARU 2026
                  </span>
                  <span className="text-[0.55rem] sm:text-[0.6rem] text-slate-400 font-medium hidden sm:inline">25-27 SEP 2026</span>
                </div>
                <h1 className="text-[0.68rem] sm:text-xs md:text-sm font-black tracking-wide text-white uppercase mt-0.5 truncate">
                  PANEL PENILAIAN <span className="text-amber-400">DEWAN JURI</span>
                </h1>
              </div>
            </div>

          {/* Juri Profile Pill & Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="bg-slate-900/90 border border-slate-800 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl flex items-center gap-1.5 sm:gap-2 text-xs max-w-[120px] sm:max-w-none">
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-black text-[0.55rem] sm:text-[0.65rem] border border-amber-500/30 shrink-0">
                ⚖️
              </div>
              <div className="min-w-0">
                <div className="text-[0.55rem] sm:text-[0.65rem] text-slate-400 uppercase leading-none hidden sm:block">Dewan Juri</div>
                <div className="font-bold text-white text-[0.6rem] sm:text-xs leading-tight truncate">{juri?.nama_lengkap || "Dewan Juri"}</div>
              </div>
            </div>

            <button
              onClick={async () => {
                try { sessionStorage.removeItem("_profile_cache"); } catch (_) {}
                await supabase.auth.signOut();
                router.replace("/login");
              }}
              className="text-[0.6rem] sm:text-xs font-bold bg-red-500/10 hover:bg-red-500 border border-red-500/20 hover:border-red-500 text-red-400 hover:text-white px-2 sm:px-3.5 py-1 sm:py-1.5 rounded-xl transition-all duration-200 shrink-0"
              title="Keluar dari panel juri"
            >
              LOGOUT
            </button>
          </div>
          </div>

          {/* Bottom row: action buttons - scrollable on mobile */}
          <div className="flex items-center gap-2 mt-2 overflow-x-auto no-scrollbar pb-0.5">
            <button
              onClick={() => {
                const jName = juri?.nama_lengkap || "";
                const jId = juri?.id || "";
                const query = new URLSearchParams();
                if (jName) query.set("juriName", jName);
                if (jId) query.set("juriId", jId);
                window.open(`/dashboard/admin/cetak-rekap?${query.toString()}`, "_blank");
              }}
              className="text-[0.65rem] sm:text-xs font-bold bg-amber-500/15 hover:bg-amber-500 border border-amber-500/30 hover:border-amber-500 text-amber-400 hover:text-slate-950 px-3 sm:px-3.5 py-1.5 rounded-xl transition-all duration-200 flex items-center gap-1.5 shadow-sm shrink-0 whitespace-nowrap"
              title="Buka & Cetak Lembar Rekap Penilaian Resmi"
            >
              <span>📋 CETAK REKAP NILAI</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Scoring Workspace */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-5">
        
        {/* Top Active Task Strip / Pengawas Quick Switcher */}
        {!isLockedPos ? (
          <div className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-4 mb-5 backdrop-blur-md shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black px-2.5 py-1 rounded-lg text-[0.65rem] tracking-wider uppercase shadow">
                  🔍 AKUN PENGAWAS & PEMERIKSA FORMAT
                </span>
                <span className="text-slate-300 font-bold text-xs">
                  Akses Bebas Semua 13 Mata Lomba, Tingkat & Gender
                </span>
              </div>
              <div className="text-[0.7rem] font-mono text-emerald-400 font-bold">
                Format Aktif: <span className="underline">{currentLombaDef?.nama_lomba}</span> ({currentLombaDef?.rubrik?.length} Aspek Rubrik)
              </div>
            </div>

            {/* Quick Switcher Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3">
              <div>
                <label className="block text-[0.65rem] text-amber-400 font-bold uppercase mb-1 flex items-center gap-1">
                  <span>🏆</span> 1. Pilih Cabang Perlombaan:
                </label>
                <select
                  value={selectedLombaId}
                  onChange={(e) => {
                    setSelectedLombaId(e.target.value);
                    setSelectedPeserta("");
                  }}
                  className="w-full bg-slate-950 border border-amber-500/50 rounded-xl px-3 py-2 text-amber-300 font-black text-xs focus:ring-2 focus:ring-amber-500 outline-none cursor-pointer"
                >
                  {filteredLomba.map((l) => (
                    <option key={l.id} value={l.id}>
                      [{l.kode_lomba || "LMB"}] {l.nama_lomba}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[0.65rem] text-cyan-400 font-bold uppercase mb-1 flex items-center gap-1">
                  <span>🏫</span> 2. Tingkat Satuan:
                </label>
                <div className="grid grid-cols-2 gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => { setSelectedKategori("SD"); setSelectedPeserta(""); }}
                    className={`py-1.5 px-2 rounded-lg text-xs font-black transition-all ${
                      selectedKategori === "SD"
                        ? "bg-amber-500 text-slate-950 shadow"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    SD / MI
                  </button>
                  <button
                    type="button"
                    onClick={() => { setSelectedKategori("SMP"); setSelectedPeserta(""); }}
                    className={`py-1.5 px-2 rounded-lg text-xs font-black transition-all ${
                      selectedKategori === "SMP"
                        ? "bg-amber-500 text-slate-950 shadow"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    SMP / MTs
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[0.65rem] text-emerald-400 font-bold uppercase mb-1 flex items-center gap-1">
                  <span>👦👧</span> 3. Gender Peserta:
                </label>
                <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => { setSelectedGender("SEMUA"); setSelectedPeserta(""); }}
                    className={`py-1.5 px-1.5 rounded-lg text-[0.7rem] font-black transition-all ${
                      selectedGender === "SEMUA"
                        ? "bg-cyan-500 text-slate-950 shadow"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Semua
                  </button>
                  <button
                    type="button"
                    onClick={() => { setSelectedGender("Laki-laki"); setSelectedPeserta(""); }}
                    className={`py-1.5 px-1.5 rounded-lg text-[0.7rem] font-black transition-all ${
                      selectedGender === "Laki-laki"
                        ? "bg-blue-500 text-white shadow"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Putra
                  </button>
                  <button
                    type="button"
                    onClick={() => { setSelectedGender("Perempuan"); setSelectedPeserta(""); }}
                    className={`py-1.5 px-1.5 rounded-lg text-[0.7rem] font-black transition-all ${
                      selectedGender === "Perempuan"
                        ? "bg-rose-500 text-white shadow"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Putri
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-900/70 border border-amber-500/20 rounded-2xl p-3.5 mb-5 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="text-slate-400 font-bold uppercase text-[0.65rem] tracking-wider">Penugasan Terkunci:</span>
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
        )}

        {/* Content Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          {/* Kolom Kiri: Pengaturan & JUKLAK (Col 4, muncul di bawah form nilai di HP) */}
          <div className="lg:col-span-4 space-y-4 order-2 lg:order-1">
            
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

          {/* Kolom Kanan: Lembar Penilaian Real-Time (Col 8, prioritas utama di atas pada HP) */}
          <div className="lg:col-span-8 order-1 lg:order-2">
            <div className="bg-slate-900/85 border border-amber-500/25 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 md:p-7 shadow-2xl backdrop-blur-xl relative overflow-hidden">
              
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
                
                {/* 1. Pilih Regu Peserta (Interaktif 1 Persatu Sekolah) */}
                <div className="bg-slate-950/90 border-2 border-slate-800 focus-within:border-amber-500/70 rounded-2xl p-4 transition-all space-y-3">
                  {/* Header & Status Progress */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800/80">
                    <div>
                      <label className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                        <span>🎯</span> PILIH REGU PESERTA (1 PER 1 SEKOLAH)
                      </label>
                      <p className="text-[0.68rem] text-slate-400 mt-0.5">
                        Ketuk salah satu kartu regu di bawah. Setelah dinilai, sistem otomatis melanjutkan ke regu berikutnya.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <div className="text-[0.65rem] font-bold text-slate-400 uppercase">
                          Progres Tingkat {selectedKategori}
                        </div>
                        <div className="text-xs font-black text-emerald-400">
                          {scoredInCategory.length} / {availableInCategory.length} Regu Dinilai
                        </div>
                      </div>
                      <div className="w-16 bg-slate-800 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full transition-all duration-500"
                          style={{
                            width: `${availableInCategory.length > 0 ? (scoredInCategory.length / availableInCategory.length) * 100 : 0}%`
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Filter Toolbar: Status Tab, Gender Filter, dan Pencarian */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    {/* Filter Status Penilaian */}
                    <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs">
                      <button
                        type="button"
                        onClick={() => setPesertaFilterTab("ALL")}
                        className={`px-2.5 py-1 rounded-lg text-[0.7rem] font-bold transition-all ${
                          pesertaFilterTab === "ALL"
                            ? "bg-amber-500 text-slate-950 shadow"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        Semua ({availableInCategory.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setPesertaFilterTab("UNSCORED")}
                        className={`px-2.5 py-1 rounded-lg text-[0.7rem] font-bold transition-all flex items-center gap-1 ${
                          pesertaFilterTab === "UNSCORED"
                            ? "bg-amber-500 text-slate-950 shadow"
                            : "text-amber-400 hover:text-amber-300"
                        }`}
                      >
                        <span>⏳</span> Belum ({unscoredInCategory.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setPesertaFilterTab("SCORED")}
                        className={`px-2.5 py-1 rounded-lg text-[0.7rem] font-bold transition-all flex items-center gap-1 ${
                          pesertaFilterTab === "SCORED"
                            ? "bg-emerald-500 text-slate-950 shadow"
                            : "text-emerald-400 hover:text-emerald-300"
                        }`}
                      >
                        <span>✅</span> Selesai ({scoredInCategory.length})
                      </button>
                    </div>

                    {/* Filter Gender & Search */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-[0.7rem] font-bold">
                        <button
                          type="button"
                          onClick={() => setSelectedGender("SEMUA")}
                          className={`px-2 py-0.5 rounded-lg transition-all ${
                            selectedGender === "SEMUA"
                              ? "bg-cyan-500 text-slate-950"
                              : "text-slate-400 hover:text-white"
                          }`}
                        >
                          Semua Gender
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedGender("Laki-laki")}
                          className={`px-2 py-0.5 rounded-lg transition-all ${
                            selectedGender === "Laki-laki"
                              ? "bg-cyan-500 text-slate-950"
                              : "text-slate-400 hover:text-white"
                          }`}
                        >
                          👦 Putra
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedGender("Perempuan")}
                          className={`px-2 py-0.5 rounded-lg transition-all ${
                            selectedGender === "Perempuan"
                              ? "bg-rose-500 text-white"
                              : "text-slate-400 hover:text-white"
                          }`}
                        >
                          👧 Putri
                        </button>
                      </div>

                      <input
                        type="text"
                        placeholder="🔍 Cari regu / sekolah..."
                        value={pesertaSearch}
                        onChange={(e) => setPesertaSearch(e.target.value)}
                        className="bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1 text-xs text-white placeholder-slate-600 focus:border-amber-500 outline-none w-36 sm:w-44"
                      />
                    </div>
                  </div>

                  {/* Grid Kartu Regu Sekolah (Interaktif) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto pr-1">
                    {displayPesertaList.length === 0 ? (
                      <div className="col-span-full py-6 text-center text-xs text-slate-500 italic">
                        Tidak ada regu yang sesuai filter saat ini.
                      </div>
                    ) : (
                      displayPesertaList.map((p) => {
                        const isSelected = selectedPeserta === p.id;
                        const scoreData = activeScoresMap[p.id];
                        return (
                          <div
                            key={p.id}
                            onClick={() => handleSelectPeserta(p.id)}
                            className={`cursor-pointer p-3 rounded-xl border text-xs transition-all flex flex-col justify-between gap-1.5 ${
                              isSelected
                                ? "bg-amber-500/15 border-amber-400 shadow-[0_0_15px_rgba(245,166,35,0.3)] ring-2 ring-amber-400/80"
                                : scoreData
                                ? "bg-emerald-950/20 border-emerald-500/30 hover:border-emerald-500/70"
                                : "bg-slate-900/80 border-slate-800 hover:border-amber-500/50"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-1">
                              <div className="truncate">
                                <span className="font-mono text-[0.65rem] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded mr-1">
                                  #{p.nomor_dada ? String(p.nomor_dada).padStart(3, "0") : "—"}
                                </span>
                                <span className="font-bold text-white text-xs">{p.nama_regu}</span>
                              </div>
                              <span className="text-[0.6rem] text-slate-400 font-bold whitespace-nowrap">
                                {p.gender === "Laki-laki" ? "👦 PA" : "👧 PI"}
                              </span>
                            </div>

                            <div className="text-[0.68rem] text-slate-400 truncate">{p.pangkalan}</div>

                            <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[0.65rem]">
                              {scoreData ? (
                                <span className="text-emerald-400 font-black flex items-center gap-1">
                                  <span>✅</span> Skor: {scoreData.nilai}
                                </span>
                              ) : (
                                <span className="text-amber-400/90 font-bold flex items-center gap-1">
                                  <span>⏳</span> Belum Dinilai
                                </span>
                              )}
                              <span className={`text-[0.62rem] font-bold ${isSelected ? "text-amber-300 font-black" : "text-slate-500"}`}>
                                {isSelected ? "● DIPILIH" : "PILIH"}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Dropdown Cadangan */}
                  <div className="pt-2 border-t border-slate-800/60">
                    <label className="block text-[0.65rem] text-slate-500 font-bold uppercase mb-1">
                      Atau Pilih Cepat Melalui Menu Dropdown:
                    </label>
                    <select
                      value={selectedPeserta}
                      onChange={(e) => handleSelectPeserta(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-bold focus:border-amber-500 outline-none cursor-pointer"
                    >
                      <option value="">— Pilih Regu Melalui Dropdown —</option>
                      {displayPesertaList.map((p) => {
                        const scoreData = activeScoresMap[p.id];
                        return (
                          <option key={p.id} value={p.id}>
                            {scoreData ? `[✅ Nilai: ${scoreData.nilai}]` : "[⏳ Belum]"} Kapling {p.nomor_dada ? String(p.nomor_dada).padStart(3, "0") : "—"} : {p.nama_regu} ({p.pangkalan} - {p.gender === 'Laki-laki' ? 'Putra' : 'Putri'})
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {/* Banner Regu Aktif yang Sedang Dipilih */}
                  {selectedPeserta && (
                    (() => {
                      const p = pesertaList.find(item => item.id === selectedPeserta);
                      const existing = activeScoresMap[selectedPeserta];
                      if (!p) return null;
                      return (
                        <div className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${
                          existing
                            ? "bg-cyan-950/40 border-cyan-500/40 text-cyan-200"
                            : "bg-amber-950/30 border-amber-500/40 text-amber-200"
                        }`}>
                          <div className="flex items-center gap-2.5">
                            <span className="text-xl">{existing ? "🔄" : "🎯"}</span>
                            <div>
                              <div className="text-xs font-black text-white flex items-center gap-1.5">
                                <span>{p.nama_regu} ({p.pangkalan})</span>
                                <span className="text-[0.65rem] bg-slate-800 px-2 py-0.5 rounded text-amber-300 font-mono">
                                  Kapling #{p.nomor_dada ? String(p.nomor_dada).padStart(3, "0") : "—"}
                                </span>
                                <span className="text-[0.65rem] bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                                  {p.gender === "Laki-laki" ? "👦 Putra" : "👧 Putri"}
                                </span>
                              </div>
                              <div className="text-[0.68rem] text-slate-300 mt-0.5">
                                {existing
                                  ? `Regu ini sudah dinilai dengan skor ${existing.nilai}. Anda dalam Mode Revisi.`
                                  : "Regu ini belum dinilai. Silakan atur rubrik nilai di bawah lalu simpan."}
                              </div>
                            </div>
                          </div>
                          {existing && (
                            <span className="px-2.5 py-1 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[0.65rem] font-black rounded-lg uppercase w-fit">
                              Mode Revisi Skor
                            </span>
                          )}
                        </div>
                      );
                    })()
                  )}
                </div>

                {/* 2. Rubrik Aspek Penilaian & Form Waktu */}
                {currentLombaDef && (() => {
                  const activeRubrikList = getLombaRubrik(currentLombaDef, selectedKategori);
                  const scoreRubriks = activeRubrikList.filter((r) => !r.isTime);
                  const timeRubriks = activeRubrikList.filter((r) => r.isTime);
                  const maxScorePossible = scoreRubriks.reduce((acc, r) => acc + (r.max || 0), 0) || 100;

                  return (
                    <div className="space-y-4 pt-1">
                      {/* Header Rubrik */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
                        <h3 className="text-xs font-black text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                          <span>📊</span> Format Penilaian Tingkat {selectedKategori} (Juknis Resmi)
                        </h3>
                        <span className="text-[0.68rem] text-amber-400 font-mono">
                          Maksimal Skor Ketepatan: {maxScorePossible} Poin
                        </span>
                      </div>

                      {/* Card Penilaian Aspek / Ketepatan Jawaban */}
                      {scoreRubriks.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                          {scoreRubriks.map((r) => {
                            const val = rubrikScores[r.id] ?? Math.round((r.max || 100) * 0.7);
                            return (
                              <div key={r.id} className="bg-slate-950/70 border border-slate-800/90 hover:border-amber-500/40 p-3.5 rounded-2xl space-y-2 transition-all shadow-sm">
                                <div className="flex justify-between items-center">
                                  <label className="text-xs font-bold text-white flex items-center gap-1.5">
                                    <span>🎯</span>
                                    <span>{r.name}</span>
                                  </label>
                                  <span className="text-xs font-black text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-lg border border-amber-500/20 font-mono">
                                    {val} / {r.max}
                                  </span>
                                </div>
                                
                                <p className="text-[0.65rem] text-slate-400 italic line-clamp-2">
                                  {r.hint}
                                </p>

                                <div className="flex items-center gap-2.5 pt-1">
                                  <input
                                    type="range"
                                    min={r.min || 0}
                                    max={r.max}
                                    value={val}
                                    onChange={(e) => handleRubrikChange(r.id, e.target.value, r.max)}
                                    className="w-full accent-amber-500 h-3 sm:h-2 bg-slate-800 rounded-lg cursor-pointer touch-none"
                                  />
                                  <input
                                    type="number"
                                    min={r.min || 0}
                                    max={r.max}
                                    value={val}
                                    onChange={(e) => handleRubrikChange(r.id, e.target.value, r.max)}
                                    className="w-14 sm:w-16 bg-slate-900 border border-slate-700 rounded-xl py-1 sm:py-1.5 text-center text-xs sm:text-sm text-amber-300 font-black focus:border-amber-500 outline-none font-mono"
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Card Khusus Form Input Manual Kecepatan Waktu (Wajib Diisi) */}
                      {timeRubriks.map((tr) => {
                        const timeVal = rubrikScores[tr.id] ?? "";
                        const isMissing = !timeVal || String(timeVal).trim() === "";

                        return (
                          <div
                            key={tr.id}
                            className={`rounded-2xl p-4 md:p-5 shadow-lg space-y-3 transition-all ${
                              isMissing
                                ? "bg-gradient-to-br from-red-950/30 via-slate-950 to-amber-950/20 border-2 border-red-500/70 shadow-[0_0_25px_rgba(239,68,68,0.15)]"
                                : "bg-gradient-to-br from-blue-950/60 via-slate-950 to-emerald-950/30 border-2 border-emerald-500/60 shadow-[0_0_20px_rgba(16,185,129,0.15)]"
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between gap-2 flex-wrap">
                                <label className="text-xs md:text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                                  <span>⏱️</span>
                                  <span>{tr.name}</span>
                                  {isMissing ? (
                                    <span className="bg-red-500 text-slate-950 text-[0.62rem] px-2.5 py-0.5 rounded-full font-mono uppercase font-black tracking-wider animate-pulse shadow">
                                      🔴 WAJIB DIISI
                                    </span>
                                  ) : (
                                    <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 text-[0.62rem] px-2 py-0.5 rounded-full font-mono uppercase font-bold">
                                      ✓ Sudah Terisi
                                    </span>
                                  )}
                                </label>
                                {timeVal !== "" && (
                                  <button
                                    type="button"
                                    onClick={() => handleRubrikChange(tr.id, "")}
                                    className="text-[0.65rem] font-bold text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-2 py-1 rounded-lg border border-red-500/30 transition-all"
                                    title="Kosongkan nilai waktu"
                                  >
                                    ✕ Kosongkan
                                  </button>
                                )}
                              </div>
                              <p className="text-[0.72rem] text-slate-300 mt-1">
                                Masukkan catatan waktu penyelesaian regu. Contoh format: <span className="font-mono text-amber-400 font-bold bg-slate-900 px-1.5 py-0.5 rounded border border-slate-700">jam:menit:detik.milidetik</span> (misal: <span className="font-mono text-emerald-400 font-bold">00:15:30.45</span> atau <span className="font-mono text-emerald-400 font-bold">00:08:20.00</span>)
                              </p>
                            </div>

                            <div className="relative">
                              <input
                                type="text"
                                placeholder="Contoh format: 00:15:30.45 (jam:menit:detik.milidetik)"
                                value={timeVal}
                                onChange={(e) => handleRubrikChange(tr.id, e.target.value)}
                                className={`w-full bg-slate-950 border-2 rounded-xl py-2.5 px-4 text-sm md:text-base font-bold text-white placeholder:text-slate-600 placeholder:font-normal placeholder:text-xs font-mono outline-none transition-all shadow-inner ${
                                  isMissing
                                    ? "border-red-500/70 focus:border-red-400 ring-2 ring-red-500/20"
                                    : "border-emerald-500/70 focus:border-emerald-400"
                                }`}
                              />
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-2 text-[0.68rem]">
                              <span className="text-slate-400">
                                ℹ️ Format pengisian: <strong className="text-slate-300 font-mono">jam:menit:detik.milidetik</strong>
                              </span>
                              {isMissing ? (
                                <span className="text-red-400 font-bold flex items-center gap-1 bg-red-950/40 px-2 py-0.5 rounded border border-red-500/30">
                                  <span>⚠️</span> Wajib diisi! Nilai tidak bisa dikunci jika waktu kosong.
                                </span>
                              ) : (
                                <span className="text-emerald-400 font-mono font-bold flex items-center gap-1 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
                                  <span>✅ Terisi:</span>
                                  <span className="text-white font-black">{timeVal}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}

                {/* 3. Total Skor & Ringkasan */}
                {(() => {
                  const activeRubrikList = currentLombaDef ? getLombaRubrik(currentLombaDef, selectedKategori) : [];
                  const scoreRubriks = activeRubrikList.filter((r) => !r.isTime);
                  const timeRubrik = activeRubrikList.find((r) => r.isTime);
                  const maxScorePossible = scoreRubriks.reduce((acc, r) => acc + (r.max || 0), 0) || 100;
                  const currentTimeVal = timeRubrik ? rubrikScores[timeRubrik.id] : null;
                  const isTimeMissing = Boolean(timeRubrik && (!currentTimeVal || String(currentTimeVal).trim() === ""));

                  return (
                    <div className="space-y-4">
                      <div className="bg-gradient-to-br from-slate-950/90 to-amber-950/20 border border-amber-500/30 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-inner">
                        <div className="space-y-1 w-full sm:w-auto">
                          <span className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest block">
                            Total Nilai Terkalkulasi
                          </span>
                          <div className="flex items-baseline gap-2">
                            <span className="text-3xl md:text-4xl font-black text-amber-400 drop-shadow-[0_0_12px_rgba(245,166,35,0.4)] font-mono">
                              {totalScoreCalculated}
                            </span>
                            <span className="text-xs text-slate-500 font-bold">
                              / {maxScorePossible} Poin {timeRubrik ? "Ketepatan" : ""}
                            </span>
                          </div>
                          
                          {/* Status Durasi Waktu Jika Ada */}
                          {timeRubrik && (
                            <div className="text-[0.68rem] text-blue-300 font-medium flex items-center gap-1.5 pt-0.5">
                              <span>⏱️ Waktu Pengerjaan:</span>
                              <span className={`font-mono font-black ${isTimeMissing ? "text-red-400 font-bold" : "text-emerald-400"}`}>
                                {currentTimeVal ? currentTimeVal : "Belum Diisi (Wajib)"}
                              </span>
                            </div>
                          )}

                          <div className="w-48 bg-slate-800 rounded-full h-2 overflow-hidden mt-1">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-300"
                              style={{ width: `${Math.min(100, Math.round((totalScoreCalculated / maxScorePossible) * 100))}%` }}
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
                        disabled={saving || !isOnline || !selectedPeserta || isTimeMissing}
                        className={`w-full font-black py-4 px-6 rounded-2xl transition-all duration-300 tracking-wider text-sm uppercase flex items-center justify-center gap-2 ${
                          isTimeMissing
                            ? "bg-slate-800 text-slate-400 border-2 border-red-500/50 cursor-not-allowed opacity-75 shadow-none"
                            : selectedPeserta && activeScoresMap[selectedPeserta]
                            ? "bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 shadow-[0_8px_30px_rgba(6,182,212,0.3)] hover:shadow-[0_12px_40px_rgba(6,182,212,0.45)]"
                            : "bg-gradient-to-r from-amber-500 via-amber-600 to-emerald-600 hover:from-amber-400 hover:to-emerald-500 text-slate-950 shadow-[0_8px_30px_rgba(245,166,35,0.3)] hover:shadow-[0_12px_40px_rgba(245,166,35,0.45)]"
                        } hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:hover:translate-y-0`}
                      >
                        {saving ? (
                          <span className="flex items-center gap-2 text-white">
                            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            MENYIMPAN & MENYINKRONKAN NILAI...
                          </span>
                        ) : isTimeMissing ? (
                          <span className="flex items-center gap-2 text-red-300">
                            <span>⚠️</span>
                            <span>ISI KECEPATAN WAKTU UNTUK MENGUNCI NILAI</span>
                          </span>
                        ) : selectedPeserta && activeScoresMap[selectedPeserta] ? (
                          <>
                            <span>🔄</span>
                            <span>PERBARUI NILAI REGU INI (REVISI SKOR: {activeScoresMap[selectedPeserta].nilai} ➔ {totalScoreCalculated})</span>
                          </>
                        ) : (
                          <>
                            <span>🔒</span>
                            <span>KUNCI NILAI & SIMPAN (LANJUT KE REGU BERIKUTNYA)</span>
                          </>
                        )}
                      </button>

                      {isTimeMissing && selectedPeserta && (
                        <div className="bg-red-500/15 border border-red-500/40 rounded-xl p-3 text-center text-xs text-red-300 font-bold flex items-center justify-center gap-2 shadow-inner">
                          <span>⚠️</span>
                          <span>Form Kecepatan Waktu belum diisi. Masukkan catatan waktu (misal: 00:15:30.45) di form atas agar nilai dapat dikunci dan diupload.</span>
                        </div>
                      )}

                      {!selectedPeserta && (
                        <p className="text-center text-[0.68rem] text-slate-500 italic">
                          * Pilih salah satu Regu Peserta di bagian atas sebelum mengunci nilai.
                        </p>
                      )}
                    </div>
                  );
                })()}

              </form>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}