# Product Requirement Document (PRD)
## Sistem Penilaian & Live Leaderboard Lomba Pramuka (ASEAN Games Style)

## 1. Ringkasan Proyek & Tujuan
Sistem ini dibangun untuk mendigitalisasi proses penilaian dalam perlombaan Pramuka yang mencakup 15 cabang lomba, 3 tingkatan sekolah (SD, SMP, SMK), serta 2 kategori gender (Laki-laki & Perempuan). 

Sistem wajib menyajikan papan klasemen (Live Leaderboard) interaktif berestetika olahraga modern (ala ASEAN Games) yang diperbarui secara real-time tanpa memuat ulang (refresh) halaman, sekaligus menyediakan panel kontrol input nilai yang aman bagi Dewan Juri dan Admin Utama.

### Sasaran Utama:
* Aksesibilitas Tinggi: Sistem dipasang di cloud server 1 bulan sebelum perlombaan dan dijamin aktif 24/7 tanpa shutdown selama 7 hari penuh masa lomba.
* Keamanan Ketat: Validasi hak akses dilakukan sepenuhnya di sisi server (server-side validation) untuk mencegah manipulasi nilai antar-juri.
* Reaktivitas Instan: Perubahan nilai oleh juri langsung menggeser posisi peringkat di layar leaderboard publik dalam hitungan milidetik.

## 2. Peran Pengguna (User Roles & Access Control)
Sistem menggunakan kontrol akses berbasis peran (Role-Based Access Control) yang divalidasi langsung oleh database server (Supabase Auth & RLS).

| Peran (Role) | Hak Akses Fitur | Cakupan Visual Data |
| :--- | :--- | :--- |
| Admin Utama (Admin 1) | Hak penuh (CRUD) data sekolah, manajemen akun juri, konfigurasi sistem, dan input/edit semua nilai. | Melihat seluruh 15 cabang lomba, semua tingkatan (SD/SMP/SMK), dan semua kategori gender. |
| Dewan Juri | Terbatas hanya pada aksi Insert/Update nilai pada cabang lomba dan tingkatan yang ditugaskan oleh server. | Hanya melihat kolom input nilai untuk cabang lomba spesifiknya sendiri. Kolom lomba lain disembunyikan. |
| Publik (Penonton) | Hanya baca (Read-Only) pada halaman klasemen utama. Tidak memerlukan login. | Melihat halaman publik terpisah untuk papan skor SD, SMP, dan SMK. |

## 3. Kebutuhan Fungsional (Functional Requirements)
### 3.1 Fitur Autentikasi & Login
* FR-AU-01: Halaman login tunggal untuk Admin dan Juri. Validasi dilakukan oleh server.
* FR-AU-02: Sistem membaca role token juri setelah berhasil masuk, lalu secara dinamis mengarahkan ke halaman panel yang sesuai.

### 3.2 Fitur Panel Admin Utama (Admin 1)
* FR-AD-01: Fitur pencarian (Search Bar) sekolah secara instan berdasarkan nama instansi.
* FR-AD-02: Fitur filter dinamis untuk menampilkan data berdasarkan Tingkatan (SD/SMP/SMK) atau Status Penilaian (Sudah Dinilai/Belum Dinilai).
* FR-AD-03: Tombol kontrol global "Simpan Nilai" dan "Reset Form" yang dilengkapi dengan status konfirmasi log aktivitas di bagian bawah layar (ticker log).

### 3.3 Fitur Panel Dewan Juri (Akses Terbatas)
* FR-JR-01: Form input nilai menggunakan komponen numeric stepper dengan batas validasi nilai 0-100.
* FR-JR-02: Sistem menyembunyikan seluruh kolom cabang lomba lain yang bukan merupakan wewenang juri tersebut berdasarkan kebijakan keamanan server (Row Level Security).

### 3.4 Fitur Live Leaderboard Publik
* FR-LB-01: Pemisahan halaman visual klasemen menjadi 3 URL rute statis yang berbeda: `/leaderboard/sd`, `/leaderboard/smp`, dan `/leaderboard/smk`.
* FR-LB-02: Komponen animasi transisi yang otomatis menggeser baris nama sekolah ke atas atau ke bawah secara halus jika terjadi perubahan akumulasi nilai (auto-sorting).
* FR-LB-03: Penayangan komponen Live Ticker Line di bagian bawah layar yang terus berjalan menampilkan info ringkas skor terbaru yang masuk.

## 4. Arsitektur Data & Skema Database
Database menggunakan PostgreSQL di Supabase dengan relasi:
- Tabel `sekolah` (id UUID PK, nama_sekolah, tingkat, kategori_gender)
- Tabel `cabang_lomba` (id INT PK, nama_lomba)
- Tabel `nilai` (id BIGINT PK, sekolah_id FK, lomba_id FK, skor NUMERIC, updated_at)
Diterapkan Composite Unique Constraint pada tabel `nilai` untuk kolom `(sekolah_id, lomba_id)`.

## 5. Kebutuhan Non-Fungsional (Non-Functional Requirements)
* Ketersediaan & Runtime (Availability): Serverless/Edge Hosting via Vercel agar 24/7 tanpa mode tidur (spin down).
* Performa Real-Time: Transmisi menggunakan protokol WebSockets (Supabase Realtime) dengan payload hemat data (single JSON row) untuk menjaga batas egress data free tier 2 GB.
* Mitigasi Jaringan Putus: Front-end mendeteksi status internet offline saat juri menginput nilai dan memberi peringatan tanpa menghilangkan data form lokal.