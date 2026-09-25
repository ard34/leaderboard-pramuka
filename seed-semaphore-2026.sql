-- =========================================================================
-- SEED DATA RESMI LOMBA SEMAPHORE LT-II 2026 KWARTIR RANTING MEKAR BARU
-- =========================================================================
-- Jalankan query ini di Supabase SQL Editor (https://supabase.com/dashboard)
-- Query ini aman (UPSERT), tidak merusak data cabang lomba lainnya.
-- =========================================================================

-- 1. Pastikan kolom rubrik JSONB ada di tabel penilaian
ALTER TABLE public.penilaian ADD COLUMN IF NOT EXISTS rubrik JSONB DEFAULT '{}'::jsonb;

DO $$
DECLARE
  v_lomba_sd_id UUID;
  v_lomba_smp_id UUID;
  v_juri_id UUID;
  v_peserta_id UUID;
BEGIN
  -- 2. Pastikan Cabang Lomba Semaphore Terdaftar di Database (SD & SMP)
  INSERT INTO public.lomba (nama_lomba, kode_lomba, kategori)
  VALUES ('Semaphore', 'SMP', 'SD')
  ON CONFLICT (nama_lomba, kategori) DO UPDATE 
    SET kode_lomba = EXCLUDED.kode_lomba
  RETURNING id INTO v_lomba_sd_id;

  INSERT INTO public.lomba (nama_lomba, kode_lomba, kategori)
  VALUES ('Semaphore', 'SMP', 'SMP')
  ON CONFLICT (nama_lomba, kategori) DO UPDATE 
    SET kode_lomba = EXCLUDED.kode_lomba
  RETURNING id INTO v_lomba_smp_id;

  -- 3. Cari akun Juri Semaphore atau Admin untuk pencatatan juri_id resmi
  SELECT id INTO v_juri_id 
  FROM public.profiles 
  WHERE role IN ('juri', 'admin') 
  ORDER BY (CASE WHEN nama_lengkap ILIKE '%semaphore%' OR nama_lengkap ILIKE '%semap%' THEN 0 ELSE 1 END), role ASC
  LIMIT 1;

  -- Jika belum ada profil juri sama sekali, cari user dari auth
  IF v_juri_id IS NULL THEN
    SELECT id INTO v_juri_id FROM auth.users LIMIT 1;
  END IF;

  -- =======================================================================
  -- A. SMP PUTRA (7 Regu)
  -- =======================================================================
  
  -- 1. GARUDA - MTSS ASHHABUL MAIMANAH (Nilai: 15, Waktu: 00:01:26.55)
  INSERT INTO public.peserta (nomor_dada, nama_regu, pangkalan, kategori, gender, is_verified, total_nilai)
  VALUES (51, 'GARUDA', 'MTSS ASHHABUL MAIMANAH', 'SMP', 'Laki-laki', true, 15)
  ON CONFLICT DO NOTHING;
  SELECT id INTO v_peserta_id FROM public.peserta WHERE nama_regu = 'GARUDA' AND pangkalan = 'MTSS ASHHABUL MAIMANAH' AND kategori = 'SMP' AND gender = 'Laki-laki';
  IF v_peserta_id IS NOT NULL AND v_juri_id IS NOT NULL THEN
    INSERT INTO public.penilaian (peserta_id, juri_id, lomba_id, nilai, rubrik, updated_at)
    VALUES (v_peserta_id, v_juri_id, v_lomba_smp_id, 15, '{"ketepatan": 15, "waktu": "00:01:26.55"}'::jsonb, NOW())
    ON CONFLICT (peserta_id, juri_id, lomba_id) DO UPDATE 
      SET nilai = EXCLUDED.nilai, rubrik = EXCLUDED.rubrik, updated_at = NOW();
  END IF;

  -- 2. Rajawali - SMPN 1 Mekar Baru (Nilai: 13, Waktu: 00:02:27.61)
  INSERT INTO public.peserta (nomor_dada, nama_regu, pangkalan, kategori, gender, is_verified, total_nilai)
  VALUES (53, 'Rajawali', 'SMPN 1 Mekar Baru', 'SMP', 'Laki-laki', true, 13)
  ON CONFLICT DO NOTHING;
  SELECT id INTO v_peserta_id FROM public.peserta WHERE nama_regu = 'Rajawali' AND pangkalan = 'SMPN 1 Mekar Baru' AND kategori = 'SMP' AND gender = 'Laki-laki';
  IF v_peserta_id IS NOT NULL AND v_juri_id IS NOT NULL THEN
    INSERT INTO public.penilaian (peserta_id, juri_id, lomba_id, nilai, rubrik, updated_at)
    VALUES (v_peserta_id, v_juri_id, v_lomba_smp_id, 13, '{"ketepatan": 13, "waktu": "00:02:27.61"}'::jsonb, NOW())
    ON CONFLICT (peserta_id, juri_id, lomba_id) DO UPDATE 
      SET nilai = EXCLUDED.nilai, rubrik = EXCLUDED.rubrik, updated_at = NOW();
  END IF;

  -- 3. COBRA - SMPN 3 MEKAR BARU (Nilai: 12, Waktu: 00:02:01.38)
  INSERT INTO public.peserta (nomor_dada, nama_regu, pangkalan, kategori, gender, is_verified, total_nilai)
  VALUES (55, 'COBRA', 'SMPN 3 MEKAR BARU', 'SMP', 'Laki-laki', true, 12)
  ON CONFLICT DO NOTHING;
  SELECT id INTO v_peserta_id FROM public.peserta WHERE nama_regu = 'COBRA' AND pangkalan = 'SMPN 3 MEKAR BARU' AND kategori = 'SMP' AND gender = 'Laki-laki';
  IF v_peserta_id IS NOT NULL AND v_juri_id IS NOT NULL THEN
    INSERT INTO public.penilaian (peserta_id, juri_id, lomba_id, nilai, rubrik, updated_at)
    VALUES (v_peserta_id, v_juri_id, v_lomba_smp_id, 12, '{"ketepatan": 12, "waktu": "00:02:01.38"}'::jsonb, NOW())
    ON CONFLICT (peserta_id, juri_id, lomba_id) DO UPDATE 
      SET nilai = EXCLUDED.nilai, rubrik = EXCLUDED.rubrik, updated_at = NOW();
  END IF;

  -- 4. MACAN - SMP NEGERI 2 MEKAR BARU (Nilai: 6, Waktu: 00:01:46.52)
  INSERT INTO public.peserta (nomor_dada, nama_regu, pangkalan, kategori, gender, is_verified, total_nilai)
  VALUES (57, 'MACAN', 'SMP NEGERI 2 MEKAR BARU', 'SMP', 'Laki-laki', true, 6)
  ON CONFLICT DO NOTHING;
  SELECT id INTO v_peserta_id FROM public.peserta WHERE nama_regu = 'MACAN' AND pangkalan = 'SMP NEGERI 2 MEKAR BARU' AND kategori = 'SMP' AND gender = 'Laki-laki';
  IF v_peserta_id IS NOT NULL AND v_juri_id IS NOT NULL THEN
    INSERT INTO public.penilaian (peserta_id, juri_id, lomba_id, nilai, rubrik, updated_at)
    VALUES (v_peserta_id, v_juri_id, v_lomba_smp_id, 6, '{"ketepatan": 6, "waktu": "00:01:46.52"}'::jsonb, NOW())
    ON CONFLICT (peserta_id, juri_id, lomba_id) DO UPDATE 
      SET nilai = EXCLUDED.nilai, rubrik = EXCLUDED.rubrik, updated_at = NOW();
  END IF;

  -- 5. RAJAWALI - SMP GEMA ISLAMI (Nilai: 2, Waktu: 00:03:55.15)
  INSERT INTO public.peserta (nomor_dada, nama_regu, pangkalan, kategori, gender, is_verified, total_nilai)
  VALUES (59, 'RAJAWALI', 'SMP GEMA ISLAMI', 'SMP', 'Laki-laki', true, 2)
  ON CONFLICT DO NOTHING;
  SELECT id INTO v_peserta_id FROM public.peserta WHERE nama_regu = 'RAJAWALI' AND pangkalan = 'SMP GEMA ISLAMI' AND kategori = 'SMP' AND gender = 'Laki-laki';
  IF v_peserta_id IS NOT NULL AND v_juri_id IS NOT NULL THEN
    INSERT INTO public.penilaian (peserta_id, juri_id, lomba_id, nilai, rubrik, updated_at)
    VALUES (v_peserta_id, v_juri_id, v_lomba_smp_id, 2, '{"ketepatan": 2, "waktu": "00:03:55.15"}'::jsonb, NOW())
    ON CONFLICT (peserta_id, juri_id, lomba_id) DO UPDATE 
      SET nilai = EXCLUDED.nilai, rubrik = EXCLUDED.rubrik, updated_at = NOW();
  END IF;

  -- 6. RAJAWALI - MTsN 7 Tangerang (Nilai: 1, Waktu: 00:02:59.01)
  INSERT INTO public.peserta (nomor_dada, nama_regu, pangkalan, kategori, gender, is_verified, total_nilai)
  VALUES (61, 'RAJAWALI', 'MTsN 7 Tangerang', 'SMP', 'Laki-laki', true, 1)
  ON CONFLICT DO NOTHING;
  SELECT id INTO v_peserta_id FROM public.peserta WHERE nama_regu = 'RAJAWALI' AND pangkalan = 'MTsN 7 Tangerang' AND kategori = 'SMP' AND gender = 'Laki-laki';
  IF v_peserta_id IS NOT NULL AND v_juri_id IS NOT NULL THEN
    INSERT INTO public.penilaian (peserta_id, juri_id, lomba_id, nilai, rubrik, updated_at)
    VALUES (v_peserta_id, v_juri_id, v_lomba_smp_id, 1, '{"ketepatan": 1, "waktu": "00:02:59.01"}'::jsonb, NOW())
    ON CONFLICT (peserta_id, juri_id, lomba_id) DO UPDATE 
      SET nilai = EXCLUDED.nilai, rubrik = EXCLUDED.rubrik, updated_at = NOW();
  END IF;

  -- 7. BLACK DRAGON - SMP NURUL AMIN (Nilai: 1, Waktu: 00:03:01.89)
  INSERT INTO public.peserta (nomor_dada, nama_regu, pangkalan, kategori, gender, is_verified, total_nilai)
  VALUES (63, 'BLACK DRAGON', 'SMP NURUL AMIN', 'SMP', 'Laki-laki', true, 1)
  ON CONFLICT DO NOTHING;
  SELECT id INTO v_peserta_id FROM public.peserta WHERE nama_regu = 'BLACK DRAGON' AND pangkalan = 'SMP NURUL AMIN' AND kategori = 'SMP' AND gender = 'Laki-laki';
  IF v_peserta_id IS NOT NULL AND v_juri_id IS NOT NULL THEN
    INSERT INTO public.penilaian (peserta_id, juri_id, lomba_id, nilai, rubrik, updated_at)
    VALUES (v_peserta_id, v_juri_id, v_lomba_smp_id, 1, '{"ketepatan": 1, "waktu": "00:03:01.89"}'::jsonb, NOW())
    ON CONFLICT (peserta_id, juri_id, lomba_id) DO UPDATE 
      SET nilai = EXCLUDED.nilai, rubrik = EXCLUDED.rubrik, updated_at = NOW();
  END IF;


  -- =======================================================================
  -- B. SMP PUTRI (7 Regu)
  -- =======================================================================

  -- 1. RAFLESIA - MTSS ASHHABUL MAIMANAH (Nilai: 15, Waktu: 00:00:53.02)
  INSERT INTO public.peserta (nomor_dada, nama_regu, pangkalan, kategori, gender, is_verified, total_nilai)
  VALUES (52, 'RAFLESIA', 'MTSS ASHHABUL MAIMANAH', 'SMP', 'Perempuan', true, 15)
  ON CONFLICT DO NOTHING;
  SELECT id INTO v_peserta_id FROM public.peserta WHERE nama_regu = 'RAFLESIA' AND pangkalan = 'MTSS ASHHABUL MAIMANAH' AND kategori = 'SMP' AND gender = 'Perempuan';
  IF v_peserta_id IS NOT NULL AND v_juri_id IS NOT NULL THEN
    INSERT INTO public.penilaian (peserta_id, juri_id, lomba_id, nilai, rubrik, updated_at)
    VALUES (v_peserta_id, v_juri_id, v_lomba_smp_id, 15, '{"ketepatan": 15, "waktu": "00:00:53.02"}'::jsonb, NOW())
    ON CONFLICT (peserta_id, juri_id, lomba_id) DO UPDATE 
      SET nilai = EXCLUDED.nilai, rubrik = EXCLUDED.rubrik, updated_at = NOW();
  END IF;

  -- 2. BLACK ROSE - SMP NURUL AMIN (Nilai: 9, Waktu: 00:01:45.64)
  INSERT INTO public.peserta (nomor_dada, nama_regu, pangkalan, kategori, gender, is_verified, total_nilai)
  VALUES (54, 'BLACK ROSE', 'SMP NURUL AMIN', 'SMP', 'Perempuan', true, 9)
  ON CONFLICT DO NOTHING;
  SELECT id INTO v_peserta_id FROM public.peserta WHERE nama_regu = 'BLACK ROSE' AND pangkalan = 'SMP NURUL AMIN' AND kategori = 'SMP' AND gender = 'Perempuan';
  IF v_peserta_id IS NOT NULL AND v_juri_id IS NOT NULL THEN
    INSERT INTO public.penilaian (peserta_id, juri_id, lomba_id, nilai, rubrik, updated_at)
    VALUES (v_peserta_id, v_juri_id, v_lomba_smp_id, 9, '{"ketepatan": 9, "waktu": "00:01:45.64"}'::jsonb, NOW())
    ON CONFLICT (peserta_id, juri_id, lomba_id) DO UPDATE 
      SET nilai = EXCLUDED.nilai, rubrik = EXCLUDED.rubrik, updated_at = NOW();
  END IF;

  -- 3. RAFLESIA - MTsN 7 Tangerang (Nilai: 6, Waktu: 00:01:22.86)
  INSERT INTO public.peserta (nomor_dada, nama_regu, pangkalan, kategori, gender, is_verified, total_nilai)
  VALUES (56, 'RAFLESIA', 'MTsN 7 Tangerang', 'SMP', 'Perempuan', true, 6)
  ON CONFLICT DO NOTHING;
  SELECT id INTO v_peserta_id FROM public.peserta WHERE nama_regu = 'RAFLESIA' AND pangkalan = 'MTsN 7 Tangerang' AND kategori = 'SMP' AND gender = 'Perempuan';
  IF v_peserta_id IS NOT NULL AND v_juri_id IS NOT NULL THEN
    INSERT INTO public.penilaian (peserta_id, juri_id, lomba_id, nilai, rubrik, updated_at)
    VALUES (v_peserta_id, v_juri_id, v_lomba_smp_id, 6, '{"ketepatan": 6, "waktu": "00:01:22.86"}'::jsonb, NOW())
    ON CONFLICT (peserta_id, juri_id, lomba_id) DO UPDATE 
      SET nilai = EXCLUDED.nilai, rubrik = EXCLUDED.rubrik, updated_at = NOW();
  END IF;

  -- 4. MAWAR - SMPN 3 MEKAR BARU (Nilai: 6, Waktu: 00:02:04.38)
  INSERT INTO public.peserta (nomor_dada, nama_regu, pangkalan, kategori, gender, is_verified, total_nilai)
  VALUES (58, 'MAWAR', 'SMPN 3 MEKAR BARU', 'SMP', 'Perempuan', true, 6)
  ON CONFLICT DO NOTHING;
  SELECT id INTO v_peserta_id FROM public.peserta WHERE nama_regu = 'MAWAR' AND pangkalan = 'SMPN 3 MEKAR BARU' AND kategori = 'SMP' AND gender = 'Perempuan';
  IF v_peserta_id IS NOT NULL AND v_juri_id IS NOT NULL THEN
    INSERT INTO public.penilaian (peserta_id, juri_id, lomba_id, nilai, rubrik, updated_at)
    VALUES (v_peserta_id, v_juri_id, v_lomba_smp_id, 6, '{"ketepatan": 6, "waktu": "00:02:04.38"}'::jsonb, NOW())
    ON CONFLICT (peserta_id, juri_id, lomba_id) DO UPDATE 
      SET nilai = EXCLUDED.nilai, rubrik = EXCLUDED.rubrik, updated_at = NOW();
  END IF;

  -- 5. EDELWEIS - SMPN 1 Mekar Baru (Nilai: 3, Waktu: 00:02:06.21)
  INSERT INTO public.peserta (nomor_dada, nama_regu, pangkalan, kategori, gender, is_verified, total_nilai)
  VALUES (60, 'EDELWEIS', 'SMPN 1 Mekar Baru', 'SMP', 'Perempuan', true, 3)
  ON CONFLICT DO NOTHING;
  SELECT id INTO v_peserta_id FROM public.peserta WHERE nama_regu = 'EDELWEIS' AND pangkalan = 'SMPN 1 Mekar Baru' AND kategori = 'SMP' AND gender = 'Perempuan';
  IF v_peserta_id IS NOT NULL AND v_juri_id IS NOT NULL THEN
    INSERT INTO public.penilaian (peserta_id, juri_id, lomba_id, nilai, rubrik, updated_at)
    VALUES (v_peserta_id, v_juri_id, v_lomba_smp_id, 3, '{"ketepatan": 3, "waktu": "00:02:06.21"}'::jsonb, NOW())
    ON CONFLICT (peserta_id, juri_id, lomba_id) DO UPDATE 
      SET nilai = EXCLUDED.nilai, rubrik = EXCLUDED.rubrik, updated_at = NOW();
  END IF;

  -- 6. EDELWEIS - SMP NEGERI 2 MEKAR BARU (Nilai: 2, Waktu: 00:01:30.99)
  INSERT INTO public.peserta (nomor_dada, nama_regu, pangkalan, kategori, gender, is_verified, total_nilai)
  VALUES (62, 'EDELWEIS', 'SMP NEGERI 2 MEKAR BARU', 'SMP', 'Perempuan', true, 2)
  ON CONFLICT DO NOTHING;
  SELECT id INTO v_peserta_id FROM public.peserta WHERE nama_regu = 'EDELWEIS' AND pangkalan = 'SMP NEGERI 2 MEKAR BARU' AND kategori = 'SMP' AND gender = 'Perempuan';
  IF v_peserta_id IS NOT NULL AND v_juri_id IS NOT NULL THEN
    INSERT INTO public.penilaian (peserta_id, juri_id, lomba_id, nilai, rubrik, updated_at)
    VALUES (v_peserta_id, v_juri_id, v_lomba_smp_id, 2, '{"ketepatan": 2, "waktu": "00:01:30.99"}'::jsonb, NOW())
    ON CONFLICT (peserta_id, juri_id, lomba_id) DO UPDATE 
      SET nilai = EXCLUDED.nilai, rubrik = EXCLUDED.rubrik, updated_at = NOW();
  END IF;

  -- 7. MELATI - SMP GEMA ISLAMI (Nilai: 1, Waktu: 00:01:10.07)
  INSERT INTO public.peserta (nomor_dada, nama_regu, pangkalan, kategori, gender, is_verified, total_nilai)
  VALUES (64, 'MELATI', 'SMP GEMA ISLAMI', 'SMP', 'Perempuan', true, 1)
  ON CONFLICT DO NOTHING;
  SELECT id INTO v_peserta_id FROM public.peserta WHERE nama_regu = 'MELATI' AND pangkalan = 'SMP GEMA ISLAMI' AND kategori = 'SMP' AND gender = 'Perempuan';
  IF v_peserta_id IS NOT NULL AND v_juri_id IS NOT NULL THEN
    INSERT INTO public.penilaian (peserta_id, juri_id, lomba_id, nilai, rubrik, updated_at)
    VALUES (v_peserta_id, v_juri_id, v_lomba_smp_id, 1, '{"ketepatan": 1, "waktu": "00:01:10.07"}'::jsonb, NOW())
    ON CONFLICT (peserta_id, juri_id, lomba_id) DO UPDATE 
      SET nilai = EXCLUDED.nilai, rubrik = EXCLUDED.rubrik, updated_at = NOW();
  END IF;


  -- =======================================================================
  -- C. SD PUTRA (18 Regu)
  -- =======================================================================

  -- 1. Cobra - MIS NURUL HIKMAH (Nilai: 10, Waktu: 00:00:52.25)
  INSERT INTO public.peserta (nomor_dada, nama_regu, pangkalan, kategori, gender, is_verified, total_nilai)
  VALUES (1, 'Cobra', 'MIS NURUL HIKMAH', 'SD', 'Laki-laki', true, 10)
  ON CONFLICT DO NOTHING;
  SELECT id INTO v_peserta_id FROM public.peserta WHERE nama_regu = 'Cobra' AND pangkalan = 'MIS NURUL HIKMAH' AND kategori = 'SD' AND gender = 'Laki-laki';
  IF v_peserta_id IS NOT NULL AND v_juri_id IS NOT NULL THEN
    INSERT INTO public.penilaian (peserta_id, juri_id, lomba_id, nilai, rubrik, updated_at)
    VALUES (v_peserta_id, v_juri_id, v_lomba_sd_id, 10, '{"ketepatan": 10, "waktu": "00:00:52.25"}'::jsonb, NOW())
    ON CONFLICT (peserta_id, juri_id, lomba_id) DO UPDATE 
      SET nilai = EXCLUDED.nilai, rubrik = EXCLUDED.rubrik, updated_at = NOW();
  END IF;

  -- 2. GARUDA - SDN KOSAMBI DALAM II (Nilai: 10, Waktu: 00:00:54.91)
  INSERT INTO public.peserta (nomor_dada, nama_regu, pangkalan, kategori, gender, is_verified, total_nilai)
  VALUES (3, 'GARUDA', 'SDN KOSAMBI DALAM II', 'SD', 'Laki-laki', true, 10)
  ON CONFLICT DO NOTHING;
  SELECT id INTO v_peserta_id FROM public.peserta WHERE nama_regu = 'GARUDA' AND pangkalan = 'SDN KOSAMBI DALAM II' AND kategori = 'SD' AND gender = 'Laki-laki';
  IF v_peserta_id IS NOT NULL AND v_juri_id IS NOT NULL THEN
    INSERT INTO public.penilaian (peserta_id, juri_id, lomba_id, nilai, rubrik, updated_at)
    VALUES (v_peserta_id, v_juri_id, v_lomba_sd_id, 10, '{"ketepatan": 10, "waktu": "00:00:54.91"}'::jsonb, NOW())
    ON CONFLICT (peserta_id, juri_id, lomba_id) DO UPDATE 
      SET nilai = EXCLUDED.nilai, rubrik = EXCLUDED.rubrik, updated_at = NOW();
  END IF;

  -- 3. Rajawali - SDN Jenggot 1 (Nilai: 10, Waktu: 00:01:04.67)
  INSERT INTO public.peserta (nomor_dada, nama_regu, pangkalan, kategori, gender, is_verified, total_nilai)
  VALUES (5, 'Rajawali', 'SDN Jenggot 1', 'SD', 'Laki-laki', true, 10)
  ON CONFLICT DO NOTHING;
  SELECT id INTO v_peserta_id FROM public.peserta WHERE nama_regu = 'Rajawali' AND pangkalan = 'SDN Jenggot 1' AND kategori = 'SD' AND gender = 'Laki-laki';
  IF v_peserta_id IS NOT NULL AND v_juri_id IS NOT NULL THEN
    INSERT INTO public.penilaian (peserta_id, juri_id, lomba_id, nilai, rubrik, updated_at)
    VALUES (v_peserta_id, v_juri_id, v_lomba_sd_id, 10, '{"ketepatan": 10, "waktu": "00:01:04.67"}'::jsonb, NOW())
    ON CONFLICT (peserta_id, juri_id, lomba_id) DO UPDATE 
      SET nilai = EXCLUDED.nilai, rubrik = EXCLUDED.rubrik, updated_at = NOW();
  END IF;

  -- 4. Garuda - SDN Burak (Nilai: 8, Waktu: 00:00:52.63)
  INSERT INTO public.peserta (nomor_dada, nama_regu, pangkalan, kategori, gender, is_verified, total_nilai)
  VALUES (7, 'Garuda', 'SDN Burak', 'SD', 'Laki-laki', true, 8)
  ON CONFLICT DO NOTHING;
  SELECT id INTO v_peserta_id FROM public.peserta WHERE nama_regu = 'Garuda' AND pangkalan = 'SDN Burak' AND kategori = 'SD' AND gender = 'Laki-laki';
  IF v_peserta_id IS NOT NULL AND v_juri_id IS NOT NULL THEN
    INSERT INTO public.penilaian (peserta_id, juri_id, lomba_id, nilai, rubrik, updated_at)
    VALUES (v_peserta_id, v_juri_id, v_lomba_sd_id, 8, '{"ketepatan": 8, "waktu": "00:00:52.63"}'::jsonb, NOW())
    ON CONFLICT (peserta_id, juri_id, lomba_id) DO UPDATE 
      SET nilai = EXCLUDED.nilai, rubrik = EXCLUDED.rubrik, updated_at = NOW();
  END IF;

  -- 5. RAJAWALI - SDN CIJERUK I (Nilai: 6, Waktu: 00:01:15.47)
  INSERT INTO public.peserta (nomor_dada, nama_regu, pangkalan, kategori, gender, is_verified, total_nilai)
  VALUES (9, 'RAJAWALI', 'SDN CIJERUK I', 'SD', 'Laki-laki', true, 6)
  ON CONFLICT DO NOTHING;
  SELECT id INTO v_peserta_id FROM public.peserta WHERE nama_regu = 'RAJAWALI' AND pangkalan = 'SDN CIJERUK I' AND kategori = 'SD' AND gender = 'Laki-laki';
  IF v_peserta_id IS NOT NULL AND v_juri_id IS NOT NULL THEN
    INSERT INTO public.penilaian (peserta_id, juri_id, lomba_id, nilai, rubrik, updated_at)
    VALUES (v_peserta_id, v_juri_id, v_lomba_sd_id, 6, '{"ketepatan": 6, "waktu": "00:01:15.47"}'::jsonb, NOW())
    ON CONFLICT (peserta_id, juri_id, lomba_id) DO UPDATE 
      SET nilai = EXCLUDED.nilai, rubrik = EXCLUDED.rubrik, updated_at = NOW();
  END IF;

  -- 6. SINGA - SDN PASIR BUAH (Nilai: 6, Waktu: 00:01:55.10)
  INSERT INTO public.peserta (nomor_dada, nama_regu, pangkalan, kategori, gender, is_verified, total_nilai)
  VALUES (11, 'SINGA', 'SDN PASIR BUAH', 'SD', 'Laki-laki', true, 6)
  ON CONFLICT DO NOTHING;
  SELECT id INTO v_peserta_id FROM public.peserta WHERE nama_regu = 'SINGA' AND pangkalan = 'SDN PASIR BUAH' AND kategori = 'SD' AND gender = 'Laki-laki';
  IF v_peserta_id IS NOT NULL AND v_juri_id IS NOT NULL THEN
    INSERT INTO public.penilaian (peserta_id, juri_id, lomba_id, nilai, rubrik, updated_at)
    VALUES (v_peserta_id, v_juri_id, v_lomba_sd_id, 6, '{"ketepatan": 6, "waktu": "00:01:55.10"}'::jsonb, NOW())
    ON CONFLICT (peserta_id, juri_id, lomba_id) DO UPDATE 
      SET nilai = EXCLUDED.nilai, rubrik = EXCLUDED.rubrik, updated_at = NOW();
  END IF;

  -- 7. COBRA - SD NEGERI WALIWIS II (Nilai: 6, Waktu: 00:02:19.87)
  INSERT INTO public.peserta (nomor_dada, nama_regu, pangkalan, kategori, gender, is_verified, total_nilai)
  VALUES (13, 'COBRA', 'SD NEGERI WALIWIS II', 'SD', 'Laki-laki', true, 6)
  ON CONFLICT DO NOTHING;
  SELECT id INTO v_peserta_id FROM public.peserta WHERE nama_regu = 'COBRA' AND pangkalan = 'SD NEGERI WALIWIS II' AND kategori = 'SD' AND gender = 'Laki-laki';
  IF v_peserta_id IS NOT NULL AND v_juri_id IS NOT NULL THEN
    INSERT INTO public.penilaian (peserta_id, juri_id, lomba_id, nilai, rubrik, updated_at)
    VALUES (v_peserta_id, v_juri_id, v_lomba_sd_id, 6, '{"ketepatan": 6, "waktu": "00:02:19.87"}'::jsonb, NOW())
    ON CONFLICT (peserta_id, juri_id, lomba_id) DO UPDATE 
      SET nilai = EXCLUDED.nilai, rubrik = EXCLUDED.rubrik, updated_at = NOW();
  END IF;

  -- 8. Rajawali - SDN Bendung (Nilai: 5, Waktu: 00:01:09.74)
  INSERT INTO public.peserta (nomor_dada, nama_regu, pangkalan, kategori, gender, is_verified, total_nilai)
  VALUES (15, 'Rajawali', 'SDN Bendung', 'SD', 'Laki-laki', true, 5)
  ON CONFLICT DO NOTHING;
  SELECT id INTO v_peserta_id FROM public.peserta WHERE nama_regu = 'Rajawali' AND pangkalan = 'SDN Bendung' AND kategori = 'SD' AND gender = 'Laki-laki';
  IF v_peserta_id IS NOT NULL AND v_juri_id IS NOT NULL THEN
    INSERT INTO public.penilaian (peserta_id, juri_id, lomba_id, nilai, rubrik, updated_at)
    VALUES (v_peserta_id, v_juri_id, v_lomba_sd_id, 5, '{"ketepatan": 5, "waktu": "00:01:09.74"}'::jsonb, NOW())
    ON CONFLICT (peserta_id, juri_id, lomba_id) DO UPDATE 
      SET nilai = EXCLUDED.nilai, rubrik = EXCLUDED.rubrik, updated_at = NOW();
  END IF;

  -- 9. SINGA - SDN Waliwis 1 (Nilai: 5, Waktu: 00:01:15.14)
  INSERT INTO public.peserta (nomor_dada, nama_regu, pangkalan, kategori, gender, is_verified, total_nilai)
  VALUES (17, 'SINGA', 'SDN Waliwis 1', 'SD', 'Laki-laki', true, 5)
  ON CONFLICT DO NOTHING;
  SELECT id INTO v_peserta_id FROM public.peserta WHERE nama_regu = 'SINGA' AND pangkalan = 'SDN Waliwis 1' AND kategori = 'SD' AND gender = 'Laki-laki';
  IF v_peserta_id IS NOT NULL AND v_juri_id IS NOT NULL THEN
    INSERT INTO public.penilaian (peserta_id, juri_id, lomba_id, nilai, rubrik, updated_at)
    VALUES (v_peserta_id, v_juri_id, v_lomba_sd_id, 5, '{"ketepatan": 5, "waktu": "00:01:15.14"}'::jsonb, NOW())
    ON CONFLICT (peserta_id, juri_id, lomba_id) DO UPDATE 
      SET nilai = EXCLUDED.nilai, rubrik = EXCLUDED.rubrik, updated_at = NOW();
  END IF;

  -- 10. Cobra - Sd negeri cirako (Nilai: 5, Waktu: 00:01:33.81)
  INSERT INTO public.peserta (nomor_dada, nama_regu, pangkalan, kategori, gender, is_verified, total_nilai)
  VALUES (19, 'Cobra', 'Sd negeri cirako', 'SD', 'Laki-laki', true, 5)
  ON CONFLICT DO NOTHING;
  SELECT id INTO v_peserta_id FROM public.peserta WHERE nama_regu = 'Cobra' AND pangkalan = 'Sd negeri cirako' AND kategori = 'SD' AND gender = 'Laki-laki';
  IF v_peserta_id IS NOT NULL AND v_juri_id IS NOT NULL THEN
    INSERT INTO public.penilaian (peserta_id, juri_id, lomba_id, nilai, rubrik, updated_at)
    VALUES (v_peserta_id, v_juri_id, v_lomba_sd_id, 5, '{"ketepatan": 5, "waktu": "00:01:33.81"}'::jsonb, NOW())
    ON CONFLICT (peserta_id, juri_id, lomba_id) DO UPDATE 
      SET nilai = EXCLUDED.nilai, rubrik = EXCLUDED.rubrik, updated_at = NOW();
  END IF;

  -- 11. RAJAWALI - SD NEGERI CIJERUK II (Nilai: 5, Waktu: 00:02:10.88)
  INSERT INTO public.peserta (nomor_dada, nama_regu, pangkalan, kategori, gender, is_verified, total_nilai)
  VALUES (21, 'RAJAWALI', 'SD NEGERI CIJERUK II', 'SD', 'Laki-laki', true, 5)
  ON CONFLICT DO NOTHING;
  SELECT id INTO v_peserta_id FROM public.peserta WHERE nama_regu = 'RAJAWALI' AND pangkalan = 'SD NEGERI CIJERUK II' AND kategori = 'SD' AND gender = 'Laki-laki';
  IF v_peserta_id IS NOT NULL AND v_juri_id IS NOT NULL THEN
    INSERT INTO public.penilaian (peserta_id, juri_id, lomba_id, nilai, rubrik, updated_at)
    VALUES (v_peserta_id, v_juri_id, v_lomba_sd_id, 5, '{"ketepatan": 5, "waktu": "00:02:10.88"}'::jsonb, NOW())
    ON CONFLICT (peserta_id, juri_id, lomba_id) DO UPDATE 
      SET nilai = EXCLUDED.nilai, rubrik = EXCLUDED.rubrik, updated_at = NOW();
  END IF;

  -- 12. HARIMAU - SDN GANDARIA (Nilai: 4, Waktu: 00:01:59.14)
  INSERT INTO public.peserta (nomor_dada, nama_regu, pangkalan, kategori, gender, is_verified, total_nilai)
  VALUES (23, 'HARIMAU', 'SDN GANDARIA', 'SD', 'Laki-laki', true, 4)
  ON CONFLICT DO NOTHING;
  SELECT id INTO v_peserta_id FROM public.peserta WHERE nama_regu = 'HARIMAU' AND pangkalan = 'SDN GANDARIA' AND kategori = 'SD' AND gender = 'Laki-laki';
  IF v_peserta_id IS NOT NULL AND v_juri_id IS NOT NULL THEN
    INSERT INTO public.penilaian (peserta_id, juri_id, lomba_id, nilai, rubrik, updated_at)
    VALUES (v_peserta_id, v_juri_id, v_lomba_sd_id, 4, '{"ketepatan": 4, "waktu": "00:01:59.14"}'::jsonb, NOW())
    ON CONFLICT (peserta_id, juri_id, lomba_id) DO UPDATE 
      SET nilai = EXCLUDED.nilai, rubrik = EXCLUDED.rubrik, updated_at = NOW();
  END IF;

  -- 13. LUMBA-LUMBA - SD NEGERI TEGAL SARI (Nilai: 3, Waktu: 00:01:16.80)
  INSERT INTO public.peserta (nomor_dada, nama_regu, pangkalan, kategori, gender, is_verified, total_nilai)
  VALUES (25, 'LUMBA-LUMBA', 'SD NEGERI TEGAL SARI', 'SD', 'Laki-laki', true, 3)
  ON CONFLICT DO NOTHING;
  SELECT id INTO v_peserta_id FROM public.peserta WHERE nama_regu = 'LUMBA-LUMBA' AND pangkalan = 'SD NEGERI TEGAL SARI' AND kategori = 'SD' AND gender = 'Laki-laki';
  IF v_peserta_id IS NOT NULL AND v_juri_id IS NOT NULL THEN
    INSERT INTO public.penilaian (peserta_id, juri_id, lomba_id, nilai, rubrik, updated_at)
    VALUES (v_peserta_id, v_juri_id, v_lomba_sd_id, 3, '{"ketepatan": 3, "waktu": "00:01:16.80"}'::jsonb, NOW())
    ON CONFLICT (peserta_id, juri_id, lomba_id) DO UPDATE 
      SET nilai = EXCLUDED.nilai, rubrik = EXCLUDED.rubrik, updated_at = NOW();
  END IF;

  -- 14. RAJAWALI - SD N GADOG (Nilai: 3, Waktu: 00:02:36.27)
  INSERT INTO public.peserta (nomor_dada, nama_regu, pangkalan, kategori, gender, is_verified, total_nilai)
  VALUES (27, 'RAJAWALI', 'SD N GADOG', 'SD', 'Laki-laki', true, 3)
  ON CONFLICT DO NOTHING;
  SELECT id INTO v_peserta_id FROM public.peserta WHERE nama_regu = 'RAJAWALI' AND pangkalan = 'SD N GADOG' AND kategori = 'SD' AND gender = 'Laki-laki';
  IF v_peserta_id IS NOT NULL AND v_juri_id IS NOT NULL THEN
    INSERT INTO public.penilaian (peserta_id, juri_id, lomba_id, nilai, rubrik, updated_at)
    VALUES (v_peserta_id, v_juri_id, v_lomba_sd_id, 3, '{"ketepatan": 3, "waktu": "00:02:36.27"}'::jsonb, NOW())
    ON CONFLICT (peserta_id, juri_id, lomba_id) DO UPDATE 
      SET nilai = EXCLUDED.nilai, rubrik = EXCLUDED.rubrik, updated_at = NOW();
  END IF;

  -- 15. Elang - SDN Jenggati (Nilai: 2, Waktu: 00:01:04.73)
  INSERT INTO public.peserta (nomor_dada, nama_regu, pangkalan, kategori, gender, is_verified, total_nilai)
  VALUES (29, 'Elang', 'SDN Jenggati', 'SD', 'Laki-laki', true, 2)
  ON CONFLICT DO NOTHING;
  SELECT id INTO v_peserta_id FROM public.peserta WHERE nama_regu = 'Elang' AND pangkalan = 'SDN Jenggati' AND kategori = 'SD' AND gender = 'Laki-laki';
  IF v_peserta_id IS NOT NULL AND v_juri_id IS NOT NULL THEN
    INSERT INTO public.penilaian (peserta_id, juri_id, lomba_id, nilai, rubrik, updated_at)
    VALUES (v_peserta_id, v_juri_id, v_lomba_sd_id, 2, '{"ketepatan": 2, "waktu": "00:01:04.73"}'::jsonb, NOW())
    ON CONFLICT (peserta_id, juri_id, lomba_id) DO UPDATE 
      SET nilai = EXCLUDED.nilai, rubrik = EXCLUDED.rubrik, updated_at = NOW();
  END IF;

  -- 16. ELANG - SDN GAGA JENGGOT (Nilai: 2, Waktu: 00:11:11.54)
  INSERT INTO public.peserta (nomor_dada, nama_regu, pangkalan, kategori, gender, is_verified, total_nilai)
  VALUES (31, 'ELANG', 'SDN GAGA JENGGOT', 'SD', 'Laki-laki', true, 2)
  ON CONFLICT DO NOTHING;
  SELECT id INTO v_peserta_id FROM public.peserta WHERE nama_regu = 'ELANG' AND pangkalan = 'SDN GAGA JENGGOT' AND kategori = 'SD' AND gender = 'Laki-laki';
  IF v_peserta_id IS NOT NULL AND v_juri_id IS NOT NULL THEN
    INSERT INTO public.penilaian (peserta_id, juri_id, lomba_id, nilai, rubrik, updated_at)
    VALUES (v_peserta_id, v_juri_id, v_lomba_sd_id, 2, '{"ketepatan": 2, "waktu": "00:11:11.54"}'::jsonb, NOW())
    ON CONFLICT (peserta_id, juri_id, lomba_id) DO UPDATE 
      SET nilai = EXCLUDED.nilai, rubrik = EXCLUDED.rubrik, updated_at = NOW();
  END IF;

  -- 17. Naga - SD ISLAM NURUS SYURO (Nilai: 0, Waktu: 00:02:40.75)
  INSERT INTO public.peserta (nomor_dada, nama_regu, pangkalan, kategori, gender, is_verified, total_nilai)
  VALUES (33, 'Naga', 'SD ISLAM NURUS SYURO', 'SD', 'Laki-laki', true, 0)
  ON CONFLICT DO NOTHING;
  SELECT id INTO v_peserta_id FROM public.peserta WHERE nama_regu = 'Naga' AND pangkalan = 'SD ISLAM NURUS SYURO' AND kategori = 'SD' AND gender = 'Laki-laki';
  IF v_peserta_id IS NOT NULL AND v_juri_id IS NOT NULL THEN
    INSERT INTO public.penilaian (peserta_id, juri_id, lomba_id, nilai, rubrik, updated_at)
    VALUES (v_peserta_id, v_juri_id, v_lomba_sd_id, 0, '{"ketepatan": 0, "waktu": "00:02:40.75"}'::jsonb, NOW())
    ON CONFLICT (peserta_id, juri_id, lomba_id) DO UPDATE 
      SET nilai = EXCLUDED.nilai, rubrik = EXCLUDED.rubrik, updated_at = NOW();
  END IF;

  -- 18. SINGA - SDN KEDAUNG 1 (Nilai: 0, Waktu: kosong "-")
  INSERT INTO public.peserta (nomor_dada, nama_regu, pangkalan, kategori, gender, is_verified, total_nilai)
  VALUES (35, 'SINGA', 'SDN KEDAUNG 1', 'SD', 'Laki-laki', true, 0)
  ON CONFLICT DO NOTHING;
  SELECT id INTO v_peserta_id FROM public.peserta WHERE nama_regu = 'SINGA' AND pangkalan = 'SDN KEDAUNG 1' AND kategori = 'SD' AND gender = 'Laki-laki';
  IF v_peserta_id IS NOT NULL AND v_juri_id IS NOT NULL THEN
    INSERT INTO public.penilaian (peserta_id, juri_id, lomba_id, nilai, rubrik, updated_at)
    VALUES (v_peserta_id, v_juri_id, v_lomba_sd_id, 0, '{"ketepatan": 0, "waktu": ""}'::jsonb, NOW())
    ON CONFLICT (peserta_id, juri_id, lomba_id) DO UPDATE 
      SET nilai = EXCLUDED.nilai, rubrik = EXCLUDED.rubrik, updated_at = NOW();
  END IF;


  -- =======================================================================
  -- D. SD PUTRI (19 Regu)
  -- =======================================================================

  -- 1. Tulip - SDN Jenggot 1 (Nilai: 10, Waktu: 00:00:55.60)
  INSERT INTO public.peserta (nomor_dada, nama_regu, pangkalan, kategori, gender, is_verified, total_nilai)
  VALUES (2, 'Tulip', 'SDN Jenggot 1', 'SD', 'Perempuan', true, 10)
  ON CONFLICT DO NOTHING;
  SELECT id INTO v_peserta_id FROM public.peserta WHERE nama_regu = 'Tulip' AND pangkalan = 'SDN Jenggot 1' AND kategori = 'SD' AND gender = 'Perempuan';
  IF v_peserta_id IS NOT NULL AND v_juri_id IS NOT NULL THEN
    INSERT INTO public.penilaian (peserta_id, juri_id, lomba_id, nilai, rubrik, updated_at)
    VALUES (v_peserta_id, v_juri_id, v_lomba_sd_id, 10, '{"ketepatan": 10, "waktu": "00:00:55.60"}'::jsonb, NOW())
    ON CONFLICT (peserta_id, juri_id, lomba_id) DO UPDATE 
      SET nilai = EXCLUDED.nilai, rubrik = EXCLUDED.rubrik, updated_at = NOW();
  END IF;

  -- 2. ANGGREK - SDN Waliwis 1 (Nilai: 10, Waktu: 00:01:05.08)
  INSERT INTO public.peserta (nomor_dada, nama_regu, pangkalan, kategori, gender, is_verified, total_nilai)
  VALUES (4, 'ANGGREK', 'SDN Waliwis 1', 'SD', 'Perempuan', true, 10)
  ON CONFLICT DO NOTHING;
  SELECT id INTO v_peserta_id FROM public.peserta WHERE nama_regu = 'ANGGREK' AND pangkalan = 'SDN Waliwis 1' AND kategori = 'SD' AND gender = 'Perempuan';
  IF v_peserta_id IS NOT NULL AND v_juri_id IS NOT NULL THEN
    INSERT INTO public.penilaian (peserta_id, juri_id, lomba_id, nilai, rubrik, updated_at)
    VALUES (v_peserta_id, v_juri_id, v_lomba_sd_id, 10, '{"ketepatan": 10, "waktu": "00:01:05.08"}'::jsonb, NOW())
    ON CONFLICT (peserta_id, juri_id, lomba_id) DO UPDATE 
      SET nilai = EXCLUDED.nilai, rubrik = EXCLUDED.rubrik, updated_at = NOW();
  END IF;

  -- 3. Matahari - MIS NURUL HIKMAH (Nilai: 10, Waktu: 00:01:32.30)
  INSERT INTO public.peserta (nomor_dada, nama_regu, pangkalan, kategori, gender, is_verified, total_nilai)
  VALUES (6, 'Matahari', 'MIS NURUL HIKMAH', 'SD', 'Perempuan', true, 10)
  ON CONFLICT DO NOTHING;
  SELECT id INTO v_peserta_id FROM public.peserta WHERE nama_regu = 'Matahari' AND pangkalan = 'MIS NURUL HIKMAH' AND kategori = 'SD' AND gender = 'Perempuan';
  IF v_peserta_id IS NOT NULL AND v_juri_id IS NOT NULL THEN
    INSERT INTO public.penilaian (peserta_id, juri_id, lomba_id, nilai, rubrik, updated_at)
    VALUES (v_peserta_id, v_juri_id, v_lomba_sd_id, 10, '{"ketepatan": 10, "waktu": "00:01:32.30"}'::jsonb, NOW())
    ON CONFLICT (peserta_id, juri_id, lomba_id) DO UPDATE 
      SET nilai = EXCLUDED.nilai, rubrik = EXCLUDED.rubrik, updated_at = NOW();
  END IF;

  -- 4. Regu Raflesia - SD N cirako (Nilai: 10, Waktu: 00:03:37.52)
  INSERT INTO public.peserta (nomor_dada, nama_regu, pangkalan, kategori, gender, is_verified, total_nilai)
  VALUES (8, 'Regu Raflesia', 'SD N cirako', 'SD', 'Perempuan', true, 10)
  ON CONFLICT DO NOTHING;
  SELECT id INTO v_peserta_id FROM public.peserta WHERE nama_regu = 'Regu Raflesia' AND pangkalan = 'SD N cirako' AND kategori = 'SD' AND gender = 'Perempuan';
  IF v_peserta_id IS NOT NULL AND v_juri_id IS NOT NULL THEN
    INSERT INTO public.penilaian (peserta_id, juri_id, lomba_id, nilai, rubrik, updated_at)
    VALUES (v_peserta_id, v_juri_id, v_lomba_sd_id, 10, '{"ketepatan": 10, "waktu": "00:03:37.52"}'::jsonb, NOW())
    ON CONFLICT (peserta_id, juri_id, lomba_id) DO UPDATE 
      SET nilai = EXCLUDED.nilai, rubrik = EXCLUDED.rubrik, updated_at = NOW();
  END IF;

  -- 5. MAWAR - SDN GANDARIA (Nilai: 9, Waktu: 00:00:57.71)
  INSERT INTO public.peserta (nomor_dada, nama_regu, pangkalan, kategori, gender, is_verified, total_nilai)
  VALUES (10, 'MAWAR', 'SDN GANDARIA', 'SD', 'Perempuan', true, 9)
  ON CONFLICT DO NOTHING;
  SELECT id INTO v_peserta_id FROM public.peserta WHERE nama_regu = 'MAWAR' AND pangkalan = 'SDN GANDARIA' AND kategori = 'SD' AND gender = 'Perempuan';
  IF v_peserta_id IS NOT NULL AND v_juri_id IS NOT NULL THEN
    INSERT INTO public.penilaian (peserta_id, juri_id, lomba_id, nilai, rubrik, updated_at)
    VALUES (v_peserta_id, v_juri_id, v_lomba_sd_id, 9, '{"ketepatan": 9, "waktu": "00:00:57.71"}'::jsonb, NOW())
    ON CONFLICT (peserta_id, juri_id, lomba_id) DO UPDATE 
      SET nilai = EXCLUDED.nilai, rubrik = EXCLUDED.rubrik, updated_at = NOW();
  END IF;

  -- 6. SAKURA - SDN KOSAMBI DALAM II (Nilai: 9, Waktu: 00:01:11.41)
  INSERT INTO public.peserta (nomor_dada, nama_regu, pangkalan, kategori, gender, is_verified, total_nilai)
  VALUES (12, 'SAKURA', 'SDN KOSAMBI DALAM II', 'SD', 'Perempuan', true, 9)
  ON CONFLICT DO NOTHING;
  SELECT id INTO v_peserta_id FROM public.peserta WHERE nama_regu = 'SAKURA' AND pangkalan = 'SDN KOSAMBI DALAM II' AND kategori = 'SD' AND gender = 'Perempuan';
  IF v_peserta_id IS NOT NULL AND v_juri_id IS NOT NULL THEN
    INSERT INTO public.penilaian (peserta_id, juri_id, lomba_id, nilai, rubrik, updated_at)
    VALUES (v_peserta_id, v_juri_id, v_lomba_sd_id, 9, '{"ketepatan": 9, "waktu": "00:01:11.41"}'::jsonb, NOW())
    ON CONFLICT (peserta_id, juri_id, lomba_id) DO UPDATE 
      SET nilai = EXCLUDED.nilai, rubrik = EXCLUDED.rubrik, updated_at = NOW();
  END IF;

  -- 7. MAWAR - SD NEGERI TEGAL SARI (Nilai: 9, Waktu: 00:02:10.81)
  INSERT INTO public.peserta (nomor_dada, nama_regu, pangkalan, kategori, gender, is_verified, total_nilai)
  VALUES (14, 'MAWAR', 'SD NEGERI TEGAL SARI', 'SD', 'Perempuan', true, 9)
  ON CONFLICT DO NOTHING;
  SELECT id INTO v_peserta_id FROM public.peserta WHERE nama_regu = 'MAWAR' AND pangkalan = 'SD NEGERI TEGAL SARI' AND kategori = 'SD' AND gender = 'Perempuan';
  IF v_peserta_id IS NOT NULL AND v_juri_id IS NOT NULL THEN
    INSERT INTO public.penilaian (peserta_id, juri_id, lomba_id, nilai, rubrik, updated_at)
    VALUES (v_peserta_id, v_juri_id, v_lomba_sd_id, 9, '{"ketepatan": 9, "waktu": "00:02:10.81"}'::jsonb, NOW())
    ON CONFLICT (peserta_id, juri_id, lomba_id) DO UPDATE 
      SET nilai = EXCLUDED.nilai, rubrik = EXCLUDED.rubrik, updated_at = NOW();
  END IF;

  -- 8. EDELWEIS - SD NEGERI CIJERUK II (Nilai: 8, Waktu: 00:01:05.29)
  INSERT INTO public.peserta (nomor_dada, nama_regu, pangkalan, kategori, gender, is_verified, total_nilai)
  VALUES (16, 'EDELWEIS', 'SD NEGERI CIJERUK II', 'SD', 'Perempuan', true, 8)
  ON CONFLICT DO NOTHING;
  SELECT id INTO v_peserta_id FROM public.peserta WHERE nama_regu = 'EDELWEIS' AND pangkalan = 'SD NEGERI CIJERUK II' AND kategori = 'SD' AND gender = 'Perempuan';
  IF v_peserta_id IS NOT NULL AND v_juri_id IS NOT NULL THEN
    INSERT INTO public.penilaian (peserta_id, juri_id, lomba_id, nilai, rubrik, updated_at)
    VALUES (v_peserta_id, v_juri_id, v_lomba_sd_id, 8, '{"ketepatan": 8, "waktu": "00:01:05.29"}'::jsonb, NOW())
    ON CONFLICT (peserta_id, juri_id, lomba_id) DO UPDATE 
      SET nilai = EXCLUDED.nilai, rubrik = EXCLUDED.rubrik, updated_at = NOW();
  END IF;

  -- 9. MATAHARI - SD NEGERI KOSAMBI DALAM I (Nilai: 7, Waktu: 00:01:50.13)
  INSERT INTO public.peserta (nomor_dada, nama_regu, pangkalan, kategori, gender, is_verified, total_nilai)
  VALUES (18, 'MATAHARI', 'SD NEGERI KOSAMBI DALAM I', 'SD', 'Perempuan', true, 7)
  ON CONFLICT DO NOTHING;
  SELECT id INTO v_peserta_id FROM public.peserta WHERE nama_regu = 'MATAHARI' AND pangkalan = 'SD NEGERI KOSAMBI DALAM I' AND kategori = 'SD' AND gender = 'Perempuan';
  IF v_peserta_id IS NOT NULL AND v_juri_id IS NOT NULL THEN
    INSERT INTO public.penilaian (peserta_id, juri_id, lomba_id, nilai, rubrik, updated_at)
    VALUES (v_peserta_id, v_juri_id, v_lomba_sd_id, 7, '{"ketepatan": 7, "waktu": "00:01:50.13"}'::jsonb, NOW())
    ON CONFLICT (peserta_id, juri_id, lomba_id) DO UPDATE 
      SET nilai = EXCLUDED.nilai, rubrik = EXCLUDED.rubrik, updated_at = NOW();
  END IF;

  -- 10. Kamboja - SD N JENGGATI (Nilai: 7, Waktu: 00:02:00.11)
  INSERT INTO public.peserta (nomor_dada, nama_regu, pangkalan, kategori, gender, is_verified, total_nilai)
  VALUES (20, 'Kamboja', 'SD N JENGGATI', 'SD', 'Perempuan', true, 7)
  ON CONFLICT DO NOTHING;
  SELECT id INTO v_peserta_id FROM public.peserta WHERE nama_regu = 'Kamboja' AND pangkalan = 'SD N JENGGATI' AND kategori = 'SD' AND gender = 'Perempuan';
  IF v_peserta_id IS NOT NULL AND v_juri_id IS NOT NULL THEN
    INSERT INTO public.penilaian (peserta_id, juri_id, lomba_id, nilai, rubrik, updated_at)
    VALUES (v_peserta_id, v_juri_id, v_lomba_sd_id, 7, '{"ketepatan": 7, "waktu": "00:02:00.11"}'::jsonb, NOW())
    ON CONFLICT (peserta_id, juri_id, lomba_id) DO UPDATE 
      SET nilai = EXCLUDED.nilai, rubrik = EXCLUDED.rubrik, updated_at = NOW();
  END IF;

  -- 11. BUNGA MATAHARI - SDN GAGA JENGGOT (Nilai: 6, Waktu: 00:02:22.81)
  INSERT INTO public.peserta (nomor_dada, nama_regu, pangkalan, kategori, gender, is_verified, total_nilai)
  VALUES (22, 'BUNGA MATAHARI', 'SDN GAGA JENGGOT', 'SD', 'Perempuan', true, 6)
  ON CONFLICT DO NOTHING;
  SELECT id INTO v_peserta_id FROM public.peserta WHERE nama_regu = 'BUNGA MATAHARI' AND pangkalan = 'SDN GAGA JENGGOT' AND kategori = 'SD' AND gender = 'Perempuan';
  IF v_peserta_id IS NOT NULL AND v_juri_id IS NOT NULL THEN
    INSERT INTO public.penilaian (peserta_id, juri_id, lomba_id, nilai, rubrik, updated_at)
    VALUES (v_peserta_id, v_juri_id, v_lomba_sd_id, 6, '{"ketepatan": 6, "waktu": "00:02:22.81"}'::jsonb, NOW())
    ON CONFLICT (peserta_id, juri_id, lomba_id) DO UPDATE 
      SET nilai = EXCLUDED.nilai, rubrik = EXCLUDED.rubrik, updated_at = NOW();
  END IF;

  -- 12. TULIP - SDN PASIR BUAH (Nilai: 6, Waktu: 00:03:17.13)
  INSERT INTO public.peserta (nomor_dada, nama_regu, pangkalan, kategori, gender, is_verified, total_nilai)
  VALUES (24, 'TULIP', 'SDN PASIR BUAH', 'SD', 'Perempuan', true, 6)
  ON CONFLICT DO NOTHING;
  SELECT id INTO v_peserta_id FROM public.peserta WHERE nama_regu = 'TULIP' AND pangkalan = 'SDN PASIR BUAH' AND kategori = 'SD' AND gender = 'Perempuan';
  IF v_peserta_id IS NOT NULL AND v_juri_id IS NOT NULL THEN
    INSERT INTO public.penilaian (peserta_id, juri_id, lomba_id, nilai, rubrik, updated_at)
    VALUES (v_peserta_id, v_juri_id, v_lomba_sd_id, 6, '{"ketepatan": 6, "waktu": "00:03:17.13"}'::jsonb, NOW())
    ON CONFLICT (peserta_id, juri_id, lomba_id) DO UPDATE 
      SET nilai = EXCLUDED.nilai, rubrik = EXCLUDED.rubrik, updated_at = NOW();
  END IF;

  -- 13. MELATI - SDN GADOG (Nilai: 5, Waktu: 00:01:51.87)
  INSERT INTO public.peserta (nomor_dada, nama_regu, pangkalan, kategori, gender, is_verified, total_nilai)
  VALUES (26, 'MELATI', 'SDN GADOG', 'SD', 'Perempuan', true, 5)
  ON CONFLICT DO NOTHING;
  SELECT id INTO v_peserta_id FROM public.peserta WHERE nama_regu = 'MELATI' AND pangkalan = 'SDN GADOG' AND kategori = 'SD' AND gender = 'Perempuan';
  IF v_peserta_id IS NOT NULL AND v_juri_id IS NOT NULL THEN
    INSERT INTO public.penilaian (peserta_id, juri_id, lomba_id, nilai, rubrik, updated_at)
    VALUES (v_peserta_id, v_juri_id, v_lomba_sd_id, 5, '{"ketepatan": 5, "waktu": "00:01:51.87"}'::jsonb, NOW())
    ON CONFLICT (peserta_id, juri_id, lomba_id) DO UPDATE 
      SET nilai = EXCLUDED.nilai, rubrik = EXCLUDED.rubrik, updated_at = NOW();
  END IF;

  -- 14. MATAHARI - SDN KEDAUNG 1 (Nilai: 5, Waktu: 00:02:24.32)
  INSERT INTO public.peserta (nomor_dada, nama_regu, pangkalan, kategori, gender, is_verified, total_nilai)
  VALUES (28, 'MATAHARI', 'SDN KEDAUNG 1', 'SD', 'Perempuan', true, 5)
  ON CONFLICT DO NOTHING;
  SELECT id INTO v_peserta_id FROM public.peserta WHERE nama_regu = 'MATAHARI' AND pangkalan = 'SDN KEDAUNG 1' AND kategori = 'SD' AND gender = 'Perempuan';
  IF v_peserta_id IS NOT NULL AND v_juri_id IS NOT NULL THEN
    INSERT INTO public.penilaian (peserta_id, juri_id, lomba_id, nilai, rubrik, updated_at)
    VALUES (v_peserta_id, v_juri_id, v_lomba_sd_id, 5, '{"ketepatan": 5, "waktu": "00:02:24.32"}'::jsonb, NOW())
    ON CONFLICT (peserta_id, juri_id, lomba_id) DO UPDATE 
      SET nilai = EXCLUDED.nilai, rubrik = EXCLUDED.rubrik, updated_at = NOW();
  END IF;

  -- 15. Lili - SD ISLAM NURUS SYURO (Nilai: 5, Waktu: 00:02:44.60)
  INSERT INTO public.peserta (nomor_dada, nama_regu, pangkalan, kategori, gender, is_verified, total_nilai)
  VALUES (30, 'Lili', 'SD ISLAM NURUS SYURO', 'SD', 'Perempuan', true, 5)
  ON CONFLICT DO NOTHING;
  SELECT id INTO v_peserta_id FROM public.peserta WHERE nama_regu = 'Lili' AND pangkalan = 'SD ISLAM NURUS SYURO' AND kategori = 'SD' AND gender = 'Perempuan';
  IF v_peserta_id IS NOT NULL AND v_juri_id IS NOT NULL THEN
    INSERT INTO public.penilaian (peserta_id, juri_id, lomba_id, nilai, rubrik, updated_at)
    VALUES (v_peserta_id, v_juri_id, v_lomba_sd_id, 5, '{"ketepatan": 5, "waktu": "00:02:44.60"}'::jsonb, NOW())
    ON CONFLICT (peserta_id, juri_id, lomba_id) DO UPDATE 
      SET nilai = EXCLUDED.nilai, rubrik = EXCLUDED.rubrik, updated_at = NOW();
  END IF;

  -- 16. Melati - SDN Bendung (Nilai: 2, Waktu: 00:00:44.24)
  INSERT INTO public.peserta (nomor_dada, nama_regu, pangkalan, kategori, gender, is_verified, total_nilai)
  VALUES (32, 'Melati', 'SDN Bendung', 'SD', 'Perempuan', true, 2)
  ON CONFLICT DO NOTHING;
  SELECT id INTO v_peserta_id FROM public.peserta WHERE nama_regu = 'Melati' AND pangkalan = 'SDN Bendung' AND kategori = 'SD' AND gender = 'Perempuan';
  IF v_peserta_id IS NOT NULL AND v_juri_id IS NOT NULL THEN
    INSERT INTO public.penilaian (peserta_id, juri_id, lomba_id, nilai, rubrik, updated_at)
    VALUES (v_peserta_id, v_juri_id, v_lomba_sd_id, 2, '{"ketepatan": 2, "waktu": "00:00:44.24"}'::jsonb, NOW())
    ON CONFLICT (peserta_id, juri_id, lomba_id) DO UPDATE 
      SET nilai = EXCLUDED.nilai, rubrik = EXCLUDED.rubrik, updated_at = NOW();
  END IF;

  -- 17. MAWAR - SD NEGERI WALIWIS II (Nilai: 2, Waktu: 00:02:04.96)
  INSERT INTO public.peserta (nomor_dada, nama_regu, pangkalan, kategori, gender, is_verified, total_nilai)
  VALUES (34, 'MAWAR', 'SD NEGERI WALIWIS II', 'SD', 'Perempuan', true, 2)
  ON CONFLICT DO NOTHING;
  SELECT id INTO v_peserta_id FROM public.peserta WHERE nama_regu = 'MAWAR' AND pangkalan = 'SD NEGERI WALIWIS II' AND kategori = 'SD' AND gender = 'Perempuan';
  IF v_peserta_id IS NOT NULL AND v_juri_id IS NOT NULL THEN
    INSERT INTO public.penilaian (peserta_id, juri_id, lomba_id, nilai, rubrik, updated_at)
    VALUES (v_peserta_id, v_juri_id, v_lomba_sd_id, 2, '{"ketepatan": 2, "waktu": "00:02:04.96"}'::jsonb, NOW())
    ON CONFLICT (peserta_id, juri_id, lomba_id) DO UPDATE 
      SET nilai = EXCLUDED.nilai, rubrik = EXCLUDED.rubrik, updated_at = NOW();
  END IF;

  -- 18. EDELWEIS - SDN CIJERUK I (Nilai: 2, Waktu: 00:03:07.99)
  INSERT INTO public.peserta (nomor_dada, nama_regu, pangkalan, kategori, gender, is_verified, total_nilai)
  VALUES (36, 'EDELWEIS', 'SDN CIJERUK I', 'SD', 'Perempuan', true, 2)
  ON CONFLICT DO NOTHING;
  SELECT id INTO v_peserta_id FROM public.peserta WHERE nama_regu = 'EDELWEIS' AND pangkalan = 'SDN CIJERUK I' AND kategori = 'SD' AND gender = 'Perempuan';
  IF v_peserta_id IS NOT NULL AND v_juri_id IS NOT NULL THEN
    INSERT INTO public.penilaian (peserta_id, juri_id, lomba_id, nilai, rubrik, updated_at)
    VALUES (v_peserta_id, v_juri_id, v_lomba_sd_id, 2, '{"ketepatan": 2, "waktu": "00:03:07.99"}'::jsonb, NOW())
    ON CONFLICT (peserta_id, juri_id, lomba_id) DO UPDATE 
      SET nilai = EXCLUDED.nilai, rubrik = EXCLUDED.rubrik, updated_at = NOW();
  END IF;

  -- 19. MELATI - SDN BURAK (Nilai: 1, Waktu: 00:01:02.79)
  INSERT INTO public.peserta (nomor_dada, nama_regu, pangkalan, kategori, gender, is_verified, total_nilai)
  VALUES (38, 'MELATI', 'SDN BURAK', 'SD', 'Perempuan', true, 1)
  ON CONFLICT DO NOTHING;
  SELECT id INTO v_peserta_id FROM public.peserta WHERE nama_regu = 'MELATI' AND pangkalan = 'SDN BURAK' AND kategori = 'SD' AND gender = 'Perempuan';
  IF v_peserta_id IS NOT NULL AND v_juri_id IS NOT NULL THEN
    INSERT INTO public.penilaian (peserta_id, juri_id, lomba_id, nilai, rubrik, updated_at)
    VALUES (v_peserta_id, v_juri_id, v_lomba_sd_id, 1, '{"ketepatan": 1, "waktu": "00:01:02.79"}'::jsonb, NOW())
    ON CONFLICT (peserta_id, juri_id, lomba_id) DO UPDATE 
      SET nilai = EXCLUDED.nilai, rubrik = EXCLUDED.rubrik, updated_at = NOW();
  END IF;

END $$;
