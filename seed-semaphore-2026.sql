-- =========================================================================
-- UPDATE PENILAIAN & WAKTU RESMI LOMBA SEMAPHORE (HANYA PENILAIAN JURI)
-- =========================================================================
-- Script ini TIDAK MENAMBAH data peserta baru.
-- Script ini HANYA mengisi / memperbarui nilai dan waktu pada data peserta
-- yang SUDAH TERDAFTAR di database berdasarkan Pangkalan, Gender, dan Tingkat.
-- =========================================================================

-- 1. Pastikan kolom rubrik JSONB ada di tabel penilaian
ALTER TABLE public.penilaian ADD COLUMN IF NOT EXISTS rubrik JSONB DEFAULT '{}'::jsonb;

DO $$
DECLARE
  v_lomba_sd_id UUID;
  v_lomba_smp_id UUID;
  v_juri_id UUID;
  v_pid UUID;

  -- Prosedur pembantu untuk mencocokkan peserta yang ada dan input nilai + waktu
  -- TIDAK membuat peserta baru!
BEGIN
  -- 2. Ambil ID Lomba Semaphore di database
  SELECT id INTO v_lomba_sd_id FROM public.lomba WHERE (kode_lomba = 'SMP' OR nama_lomba ILIKE '%Semaphore%') AND kategori = 'SD' LIMIT 1;
  SELECT id INTO v_lomba_smp_id FROM public.lomba WHERE (kode_lomba = 'SMP' OR nama_lomba ILIKE '%Semaphore%') AND kategori = 'SMP' LIMIT 1;

  -- Jika belum ada di tabel lomba, buat baris lomba Semaphore resmi
  IF v_lomba_sd_id IS NULL THEN
    INSERT INTO public.lomba (nama_lomba, kode_lomba, kategori) VALUES ('Semaphore', 'SMP', 'SD') RETURNING id INTO v_lomba_sd_id;
  END IF;
  IF v_lomba_smp_id IS NULL THEN
    INSERT INTO public.lomba (nama_lomba, kode_lomba, kategori) VALUES ('Semaphore', 'SMP', 'SMP') RETURNING id INTO v_lomba_smp_id;
  END IF;

  -- 3. Cari akun Juri Semaphore atau Admin untuk juri_id
  SELECT id INTO v_juri_id 
  FROM public.profiles 
  WHERE role IN ('juri', 'admin') 
  ORDER BY (CASE WHEN nama_lengkap ILIKE '%semaphore%' OR nama_lengkap ILIKE '%semap%' THEN 0 ELSE 1 END), role ASC
  LIMIT 1;

  IF v_juri_id IS NULL THEN
    SELECT id INTO v_juri_id FROM auth.users LIMIT 1;
  END IF;

  -- =======================================================================
  -- A. SMP PUTRA (7 Regu Terdaftar)
  -- =======================================================================

  -- 1. MTSS ASHHABUL MAIMANAH (Nilai: 15, Waktu: 00:01:26.55)
  SELECT id INTO v_pid FROM public.peserta WHERE kategori = 'SMP' AND gender = 'Laki-laki' AND (pangkalan ILIKE '%Ashhabul Maimanah%' OR nama_regu ILIKE '%GARUDA%') ORDER BY created_at ASC LIMIT 1;
  IF v_pid IS NOT NULL AND v_juri_id IS NOT NULL THEN
    INSERT INTO public.penilaian (peserta_id, juri_id, lomba_id, nilai, rubrik, updated_at)
    VALUES (v_pid, v_juri_id, v_lomba_smp_id, 15, '{"ketepatan": 15, "waktu": "00:01:26.55"}'::jsonb, NOW())
    ON CONFLICT (peserta_id, juri_id, lomba_id) DO UPDATE 
      SET nilai = 15, rubrik = '{"ketepatan": 15, "waktu": "00:01:26.55"}'::jsonb, updated_at = NOW();
  END IF;

  -- 2. SMPN 1 Mekar Baru (Nilai: 13, Waktu: 00:02:27.61)
  SELECT id INTO v_pid FROM public.peserta WHERE kategori = 'SMP' AND gender = 'Laki-laki' AND (pangkalan ILIKE '%SMPN 1%' OR pangkalan ILIKE '%SMP Negeri 1%') ORDER BY created_at ASC LIMIT 1;
  IF v_pid IS NOT NULL AND v_juri_id IS NOT NULL THEN
    INSERT INTO public.penilaian (peserta_id, juri_id, lomba_id, nilai, rubrik, updated_at)
    VALUES (v_pid, v_juri_id, v_lomba_smp_id, 13, '{"ketepatan": 13, "waktu": "00:02:27.61"}'::jsonb, NOW())
    ON CONFLICT (peserta_id, juri_id, lomba_id) DO UPDATE 
      SET nilai = 13, rubrik = '{"ketepatan": 13, "waktu": "00:02:27.61"}'::jsonb, updated_at = NOW();
  END IF;

  -- 3. SMPN 3 MEKAR BARU (Nilai: 12, Waktu: 00:02:01.38)
  SELECT id INTO v_pid FROM public.peserta WHERE kategori = 'SMP' AND gender = 'Laki-laki' AND (pangkalan ILIKE '%SMPN 3%' OR pangkalan ILIKE '%SMP Negeri 3%') ORDER BY created_at ASC LIMIT 1;
  IF v_pid IS NOT NULL AND v_juri_id IS NOT NULL THEN
    INSERT INTO public.penilaian (peserta_id, juri_id, lomba_id, nilai, rubrik, updated_at)
    VALUES (v_pid, v_juri_id, v_lomba_smp_id, 12, '{"ketepatan": 12, "waktu": "00:02:01.38"}'::jsonb, NOW())
    ON CONFLICT (peserta_id, juri_id, lomba_id) DO UPDATE 
      SET nilai = 12, rubrik = '{"ketepatan": 12, "waktu": "00:02:01.38"}'::jsonb, updated_at = NOW();
  END IF;

  -- 4. SMP NEGERI 2 MEKAR BARU (Nilai: 6, Waktu: 00:01:46.52)
  SELECT id INTO v_pid FROM public.peserta WHERE kategori = 'SMP' AND gender = 'Laki-laki' AND (pangkalan ILIKE '%SMPN 2%' OR pangkalan ILIKE '%SMP Negeri 2%') ORDER BY created_at ASC LIMIT 1;
  IF v_pid IS NOT NULL AND v_juri_id IS NOT NULL THEN
    INSERT INTO public.penilaian (peserta_id, juri_id, lomba_id, nilai, rubrik, updated_at)
    VALUES (v_pid, v_juri_id, v_lomba_smp_id, 6, '{"ketepatan": 6, "waktu": "00:01:46.52"}'::jsonb, NOW())
    ON CONFLICT (peserta_id, juri_id, lomba_id) DO UPDATE 
      SET nilai = 6, rubrik = '{"ketepatan": 6, "waktu": "00:01:46.52"}'::jsonb, updated_at = NOW();
  END IF;

  -- 5. SMP GEMA ISLAMI (Nilai: 2, Waktu: 00:03:55.15)
  SELECT id INTO v_pid FROM public.peserta WHERE kategori = 'SMP' AND gender = 'Laki-laki' AND (pangkalan ILIKE '%Gema Islami%') ORDER BY created_at ASC LIMIT 1;
  IF v_pid IS NOT NULL AND v_juri_id IS NOT NULL THEN
    INSERT INTO public.penilaian (peserta_id, juri_id, lomba_id, nilai, rubrik, updated_at)
    VALUES (v_pid, v_juri_id, v_lomba_smp_id, 2, '{"ketepatan": 2, "waktu": "00:03:55.15"}'::jsonb, NOW())
    ON CONFLICT (peserta_id, juri_id, lomba_id) DO UPDATE 
      SET nilai = 2, rubrik = '{"ketepatan": 2, "waktu": "00:03:55.15"}'::jsonb, updated_at = NOW();
  END IF;

  -- 6. MTsN 7 Tangerang (Nilai: 1, Waktu: 00:02:59.01)
  SELECT id INTO v_pid FROM public.peserta WHERE kategori = 'SMP' AND gender = 'Laki-laki' AND (pangkalan ILIKE '%MTsN 7%' OR pangkalan ILIKE '%MTSN 7%') ORDER BY created_at ASC LIMIT 1;
  IF v_pid IS NOT NULL AND v_juri_id IS NOT NULL THEN
    INSERT INTO public.penilaian (peserta_id, juri_id, lomba_id, nilai, rubrik, updated_at)
    VALUES (v_pid, v_juri_id, v_lomba_smp_id, 1, '{"ketepatan": 1, "waktu": "00:02:59.01"}'::jsonb, NOW())
    ON CONFLICT (peserta_id, juri_id, lomba_id) DO UPDATE 
      SET nilai = 1, rubrik = '{"ketepatan": 1, "waktu": "00:02:59.01"}'::jsonb, updated_at = NOW();
  END IF;

  -- 7. SMP NURUL AMIN (Nilai: 1, Waktu: 00:03:01.89)
  SELECT id INTO v_pid FROM public.peserta WHERE kategori = 'SMP' AND gender = 'Laki-laki' AND (pangkalan ILIKE '%Nurul Amin%') ORDER BY created_at ASC LIMIT 1;
  IF v_pid IS NOT NULL AND v_juri_id IS NOT NULL THEN
    INSERT INTO public.penilaian (peserta_id, juri_id, lomba_id, nilai, rubrik, updated_at)
    VALUES (v_pid, v_juri_id, v_lomba_smp_id, 1, '{"ketepatan": 1, "waktu": "00:03:01.89"}'::jsonb, NOW())
    ON CONFLICT (peserta_id, juri_id, lomba_id) DO UPDATE 
      SET nilai = 1, rubrik = '{"ketepatan": 1, "waktu": "00:03:01.89"}'::jsonb, updated_at = NOW();
  END IF;


  -- =======================================================================
  -- B. SMP PUTRI (7 Regu Terdaftar)
  -- =======================================================================

  -- 1. MTSS ASHHABUL MAIMANAH (Nilai: 15, Waktu: 00:00:53.02)
  SELECT id INTO v_pid FROM public.peserta WHERE kategori = 'SMP' AND gender = 'Perempuan' AND (pangkalan ILIKE '%Ashhabul Maimanah%' OR nama_regu ILIKE '%RAFLESIA%') ORDER BY created_at ASC LIMIT 1;
  IF v_pid IS NOT NULL AND v_juri_id IS NOT NULL THEN
    INSERT INTO public.penilaian (peserta_id, juri_id, lomba_id, nilai, rubrik, updated_at)
    VALUES (v_pid, v_juri_id, v_lomba_smp_id, 15, '{"ketepatan": 15, "waktu": "00:00:53.02"}'::jsonb, NOW())
    ON CONFLICT (peserta_id, juri_id, lomba_id) DO UPDATE 
      SET nilai = 15, rubrik = '{"ketepatan": 15, "waktu": "00:00:53.02"}'::jsonb, updated_at = NOW();
  END IF;

  -- 2. SMP NURUL AMIN (Nilai: 9, Waktu: 00:01:45.64)
  SELECT id INTO v_pid FROM public.peserta WHERE kategori = 'SMP' AND gender = 'Perempuan' AND (pangkalan ILIKE '%Nurul Amin%') ORDER BY created_at ASC LIMIT 1;
  IF v_pid IS NOT NULL AND v_juri_id IS NOT NULL THEN
    INSERT INTO public.penilaian (peserta_id, juri_id, lomba_id, nilai, rubrik, updated_at)
    VALUES (v_pid, v_juri_id, v_lomba_smp_id, 9, '{"ketepatan": 9, "waktu": "00:01:45.64"}'::jsonb, NOW())
    ON CONFLICT (peserta_id, juri_id, lomba_id) DO UPDATE 
      SET nilai = 9, rubrik = '{"ketepatan": 9, "waktu": "00:01:45.64"}'::jsonb, updated_at = NOW();
  END IF;

  -- 3. MTsN 7 Tangerang (Nilai: 6, Waktu: 00:01:22.86)
  SELECT id INTO v_pid FROM public.peserta WHERE kategori = 'SMP' AND gender = 'Perempuan' AND (pangkalan ILIKE '%MTsN 7%' OR pangkalan ILIKE '%MTSN 7%') ORDER BY created_at ASC LIMIT 1;
  IF v_pid IS NOT NULL AND v_juri_id IS NOT NULL THEN
    INSERT INTO public.penilaian (peserta_id, juri_id, lomba_id, nilai, rubrik, updated_at)
    VALUES (v_pid, v_juri_id, v_lomba_smp_id, 6, '{"ketepatan": 6, "waktu": "00:01:22.86"}'::jsonb, NOW())
    ON CONFLICT (peserta_id, juri_id, lomba_id) DO UPDATE 
      SET nilai = 6, rubrik = '{"ketepatan": 6, "waktu": "00:01:22.86"}'::jsonb, updated_at = NOW();
  END IF;

  -- 4. SMPN 3 MEKAR BARU (Nilai: 6, Waktu: 00:02:04.38)
  SELECT id INTO v_pid FROM public.peserta WHERE kategori = 'SMP' AND gender = 'Perempuan' AND (pangkalan ILIKE '%SMPN 3%' OR pangkalan ILIKE '%SMP Negeri 3%') ORDER BY created_at ASC LIMIT 1;
  IF v_pid IS NOT NULL AND v_juri_id IS NOT NULL THEN
    INSERT INTO public.penilaian (peserta_id, juri_id, lomba_id, nilai, rubrik, updated_at)
    VALUES (v_pid, v_juri_id, v_lomba_smp_id, 6, '{"ketepatan": 6, "waktu": "00:02:04.38"}'::jsonb, NOW())
    ON CONFLICT (peserta_id, juri_id, lomba_id) DO UPDATE 
      SET nilai = 6, rubrik = '{"ketepatan": 6, "waktu": "00:02:04.38"}'::jsonb, updated_at = NOW();
  END IF;

  -- 5. SMPN 1 Mekar Baru (Nilai: 3, Waktu: 00:02:06.21)
  SELECT id INTO v_pid FROM public.peserta WHERE kategori = 'SMP' AND gender = 'Perempuan' AND (pangkalan ILIKE '%SMPN 1%' OR pangkalan ILIKE '%SMP Negeri 1%') ORDER BY created_at ASC LIMIT 1;
  IF v_pid IS NOT NULL AND v_juri_id IS NOT NULL THEN
    INSERT INTO public.penilaian (peserta_id, juri_id, lomba_id, nilai, rubrik, updated_at)
    VALUES (v_pid, v_juri_id, v_lomba_smp_id, 3, '{"ketepatan": 3, "waktu": "00:02:06.21"}'::jsonb, NOW())
    ON CONFLICT (peserta_id, juri_id, lomba_id) DO UPDATE 
      SET nilai = 3, rubrik = '{"ketepatan": 3, "waktu": "00:02:06.21"}'::jsonb, updated_at = NOW();
  END IF;

  -- 6. SMP NEGERI 2 MEKAR BARU (Nilai: 2, Waktu: 00:01:30.99)
  SELECT id INTO v_pid FROM public.peserta WHERE kategori = 'SMP' AND gender = 'Perempuan' AND (pangkalan ILIKE '%SMPN 2%' OR pangkalan ILIKE '%SMP Negeri 2%') ORDER BY created_at ASC LIMIT 1;
  IF v_pid IS NOT NULL AND v_juri_id IS NOT NULL THEN
    INSERT INTO public.penilaian (peserta_id, juri_id, lomba_id, nilai, rubrik, updated_at)
    VALUES (v_pid, v_juri_id, v_lomba_smp_id, 2, '{"ketepatan": 2, "waktu": "00:01:30.99"}'::jsonb, NOW())
    ON CONFLICT (peserta_id, juri_id, lomba_id) DO UPDATE 
      SET nilai = 2, rubrik = '{"ketepatan": 2, "waktu": "00:01:30.99"}'::jsonb, updated_at = NOW();
  END IF;

  -- 7. SMP GEMA ISLAMI (Nilai: 1, Waktu: 00:01:10.07)
  SELECT id INTO v_pid FROM public.peserta WHERE kategori = 'SMP' AND gender = 'Perempuan' AND (pangkalan ILIKE '%Gema Islami%') ORDER BY created_at ASC LIMIT 1;
  IF v_pid IS NOT NULL AND v_juri_id IS NOT NULL THEN
    INSERT INTO public.penilaian (peserta_id, juri_id, lomba_id, nilai, rubrik, updated_at)
    VALUES (v_pid, v_juri_id, v_lomba_smp_id, 1, '{"ketepatan": 1, "waktu": "00:01:10.07"}'::jsonb, NOW())
    ON CONFLICT (peserta_id, juri_id, lomba_id) DO UPDATE 
      SET nilai = 1, rubrik = '{"ketepatan": 1, "waktu": "00:01:10.07"}'::jsonb, updated_at = NOW();
  END IF;


  -- =======================================================================
  -- C. SD PUTRA (18 Regu Terdaftar)
  -- =======================================================================

  -- 1. MIS NURUL HIKMAH (Nilai: 10, Waktu: 00:00:52.25)
  SELECT id INTO v_pid FROM public.peserta WHERE kategori = 'SD' AND gender = 'Laki-laki' AND (pangkalan ILIKE '%Nurul Hikmah%') ORDER BY created_at ASC LIMIT 1;
  IF v_pid IS NOT NULL AND v_juri_id IS NOT NULL THEN
    INSERT INTO public.penilaian (peserta_id, juri_id, lomba_id, nilai, rubrik, updated_at)
    VALUES (v_pid, v_juri_id, v_lomba_sd_id, 10, '{"ketepatan": 10, "waktu": "00:00:52.25"}'::jsonb, NOW())
    ON CONFLICT (peserta_id, juri_id, lomba_id) DO UPDATE 
      SET nilai = 10, rubrik = '{"ketepatan": 10, "waktu": "00:00:52.25"}'::jsonb, updated_at = NOW();
  END IF;

  -- 2. SDN KOSAMBI DALAM II (Nilai: 10, Waktu: 00:00:54.91)
  SELECT id INTO v_pid FROM public.peserta WHERE kategori = 'SD' AND gender = 'Laki-laki' AND (pangkalan ILIKE '%Kosambi Dalam%2%' OR pangkalan ILIKE '%Kosambi Dalam II%') ORDER BY created_at ASC LIMIT 1;
  IF v_pid IS NOT NULL AND v_juri_id IS NOT NULL THEN
    INSERT INTO public.penilaian (peserta_id, juri_id, lomba_id, nilai, rubrik, updated_at)
    VALUES (v_pid, v_juri_id, v_lomba_sd_id, 10, '{"ketepatan": 10, "waktu": "00:00:54.91"}'::jsonb, NOW())
    ON CONFLICT (peserta_id, juri_id, lomba_id) DO UPDATE 
      SET nilai = 10, rubrik = '{"ketepatan": 10, "waktu": "00:00:54.91"}'::jsonb, updated_at = NOW();
  END IF;

  -- 3. SDN Jenggot 1 (Nilai: 10, Waktu: 00:01:04.67)
  SELECT id INTO v_pid FROM public.peserta WHERE kategori = 'SD' AND gender = 'Laki-laki' AND (pangkalan ILIKE '%Jenggot 1%' OR pangkalan ILIKE '%Jenggot I%') ORDER BY created_at ASC LIMIT 1;
  IF v_pid IS NOT NULL AND v_juri_id IS NOT NULL THEN
    INSERT INTO public.penilaian (peserta_id, juri_id, lomba_id, nilai, rubrik, updated_at)
    VALUES (v_pid, v_juri_id, v_lomba_sd_id, 10, '{"ketepatan": 10, "waktu": "00:01:04.67"}'::jsonb, NOW())
    ON CONFLICT (peserta_id, juri_id, lomba_id) DO UPDATE 
      SET nilai = 10, rubrik = '{"ketepatan": 10, "waktu": "00:01:04.67"}'::jsonb, updated_at = NOW();
  END IF;

  -- 4. SDN Burak (Nilai: 8, Waktu: 00:00:52.63)
  SELECT id INTO v_pid FROM public.peserta WHERE kategori = 'SD' AND gender = 'Laki-laki' AND (pangkalan ILIKE '%Burak%') ORDER BY created_at ASC LIMIT 1;
  IF v_pid IS NOT NULL AND v_juri_id IS NOT NULL THEN
    INSERT INTO public.penilaian (peserta_id, juri_id, lomba_id, nilai, rubrik, updated_at)
    VALUES (v_pid, v_juri_id, v_lomba_sd_id, 8, '{"ketepatan": 8, "waktu": "00:00:52.63"}'::jsonb, NOW())
    ON CONFLICT (peserta_id, juri_id, lomba_id) DO UPDATE 
      SET nilai = 8, rubrik = '{"ketepatan": 8, "waktu": "00:00:52.63"}'::jsonb, updated_at = NOW();
  END IF;

  -- 5. SDN CIJERUK I (Nilai: 6, Waktu: 00:01:15.47)
  SELECT id INTO v_pid FROM public.peserta WHERE kategori = 'SD' AND gender = 'Laki-laki' AND (pangkalan ILIKE '%Cijeruk 1%' OR pangkalan ILIKE '%Cijeruk I%') ORDER BY created_at ASC LIMIT 1;
  IF v_pid IS NOT NULL AND v_juri_id IS NOT NULL THEN
    INSERT INTO public.penilaian (peserta_id, juri_id, lomba_id, nilai, rubrik, updated_at)
    VALUES (v_pid, v_juri_id, v_lomba_sd_id, 6, '{"ketepatan": 6, "waktu": "00:01:15.47"}'::jsonb, NOW())
    ON CONFLICT (peserta_id, juri_id, lomba_id) DO UPDATE 
      SET nilai = 6, rubrik = '{"ketepatan": 6, "waktu": "00:01:15.47"}'::jsonb, updated_at = NOW();
  END IF;

  -- 6. SDN PASIR BUAH (Nilai: 6, Waktu: 00:01:55.10)
  SELECT id INTO v_pid FROM public.peserta WHERE kategori = 'SD' AND gender = 'Laki-laki' AND (pangkalan ILIKE '%Pasir Buah%') ORDER BY created_at ASC LIMIT 1;
  IF v_pid IS NOT NULL AND v_juri_id IS NOT NULL THEN
    INSERT INTO public.penilaian (peserta_id, juri_id, lomba_id, nilai, rubrik, updated_at)
    VALUES (v_pid, v_juri_id, v_lomba_sd_id, 6, '{"ketepatan": 6, "waktu": "00:01:55.10"}'::jsonb, NOW())
    ON CONFLICT (peserta_id, juri_id, lomba_id) DO UPDATE 
      SET nilai = 6, rubrik = '{"ketepatan": 6, "waktu": "00:01:55.10"}'::jsonb, updated_at = NOW();
  END IF;

  -- 7. SD NEGERI WALIWIS II (Nilai: 6, Waktu: 00:02:19.87)
  SELECT id INTO v_pid FROM public.peserta WHERE kategori = 'SD' AND gender = 'Laki-laki' AND (pangkalan ILIKE '%Waliwis 2%' OR pangkalan ILIKE '%Waliwis II%') ORDER BY created_at ASC LIMIT 1;
  IF v_pid IS NOT NULL AND v_juri_id IS NOT NULL THEN
    INSERT INTO public.penilaian (peserta_id, juri_id, lomba_id, nilai, rubrik, updated_at)
    VALUES (v_pid, v_juri_id, v_lomba_sd_id, 6, '{"ketepatan": 6, "waktu": "00:02:19.87"}'::jsonb, NOW())
    ON CONFLICT (peserta_id, juri_id, lomba_id) DO UPDATE 
      SET nilai = 6, rubrik = '{"ketepatan": 6, "waktu": "00:02:19.87"}'::jsonb, updated_at = NOW();
  END IF;

  -- 8. SDN Bendung (Nilai: 5, Waktu: 00:01:09.74)
  SELECT id INTO v_pid FROM public.peserta WHERE kategori = 'SD' AND gender = 'Laki-laki' AND (pangkalan ILIKE '%Bendung%') ORDER BY created_at ASC LIMIT 1;
  IF v_pid IS NOT NULL AND v_juri_id IS NOT NULL THEN
    INSERT INTO public.penilaian (peserta_id, juri_id, lomba_id, nilai, rubrik, updated_at)
    VALUES (v_pid, v_juri_id, v_lomba_sd_id, 5, '{"ketepatan": 5, "waktu": "00:01:09.74"}'::jsonb, NOW())
    ON CONFLICT (peserta_id, juri_id, lomba_id) DO UPDATE 
      SET nilai = 5, rubrik = '{"ketepatan": 5, "waktu": "00:01:09.74"}'::jsonb, updated_at = NOW();
  END IF;

  -- 9. SDN Waliwis 1 (Nilai: 5, Waktu: 00:01:15.14)
  SELECT id INTO v_pid FROM public.peserta WHERE kategori = 'SD' AND gender = 'Laki-laki' AND (pangkalan ILIKE '%Waliwis 1%' OR pangkalan ILIKE '%Waliwis I%') ORDER BY created_at ASC LIMIT 1;
  IF v_pid IS NOT NULL AND v_juri_id IS NOT NULL THEN
    INSERT INTO public.penilaian (peserta_id, juri_id, lomba_id, nilai, rubrik, updated_at)
    VALUES (v_pid, v_juri_id, v_lomba_sd_id, 5, '{"ketepatan": 5, "waktu": "00:01:15.14"}'::jsonb, NOW())
    ON CONFLICT (peserta_id, juri_id, lomba_id) DO UPDATE 
      SET nilai = 5, rubrik = '{"ketepatan": 5, "waktu": "00:01:15.14"}'::jsonb, updated_at = NOW();
  END IF;

  -- 10. Sd negeri cirako (Nilai: 5, Waktu: 00:01:33.81)
  SELECT id INTO v_pid FROM public.peserta WHERE kategori = 'SD' AND gender = 'Laki-laki' AND (pangkalan ILIKE '%Cirako%') ORDER BY created_at ASC LIMIT 1;
  IF v_pid IS NOT NULL AND v_juri_id IS NOT NULL THEN
    INSERT INTO public.penilaian (peserta_id, juri_id, lomba_id, nilai, rubrik, updated_at)
    VALUES (v_pid, v_juri_id, v_lomba_sd_id, 5, '{"ketepatan": 5, "waktu": "00:01:33.81"}'::jsonb, NOW())
    ON CONFLICT (peserta_id, juri_id, lomba_id) DO UPDATE 
      SET nilai = 5, rubrik = '{"ketepatan": 5, "waktu": "00:01:33.81"}'::jsonb, updated_at = NOW();
  END IF;

  -- 11. SD NEGERI CIJERUK II (Nilai: 5, Waktu: 00:02:10.88)
  SELECT id INTO v_pid FROM public.peserta WHERE kategori = 'SD' AND gender = 'Laki-laki' AND (pangkalan ILIKE '%Cijeruk 2%' OR pangkalan ILIKE '%Cijeruk II%') ORDER BY created_at ASC LIMIT 1;
  IF v_pid IS NOT NULL AND v_juri_id IS NOT NULL THEN
    INSERT INTO public.penilaian (peserta_id, juri_id, lomba_id, nilai, rubrik, updated_at)
    VALUES (v_pid, v_juri_id, v_lomba_sd_id, 5, '{"ketepatan": 5, "waktu": "00:02:10.88"}'::jsonb, NOW())
    ON CONFLICT (peserta_id, juri_id, lomba_id) DO UPDATE 
      SET nilai = 5, rubrik = '{"ketepatan": 5, "waktu": "00:02:10.88"}'::jsonb, updated_at = NOW();
  END IF;

  -- 12. SDN GANDARIA (Nilai: 4, Waktu: 00:01:59.14)
  SELECT id INTO v_pid FROM public.peserta WHERE kategori = 'SD' AND gender = 'Laki-laki' AND (pangkalan ILIKE '%Gandaria%') ORDER BY created_at ASC LIMIT 1;
  IF v_pid IS NOT NULL AND v_juri_id IS NOT NULL THEN
    INSERT INTO public.penilaian (peserta_id, juri_id, lomba_id, nilai, rubrik, updated_at)
    VALUES (v_pid, v_juri_id, v_lomba_sd_id, 4, '{"ketepatan": 4, "waktu": "00:01:59.14"}'::jsonb, NOW())
    ON CONFLICT (peserta_id, juri_id, lomba_id) DO UPDATE 
      SET nilai = 4, rubrik = '{"ketepatan": 4, "waktu": "00:01:59.14"}'::jsonb, updated_at = NOW();
  END IF;

  -- 13. SD NEGERI TEGAL SARI (Nilai: 3, Waktu: 00:01:16.80)
  SELECT id INTO v_pid FROM public.peserta WHERE kategori = 'SD' AND gender = 'Laki-laki' AND (pangkalan ILIKE '%Tegal Sari%') ORDER BY created_at ASC LIMIT 1;
  IF v_pid IS NOT NULL AND v_juri_id IS NOT NULL THEN
    INSERT INTO public.penilaian (peserta_id, juri_id, lomba_id, nilai, rubrik, updated_at)
    VALUES (v_pid, v_juri_id, v_lomba_sd_id, 3, '{"ketepatan": 3, "waktu": "00:01:16.80"}'::jsonb, NOW())
    ON CONFLICT (peserta_id, juri_id, lomba_id) DO UPDATE 
      SET nilai = 3, rubrik = '{"ketepatan": 3, "waktu": "00:01:16.80"}'::jsonb, updated_at = NOW();
  END IF;

  -- 14. SD N GADOG (Nilai: 3, Waktu: 00:02:36.27)
  SELECT id INTO v_pid FROM public.peserta WHERE kategori = 'SD' AND gender = 'Laki-laki' AND (pangkalan ILIKE '%Gadog%') ORDER BY created_at ASC LIMIT 1;
  IF v_pid IS NOT NULL AND v_juri_id IS NOT NULL THEN
    INSERT INTO public.penilaian (peserta_id, juri_id, lomba_id, nilai, rubrik, updated_at)
    VALUES (v_pid, v_juri_id, v_lomba_sd_id, 3, '{"ketepatan": 3, "waktu": "00:02:36.27"}'::jsonb, NOW())
    ON CONFLICT (peserta_id, juri_id, lomba_id) DO UPDATE 
      SET nilai = 3, rubrik = '{"ketepatan": 3, "waktu": "00:02:36.27"}'::jsonb, updated_at = NOW();
  END IF;

  -- 15. SDN Jenggati (Nilai: 2, Waktu: 00:01:04.73)
  SELECT id INTO v_pid FROM public.peserta WHERE kategori = 'SD' AND gender = 'Laki-laki' AND (pangkalan ILIKE '%Jenggati%') ORDER BY created_at ASC LIMIT 1;
  IF v_pid IS NOT NULL AND v_juri_id IS NOT NULL THEN
    INSERT INTO public.penilaian (peserta_id, juri_id, lomba_id, nilai, rubrik, updated_at)
    VALUES (v_pid, v_juri_id, v_lomba_sd_id, 2, '{"ketepatan": 2, "waktu": "00:01:04.73"}'::jsonb, NOW())
    ON CONFLICT (peserta_id, juri_id, lomba_id) DO UPDATE 
      SET nilai = 2, rubrik = '{"ketepatan": 2, "waktu": "00:01:04.73"}'::jsonb, updated_at = NOW();
  END IF;

  -- 16. SDN GAGA JENGGOT (Nilai: 2, Waktu: 00:11:11.54)
  SELECT id INTO v_pid FROM public.peserta WHERE kategori = 'SD' AND gender = 'Laki-laki' AND (pangkalan ILIKE '%Gaga Jenggot%') ORDER BY created_at ASC LIMIT 1;
  IF v_pid IS NOT NULL AND v_juri_id IS NOT NULL THEN
    INSERT INTO public.penilaian (peserta_id, juri_id, lomba_id, nilai, rubrik, updated_at)
    VALUES (v_pid, v_juri_id, v_lomba_sd_id, 2, '{"ketepatan": 2, "waktu": "00:11:11.54"}'::jsonb, NOW())
    ON CONFLICT (peserta_id, juri_id, lomba_id) DO UPDATE 
      SET nilai = 2, rubrik = '{"ketepatan": 2, "waktu": "00:11:11.54"}'::jsonb, updated_at = NOW();
  END IF;

  -- 17. SD ISLAM NURUS SYURO (Nilai: 0, Waktu: 00:02:40.75)
  SELECT id INTO v_pid FROM public.peserta WHERE kategori = 'SD' AND gender = 'Laki-laki' AND (pangkalan ILIKE '%Nurus Syuro%') ORDER BY created_at ASC LIMIT 1;
  IF v_pid IS NOT NULL AND v_juri_id IS NOT NULL THEN
    INSERT INTO public.penilaian (peserta_id, juri_id, lomba_id, nilai, rubrik, updated_at)
    VALUES (v_pid, v_juri_id, v_lomba_sd_id, 0, '{"ketepatan": 0, "waktu": "00:02:40.75"}'::jsonb, NOW())
    ON CONFLICT (peserta_id, juri_id, lomba_id) DO UPDATE 
      SET nilai = 0, rubrik = '{"ketepatan": 0, "waktu": "00:02:40.75"}'::jsonb, updated_at = NOW();
  END IF;

  -- 18. SDN KEDAUNG 1 (Nilai: 0, Waktu: kosong "-")
  SELECT id INTO v_pid FROM public.peserta WHERE kategori = 'SD' AND gender = 'Laki-laki' AND (pangkalan ILIKE '%Kedaung%') ORDER BY created_at ASC LIMIT 1;
  IF v_pid IS NOT NULL AND v_juri_id IS NOT NULL THEN
    INSERT INTO public.penilaian (peserta_id, juri_id, lomba_id, nilai, rubrik, updated_at)
    VALUES (v_pid, v_juri_id, v_lomba_sd_id, 0, '{"ketepatan": 0, "waktu": ""}'::jsonb, NOW())
    ON CONFLICT (peserta_id, juri_id, lomba_id) DO UPDATE 
      SET nilai = 0, rubrik = '{"ketepatan": 0, "waktu": ""}'::jsonb, updated_at = NOW();
  END IF;


  -- =======================================================================
  -- D. SD PUTRI (19 Regu Terdaftar)
  -- =======================================================================

  -- 1. SDN Jenggot 1 (Nilai: 10, Waktu: 00:00:55.60)
  SELECT id INTO v_pid FROM public.peserta WHERE kategori = 'SD' AND gender = 'Perempuan' AND (pangkalan ILIKE '%Jenggot 1%' OR pangkalan ILIKE '%Jenggot I%') ORDER BY created_at ASC LIMIT 1;
  IF v_pid IS NOT NULL AND v_juri_id IS NOT NULL THEN
    INSERT INTO public.penilaian (peserta_id, juri_id, lomba_id, nilai, rubrik, updated_at)
    VALUES (v_pid, v_juri_id, v_lomba_sd_id, 10, '{"ketepatan": 10, "waktu": "00:00:55.60"}'::jsonb, NOW())
    ON CONFLICT (peserta_id, juri_id, lomba_id) DO UPDATE 
      SET nilai = 10, rubrik = '{"ketepatan": 10, "waktu": "00:00:55.60"}'::jsonb, updated_at = NOW();
  END IF;

  -- 2. SDN Waliwis 1 (Nilai: 10, Waktu: 00:01:05.08)
  SELECT id INTO v_pid FROM public.peserta WHERE kategori = 'SD' AND gender = 'Perempuan' AND (pangkalan ILIKE '%Waliwis 1%' OR pangkalan ILIKE '%Waliwis I%') ORDER BY created_at ASC LIMIT 1;
  IF v_pid IS NOT NULL AND v_juri_id IS NOT NULL THEN
    INSERT INTO public.penilaian (peserta_id, juri_id, lomba_id, nilai, rubrik, updated_at)
    VALUES (v_pid, v_juri_id, v_lomba_sd_id, 10, '{"ketepatan": 10, "waktu": "00:01:05.08"}'::jsonb, NOW())
    ON CONFLICT (peserta_id, juri_id, lomba_id) DO UPDATE 
      SET nilai = 10, rubrik = '{"ketepatan": 10, "waktu": "00:01:05.08"}'::jsonb, updated_at = NOW();
  END IF;

  -- 3. MIS NURUL HIKMAH (Nilai: 10, Waktu: 00:01:32.30)
  SELECT id INTO v_pid FROM public.peserta WHERE kategori = 'SD' AND gender = 'Perempuan' AND (pangkalan ILIKE '%Nurul Hikmah%') ORDER BY created_at ASC LIMIT 1;
  IF v_pid IS NOT NULL AND v_juri_id IS NOT NULL THEN
    INSERT INTO public.penilaian (peserta_id, juri_id, lomba_id, nilai, rubrik, updated_at)
    VALUES (v_pid, v_juri_id, v_lomba_sd_id, 10, '{"ketepatan": 10, "waktu": "00:01:32.30"}'::jsonb, NOW())
    ON CONFLICT (peserta_id, juri_id, lomba_id) DO UPDATE 
      SET nilai = 10, rubrik = '{"ketepatan": 10, "waktu": "00:01:32.30"}'::jsonb, updated_at = NOW();
  END IF;

  -- 4. SD N cirako (Nilai: 10, Waktu: 00:03:37.52)
  SELECT id INTO v_pid FROM public.peserta WHERE kategori = 'SD' AND gender = 'Perempuan' AND (pangkalan ILIKE '%Cirako%') ORDER BY created_at ASC LIMIT 1;
  IF v_pid IS NOT NULL AND v_juri_id IS NOT NULL THEN
    INSERT INTO public.penilaian (peserta_id, juri_id, lomba_id, nilai, rubrik, updated_at)
    VALUES (v_pid, v_juri_id, v_lomba_sd_id, 10, '{"ketepatan": 10, "waktu": "00:03:37.52"}'::jsonb, NOW())
    ON CONFLICT (peserta_id, juri_id, lomba_id) DO UPDATE 
      SET nilai = 10, rubrik = '{"ketepatan": 10, "waktu": "00:03:37.52"}'::jsonb, updated_at = NOW();
  END IF;

  -- 5. SDN GANDARIA (Nilai: 9, Waktu: 00:00:57.71)
  SELECT id INTO v_pid FROM public.peserta WHERE kategori = 'SD' AND gender = 'Perempuan' AND (pangkalan ILIKE '%Gandaria%') ORDER BY created_at ASC LIMIT 1;
  IF v_pid IS NOT NULL AND v_juri_id IS NOT NULL THEN
    INSERT INTO public.penilaian (peserta_id, juri_id, lomba_id, nilai, rubrik, updated_at)
    VALUES (v_pid, v_juri_id, v_lomba_sd_id, 9, '{"ketepatan": 9, "waktu": "00:00:57.71"}'::jsonb, NOW())
    ON CONFLICT (peserta_id, juri_id, lomba_id) DO UPDATE 
      SET nilai = 9, rubrik = '{"ketepatan": 9, "waktu": "00:00:57.71"}'::jsonb, updated_at = NOW();
  END IF;

  -- 6. SDN KOSAMBI DALAM II (Nilai: 9, Waktu: 00:01:11.41)
  SELECT id INTO v_pid FROM public.peserta WHERE kategori = 'SD' AND gender = 'Perempuan' AND (pangkalan ILIKE '%Kosambi Dalam%2%' OR pangkalan ILIKE '%Kosambi Dalam II%') ORDER BY created_at ASC LIMIT 1;
  IF v_pid IS NOT NULL AND v_juri_id IS NOT NULL THEN
    INSERT INTO public.penilaian (peserta_id, juri_id, lomba_id, nilai, rubrik, updated_at)
    VALUES (v_pid, v_juri_id, v_lomba_sd_id, 9, '{"ketepatan": 9, "waktu": "00:01:11.41"}'::jsonb, NOW())
    ON CONFLICT (peserta_id, juri_id, lomba_id) DO UPDATE 
      SET nilai = 9, rubrik = '{"ketepatan": 9, "waktu": "00:01:11.41"}'::jsonb, updated_at = NOW();
  END IF;

  -- 7. SD NEGERI TEGAL SARI (Nilai: 9, Waktu: 00:02:10.81)
  SELECT id INTO v_pid FROM public.peserta WHERE kategori = 'SD' AND gender = 'Perempuan' AND (pangkalan ILIKE '%Tegal Sari%') ORDER BY created_at ASC LIMIT 1;
  IF v_pid IS NOT NULL AND v_juri_id IS NOT NULL THEN
    INSERT INTO public.penilaian (peserta_id, juri_id, lomba_id, nilai, rubrik, updated_at)
    VALUES (v_pid, v_juri_id, v_lomba_sd_id, 9, '{"ketepatan": 9, "waktu": "00:02:10.81"}'::jsonb, NOW())
    ON CONFLICT (peserta_id, juri_id, lomba_id) DO UPDATE 
      SET nilai = 9, rubrik = '{"ketepatan": 9, "waktu": "00:02:10.81"}'::jsonb, updated_at = NOW();
  END IF;

  -- 8. SD NEGERI CIJERUK II (Nilai: 8, Waktu: 00:01:05.29)
  SELECT id INTO v_pid FROM public.peserta WHERE kategori = 'SD' AND gender = 'Perempuan' AND (pangkalan ILIKE '%Cijeruk 2%' OR pangkalan ILIKE '%Cijeruk II%') ORDER BY created_at ASC LIMIT 1;
  IF v_pid IS NOT NULL AND v_juri_id IS NOT NULL THEN
    INSERT INTO public.penilaian (peserta_id, juri_id, lomba_id, nilai, rubrik, updated_at)
    VALUES (v_pid, v_juri_id, v_lomba_sd_id, 8, '{"ketepatan": 8, "waktu": "00:01:05.29"}'::jsonb, NOW())
    ON CONFLICT (peserta_id, juri_id, lomba_id) DO UPDATE 
      SET nilai = 8, rubrik = '{"ketepatan": 8, "waktu": "00:01:05.29"}'::jsonb, updated_at = NOW();
  END IF;

  -- 9. SD NEGERI KOSAMBI DALAM I (Nilai: 7, Waktu: 00:01:50.13)
  SELECT id INTO v_pid FROM public.peserta WHERE kategori = 'SD' AND gender = 'Perempuan' AND (pangkalan ILIKE '%Kosambi Dalam%1%' OR pangkalan ILIKE '%Kosambi Dalam I%') ORDER BY created_at ASC LIMIT 1;
  IF v_pid IS NOT NULL AND v_juri_id IS NOT NULL THEN
    INSERT INTO public.penilaian (peserta_id, juri_id, lomba_id, nilai, rubrik, updated_at)
    VALUES (v_pid, v_juri_id, v_lomba_sd_id, 7, '{"ketepatan": 7, "waktu": "00:01:50.13"}'::jsonb, NOW())
    ON CONFLICT (peserta_id, juri_id, lomba_id) DO UPDATE 
      SET nilai = 7, rubrik = '{"ketepatan": 7, "waktu": "00:01:50.13"}'::jsonb, updated_at = NOW();
  END IF;

  -- 10. SD N JENGGATI (Nilai: 7, Waktu: 00:02:00.11)
  SELECT id INTO v_pid FROM public.peserta WHERE kategori = 'SD' AND gender = 'Perempuan' AND (pangkalan ILIKE '%Jenggati%') ORDER BY created_at ASC LIMIT 1;
  IF v_pid IS NOT NULL AND v_juri_id IS NOT NULL THEN
    INSERT INTO public.penilaian (peserta_id, juri_id, lomba_id, nilai, rubrik, updated_at)
    VALUES (v_pid, v_juri_id, v_lomba_sd_id, 7, '{"ketepatan": 7, "waktu": "00:02:00.11"}'::jsonb, NOW())
    ON CONFLICT (peserta_id, juri_id, lomba_id) DO UPDATE 
      SET nilai = 7, rubrik = '{"ketepatan": 7, "waktu": "00:02:00.11"}'::jsonb, updated_at = NOW();
  END IF;

  -- 11. SDN GAGA JENGGOT (Nilai: 6, Waktu: 00:02:22.81)
  SELECT id INTO v_pid FROM public.peserta WHERE kategori = 'SD' AND gender = 'Perempuan' AND (pangkalan ILIKE '%Gaga Jenggot%') ORDER BY created_at ASC LIMIT 1;
  IF v_pid IS NOT NULL AND v_juri_id IS NOT NULL THEN
    INSERT INTO public.penilaian (peserta_id, juri_id, lomba_id, nilai, rubrik, updated_at)
    VALUES (v_pid, v_juri_id, v_lomba_sd_id, 6, '{"ketepatan": 6, "waktu": "00:02:22.81"}'::jsonb, NOW())
    ON CONFLICT (peserta_id, juri_id, lomba_id) DO UPDATE 
      SET nilai = 6, rubrik = '{"ketepatan": 6, "waktu": "00:02:22.81"}'::jsonb, updated_at = NOW();
  END IF;

  -- 12. SDN PASIR BUAH (Nilai: 6, Waktu: 00:03:17.13)
  SELECT id INTO v_pid FROM public.peserta WHERE kategori = 'SD' AND gender = 'Perempuan' AND (pangkalan ILIKE '%Pasir Buah%') ORDER BY created_at ASC LIMIT 1;
  IF v_pid IS NOT NULL AND v_juri_id IS NOT NULL THEN
    INSERT INTO public.penilaian (peserta_id, juri_id, lomba_id, nilai, rubrik, updated_at)
    VALUES (v_pid, v_juri_id, v_lomba_sd_id, 6, '{"ketepatan": 6, "waktu": "00:03:17.13"}'::jsonb, NOW())
    ON CONFLICT (peserta_id, juri_id, lomba_id) DO UPDATE 
      SET nilai = 6, rubrik = '{"ketepatan": 6, "waktu": "00:03:17.13"}'::jsonb, updated_at = NOW();
  END IF;

  -- 13. SDN GADOG (Nilai: 5, Waktu: 00:01:51.87)
  SELECT id INTO v_pid FROM public.peserta WHERE kategori = 'SD' AND gender = 'Perempuan' AND (pangkalan ILIKE '%Gadog%') ORDER BY created_at ASC LIMIT 1;
  IF v_pid IS NOT NULL AND v_juri_id IS NOT NULL THEN
    INSERT INTO public.penilaian (peserta_id, juri_id, lomba_id, nilai, rubrik, updated_at)
    VALUES (v_pid, v_juri_id, v_lomba_sd_id, 5, '{"ketepatan": 5, "waktu": "00:01:51.87"}'::jsonb, NOW())
    ON CONFLICT (peserta_id, juri_id, lomba_id) DO UPDATE 
      SET nilai = 5, rubrik = '{"ketepatan": 5, "waktu": "00:01:51.87"}'::jsonb, updated_at = NOW();
  END IF;

  -- 14. SDN KEDAUNG 1 (Nilai: 5, Waktu: 00:02:24.32)
  SELECT id INTO v_pid FROM public.peserta WHERE kategori = 'SD' AND gender = 'Perempuan' AND (pangkalan ILIKE '%Kedaung%') ORDER BY created_at ASC LIMIT 1;
  IF v_pid IS NOT NULL AND v_juri_id IS NOT NULL THEN
    INSERT INTO public.penilaian (peserta_id, juri_id, lomba_id, nilai, rubrik, updated_at)
    VALUES (v_pid, v_juri_id, v_lomba_sd_id, 5, '{"ketepatan": 5, "waktu": "00:02:24.32"}'::jsonb, NOW())
    ON CONFLICT (peserta_id, juri_id, lomba_id) DO UPDATE 
      SET nilai = 5, rubrik = '{"ketepatan": 5, "waktu": "00:02:24.32"}'::jsonb, updated_at = NOW();
  END IF;

  -- 15. SD ISLAM NURUS SYURO (Nilai: 5, Waktu: 00:02:44.60)
  SELECT id INTO v_pid FROM public.peserta WHERE kategori = 'SD' AND gender = 'Perempuan' AND (pangkalan ILIKE '%Nurus Syuro%') ORDER BY created_at ASC LIMIT 1;
  IF v_pid IS NOT NULL AND v_juri_id IS NOT NULL THEN
    INSERT INTO public.penilaian (peserta_id, juri_id, lomba_id, nilai, rubrik, updated_at)
    VALUES (v_pid, v_juri_id, v_lomba_sd_id, 5, '{"ketepatan": 5, "waktu": "00:02:44.60"}'::jsonb, NOW())
    ON CONFLICT (peserta_id, juri_id, lomba_id) DO UPDATE 
      SET nilai = 5, rubrik = '{"ketepatan": 5, "waktu": "00:02:44.60"}'::jsonb, updated_at = NOW();
  END IF;

  -- 16. SDN Bendung (Nilai: 2, Waktu: 00:00:44.24)
  SELECT id INTO v_pid FROM public.peserta WHERE kategori = 'SD' AND gender = 'Perempuan' AND (pangkalan ILIKE '%Bendung%') ORDER BY created_at ASC LIMIT 1;
  IF v_pid IS NOT NULL AND v_juri_id IS NOT NULL THEN
    INSERT INTO public.penilaian (peserta_id, juri_id, lomba_id, nilai, rubrik, updated_at)
    VALUES (v_pid, v_juri_id, v_lomba_sd_id, 2, '{"ketepatan": 2, "waktu": "00:00:44.24"}'::jsonb, NOW())
    ON CONFLICT (peserta_id, juri_id, lomba_id) DO UPDATE 
      SET nilai = 2, rubrik = '{"ketepatan": 2, "waktu": "00:00:44.24"}'::jsonb, updated_at = NOW();
  END IF;

  -- 17. SD NEGERI WALIWIS II (Nilai: 2, Waktu: 00:02:04.96)
  SELECT id INTO v_pid FROM public.peserta WHERE kategori = 'SD' AND gender = 'Perempuan' AND (pangkalan ILIKE '%Waliwis 2%' OR pangkalan ILIKE '%Waliwis II%') ORDER BY created_at ASC LIMIT 1;
  IF v_pid IS NOT NULL AND v_juri_id IS NOT NULL THEN
    INSERT INTO public.penilaian (peserta_id, juri_id, lomba_id, nilai, rubrik, updated_at)
    VALUES (v_pid, v_juri_id, v_lomba_sd_id, 2, '{"ketepatan": 2, "waktu": "00:02:04.96"}'::jsonb, NOW())
    ON CONFLICT (peserta_id, juri_id, lomba_id) DO UPDATE 
      SET nilai = 2, rubrik = '{"ketepatan": 2, "waktu": "00:02:04.96"}'::jsonb, updated_at = NOW();
  END IF;

  -- 18. SDN CIJERUK I (Nilai: 2, Waktu: 00:03:07.99)
  SELECT id INTO v_pid FROM public.peserta WHERE kategori = 'SD' AND gender = 'Perempuan' AND (pangkalan ILIKE '%Cijeruk 1%' OR pangkalan ILIKE '%Cijeruk I%') ORDER BY created_at ASC LIMIT 1;
  IF v_pid IS NOT NULL AND v_juri_id IS NOT NULL THEN
    INSERT INTO public.penilaian (peserta_id, juri_id, lomba_id, nilai, rubrik, updated_at)
    VALUES (v_pid, v_juri_id, v_lomba_sd_id, 2, '{"ketepatan": 2, "waktu": "00:03:07.99"}'::jsonb, NOW())
    ON CONFLICT (peserta_id, juri_id, lomba_id) DO UPDATE 
      SET nilai = 2, rubrik = '{"ketepatan": 2, "waktu": "00:03:07.99"}'::jsonb, updated_at = NOW();
  END IF;

  -- 19. SDN BURAK (Nilai: 1, Waktu: 00:01:02.79)
  SELECT id INTO v_pid FROM public.peserta WHERE kategori = 'SD' AND gender = 'Perempuan' AND (pangkalan ILIKE '%Burak%') ORDER BY created_at ASC LIMIT 1;
  IF v_pid IS NOT NULL AND v_juri_id IS NOT NULL THEN
    INSERT INTO public.penilaian (peserta_id, juri_id, lomba_id, nilai, rubrik, updated_at)
    VALUES (v_pid, v_juri_id, v_lomba_sd_id, 1, '{"ketepatan": 1, "waktu": "00:01:02.79"}'::jsonb, NOW())
    ON CONFLICT (peserta_id, juri_id, lomba_id) DO UPDATE 
      SET nilai = 1, rubrik = '{"ketepatan": 1, "waktu": "00:01:02.79"}'::jsonb, updated_at = NOW();
  END IF;

END $$;
