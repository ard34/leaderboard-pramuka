-- ============================================================
-- SQL PEMBERSIH DATA TESTING — Sistem Leaderboard Pramuka LT-II
-- ============================================================
-- Jalankan skrip ini di Supabase SQL Editor (https://supabase.com/dashboard)
-- Query ini akan membersihkan seluruh sampah peserta uji coba, 
-- nilai uji coba, dan akun dewan juri uji coba.
-- Akun Admin Utama dan 15 Cabang Lomba Resmi TIDAK AKAN TERHAPUS.
-- ============================================================

-- 1. Hapus seluruh data penilaian uji coba
DELETE FROM public.penilaian;

-- 2. Hapus seluruh peserta uji coba
DELETE FROM public.peserta;

-- 3. Hapus seluruh profil dewan juri uji coba (menjaga akun Admin Utama tetap aman)
DELETE FROM public.profiles WHERE role <> 'admin';

-- 4. Hapus seluruh akun auth juri uji coba (menjaga akun Admin Utama tetap aman)
DELETE FROM auth.users 
WHERE id NOT IN (SELECT id FROM public.profiles WHERE role = 'admin');

-- 5. Bersihkan pengaturan/flag moderasi testing dari tabel informasi
DELETE FROM public.informasi 
WHERE text LIKE '__CONFIG_%' 
   OR text LIKE '__PUBLISH%' 
   OR text LIKE '__PUBLISHED_JURI__%'
   OR text = '__SHOW_WINNERS__';

-- Selesai! Database Anda sekarang bersih total dan siap digunakan untuk data riil.
