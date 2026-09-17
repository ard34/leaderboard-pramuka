// Daftar 19 Sekolah SD/MI & 7 Sekolah SMP/MTs (Total 52 Regu Putra & Putri)
export const NAMA_REGU_PUTRA_SD = [
  "Regu Garuda", "Regu Elang", "Regu Rajawali", "Regu Singa", "Regu Harimau",
  "Regu Badak", "Regu Banteng", "Regu Serigala", "Regu Cobra", "Regu Scorpio",
  "Regu Jaguar", "Regu Panther", "Regu Kancil", "Regu Kucing Hutan", "Regu Beruang",
  "Regu Merak", "Regu Jalak", "Regu Kutilang", "Regu Kenari"
];

export const NAMA_REGU_PUTRI_SD = [
  "Regu Melati", "Regu Mawar", "Regu Anggrek", "Regu Dahlia", "Regu Teratai",
  "Regu Sakura", "Regu Tulip", "Regu Cempaka", "Regu Flamboyan", "Regu Kenanga",
  "Regu Lily", "Regu Lavender", "Regu Asoka", "Regu Bougenville", "Regu Edelweis",
  "Regu Kamboja", "Regu Matahari", "Regu Sedap Malam", "Regu Nusa Indah"
];

export const NAMA_REGU_PUTRA_SMP = [
  "Regu Harimau", "Regu Singa", "Regu Rajawali", "Regu Garuda",
  "Regu Elang", "Regu Serigala", "Regu Banteng"
];

export const NAMA_REGU_PUTRI_SMP = [
  "Regu Melati", "Regu Mawar", "Regu Anggrek", "Regu Dahlia",
  "Regu Sakura", "Regu Lily", "Regu Teratai"
];

export const TEST_PESERTA_SD = [];
// 19 Regu Putra SD (101 - 119)
for (let i = 1; i <= 19; i++) {
  TEST_PESERTA_SD.push({
    id: `sd-pa-${100 + i}`,
    nomor_dada: 100 + i,
    nama_regu: NAMA_REGU_PUTRA_SD[i - 1] || `Regu Putra ${i}`,
    pangkalan: `SDN Mekar Baru ${i}`,
    no_gudep: `01.${String(i * 2 - 1).padStart(3, "0")}`,
    kontak_person: `08123456${String(100 + i)}`,
    email: `sdtest${i}@gmail.com`,
    kategori: "SD",
    gender: "Laki-laki",
    is_verified: true,
    status_berkas: { ketersediaan: true, pendaftaran: true, biodata_peserta: true, biodata_pembina: true, bukti_pembayaran: true },
    catatan_berkas: "Berkas lengkap dan terverifikasi",
    total_nilai: 0,
  });
}
// 19 Regu Putri SD (121 - 139)
for (let i = 1; i <= 19; i++) {
  TEST_PESERTA_SD.push({
    id: `sd-pi-${120 + i}`,
    nomor_dada: 120 + i,
    nama_regu: NAMA_REGU_PUTRI_SD[i - 1] || `Regu Putri ${i}`,
    pangkalan: `SDN Mekar Baru ${i}`,
    no_gudep: `01.${String(i * 2).padStart(3, "0")}`,
    kontak_person: `08123456${String(120 + i)}`,
    email: `sdtest${i}@gmail.com`,
    kategori: "SD",
    gender: "Perempuan",
    is_verified: true,
    status_berkas: { ketersediaan: true, pendaftaran: true, biodata_peserta: true, biodata_pembina: true, bukti_pembayaran: true },
    catatan_berkas: "Berkas lengkap dan terverifikasi",
    total_nilai: 0,
  });
}

export const TEST_PESERTA_SMP = [];
// 7 Regu Putra SMP (201 - 207)
for (let i = 1; i <= 7; i++) {
  TEST_PESERTA_SMP.push({
    id: `smp-pa-${200 + i}`,
    nomor_dada: 200 + i,
    nama_regu: NAMA_REGU_PUTRA_SMP[i - 1] || `Regu Putra SMP ${i}`,
    pangkalan: `SMPN Mekar Baru ${i}`,
    no_gudep: `02.${String(i * 2 - 1).padStart(3, "0")}`,
    kontak_person: `08123456${String(200 + i)}`,
    email: `smptest${i}@gmail.com`,
    kategori: "SMP",
    gender: "Laki-laki",
    is_verified: true,
    status_berkas: { ketersediaan: true, pendaftaran: true, biodata_peserta: true, biodata_pembina: true, bukti_pembayaran: true },
    catatan_berkas: "Berkas lengkap dan terverifikasi",
    total_nilai: 0,
  });
}
// 7 Regu Putri SMP (211 - 217)
for (let i = 1; i <= 7; i++) {
  TEST_PESERTA_SMP.push({
    id: `smp-pi-${210 + i}`,
    nomor_dada: 210 + i,
    nama_regu: NAMA_REGU_PUTRI_SMP[i - 1] || `Regu Putri SMP ${i}`,
    pangkalan: `SMPN Mekar Baru ${i}`,
    no_gudep: `02.${String(i * 2).padStart(3, "0")}`,
    kontak_person: `08123456${String(210 + i)}`,
    email: `smptest${i}@gmail.com`,
    kategori: "SMP",
    gender: "Perempuan",
    is_verified: true,
    status_berkas: { ketersediaan: true, pendaftaran: true, biodata_peserta: true, biodata_pembina: true, bukti_pembayaran: true },
    catatan_berkas: "Berkas lengkap dan terverifikasi",
    total_nilai: 0,
  });
}

export const ALL_TEST_PESERTA = [...TEST_PESERTA_SD, ...TEST_PESERTA_SMP];
