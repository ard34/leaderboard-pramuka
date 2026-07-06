-- ============================================================
-- SUPABASE COMPLETE SETUP — Sistem Penilaian Lomba Pramuka
-- ============================================================
-- Jalankan script ini di Supabase SQL Editor (https://supabase.com/dashboard)
-- PERINGATAN: Menjalankan script ini akan MENGAPUS & MENGULANG data dari awal.
-- ============================================================

-- 1. Bersihkan tabel lama jika ada
DROP TRIGGER IF EXISTS trigger_update_total_nilai ON public.penilaian;
DROP FUNCTION IF EXISTS public.update_total_nilai();
DROP TABLE IF EXISTS public.penilaian CASCADE;
DROP TABLE IF EXISTS public.peserta CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.lomba CASCADE;

-- 2. Buat tabel LOMBA (Dinamis per Kategori)
CREATE TABLE public.lomba (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_lomba TEXT NOT NULL,
  kode_lomba TEXT NOT NULL, -- Kode singkat (e.g. PNR, SMP) untuk header tabel
  kategori TEXT NOT NULL CHECK (kategori IN ('SD', 'SMP', 'SMK')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Kode lomba & Nama lomba harus unik per tingkatan
  UNIQUE (nama_lomba, kategori),
  UNIQUE (kode_lomba, kategori)
);

-- 3. Buat tabel PROFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nama_lengkap TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'juri' CHECK (role IN ('admin', 'juri')),
  assigned_lomba_id UUID REFERENCES public.lomba(id) ON DELETE SET NULL, -- Cabang lomba yang ditugaskan
  assigned_kategori TEXT DEFAULT NULL, -- Tingkatan yang ditugaskan (SD/SMP/SMK)
  assigned_gender TEXT DEFAULT 'SEMUA' CHECK (assigned_gender IN ('Laki-laki', 'Perempuan', 'SEMUA')), -- Gender yang ditugaskan
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Buat tabel PESERTA
CREATE TABLE public.peserta (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nomor_dada INT NOT NULL,
  nama_regu TEXT NOT NULL,
  pangkalan TEXT NOT NULL,
  kategori TEXT NOT NULL CHECK (kategori IN ('SD', 'SMP', 'SMK')),
  gender TEXT NOT NULL CHECK (gender IN ('Laki-laki', 'Perempuan')) DEFAULT 'Laki-laki',
  total_nilai NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE (nomor_dada, kategori, gender)
);

-- 5. Buat tabel PENILAIAN
CREATE TABLE public.penilaian (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  peserta_id UUID NOT NULL REFERENCES public.peserta(id) ON DELETE CASCADE,
  juri_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  lomba_id UUID NOT NULL REFERENCES public.lomba(id) ON DELETE CASCADE,
  nilai NUMERIC NOT NULL CHECK (nilai >= 0 AND nilai <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Satu cabang lomba pada satu regu bisa diisi oleh beberapa juri berbeda
  UNIQUE (peserta_id, juri_id, lomba_id)
);

-- 6. Aktifkan Row Level Security (RLS)
ALTER TABLE public.lomba ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peserta ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.penilaian ENABLE ROW LEVEL SECURITY;

-- 7. Helper function to check if the current user is admin (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Kebijakan RLS — LOMBA
CREATE POLICY "Public can read lomba" ON public.lomba FOR SELECT USING (true);
CREATE POLICY "Admin full access lomba" ON public.lomba FOR ALL USING (public.is_admin());

-- 9. Kebijakan RLS — PROFILES
CREATE POLICY "Public can read profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Admin full access profiles" ON public.profiles FOR ALL USING (public.is_admin());

-- 10. Kebijakan RLS — PESERTA
CREATE POLICY "Public can read peserta" ON public.peserta FOR SELECT USING (true);
CREATE POLICY "Admin full access peserta" ON public.peserta FOR ALL USING (public.is_admin());

-- 11. Kebijakan RLS — PENILAIAN
CREATE POLICY "Public can read penilaian" ON public.penilaian FOR SELECT USING (true);

CREATE POLICY "Admin full access penilaian" 
ON public.penilaian 
FOR ALL 
TO authenticated 
USING (public.is_admin()) 
WITH CHECK (public.is_admin());

CREATE POLICY "Juri can insert scores based on assignment" 
ON public.penilaian 
FOR INSERT 
TO authenticated 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.peserta r ON r.id = peserta_id
    WHERE p.id = auth.uid()
      AND (p.assigned_lomba_id = lomba_id OR p.assigned_lomba_id IS NULL)
      AND (p.assigned_kategori = r.kategori OR p.assigned_kategori IS NULL)
      AND (p.assigned_gender = 'SEMUA' OR p.assigned_gender = r.gender)
  )
);

CREATE POLICY "Juri can update their own assigned scores" 
ON public.penilaian 
FOR UPDATE 
TO authenticated 
USING (
  juri_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.peserta r ON r.id = peserta_id
    WHERE p.id = auth.uid()
      AND (p.assigned_lomba_id = lomba_id OR p.assigned_lomba_id IS NULL)
      AND (p.assigned_kategori = r.kategori OR p.assigned_kategori IS NULL)
      AND (p.assigned_gender = 'SEMUA' OR p.assigned_gender = r.gender)
  )
)
WITH CHECK (
  juri_id = auth.uid()
  AND nilai >= 0 AND nilai <= 100
);


-- 12. Trigger: Otomatis Menghitung Total Nilai Peserta
CREATE OR REPLACE FUNCTION public.update_total_nilai()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.peserta
  SET total_nilai = (
    SELECT ROUND(COALESCE(SUM(rata_rata_lomba), 0), 2)
    FROM (
      SELECT AVG(nilai) as rata_rata_lomba
      FROM public.penilaian
      WHERE peserta_id = COALESCE(NEW.peserta_id, OLD.peserta_id)
      GROUP BY lomba_id
    ) subquery
  )
  WHERE id = COALESCE(NEW.peserta_id, OLD.peserta_id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_update_total_nilai
  AFTER INSERT OR UPDATE OR DELETE ON public.penilaian
  FOR EACH ROW
  EXECUTE FUNCTION public.update_total_nilai();

-- Trigger: Otomatis Menghapus Akun Auth saat Profil Juri Dihapus oleh Admin
CREATE OR REPLACE FUNCTION public.delete_auth_user_on_profile_delete()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM auth.users WHERE id = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER trigger_delete_auth_user
  AFTER DELETE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.delete_auth_user_on_profile_delete();

-- 13. Berikan Hak Akses (GRANT) agar Website Bebas Akses
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON public.lomba TO anon, authenticated, service_role;
GRANT ALL ON public.profiles TO anon, authenticated, service_role;
GRANT ALL ON public.peserta TO anon, authenticated, service_role;
GRANT ALL ON public.penilaian TO anon, authenticated, service_role;

-- 14. Aktifkan Realtime Live untuk Tabel
DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime FOR TABLE public.lomba, public.peserta, public.penilaian, public.profiles;
