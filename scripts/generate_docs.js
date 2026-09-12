const fs = require("fs");
const path = require("path");

const LOMBA_SD = [
  { id: "efb72c87-594c-41ed-9b41-83098e8c6f5c", kode: "ADM", nama: "Administrasi Regu" },
  { id: "b528b529-6152-42b1-b810-48f598cd6c0e", kode: "FRP", nama: "Forum Penggalang" },
  { id: "400ee260-9d94-4327-b8f0-08790826bf69", kode: "HMN", nama: "Menyanyi Hymne & Mars Tangerang" },
  { id: "701c8117-12c6-4dbb-bd8a-1dc369f28ae3", kode: "KIM", nama: "Obat Tradisional & KIM" },
  { id: "442a5d29-1703-40a9-9480-216ae536406e", kode: "KRN", nama: "Karnaval" },
  { id: "80771c90-672d-4145-bc4f-29f57a3ebc57", kode: "MRS", nama: "Morse Pluit" },
  { id: "336c78c2-4185-4179-9725-39285d46242e", kode: "MSK", nama: "Masak Nusantara" },
  { id: "a0c6d26a-633d-4444-9359-454ef6f23c90", kode: "NAV", nama: "Orienteering Navigasi" },
  { id: "b4318236-e4e3-4799-b408-188000482d0c", kode: "PCK", nama: "Packing Perlengkapan" },
  { id: "e0d60070-1be2-4184-a367-efb663211a7c", kode: "PGD", nama: "PPPK / PPGD" },
  { id: "16c6eb28-b2c4-4582-a05f-fb9bf0846211", kode: "PNR", nama: "Pionering & Tali-Temali" },
  { id: "9fa44cf1-e3b0-4ac6-a6ac-3610c820d442", kode: "SMP", nama: "Semaphore" },
  { id: "60bafddb-7337-4eeb-910e-1fc458801142", kode: "SND", nama: "Sandi-Sandi" },
  { id: "6d435369-e9b5-4a12-a8bf-7d44b7093ecf", kode: "TKS", nama: "Menaksir" },
  { id: "e605e267-fcc5-4d3b-9899-43a57699d125", kode: "TSB", nama: "Pentas Seni Budaya (Tari Kreasi)" },
];

const GENDERS = [
  { key: "pa", label: "Putra", dbVal: "Laki-laki" },
  { key: "pi", label: "Putri", dbVal: "Perempuan" },
];

const PASSWORD_TEXT = "JuriLT2MekarBaru2026!";

let md = `# 📋 Daftar Kredensial Akun Dewan Juri — Tingkat SD (90 Juri)
**Lomba Tingkat II (LT-II) Kwartir Ranting Mekar Baru 2026**

Dokumen ini berisi daftar lengkap **90 Dewan Juri** untuk tingkatan **SD / MI** yang mencakup seluruh **15 Cabang Lomba** dan kedua gender (**Putra & Putri**), di mana setiap cabang lomba memiliki **3 Dewan Juri Putra** dan **3 Dewan Juri Putri**.

---

### 🔑 Informasi Login Seragam
- **URL Login Juri:** [https://www.siloti-kwaranmekarbaru.my.id/login](https://www.siloti-kwaranmekarbaru.my.id/login)
- **Password Default (Semua Juri):** \`${PASSWORD_TEXT}\`

---

## 📊 Ringkasan Pembagian Dewan Juri SD
| No | Cabang Lomba | Kode | Juri Putra | Juri Putri | Total Juri |
|---|---|:---:|:---:|:---:|:---:|
`;

LOMBA_SD.forEach((l, idx) => {
  md += `| ${idx + 1} | ${l.nama} | **${l.kode}** | 3 Juri | 3 Juri | 6 Juri |\n`;
});

md += `| | **TOTAL** | | **45 Juri** | **45 Juri** | **90 Juri** |

---

## 📑 Tabel Rincian 90 Akun Dewan Juri SD

| No | Nama Dewan Juri | Cabang Lomba | Gender | Email Login | Kata Sandi |
|:---:|---|---|:---:|---|---|
`;

let counter = 1;
LOMBA_SD.forEach((l) => {
  GENDERS.forEach((g) => {
    for (let j = 1; j <= 3; j++) {
      const email = `juri${j}.${l.kode.toLowerCase()}.sd.${g.key}@pramuka.id`;
      const nama = `Juri ${j} ${l.nama} (${g.label})`;
      md += `| ${counter} | **${nama}** | ${l.nama} (${l.kode}) | ${g.label} | \`${email}\` | \`${PASSWORD_TEXT}\` |\n`;
      counter++;
    }
  });
});

md += `
---

## 🚀 Cara Menjalankan Uji Coba Penilaian di Supabase

1. Buka [Supabase Dashboard](https://supabase.com/dashboard) -> pilih proyek Anda.
2. Masuk ke menu **SQL Editor** di sidebar kiri.
3. Buka file [seed-juri-sd-lengkap.sql](seed-juri-sd-lengkap.sql) yang ada di folder proyek Anda.
4. Salin (copy) seluruh kodenya dan tempelkan (paste) ke SQL Editor Supabase.
5. Klik tombol **Run** (atau tekan \`Ctrl + Enter\`).
6. **Selesai!**
   - Seluruh 90 akun juri otomatis dibuat di \`auth.users\` dan \`profiles\` (langsung terverifikasi).
   - Seluruh 36 regu SD (16 Putra & 20 Putri) otomatis terisi nilai uji coba dari ketiga dewan juri pada masing-masing lomba.
   - Total nilai akumulasi otomatis dihitung sebagai rata-rata dari 3 juri untuk setiap pos lomba.
`;

fs.writeFileSync(path.resolve("DAFTAR_90_DEWAN_JURI_SD.md"), md);
console.log("Written DAFTAR_90_DEWAN_JURI_SD.md successfully!");
