# 📋 Checklist Proyek: Live Leaderboard Penilaian Lomba Pramuka

Daftar checklist ini disusun berdasarkan rencana cetak biru di **[PRD.md](file:///d:/Joki-Website/leaderboard-pramuka/PRD.md)**, melacak dari tahap inisialisasi awal hingga fitur final yang berhasil ditambahkan.

---

## 🏗️ 1. Inisialisasi Proyek & Struktur Dasar
- ✅ Bootstrapping proyek web menggunakan framework Next.js.
- ✅ Instalasi dan konfigurasi client SDK `@supabase/supabase-js`.
- ✅ Pembuatan variabel lingkungan (`.env.local`) berisi kredensial URL dan API Key anonim Supabase.
- ✅ Struktur folder rute Next.js App Router (`/`, `/login`, `/dashboard/admin`, `/dashboard/juri`, `/leaderboard/[sd/smp/smk]`).

---

## 🗄️ 2. Arsitektur Data & Skema Database (Supabase PostgreSQL)
- ✅ **Tabel `public.profiles` (CRUD Terproteksi)**:
  - ✅ Integrasi kolom tugas `assigned_kategori` (SD/SMP/SMK) dan `assigned_lomba_id` (Cabang Lomba).
  - ✅ RLS terproteksi penuh menggunakan fungsi bypass rekursi `is_admin()`.
- ✅ **Tabel `public.peserta` (CRUD Terproteksi)**:
  - ✅ Menyimpan data `nomor_dada`, `nama_regu`, `pangkalan` (sekolah), `kategori`, dan `total_nilai`.
- ✅ **Tabel `public.lomba` (Cabang Lomba Dinamis)**:
  - ✅ Menggantikan 15 pos cabang lomba statis menjadi baris data dinamis (`nama_lomba`, `kode_lomba` 3-4 huruf, `kategori`).
- ✅ **Tabel `public.penilaian` (Transaksi Skor)**:
  - ✅ Constraint Unik Multi-Juri: `UNIQUE (peserta_id, juri_id, lomba_id)`.
- ✅ **Triggers & Functions**:
  - ✅ `update_total_nilai()`: Otomatis menghitung total nilai peserta sebagai jumlah dari nilai rata-rata (*Average*) multi-juri tiap pos.
  - ✅ `delete_auth_user_on_profile_delete()`: Otomatis menghapus akun login internal `auth.users` saat dewan juri dihapus di tabel `profiles` oleh Admin.

---

## 🔒 3. Autentikasi & RLS (FR-AU-01 & FR-AU-02)
- ✅ Halaman login tunggal (`/login`) untuk Admin Utama dan Dewan Juri.
- ✅ Login terproteksi server-side dengan session management Supabase Auth.
- ✅ Pengalihan otomatis (*auto-redirect*):
  - ✅ Admin Utama dialihkan ke `/dashboard/admin`.
  - ✅ Dewan Juri dialihkan ke `/dashboard/juri`.

---

## 👑 4. Fitur Panel Dashboard Admin Utama (`/dashboard/admin`)
- ✅ **Papan Matriks Penilaian**:
  - ✅ Menampilkan data rata-rata nilai juri per pos.
  - ✅ **Admin Override**: Admin dapat mengetik skor override langsung (termasuk **`0`**) atau mengosongkan kolom untuk menghapus nilai juri secara mutlak.
- ✅ **Manajemen Peserta (FR-AD-01 & FR-AD-02)**:
  - ✅ Search bar instan untuk pencarian sekolah/regu berdasarkan nama instansi.
  - ✅ Filter dinamis berdasarkan Tingkatan (SD/SMP/SMK) atau Status Penilaian (Sudah/Belum Dinilai).
- ✅ **Manajemen Akun Juri**:
  - ✅ Pendaftaran juri baru menggunakan koneksi Client sekunder `{ auth: { persistSession: false } }` agar Admin tidak ter-logout.
  - ✅ Penugasan tingkatan (SD/SMP/SMK) dan cabang lomba secara spesifik pada form pembuatan juri.
- ✅ **Modul Hapus Data Terintegrasi**:
  - ✅ Fitur hapus Juri, Peserta, dan Lomba menggunakan sistem konfirmasi aman **Inline State Confirmation** (`Ya, Hapus` / `Batal`).
- ✅ **Log Aktivitas Penilaian (FR-AD-03)**:
  - ✅ Log real-time 30 aktivitas penginputan nilai dewan juri terbaru yang langsung di-join dari database.

---

## ⚖️ 5. Fitur Panel Dewan Juri (`/dashboard/juri` - FR-JR-01 & FR-JR-02)
- ✅ **Assignment Lock**: Mengunci halaman input juri agar hanya menampilkan tingkat sekolah dan cabang lomba yang ditugaskan.
- ✅ **Secure RLS Enforcement**: Mencegah juri memodifikasi data cabang lomba lain di database.
- ✅ **Form Stepper Numeric**: Kontrol input skor 0-100 menggunakan numeric stepper untuk mencegah kesalahan penulisan.
- ✅ **Save/Upsert**: Penilaian di-save menggunakan target konflik `(peserta_id, juri_id, lomba_id)`.

---

## 🖥️ 6. Fitur Live Leaderboard Publik (FR-LB-01, FR-LB-02 & FR-LB-03)
- ✅ **Akses Publik Bebas Login**: Leaderboard langsung tampil di halaman depan (`/`) tanpa login sesuai permintaan pengguna.
- ✅ **URL Khusus**: Disediakan halaman khusus rute statis per tingkatan (`/leaderboard/sd`, `/leaderboard/smp`, dan `/leaderboard/smk`).
- ✅ **Silent Loading & Real-time Websockets**:
  - ✅ Data memuat secara senyap di latar belakang (*background fetch*) saat beralih tab tanpa memicu layar pemuatan hitam.
  - ✅ Pembaruan nilai juri memicu pembaruan dan pengurutan (*sorting*) baris sekolah secara real-time melalui websocket channels.
- ✅ **Asean Games Aesthetic**: Tampilan premium gelap futuristik dilengkapi animasi perubahan peringkat (`medal-gold`, `medal-silver`, `medal-bronze`).
- ✅ **Live Clock & Last Update**: Penunjuk waktu aktif dan pencatat waktu update nilai terakhir.
- ✅ **Running Text / Marquee Ticker**: Baris running text di bawah layar yang memperlihatkan skor juri yang baru saja masuk secara real-time.

---

## 🌐 7. Kebutuhan Non-Fungsional (NFR)
- ✅ **Edge Hosting via Vercel**: Deployment cloud server aktif 24/7 bebas tidur.
- ✅ **Mitigasi Jaringan Putus**: Banner peringatan `KONEKSI TERPUTUS` otomatis muncul jika koneksi internet klien terputus saat penginputan nilai.
