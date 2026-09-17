-- ============================================================
-- SQL IZIN TESTING LOKAL — Akses Penuh untuk Pengujian Lokal
-- ============================================================
-- Jalankan script ini di Supabase SQL Editor (https://supabase.com/dashboard)
-- agar penilaian, peserta, dan konfigurasi dari panel lokal dapat disimpan langsung ke database Supabase tanpa diblokir RLS.
-- ============================================================

-- 1. Izin Akses Tabel Penilaian untuk testing
DROP POLICY IF EXISTS "Testing anon full access penilaian" ON public.penilaian;
CREATE POLICY "Testing anon full access penilaian" 
ON public.penilaian 
FOR ALL 
TO anon, authenticated 
USING (true) 
WITH CHECK (true);

-- 2. Izin Akses Tabel Peserta untuk testing
DROP POLICY IF EXISTS "Testing anon full access peserta" ON public.peserta;
CREATE POLICY "Testing anon full access peserta" 
ON public.peserta 
FOR ALL 
TO anon, authenticated 
USING (true) 
WITH CHECK (true);

-- 3. Izin Akses Tabel Informasi untuk testing
DROP POLICY IF EXISTS "Testing anon full access informasi" ON public.informasi;
CREATE POLICY "Testing anon full access informasi" 
ON public.informasi 
FOR ALL 
TO anon, authenticated 
USING (true) 
WITH CHECK (true);

-- 4. Izin Akses Tabel Profiles untuk testing
DROP POLICY IF EXISTS "Testing anon full access profiles" ON public.profiles;
CREATE POLICY "Testing anon full access profiles" 
ON public.profiles 
FOR ALL 
TO anon, authenticated 
USING (true) 
WITH CHECK (true);
