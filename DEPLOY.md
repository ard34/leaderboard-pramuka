# Panduan Deployment Lengkap — Sistem Leaderboard Pramuka

Dokumen ini berisi panduan lengkap langkah-demi-langkah untuk melakukan deployment aplikasi **Sistem Penilaian & Live Leaderboard Lomba Pramuka** menggunakan **Supabase (Backend, Database, Auth)** dan **Vercel (Frontend Next.js)**.

---

## 📋 Prasyarat Sebelum Deploy
Sebelum memulai, pastikan Anda memiliki:
1. Akun [GitHub](https://github.com/) (atau GitLab/Bitbucket).
2. Akun [Supabase](https://supabase.com/).
3. Akun [Vercel](https://vercel.com/).
4. Git terinstal di komputer lokal Anda.

---

## 🛠️ Langkah 1: Setup Database & Realtime di Supabase

### 1. Buat Proyek Baru di Supabase
1. Masuk ke [Supabase Dashboard](https://supabase.com/dashboard).
2. Klik **New Project** dan pilih organisasi Anda.
3. Masukkan data proyek:
   - **Name**: `leaderboard-pramuka` (atau nama lain bebas).
   - **Database Password**: Buat password yang kuat dan catat/simpan password ini.
   - **Region**: Pilih lokasi terdekat (misalnya `Singapore`).
   - **Pricing Plan**: Pilih **Free** (jika menggunakan akun gratis).
4. Klik **Create new project** dan tunggu proses penyediaan (provisioning) selesai (sekitar 1-2 menit).

### 2. Jalankan Skema Database (Tabel & Trigger)
Setelah proyek aktif:
1. Di sidebar kiri, klik menu **SQL Editor** (ikon persegi dengan tulisan `SQL`).
2. Klik **New Query** (atau **Quickstart** -> **New Query**).
3. Buka file [supabase-setup.sql](file:///d:/Joki-Website/leaderboard-pramuka/supabase-setup.sql) yang ada di folder proyek Anda.
4. Salin seluruh isi file tersebut, tempelkan ke kolom SQL Editor Supabase, lalu klik **Run** (atau tekan `Ctrl + Enter`).
5. Pastikan muncul pesan sukses: `Success. No rows returned.`

### 3. Masukkan Data Awal Peserta (Seed Data)
1. Di SQL Editor Supabase, buat query baru lagi (**New Query**).
2. Buka file [supabase-seed-data.sql](file:///d:/Joki-Website/leaderboard-pramuka/supabase-seed-data.sql) dari proyek Anda.
3. Salin seluruh isinya, tempelkan ke SQL Editor, lalu klik **Run**.
4. Langkah ini akan mengisi data 45 regu awal untuk kategori SD, SMP, dan SMK ke tabel `peserta`.

---

## 👤 Langkah 2: Konfigurasi Supabase Auth & Akun Admin Utama

Aplikasi ini menggunakan sistem registrasi juri satu pintu dari halaman Admin. Supaya Admin dapat mendaftarkan juri secara instan tanpa verifikasi email, ikuti langkah berikut:

### 1. Nonaktifkan Verifikasi Email (Email Confirmation)
1. Di sidebar kiri Supabase, masuk ke menu **Authentication** -> **Providers**.
2. Klik opsi **Email** untuk membuka pengaturannya.
3. Matikan saklar **Confirm email** (ubah menjadi nonaktif / disabled).
4. Klik **Save** di bagian bawah.

### 2. Buat Akun User Admin di Supabase Auth
1. Masuk ke menu **Authentication** -> **Users**.
2. Klik tombol **Add User** -> pilih **Create User**.
3. Isi data:
   - **Email**: Email yang akan digunakan sebagai login Admin (misal: `admin@pramuka.com`).
   - **Password**: Masukkan password minimal 6 karakter.
   - Hapus/matikan centang pada pilihan **Send invite email**.
4. Klik **Create User**.
5. Setelah user berhasil dibuat, **salin UUID** user tersebut (contoh UUID: `e4b33d06-cfb0-4db8-b5d1-9f9361ad28a4`).

### 3. Daftarkan Role User Menjadi Admin di Database
User yang baru dibuat di atas hanya terdaftar di sistem Auth Supabase, belum terdaftar di tabel profil database kita dengan status Admin.
1. Kembali ke **SQL Editor** -> buat **New Query**.
2. Jalankan perintah SQL berikut (ganti `<UUID-USER-ADMIN-ANDA>` dengan UUID yang baru saja Anda salin):
   ```sql
   INSERT INTO public.profiles (id, nama_lengkap, role)
   VALUES ('<UUID-USER-ADMIN-ANDA>', 'Admin Utama', 'admin');
   ```
3. Klik **Run**. Sekarang akun tersebut sudah resmi memiliki hak akses sebagai **Admin Utama**.

---

## 🚀 Langkah 3: Upload Code ke Git (GitHub)

Sebelum mendeploy frontend ke Vercel, kita perlu mengunggah kode ke repository Git.

1. Inisialisasi Git (jika belum dilakukan):
   ```bash
   git init
   ```
2. Tambahkan semua file (file `.env.local` otomatis diabaikan karena sudah terdaftar di `.gitignore`):
   ```bash
   git add .
   ```
3. Lakukan commit:
   ```bash
   git commit -m "Initial commit leaderboard pramuka"
   ```
4. Buat repository baru di GitHub secara online (buat sebagai private atau public).
5. Hubungkan repository lokal Anda dengan GitHub lalu push kodenya:
   ```bash
   git remote add origin <URL_REPOSITORY_GITHUB_ANDA>
   git branch -M main
   git push -u origin main
   ```

---

## 🌐 Langkah 4: Deploy Frontend Next.js ke Vercel

1. Buka [Vercel Dashboard](https://vercel.com/) dan login.
2. Klik tombol **Add New** -> pilih **Project**.
3. Cari repository proyek `leaderboard-pramuka` Anda di daftar proyek GitHub, lalu klik **Import**.
4. Di bagian **Configure Project**:
   - **Framework Preset**: Vercel akan otomatis mendeteksi **Next.js**.
   - **Root Directory**: Biarkan default (`./`).
   - **Build and Output Settings**: Biarkan default.
5. Klik menu dropdown **Environment Variables** untuk menambahkan variabel lingkungan agar Next.js dapat berkomunikasi dengan Supabase:
   
   Dapatkan nilai variabel ini dari Dashboard Supabase Anda:
   * Buka Supabase -> **Project Settings** (ikon roda gigi di kiri bawah) -> **API**.
   
   Masukkan nilai berikut di Vercel:
   - **Key**: `NEXT_PUBLIC_SUPABASE_URL`  
     **Value**: *(Salin dari kolom Project URL)*
   - **Key**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`  
     **Value**: *(Salin dari kolom API Keys bagian `anon` `public`)*
6. Klik tombol **Deploy** dan tunggu 2-3 menit hingga proses build selesai.
7. Setelah selesai, Anda akan mendapatkan URL publik website Anda (contoh: `https://leaderboard-pramuka.vercel.app`).

---

## 🧪 Langkah 5: Pengujian Pasca-Deployment

Setelah proses deploy berhasil, lakukan langkah pengujian ini untuk memastikan semua sistem berjalan normal:

1. **Akses Leaderboard Publik (Tanpa Login)**:
   - Akses `/leaderboard/sd`
   - Akses `/leaderboard/smp`
   - Akses `/leaderboard/smk`
   - Pastikan halaman klasemen dengan styling ASEAN Games termuat dengan indah dan tabel data peserta terisi (diambil dari data seed).

2. **Login Sebagai Admin**:
   - Buka `/login`.
   - Masukkan email dan password Admin yang telah dibuat di Supabase Auth pada Langkah 2.
   - Pastikan Anda diarahkan ke `/dashboard/admin`.

3. **Manajemen Cabang Lomba & Juri**:
   - Di panel Admin, cobalah membuat satu Cabang Lomba baru (contoh: `Pionering`, kode: `PNR`, tingkat: `SMP`).
   - Buat satu Akun Juri baru (contoh: Nama: `Juri Pionering SMP`, Email: `juri1@gmail.com`, Password: `password123`).
   - Pilih penugasan juri tersebut ke cabang lomba `Pionering` dan tingkat `SMP`.
   - Klik **Tambah Juri**. Akun ini akan otomatis terdaftar di Auth Supabase & database profiles.

4. **Uji Coba Penilaian Real-Time**:
   - Buka browser baru atau jendela *Incognito* dan buka halaman `/login`.
   - Login menggunakan akun Juri yang baru dibuat (`juri1@gmail.com` / `password123`).
   - Pastikan Juri masuk ke halaman `/dashboard/juri` dan hanya melihat input nilai untuk lomba `Pionering` tingkat `SMP`.
   - Cobalah mengubah nilai untuk salah satu regu (misalnya mengubah nilai dari `0` menjadi `95`), lalu klik **Simpan Nilai**.
   - Buka halaman `/leaderboard/smp` secara berdampingan. Anda akan melihat peringkat regu tersebut bergeser secara mulus melalui animasi transisi dan running text (ticker log) di bagian bawah ikut memperbarui data secara instan tanpa perlu reload halaman!
