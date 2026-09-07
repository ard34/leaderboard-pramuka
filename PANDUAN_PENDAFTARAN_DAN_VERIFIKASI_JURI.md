# Buku Panduan Resmi Sistem SILOTI
## Tata Cara Registrasi Dewan Juri, Pendaftaran Peserta, Verifikasi Admin, dan Akses Penilaian

> **Sistem Informasi Lomba Tingkat (SILOTI)**  
> **Kwartir Ranting Gerakan Pramuka Mekar Baru — LT-II Tahun 2026**  
> Alamat Website: [https://www.siloti-kwaranmekarbaru.my.id](https://www.siloti-kwaranmekarbaru.my.id)

---

## Daftar Isi
1. [Alur Kerja Sistem (Workflow)](#1-alur-kerja-sistem-workflow)
2. [Panduan Registrasi Dewan Juri](#2-panduan-registrasi-dewan-juri)
3. [Tampilan Status Menunggu Verifikasi](#3-tampilan-status-menunggu-verifikasi)
4. [Panduan Admin: Login & Verifikasi Dewan Juri](#4-panduan-admin-login--verifikasi-dewan-juri)
5. [Panduan Login & Penggunaan Dashboard Dewan Juri](#5-panduan-login--penggunaan-dashboard-dewan-juri)
6. [Panduan Registrasi Peserta Regu & Unggah Berkas](#6-panduan-registrasi-peserta-regu--unggah-berkas)
7. [Daftar Tautan & Kredensial Resmi](#7-daftar-tautan--kredensial-resmi)

---

## 1. Alur Kerja Sistem (Workflow)

Untuk menjaga akurasi dan kerahasiaan penilaian kegiatan Pramuka LT-II, sistem SILOTI menerapkan mekanisme persetujuan akun dewan juri secara terpusat oleh Admin:

```
[Calon Juri] ─── Mengisi Form Pendaftaran ───> [Sistem: Status Menunggu Verifikasi]
                                                                │
                                                                ▼
[Admin] ◄─── Notifikasi & Cek Manajemen Juri ◄──────────────────┘
   │
   ├─► Klik "⚡ Verifikasi"
   └─► Masukkan Password Baru (Contoh: juri123) ───> [Sistem: Status Aktif]
                                                            │
                                                            ▼
[Juri Terverifikasi] ◄─── Menerima Akun & Sandi ◄───────────┘
   │
   └─► Login di /login ───► Masuk Dashboard Juri ───► Penilaian Realtime
```

---

## 2. Panduan Registrasi Dewan Juri

Tautan Halaman: **[https://www.siloti-kwaranmekarbaru.my.id/juri/register](https://www.siloti-kwaranmekarbaru.my.id/juri/register)**

### Data yang Wajib Diisi di Formulir:

| Kolom Input | Tipe Data | Deskripsi & Petunjuk Pengisian | Contoh Data |
|---|---|---|---|
| **Nama Lengkap** | Teks | Nama lengkap calon dewan juri disertai gelar bila ada | `Kak Budi Santoso, S.Pd` |
| **Email Aktif** | Email | Alamat email aktif untuk username login dan pengiriman konfirmasi | `juribudi.test@gmail.com` |
| **No. WhatsApp** | Nomor Telepon | Nomor kontak WhatsApp aktif untuk koordinasi panitia | `081234567890` |
| **Tugas Tingkatan** | Dropdown | Pilih tingkatan peserta yang akan dinilai: <br/>• **SD / MI** <br/>• **SMP / MTs** | `SD / MI` |
| **Kategori Regu** | Dropdown | Pilih kategori regu yang dinilai: <br/>• **Putra (Laki-laki)** <br/>• **Putri (Perempuan)** | `Putra (Laki-laki)` |
| **Tugas Cabang Lomba** | Dropdown | Pilih mata lomba sesuai penugasan SK Panitia (Pionering, Sandi, PPPK, dll) | `Pionering & Tali-Temali` |

### Langkah Pendaftaran:
1. Buka halaman registrasi juri melalui link [https://www.siloti-kwaranmekarbaru.my.id/juri/register](https://www.siloti-kwaranmekarbaru.my.id/juri/register).
2. Isi formulir dengan data yang sesuai.
3. Klik tombol biru **"DAFTAR SEBAGAI JURI"**.
4. Sistem akan memproses dan mengunci data untuk peninjauan admin.

---

## 3. Tampilan Status Menunggu Verifikasi

Setelah formulir dikirimkan, juri akan langsung melihat layar konfirmasi:

- **Judul**: *PENDAFTARAN MENUNGGU VERIFIKASI!*
- **Pesan Sistem**:  
  > *"Registrasi berhasil. Data Anda sedang ditinjau oleh Admin. Jika disetujui, Admin akan menghubungi Anda dan memberikan Kata Sandi untuk masuk ke panel juri dengan email `[email_juri]`."*
- Tombol **"Ke Halaman Login"** disediakan agar juri dapat langsung menuju form login setelah menerima kata sandi dari Admin.

---

## 4. Panduan Admin: Login & Verifikasi Dewan Juri

### Langkah 1: Login ke Dashboard Admin
1. Buka URL: **[https://www.siloti-kwaranmekarbaru.my.id/login](https://www.siloti-kwaranmekarbaru.my.id/login)**
2. Masukkan kredensial administrator:
   - **Email / Akun**: `admin@gmail.com`
   - **Kata Sandi**: `admin123`
3. Klik tombol **"MASUK KE SISTEM"**.
4. Sistem otomatis mengarahkan ke halaman `/dashboard/admin`.

### Langkah 2: Proses Verifikasi Dewan Juri
1. Pada menu dashboard atas, klik tab **"Dewan Juri"**.
2. Pada tabel akun juri, cari nama juri yang baru mendaftar (berstatus **`⏳ Menunggu`**).
3. Pada baris tersebut di kolom aksi, klik tombol kuning **"⚡ Verifikasi"**.
4. Pada kolom isian **`Set Password`** yang muncul, masukkan kata sandi untuk juri tersebut (minimal 6 karakter, misal: `juri123`).
5. Klik tombol **"Simpan"**.
6. Status juri akan langsung berubah menjadi **`✅ Aktif`**, dan sistem secara otomatis:
   - Mengaktifkan kredensial di database Supabase Auth.
   - Mengirimkan email konfirmasi / membukakan rincian login untuk dikirimkan ke Juri yang bersangkutan.

---

## 5. Panduan Login & Penggunaan Dashboard Dewan Juri

Setelah akun juri diverifikasi oleh Admin:

### Langkah Login Juri:
1. Buka [https://www.siloti-kwaranmekarbaru.my.id/login](https://www.siloti-kwaranmekarbaru.my.id/login).
2. Masukkan email juri (misal: `juribudi.test@gmail.com`).
3. Masukkan kata sandi yang telah di-set Admin (misal: `juri123`).
4. Klik **"MASUK KE SISTEM"**.
5. Juri akan langsung diarahkan ke `/dashboard/juri`.

### Menu & Fitur Dashboard Penilaian Juri:
- **Informasi Tugas**: Sistem secara otomatis mengunci tampilan penilaian hanya untuk mata lomba, tingkatan, dan kategori gender yang ditugaskan kepada juri tersebut.
- **Pilihan Regu Peserta**: Memilih nomor dada atau nama regu yang sedang dinilai.
- **Rubrik Penilaian Terstandar JUKLAK**: Juri memberikan nilai per kriteria (misal vokal, teknik, ketepatan, kerapihan, kreativitas).
- **Kalkulasi Total Otomatis**: Menghindari kesalahan hitung manual nilai total.
- **Simpan Nilai**: Sekali klik tombol hijau **"Simpan Nilai"**, nilai langsung tersimpan ke pangkalan data dan mengupdate Live Klasemen.

---

## 6. Panduan Registrasi Peserta Regu & Unggah Berkas

Tautan Halaman: **[https://www.siloti-kwaranmekarbaru.my.id/peserta/register](https://www.siloti-kwaranmekarbaru.my.id/peserta/register)**

### Data yang Diinput:
1. **Asal Pangkalan / Sekolah**: Contoh `SDN 1 Mekar Baru`
2. **Kwartir Ranting**: Pilihan `Mekar Baru` (atau kwarran terkait)
3. **No. Gugus Depan**: Contoh `01.025 - 01.026`
4. **Nama Regu**: Nama regu putra/putri, contoh `Regu Elang` atau `Regu Melati`
5. **Tingkatan**: Pilihan `SD / MI` atau `SMP / MTs`
6. **Kategori Regu**: `Putra (Laki-laki)` atau `Putri (Perempuan)`
7. **Nama Pembina Pendamping**: Nama lengkap pembina
8. **No. WhatsApp Pembina**: Nomor WhatsApp aktif
9. **Email Pembina/Pangkalan**: Email aktif untuk menerima bukti pendaftaran & kapling tenda

### 5 Berkas Persyaratan yang Wajib Diunggah (Max 2MB per file, format PDF/JPG/PNG):
1. **Formulir 01 / LT-II 2026** (Kesediaan Gugus Depan)
2. **Formulir 02 / LT-II 2026** (Pendaftaran Peserta Regu)
3. **Formulir 03 / LT-II 2026** (Biodata Anggota Peserta)
4. **Formulir 03 / LT-II 2026** (Biodata Pembina Pendamping)
5. **Bukti Pembayaran / Iuran Pendaftaran**

Setelah seluruh isian dan berkas lengkap, klik **"KIRIM PENDAFTARAN REGU"**.

---

## 7. Daftar Tautan & Kredensial Resmi

| Halaman | URL | Keterangan |
|---|---|---|
| **Beranda Utama** | `https://www.siloti-kwaranmekarbaru.my.id/` | Informasi umum kegiatan LT-II |
| **Registrasi Juri** | `https://www.siloti-kwaranmekarbaru.my.id/juri/register` | Pendaftaran mandiri dewan juri |
| **Registrasi Peserta** | `https://www.siloti-kwaranmekarbaru.my.id/peserta/register` | Pendaftaran regu + unggah berkas |
| **Halaman Login** | `https://www.siloti-kwaranmekarbaru.my.id/login` | Pintu masuk Admin & Dewan Juri |
| **Dashboard Admin** | `https://www.siloti-kwaranmekarbaru.my.id/dashboard/admin` | Login: `admin@gmail.com` / `admin123` |
| **Dashboard Juri** | `https://www.siloti-kwaranmekarbaru.my.id/dashboard/juri` | Sesuai email & sandi verifikasi admin |
| **Leaderboard SD** | `https://www.siloti-kwaranmekarbaru.my.id/leaderboard/sd` | Live Klasemen SD/MI |
| **Leaderboard SMP** | `https://www.siloti-kwaranmekarbaru.my.id/leaderboard/smp` | Live Klasemen SMP/MTs |
