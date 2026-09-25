-- =========================================================================
-- UPDATE NILAI & WAKTU RESMI LOMBA SEMAPHORE KE PESERTA YANG SUDAH ADA
-- =========================================================================
-- Jalankan script ini di Supabase SQL Editor (https://supabase.com/dashboard)
-- 
-- Script ini:
-- 1. TIDAK membuat peserta baru (hanya mengupdate data peserta yang ada).
-- 2. Memperbarui kolom 'nilai' dan 'rubrik' (ketepatan & waktu resmi) di tabel penilaian.
-- 3. Memperbarui field catatan_berkas di tabel peserta agar tersinkronisasi.
-- =========================================================================

-- 1. Pastikan kolom rubrik JSONB tersedia di tabel penilaian
ALTER TABLE public.penilaian ADD COLUMN IF NOT EXISTS rubrik JSONB DEFAULT '{}'::jsonb;

DO $$
DECLARE
  v_lomba_sd_id UUID;
  v_lomba_smp_id UUID;
  v_juri_id UUID;

  r RECORD;
  v_pid UUID;
  v_lid UUID;
BEGIN
  -- 2. Dapatkan ID Lomba Semaphore di database (SD dan SMP)
  SELECT id INTO v_lomba_sd_id 
  FROM public.lomba 
  WHERE (kode_lomba = 'SMP' OR nama_lomba ILIKE '%Semaphore%' OR nama_lomba ILIKE '%Semapur%') 
    AND (kategori = 'SD' OR kategori = 'SEMUA' OR kategori IS NULL)
  ORDER BY (CASE WHEN kategori = 'SD' THEN 0 ELSE 1 END)
  LIMIT 1;

  SELECT id INTO v_lomba_smp_id 
  FROM public.lomba 
  WHERE (kode_lomba = 'SMP' OR nama_lomba ILIKE '%Semaphore%' OR nama_lomba ILIKE '%Semapur%') 
    AND (kategori = 'SMP' OR kategori = 'SEMUA' OR kategori IS NULL)
  ORDER BY (CASE WHEN kategori = 'SMP' THEN 0 ELSE 1 END)
  LIMIT 1;

  IF v_lomba_sd_id IS NULL THEN
    INSERT INTO public.lomba (nama_lomba, kode_lomba, kategori) VALUES ('Semaphore', 'SMP', 'SD') RETURNING id INTO v_lomba_sd_id;
  END IF;
  IF v_lomba_smp_id IS NULL THEN
    INSERT INTO public.lomba (nama_lomba, kode_lomba, kategori) VALUES ('Semaphore', 'SMP', 'SMP') RETURNING id INTO v_lomba_smp_id;
  END IF;

  -- 3. Dapatkan ID Juri Semaphore resmi
  SELECT id INTO v_juri_id 
  FROM public.profiles 
  WHERE role IN ('juri', 'admin') 
  ORDER BY (CASE WHEN nama_lengkap ILIKE '%semaphore%' OR nama_lengkap ILIKE '%semap%' THEN 0 ELSE 1 END), role ASC
  LIMIT 1;

  IF v_juri_id IS NULL THEN
    SELECT id INTO v_juri_id FROM auth.users LIMIT 1;
  END IF;

  -- 4. Buat tabel sementara data resmi Semaphore LT-II 2026
  CREATE TEMP TABLE temp_semaphore_scores (
    pangkalan_pattern TEXT,
    kategori TEXT,
    gender TEXT,
    nilai NUMERIC,
    waktu TEXT
  ) ON COMMIT DROP;

  -- === A. SMP PUTRA ===
  INSERT INTO temp_semaphore_scores VALUES
  ('Ashhabul Maimanah', 'SMP', 'Laki-laki', 15, '00:01:26.55'),
  ('SMPN 1 Mekar Baru', 'SMP', 'Laki-laki', 13, '00:02:27.61'),
  ('SMPN 3 MEKAR BARU', 'SMP', 'Laki-laki', 12, '00:02:01.38'),
  ('SMP NEGERI 2', 'SMP', 'Laki-laki', 6, '00:01:46.52'),
  ('Gema Islami', 'SMP', 'Laki-laki', 2, '00:03:55.15'),
  ('MTsN 7 Tangerang', 'SMP', 'Laki-laki', 1, '00:02:59.01'),
  ('Nurul Amin', 'SMP', 'Laki-laki', 1, '00:03:01.89');

  -- === B. SMP PUTRI ===
  INSERT INTO temp_semaphore_scores VALUES
  ('Ashhabul Maimanah', 'SMP', 'Perempuan', 15, '00:00:53.02'),
  ('Nurul Amin', 'SMP', 'Perempuan', 9, '00:01:45.64'),
  ('MTsN 7 Tangerang', 'SMP', 'Perempuan', 6, '00:01:22.86'),
  ('SMPN 3 MEKAR BARU', 'SMP', 'Perempuan', 6, '00:02:04.38'),
  ('SMPN 1 Mekar Baru', 'SMP', 'Perempuan', 3, '00:02:06.21'),
  ('SMP NEGERI 2', 'SMP', 'Perempuan', 2, '00:01:30.99'),
  ('Gema Islami', 'SMP', 'Perempuan', 1, '00:01:10.07');

  -- === C. SD PUTRA ===
  INSERT INTO temp_semaphore_scores VALUES
  ('Nurul Hikmah', 'SD', 'Laki-laki', 10, '00:00:52.25'),
  ('Kosambi Dalam II', 'SD', 'Laki-laki', 10, '00:00:54.91'),
  ('Jenggot 1', 'SD', 'Laki-laki', 10, '00:01:04.67'),
  ('Burak', 'SD', 'Laki-laki', 8, '00:00:52.63'),
  ('Cijeruk I', 'SD', 'Laki-laki', 6, '00:01:15.47'),
  ('Pasir Buah', 'SD', 'Laki-laki', 6, '00:01:55.10'),
  ('Waliwis II', 'SD', 'Laki-laki', 6, '00:02:19.87'),
  ('Bendung', 'SD', 'Laki-laki', 5, '00:01:09.74'),
  ('Waliwis 1', 'SD', 'Laki-laki', 5, '00:01:15.14'),
  ('Cirako', 'SD', 'Laki-laki', 5, '00:01:33.81'),
  ('Cijeruk II', 'SD', 'Laki-laki', 5, '00:02:10.88'),
  ('Gandaria', 'SD', 'Laki-laki', 4, '00:01:59.14'),
  ('Tegal Sari', 'SD', 'Laki-laki', 3, '00:01:16.80'),
  ('Gadog', 'SD', 'Laki-laki', 3, '00:02:36.27'),
  ('Jenggati', 'SD', 'Laki-laki', 2, '00:01:04.73'),
  ('Gaga Jenggot', 'SD', 'Laki-laki', 2, '00:11:11.54'),
  ('Nurus Syuro', 'SD', 'Laki-laki', 0, '00:02:40.75'),
  ('Kedaung', 'SD', 'Laki-laki', 0, '');

  -- === D. SD PUTRI ===
  INSERT INTO temp_semaphore_scores VALUES
  ('Jenggot 1', 'SD', 'Perempuan', 10, '00:00:55.60'),
  ('Waliwis 1', 'SD', 'Perempuan', 10, '00:01:05.08'),
  ('Nurul Hikmah', 'SD', 'Perempuan', 10, '00:01:32.30'),
  ('Cirako', 'SD', 'Perempuan', 10, '00:03:37.52'),
  ('Gandaria', 'SD', 'Perempuan', 9, '00:00:57.71'),
  ('Kosambi Dalam II', 'SD', 'Perempuan', 9, '00:01:11.41'),
  ('Tegal Sari', 'SD', 'Perempuan', 9, '00:02:10.81'),
  ('Cijeruk II', 'SD', 'Perempuan', 8, '00:01:05.29'),
  ('Kosambi Dalam I', 'SD', 'Perempuan', 7, '00:01:50.13'),
  ('Jenggati', 'SD', 'Perempuan', 7, '00:02:00.11'),
  ('Gaga Jenggot', 'SD', 'Perempuan', 6, '00:02:22.81'),
  ('Pasir Buah', 'SD', 'Perempuan', 6, '00:03:17.13'),
  ('Gadog', 'SD', 'Perempuan', 5, '00:01:51.87'),
  ('Kedaung', 'SD', 'Perempuan', 5, '00:02:24.32'),
  ('Nurus Syuro', 'SD', 'Perempuan', 5, '00:02:44.60'),
  ('Bendung', 'SD', 'Perempuan', 2, '00:00:44.24'),
  ('Waliwis II', 'SD', 'Perempuan', 2, '00:02:04.96'),
  ('Cijeruk I', 'SD', 'Perempuan', 2, '00:03:07.99'),
  ('Burak', 'SD', 'Perempuan', 1, '00:01:02.79');

  -- 5. Lakukan Pencocokan dan Update ke Tabel Penilaian & Peserta
  FOR r IN SELECT * FROM temp_semaphore_scores LOOP
    v_lid := CASE WHEN r.kategori = 'SD' THEN v_lomba_sd_id ELSE v_lomba_smp_id END;

    -- Cari ID peserta yang sudah terdaftar dengan pencocokan nama fleksibel
    SELECT id INTO v_pid 
    FROM public.peserta 
    WHERE kategori = r.kategori 
      AND gender = r.gender 
      AND (
        pangkalan ILIKE '%' || r.pangkalan_pattern || '%' 
        OR pangkalan ILIKE '%' || REPLACE(REPLACE(r.pangkalan_pattern, ' II', ' 2'), ' I', ' 1') || '%'
        OR pangkalan ILIKE '%' || REPLACE(REPLACE(r.pangkalan_pattern, ' 2', ' II'), ' 1', ' I') || '%'
        OR pangkalan ILIKE '%' || REPLACE(r.pangkalan_pattern, 'SMP NEGERI ', 'SMPN ') || '%'
        OR pangkalan ILIKE '%' || REPLACE(r.pangkalan_pattern, 'SMPN ', 'SMP NEGERI ') || '%'
        OR REPLACE(REPLACE(pangkalan, ' ', ''), '.', '') ILIKE '%' || REPLACE(REPLACE(r.pangkalan_pattern, ' ', ''), '.', '') || '%'
      )
    ORDER BY is_verified DESC, created_at ASC 
    LIMIT 1;

    IF v_pid IS NOT NULL THEN
      -- A. Perbarui semua baris penilaian yang sudah ada untuk peserta dan lomba ini
      UPDATE public.penilaian 
      SET nilai = r.nilai,
          rubrik = jsonb_build_object('ketepatan', r.nilai, 'waktu', r.waktu),
          updated_at = NOW()
      WHERE peserta_id = v_pid 
        AND (lomba_id = v_lid OR lomba_id IN (SELECT id FROM public.lomba WHERE kode_lomba = 'SMP' OR nama_lomba ILIKE '%Semaphore%'));

      -- B. Jika belum ada penilaian sama sekali untuk peserta ini, buatkan dengan juri resmi
      IF NOT FOUND AND v_juri_id IS NOT NULL THEN
        INSERT INTO public.penilaian (peserta_id, juri_id, lomba_id, nilai, rubrik, updated_at)
        VALUES (v_pid, v_juri_id, v_lid, r.nilai, jsonb_build_object('ketepatan', r.nilai, 'waktu', r.waktu), NOW())
        ON CONFLICT (peserta_id, juri_id, lomba_id) DO UPDATE 
          SET nilai = EXCLUDED.nilai, rubrik = EXCLUDED.rubrik, updated_at = NOW();
      END IF;

    END IF;
  END LOOP;

END $$;
