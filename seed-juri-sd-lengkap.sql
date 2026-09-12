-- ============================================================
-- SQL SEEDER: 90 DEWAN JURI TINGKAT SD & SIMULASI PENILAIAN LENGKAP
-- LT-II KWARTIR RANTING MEKAR BARU 2026
-- ============================================================
-- 15 Cabang Lomba x 2 Gender (Putra & Putri) x 3 Juri per lomba = 90 Juri
-- Kredensial Login Seragam:
-- Password: JuriLT2MekarBaru2026!
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Insert/Upsert 90 Akun Dewan Juri ke auth.users
DO $$
DECLARE
  pwd_hash text;
BEGIN
  pwd_hash := crypt('JuriLT2MekarBaru2026!', gen_salt('bf'));

  -- Juri 1: Juri 1 Administrasi Regu (Putra) (juri1.adm.sd.pa@pramuka.id)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'juri1.adm.sd.pa@pramuka.id') THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      '00000000-0000-4000-a000-000000000001'::uuid,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'juri1.adm.sd.pa@pramuka.id',
      pwd_hash,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'nama_lengkap', 'Juri 1 Administrasi Regu (Putra)',
        'role', 'juri',
        'assigned_kategori', 'SD',
        'assigned_gender', 'Laki-laki',
        'assigned_lomba_id', 'efb72c87-594c-41ed-9b41-83098e8c6f5c'
      ),
      now(),
      now()
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = pwd_hash,
        email_confirmed_at = COALESCE(email_confirmed_at, now())
    WHERE email = 'juri1.adm.sd.pa@pramuka.id';
  END IF;

  -- Juri 2: Juri 2 Administrasi Regu (Putra) (juri2.adm.sd.pa@pramuka.id)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'juri2.adm.sd.pa@pramuka.id') THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      '00000000-0000-4000-a000-000000000002'::uuid,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'juri2.adm.sd.pa@pramuka.id',
      pwd_hash,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'nama_lengkap', 'Juri 2 Administrasi Regu (Putra)',
        'role', 'juri',
        'assigned_kategori', 'SD',
        'assigned_gender', 'Laki-laki',
        'assigned_lomba_id', 'efb72c87-594c-41ed-9b41-83098e8c6f5c'
      ),
      now(),
      now()
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = pwd_hash,
        email_confirmed_at = COALESCE(email_confirmed_at, now())
    WHERE email = 'juri2.adm.sd.pa@pramuka.id';
  END IF;

  -- Juri 3: Juri 3 Administrasi Regu (Putra) (juri3.adm.sd.pa@pramuka.id)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'juri3.adm.sd.pa@pramuka.id') THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      '00000000-0000-4000-a000-000000000003'::uuid,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'juri3.adm.sd.pa@pramuka.id',
      pwd_hash,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'nama_lengkap', 'Juri 3 Administrasi Regu (Putra)',
        'role', 'juri',
        'assigned_kategori', 'SD',
        'assigned_gender', 'Laki-laki',
        'assigned_lomba_id', 'efb72c87-594c-41ed-9b41-83098e8c6f5c'
      ),
      now(),
      now()
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = pwd_hash,
        email_confirmed_at = COALESCE(email_confirmed_at, now())
    WHERE email = 'juri3.adm.sd.pa@pramuka.id';
  END IF;

  -- Juri 4: Juri 1 Administrasi Regu (Putri) (juri1.adm.sd.pi@pramuka.id)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'juri1.adm.sd.pi@pramuka.id') THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      '00000000-0000-4000-a000-000000000004'::uuid,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'juri1.adm.sd.pi@pramuka.id',
      pwd_hash,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'nama_lengkap', 'Juri 1 Administrasi Regu (Putri)',
        'role', 'juri',
        'assigned_kategori', 'SD',
        'assigned_gender', 'Perempuan',
        'assigned_lomba_id', 'efb72c87-594c-41ed-9b41-83098e8c6f5c'
      ),
      now(),
      now()
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = pwd_hash,
        email_confirmed_at = COALESCE(email_confirmed_at, now())
    WHERE email = 'juri1.adm.sd.pi@pramuka.id';
  END IF;

  -- Juri 5: Juri 2 Administrasi Regu (Putri) (juri2.adm.sd.pi@pramuka.id)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'juri2.adm.sd.pi@pramuka.id') THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      '00000000-0000-4000-a000-000000000005'::uuid,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'juri2.adm.sd.pi@pramuka.id',
      pwd_hash,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'nama_lengkap', 'Juri 2 Administrasi Regu (Putri)',
        'role', 'juri',
        'assigned_kategori', 'SD',
        'assigned_gender', 'Perempuan',
        'assigned_lomba_id', 'efb72c87-594c-41ed-9b41-83098e8c6f5c'
      ),
      now(),
      now()
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = pwd_hash,
        email_confirmed_at = COALESCE(email_confirmed_at, now())
    WHERE email = 'juri2.adm.sd.pi@pramuka.id';
  END IF;

  -- Juri 6: Juri 3 Administrasi Regu (Putri) (juri3.adm.sd.pi@pramuka.id)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'juri3.adm.sd.pi@pramuka.id') THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      '00000000-0000-4000-a000-000000000006'::uuid,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'juri3.adm.sd.pi@pramuka.id',
      pwd_hash,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'nama_lengkap', 'Juri 3 Administrasi Regu (Putri)',
        'role', 'juri',
        'assigned_kategori', 'SD',
        'assigned_gender', 'Perempuan',
        'assigned_lomba_id', 'efb72c87-594c-41ed-9b41-83098e8c6f5c'
      ),
      now(),
      now()
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = pwd_hash,
        email_confirmed_at = COALESCE(email_confirmed_at, now())
    WHERE email = 'juri3.adm.sd.pi@pramuka.id';
  END IF;

  -- Juri 7: Juri 1 Forum Penggalang (Putra) (juri1.frp.sd.pa@pramuka.id)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'juri1.frp.sd.pa@pramuka.id') THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      '00000000-0000-4000-a000-000000000007'::uuid,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'juri1.frp.sd.pa@pramuka.id',
      pwd_hash,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'nama_lengkap', 'Juri 1 Forum Penggalang (Putra)',
        'role', 'juri',
        'assigned_kategori', 'SD',
        'assigned_gender', 'Laki-laki',
        'assigned_lomba_id', 'b528b529-6152-42b1-b810-48f598cd6c0e'
      ),
      now(),
      now()
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = pwd_hash,
        email_confirmed_at = COALESCE(email_confirmed_at, now())
    WHERE email = 'juri1.frp.sd.pa@pramuka.id';
  END IF;

  -- Juri 8: Juri 2 Forum Penggalang (Putra) (juri2.frp.sd.pa@pramuka.id)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'juri2.frp.sd.pa@pramuka.id') THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      '00000000-0000-4000-a000-000000000008'::uuid,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'juri2.frp.sd.pa@pramuka.id',
      pwd_hash,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'nama_lengkap', 'Juri 2 Forum Penggalang (Putra)',
        'role', 'juri',
        'assigned_kategori', 'SD',
        'assigned_gender', 'Laki-laki',
        'assigned_lomba_id', 'b528b529-6152-42b1-b810-48f598cd6c0e'
      ),
      now(),
      now()
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = pwd_hash,
        email_confirmed_at = COALESCE(email_confirmed_at, now())
    WHERE email = 'juri2.frp.sd.pa@pramuka.id';
  END IF;

  -- Juri 9: Juri 3 Forum Penggalang (Putra) (juri3.frp.sd.pa@pramuka.id)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'juri3.frp.sd.pa@pramuka.id') THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      '00000000-0000-4000-a000-000000000009'::uuid,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'juri3.frp.sd.pa@pramuka.id',
      pwd_hash,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'nama_lengkap', 'Juri 3 Forum Penggalang (Putra)',
        'role', 'juri',
        'assigned_kategori', 'SD',
        'assigned_gender', 'Laki-laki',
        'assigned_lomba_id', 'b528b529-6152-42b1-b810-48f598cd6c0e'
      ),
      now(),
      now()
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = pwd_hash,
        email_confirmed_at = COALESCE(email_confirmed_at, now())
    WHERE email = 'juri3.frp.sd.pa@pramuka.id';
  END IF;

  -- Juri 10: Juri 1 Forum Penggalang (Putri) (juri1.frp.sd.pi@pramuka.id)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'juri1.frp.sd.pi@pramuka.id') THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      '00000000-0000-4000-a000-000000000010'::uuid,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'juri1.frp.sd.pi@pramuka.id',
      pwd_hash,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'nama_lengkap', 'Juri 1 Forum Penggalang (Putri)',
        'role', 'juri',
        'assigned_kategori', 'SD',
        'assigned_gender', 'Perempuan',
        'assigned_lomba_id', 'b528b529-6152-42b1-b810-48f598cd6c0e'
      ),
      now(),
      now()
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = pwd_hash,
        email_confirmed_at = COALESCE(email_confirmed_at, now())
    WHERE email = 'juri1.frp.sd.pi@pramuka.id';
  END IF;

  -- Juri 11: Juri 2 Forum Penggalang (Putri) (juri2.frp.sd.pi@pramuka.id)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'juri2.frp.sd.pi@pramuka.id') THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      '00000000-0000-4000-a000-000000000011'::uuid,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'juri2.frp.sd.pi@pramuka.id',
      pwd_hash,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'nama_lengkap', 'Juri 2 Forum Penggalang (Putri)',
        'role', 'juri',
        'assigned_kategori', 'SD',
        'assigned_gender', 'Perempuan',
        'assigned_lomba_id', 'b528b529-6152-42b1-b810-48f598cd6c0e'
      ),
      now(),
      now()
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = pwd_hash,
        email_confirmed_at = COALESCE(email_confirmed_at, now())
    WHERE email = 'juri2.frp.sd.pi@pramuka.id';
  END IF;

  -- Juri 12: Juri 3 Forum Penggalang (Putri) (juri3.frp.sd.pi@pramuka.id)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'juri3.frp.sd.pi@pramuka.id') THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      '00000000-0000-4000-a000-000000000012'::uuid,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'juri3.frp.sd.pi@pramuka.id',
      pwd_hash,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'nama_lengkap', 'Juri 3 Forum Penggalang (Putri)',
        'role', 'juri',
        'assigned_kategori', 'SD',
        'assigned_gender', 'Perempuan',
        'assigned_lomba_id', 'b528b529-6152-42b1-b810-48f598cd6c0e'
      ),
      now(),
      now()
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = pwd_hash,
        email_confirmed_at = COALESCE(email_confirmed_at, now())
    WHERE email = 'juri3.frp.sd.pi@pramuka.id';
  END IF;

  -- Juri 13: Juri 1 Menyanyi Hymne & Mars (Putra) (juri1.hmn.sd.pa@pramuka.id)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'juri1.hmn.sd.pa@pramuka.id') THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      '00000000-0000-4000-a000-000000000013'::uuid,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'juri1.hmn.sd.pa@pramuka.id',
      pwd_hash,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'nama_lengkap', 'Juri 1 Menyanyi Hymne & Mars (Putra)',
        'role', 'juri',
        'assigned_kategori', 'SD',
        'assigned_gender', 'Laki-laki',
        'assigned_lomba_id', '400ee260-9d94-4327-b8f0-08790826bf69'
      ),
      now(),
      now()
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = pwd_hash,
        email_confirmed_at = COALESCE(email_confirmed_at, now())
    WHERE email = 'juri1.hmn.sd.pa@pramuka.id';
  END IF;

  -- Juri 14: Juri 2 Menyanyi Hymne & Mars (Putra) (juri2.hmn.sd.pa@pramuka.id)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'juri2.hmn.sd.pa@pramuka.id') THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      '00000000-0000-4000-a000-000000000014'::uuid,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'juri2.hmn.sd.pa@pramuka.id',
      pwd_hash,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'nama_lengkap', 'Juri 2 Menyanyi Hymne & Mars (Putra)',
        'role', 'juri',
        'assigned_kategori', 'SD',
        'assigned_gender', 'Laki-laki',
        'assigned_lomba_id', '400ee260-9d94-4327-b8f0-08790826bf69'
      ),
      now(),
      now()
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = pwd_hash,
        email_confirmed_at = COALESCE(email_confirmed_at, now())
    WHERE email = 'juri2.hmn.sd.pa@pramuka.id';
  END IF;

  -- Juri 15: Juri 3 Menyanyi Hymne & Mars (Putra) (juri3.hmn.sd.pa@pramuka.id)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'juri3.hmn.sd.pa@pramuka.id') THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      '00000000-0000-4000-a000-000000000015'::uuid,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'juri3.hmn.sd.pa@pramuka.id',
      pwd_hash,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'nama_lengkap', 'Juri 3 Menyanyi Hymne & Mars (Putra)',
        'role', 'juri',
        'assigned_kategori', 'SD',
        'assigned_gender', 'Laki-laki',
        'assigned_lomba_id', '400ee260-9d94-4327-b8f0-08790826bf69'
      ),
      now(),
      now()
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = pwd_hash,
        email_confirmed_at = COALESCE(email_confirmed_at, now())
    WHERE email = 'juri3.hmn.sd.pa@pramuka.id';
  END IF;

  -- Juri 16: Juri 1 Menyanyi Hymne & Mars (Putri) (juri1.hmn.sd.pi@pramuka.id)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'juri1.hmn.sd.pi@pramuka.id') THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      '00000000-0000-4000-a000-000000000016'::uuid,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'juri1.hmn.sd.pi@pramuka.id',
      pwd_hash,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'nama_lengkap', 'Juri 1 Menyanyi Hymne & Mars (Putri)',
        'role', 'juri',
        'assigned_kategori', 'SD',
        'assigned_gender', 'Perempuan',
        'assigned_lomba_id', '400ee260-9d94-4327-b8f0-08790826bf69'
      ),
      now(),
      now()
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = pwd_hash,
        email_confirmed_at = COALESCE(email_confirmed_at, now())
    WHERE email = 'juri1.hmn.sd.pi@pramuka.id';
  END IF;

  -- Juri 17: Juri 2 Menyanyi Hymne & Mars (Putri) (juri2.hmn.sd.pi@pramuka.id)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'juri2.hmn.sd.pi@pramuka.id') THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      '00000000-0000-4000-a000-000000000017'::uuid,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'juri2.hmn.sd.pi@pramuka.id',
      pwd_hash,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'nama_lengkap', 'Juri 2 Menyanyi Hymne & Mars (Putri)',
        'role', 'juri',
        'assigned_kategori', 'SD',
        'assigned_gender', 'Perempuan',
        'assigned_lomba_id', '400ee260-9d94-4327-b8f0-08790826bf69'
      ),
      now(),
      now()
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = pwd_hash,
        email_confirmed_at = COALESCE(email_confirmed_at, now())
    WHERE email = 'juri2.hmn.sd.pi@pramuka.id';
  END IF;

  -- Juri 18: Juri 3 Menyanyi Hymne & Mars (Putri) (juri3.hmn.sd.pi@pramuka.id)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'juri3.hmn.sd.pi@pramuka.id') THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      '00000000-0000-4000-a000-000000000018'::uuid,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'juri3.hmn.sd.pi@pramuka.id',
      pwd_hash,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'nama_lengkap', 'Juri 3 Menyanyi Hymne & Mars (Putri)',
        'role', 'juri',
        'assigned_kategori', 'SD',
        'assigned_gender', 'Perempuan',
        'assigned_lomba_id', '400ee260-9d94-4327-b8f0-08790826bf69'
      ),
      now(),
      now()
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = pwd_hash,
        email_confirmed_at = COALESCE(email_confirmed_at, now())
    WHERE email = 'juri3.hmn.sd.pi@pramuka.id';
  END IF;

  -- Juri 19: Juri 1 Obat Tradisional & KIM (Putra) (juri1.kim.sd.pa@pramuka.id)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'juri1.kim.sd.pa@pramuka.id') THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      '00000000-0000-4000-a000-000000000019'::uuid,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'juri1.kim.sd.pa@pramuka.id',
      pwd_hash,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'nama_lengkap', 'Juri 1 Obat Tradisional & KIM (Putra)',
        'role', 'juri',
        'assigned_kategori', 'SD',
        'assigned_gender', 'Laki-laki',
        'assigned_lomba_id', '701c8117-12c6-4dbb-bd8a-1dc369f28ae3'
      ),
      now(),
      now()
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = pwd_hash,
        email_confirmed_at = COALESCE(email_confirmed_at, now())
    WHERE email = 'juri1.kim.sd.pa@pramuka.id';
  END IF;

  -- Juri 20: Juri 2 Obat Tradisional & KIM (Putra) (juri2.kim.sd.pa@pramuka.id)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'juri2.kim.sd.pa@pramuka.id') THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      '00000000-0000-4000-a000-000000000020'::uuid,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'juri2.kim.sd.pa@pramuka.id',
      pwd_hash,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'nama_lengkap', 'Juri 2 Obat Tradisional & KIM (Putra)',
        'role', 'juri',
        'assigned_kategori', 'SD',
        'assigned_gender', 'Laki-laki',
        'assigned_lomba_id', '701c8117-12c6-4dbb-bd8a-1dc369f28ae3'
      ),
      now(),
      now()
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = pwd_hash,
        email_confirmed_at = COALESCE(email_confirmed_at, now())
    WHERE email = 'juri2.kim.sd.pa@pramuka.id';
  END IF;

  -- Juri 21: Juri 3 Obat Tradisional & KIM (Putra) (juri3.kim.sd.pa@pramuka.id)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'juri3.kim.sd.pa@pramuka.id') THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      '00000000-0000-4000-a000-000000000021'::uuid,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'juri3.kim.sd.pa@pramuka.id',
      pwd_hash,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'nama_lengkap', 'Juri 3 Obat Tradisional & KIM (Putra)',
        'role', 'juri',
        'assigned_kategori', 'SD',
        'assigned_gender', 'Laki-laki',
        'assigned_lomba_id', '701c8117-12c6-4dbb-bd8a-1dc369f28ae3'
      ),
      now(),
      now()
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = pwd_hash,
        email_confirmed_at = COALESCE(email_confirmed_at, now())
    WHERE email = 'juri3.kim.sd.pa@pramuka.id';
  END IF;

  -- Juri 22: Juri 1 Obat Tradisional & KIM (Putri) (juri1.kim.sd.pi@pramuka.id)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'juri1.kim.sd.pi@pramuka.id') THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      '00000000-0000-4000-a000-000000000022'::uuid,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'juri1.kim.sd.pi@pramuka.id',
      pwd_hash,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'nama_lengkap', 'Juri 1 Obat Tradisional & KIM (Putri)',
        'role', 'juri',
        'assigned_kategori', 'SD',
        'assigned_gender', 'Perempuan',
        'assigned_lomba_id', '701c8117-12c6-4dbb-bd8a-1dc369f28ae3'
      ),
      now(),
      now()
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = pwd_hash,
        email_confirmed_at = COALESCE(email_confirmed_at, now())
    WHERE email = 'juri1.kim.sd.pi@pramuka.id';
  END IF;

  -- Juri 23: Juri 2 Obat Tradisional & KIM (Putri) (juri2.kim.sd.pi@pramuka.id)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'juri2.kim.sd.pi@pramuka.id') THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      '00000000-0000-4000-a000-000000000023'::uuid,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'juri2.kim.sd.pi@pramuka.id',
      pwd_hash,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'nama_lengkap', 'Juri 2 Obat Tradisional & KIM (Putri)',
        'role', 'juri',
        'assigned_kategori', 'SD',
        'assigned_gender', 'Perempuan',
        'assigned_lomba_id', '701c8117-12c6-4dbb-bd8a-1dc369f28ae3'
      ),
      now(),
      now()
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = pwd_hash,
        email_confirmed_at = COALESCE(email_confirmed_at, now())
    WHERE email = 'juri2.kim.sd.pi@pramuka.id';
  END IF;

  -- Juri 24: Juri 3 Obat Tradisional & KIM (Putri) (juri3.kim.sd.pi@pramuka.id)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'juri3.kim.sd.pi@pramuka.id') THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      '00000000-0000-4000-a000-000000000024'::uuid,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'juri3.kim.sd.pi@pramuka.id',
      pwd_hash,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'nama_lengkap', 'Juri 3 Obat Tradisional & KIM (Putri)',
        'role', 'juri',
        'assigned_kategori', 'SD',
        'assigned_gender', 'Perempuan',
        'assigned_lomba_id', '701c8117-12c6-4dbb-bd8a-1dc369f28ae3'
      ),
      now(),
      now()
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = pwd_hash,
        email_confirmed_at = COALESCE(email_confirmed_at, now())
    WHERE email = 'juri3.kim.sd.pi@pramuka.id';
  END IF;

  -- Juri 25: Juri 1 Karnaval (Putra) (juri1.krn.sd.pa@pramuka.id)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'juri1.krn.sd.pa@pramuka.id') THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      '00000000-0000-4000-a000-000000000025'::uuid,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'juri1.krn.sd.pa@pramuka.id',
      pwd_hash,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'nama_lengkap', 'Juri 1 Karnaval (Putra)',
        'role', 'juri',
        'assigned_kategori', 'SD',
        'assigned_gender', 'Laki-laki',
        'assigned_lomba_id', '442a5d29-1703-40a9-9480-216ae536406e'
      ),
      now(),
      now()
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = pwd_hash,
        email_confirmed_at = COALESCE(email_confirmed_at, now())
    WHERE email = 'juri1.krn.sd.pa@pramuka.id';
  END IF;

  -- Juri 26: Juri 2 Karnaval (Putra) (juri2.krn.sd.pa@pramuka.id)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'juri2.krn.sd.pa@pramuka.id') THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      '00000000-0000-4000-a000-000000000026'::uuid,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'juri2.krn.sd.pa@pramuka.id',
      pwd_hash,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'nama_lengkap', 'Juri 2 Karnaval (Putra)',
        'role', 'juri',
        'assigned_kategori', 'SD',
        'assigned_gender', 'Laki-laki',
        'assigned_lomba_id', '442a5d29-1703-40a9-9480-216ae536406e'
      ),
      now(),
      now()
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = pwd_hash,
        email_confirmed_at = COALESCE(email_confirmed_at, now())
    WHERE email = 'juri2.krn.sd.pa@pramuka.id';
  END IF;

  -- Juri 27: Juri 3 Karnaval (Putra) (juri3.krn.sd.pa@pramuka.id)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'juri3.krn.sd.pa@pramuka.id') THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      '00000000-0000-4000-a000-000000000027'::uuid,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'juri3.krn.sd.pa@pramuka.id',
      pwd_hash,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'nama_lengkap', 'Juri 3 Karnaval (Putra)',
        'role', 'juri',
        'assigned_kategori', 'SD',
        'assigned_gender', 'Laki-laki',
        'assigned_lomba_id', '442a5d29-1703-40a9-9480-216ae536406e'
      ),
      now(),
      now()
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = pwd_hash,
        email_confirmed_at = COALESCE(email_confirmed_at, now())
    WHERE email = 'juri3.krn.sd.pa@pramuka.id';
  END IF;

  -- Juri 28: Juri 1 Karnaval (Putri) (juri1.krn.sd.pi@pramuka.id)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'juri1.krn.sd.pi@pramuka.id') THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      '00000000-0000-4000-a000-000000000028'::uuid,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'juri1.krn.sd.pi@pramuka.id',
      pwd_hash,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'nama_lengkap', 'Juri 1 Karnaval (Putri)',
        'role', 'juri',
        'assigned_kategori', 'SD',
        'assigned_gender', 'Perempuan',
        'assigned_lomba_id', '442a5d29-1703-40a9-9480-216ae536406e'
      ),
      now(),
      now()
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = pwd_hash,
        email_confirmed_at = COALESCE(email_confirmed_at, now())
    WHERE email = 'juri1.krn.sd.pi@pramuka.id';
  END IF;

  -- Juri 29: Juri 2 Karnaval (Putri) (juri2.krn.sd.pi@pramuka.id)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'juri2.krn.sd.pi@pramuka.id') THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      '00000000-0000-4000-a000-000000000029'::uuid,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'juri2.krn.sd.pi@pramuka.id',
      pwd_hash,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'nama_lengkap', 'Juri 2 Karnaval (Putri)',
        'role', 'juri',
        'assigned_kategori', 'SD',
        'assigned_gender', 'Perempuan',
        'assigned_lomba_id', '442a5d29-1703-40a9-9480-216ae536406e'
      ),
      now(),
      now()
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = pwd_hash,
        email_confirmed_at = COALESCE(email_confirmed_at, now())
    WHERE email = 'juri2.krn.sd.pi@pramuka.id';
  END IF;

  -- Juri 30: Juri 3 Karnaval (Putri) (juri3.krn.sd.pi@pramuka.id)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'juri3.krn.sd.pi@pramuka.id') THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      '00000000-0000-4000-a000-000000000030'::uuid,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'juri3.krn.sd.pi@pramuka.id',
      pwd_hash,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'nama_lengkap', 'Juri 3 Karnaval (Putri)',
        'role', 'juri',
        'assigned_kategori', 'SD',
        'assigned_gender', 'Perempuan',
        'assigned_lomba_id', '442a5d29-1703-40a9-9480-216ae536406e'
      ),
      now(),
      now()
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = pwd_hash,
        email_confirmed_at = COALESCE(email_confirmed_at, now())
    WHERE email = 'juri3.krn.sd.pi@pramuka.id';
  END IF;

  -- Juri 31: Juri 1 Morse Pluit (Putra) (juri1.mrs.sd.pa@pramuka.id)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'juri1.mrs.sd.pa@pramuka.id') THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      '00000000-0000-4000-a000-000000000031'::uuid,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'juri1.mrs.sd.pa@pramuka.id',
      pwd_hash,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'nama_lengkap', 'Juri 1 Morse Pluit (Putra)',
        'role', 'juri',
        'assigned_kategori', 'SD',
        'assigned_gender', 'Laki-laki',
        'assigned_lomba_id', '80771c90-672d-4145-bc4f-29f57a3ebc57'
      ),
      now(),
      now()
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = pwd_hash,
        email_confirmed_at = COALESCE(email_confirmed_at, now())
    WHERE email = 'juri1.mrs.sd.pa@pramuka.id';
  END IF;

  -- Juri 32: Juri 2 Morse Pluit (Putra) (juri2.mrs.sd.pa@pramuka.id)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'juri2.mrs.sd.pa@pramuka.id') THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      '00000000-0000-4000-a000-000000000032'::uuid,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'juri2.mrs.sd.pa@pramuka.id',
      pwd_hash,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'nama_lengkap', 'Juri 2 Morse Pluit (Putra)',
        'role', 'juri',
        'assigned_kategori', 'SD',
        'assigned_gender', 'Laki-laki',
        'assigned_lomba_id', '80771c90-672d-4145-bc4f-29f57a3ebc57'
      ),
      now(),
      now()
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = pwd_hash,
        email_confirmed_at = COALESCE(email_confirmed_at, now())
    WHERE email = 'juri2.mrs.sd.pa@pramuka.id';
  END IF;

  -- Juri 33: Juri 3 Morse Pluit (Putra) (juri3.mrs.sd.pa@pramuka.id)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'juri3.mrs.sd.pa@pramuka.id') THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      '00000000-0000-4000-a000-000000000033'::uuid,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'juri3.mrs.sd.pa@pramuka.id',
      pwd_hash,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'nama_lengkap', 'Juri 3 Morse Pluit (Putra)',
        'role', 'juri',
        'assigned_kategori', 'SD',
        'assigned_gender', 'Laki-laki',
        'assigned_lomba_id', '80771c90-672d-4145-bc4f-29f57a3ebc57'
      ),
      now(),
      now()
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = pwd_hash,
        email_confirmed_at = COALESCE(email_confirmed_at, now())
    WHERE email = 'juri3.mrs.sd.pa@pramuka.id';
  END IF;

  -- Juri 34: Juri 1 Morse Pluit (Putri) (juri1.mrs.sd.pi@pramuka.id)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'juri1.mrs.sd.pi@pramuka.id') THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      '00000000-0000-4000-a000-000000000034'::uuid,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'juri1.mrs.sd.pi@pramuka.id',
      pwd_hash,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'nama_lengkap', 'Juri 1 Morse Pluit (Putri)',
        'role', 'juri',
        'assigned_kategori', 'SD',
        'assigned_gender', 'Perempuan',
        'assigned_lomba_id', '80771c90-672d-4145-bc4f-29f57a3ebc57'
      ),
      now(),
      now()
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = pwd_hash,
        email_confirmed_at = COALESCE(email_confirmed_at, now())
    WHERE email = 'juri1.mrs.sd.pi@pramuka.id';
  END IF;

  -- Juri 35: Juri 2 Morse Pluit (Putri) (juri2.mrs.sd.pi@pramuka.id)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'juri2.mrs.sd.pi@pramuka.id') THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      '00000000-0000-4000-a000-000000000035'::uuid,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'juri2.mrs.sd.pi@pramuka.id',
      pwd_hash,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'nama_lengkap', 'Juri 2 Morse Pluit (Putri)',
        'role', 'juri',
        'assigned_kategori', 'SD',
        'assigned_gender', 'Perempuan',
        'assigned_lomba_id', '80771c90-672d-4145-bc4f-29f57a3ebc57'
      ),
      now(),
      now()
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = pwd_hash,
        email_confirmed_at = COALESCE(email_confirmed_at, now())
    WHERE email = 'juri2.mrs.sd.pi@pramuka.id';
  END IF;

  -- Juri 36: Juri 3 Morse Pluit (Putri) (juri3.mrs.sd.pi@pramuka.id)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'juri3.mrs.sd.pi@pramuka.id') THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      '00000000-0000-4000-a000-000000000036'::uuid,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'juri3.mrs.sd.pi@pramuka.id',
      pwd_hash,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'nama_lengkap', 'Juri 3 Morse Pluit (Putri)',
        'role', 'juri',
        'assigned_kategori', 'SD',
        'assigned_gender', 'Perempuan',
        'assigned_lomba_id', '80771c90-672d-4145-bc4f-29f57a3ebc57'
      ),
      now(),
      now()
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = pwd_hash,
        email_confirmed_at = COALESCE(email_confirmed_at, now())
    WHERE email = 'juri3.mrs.sd.pi@pramuka.id';
  END IF;

  -- Juri 37: Juri 1 Masak Nusantara (Putra) (juri1.msk.sd.pa@pramuka.id)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'juri1.msk.sd.pa@pramuka.id') THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      '00000000-0000-4000-a000-000000000037'::uuid,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'juri1.msk.sd.pa@pramuka.id',
      pwd_hash,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'nama_lengkap', 'Juri 1 Masak Nusantara (Putra)',
        'role', 'juri',
        'assigned_kategori', 'SD',
        'assigned_gender', 'Laki-laki',
        'assigned_lomba_id', '336c78c2-4185-4179-9725-39285d46242e'
      ),
      now(),
      now()
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = pwd_hash,
        email_confirmed_at = COALESCE(email_confirmed_at, now())
    WHERE email = 'juri1.msk.sd.pa@pramuka.id';
  END IF;

  -- Juri 38: Juri 2 Masak Nusantara (Putra) (juri2.msk.sd.pa@pramuka.id)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'juri2.msk.sd.pa@pramuka.id') THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      '00000000-0000-4000-a000-000000000038'::uuid,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'juri2.msk.sd.pa@pramuka.id',
      pwd_hash,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'nama_lengkap', 'Juri 2 Masak Nusantara (Putra)',
        'role', 'juri',
        'assigned_kategori', 'SD',
        'assigned_gender', 'Laki-laki',
        'assigned_lomba_id', '336c78c2-4185-4179-9725-39285d46242e'
      ),
      now(),
      now()
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = pwd_hash,
        email_confirmed_at = COALESCE(email_confirmed_at, now())
    WHERE email = 'juri2.msk.sd.pa@pramuka.id';
  END IF;

  -- Juri 39: Juri 3 Masak Nusantara (Putra) (juri3.msk.sd.pa@pramuka.id)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'juri3.msk.sd.pa@pramuka.id') THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      '00000000-0000-4000-a000-000000000039'::uuid,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'juri3.msk.sd.pa@pramuka.id',
      pwd_hash,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'nama_lengkap', 'Juri 3 Masak Nusantara (Putra)',
        'role', 'juri',
        'assigned_kategori', 'SD',
        'assigned_gender', 'Laki-laki',
        'assigned_lomba_id', '336c78c2-4185-4179-9725-39285d46242e'
      ),
      now(),
      now()
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = pwd_hash,
        email_confirmed_at = COALESCE(email_confirmed_at, now())
    WHERE email = 'juri3.msk.sd.pa@pramuka.id';
  END IF;

  -- Juri 40: Juri 1 Masak Nusantara (Putri) (juri1.msk.sd.pi@pramuka.id)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'juri1.msk.sd.pi@pramuka.id') THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      '00000000-0000-4000-a000-000000000040'::uuid,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'juri1.msk.sd.pi@pramuka.id',
      pwd_hash,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'nama_lengkap', 'Juri 1 Masak Nusantara (Putri)',
        'role', 'juri',
        'assigned_kategori', 'SD',
        'assigned_gender', 'Perempuan',
        'assigned_lomba_id', '336c78c2-4185-4179-9725-39285d46242e'
      ),
      now(),
      now()
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = pwd_hash,
        email_confirmed_at = COALESCE(email_confirmed_at, now())
    WHERE email = 'juri1.msk.sd.pi@pramuka.id';
  END IF;

  -- Juri 41: Juri 2 Masak Nusantara (Putri) (juri2.msk.sd.pi@pramuka.id)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'juri2.msk.sd.pi@pramuka.id') THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      '00000000-0000-4000-a000-000000000041'::uuid,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'juri2.msk.sd.pi@pramuka.id',
      pwd_hash,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'nama_lengkap', 'Juri 2 Masak Nusantara (Putri)',
        'role', 'juri',
        'assigned_kategori', 'SD',
        'assigned_gender', 'Perempuan',
        'assigned_lomba_id', '336c78c2-4185-4179-9725-39285d46242e'
      ),
      now(),
      now()
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = pwd_hash,
        email_confirmed_at = COALESCE(email_confirmed_at, now())
    WHERE email = 'juri2.msk.sd.pi@pramuka.id';
  END IF;

  -- Juri 42: Juri 3 Masak Nusantara (Putri) (juri3.msk.sd.pi@pramuka.id)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'juri3.msk.sd.pi@pramuka.id') THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      '00000000-0000-4000-a000-000000000042'::uuid,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'juri3.msk.sd.pi@pramuka.id',
      pwd_hash,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'nama_lengkap', 'Juri 3 Masak Nusantara (Putri)',
        'role', 'juri',
        'assigned_kategori', 'SD',
        'assigned_gender', 'Perempuan',
        'assigned_lomba_id', '336c78c2-4185-4179-9725-39285d46242e'
      ),
      now(),
      now()
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = pwd_hash,
        email_confirmed_at = COALESCE(email_confirmed_at, now())
    WHERE email = 'juri3.msk.sd.pi@pramuka.id';
  END IF;

  -- Juri 43: Juri 1 Orienteering Navigasi (Putra) (juri1.nav.sd.pa@pramuka.id)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'juri1.nav.sd.pa@pramuka.id') THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      '00000000-0000-4000-a000-000000000043'::uuid,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'juri1.nav.sd.pa@pramuka.id',
      pwd_hash,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'nama_lengkap', 'Juri 1 Orienteering Navigasi (Putra)',
        'role', 'juri',
        'assigned_kategori', 'SD',
        'assigned_gender', 'Laki-laki',
        'assigned_lomba_id', 'a0c6d26a-633d-4444-9359-454ef6f23c90'
      ),
      now(),
      now()
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = pwd_hash,
        email_confirmed_at = COALESCE(email_confirmed_at, now())
    WHERE email = 'juri1.nav.sd.pa@pramuka.id';
  END IF;

  -- Juri 44: Juri 2 Orienteering Navigasi (Putra) (juri2.nav.sd.pa@pramuka.id)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'juri2.nav.sd.pa@pramuka.id') THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      '00000000-0000-4000-a000-000000000044'::uuid,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'juri2.nav.sd.pa@pramuka.id',
      pwd_hash,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'nama_lengkap', 'Juri 2 Orienteering Navigasi (Putra)',
        'role', 'juri',
        'assigned_kategori', 'SD',
        'assigned_gender', 'Laki-laki',
        'assigned_lomba_id', 'a0c6d26a-633d-4444-9359-454ef6f23c90'
      ),
      now(),
      now()
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = pwd_hash,
        email_confirmed_at = COALESCE(email_confirmed_at, now())
    WHERE email = 'juri2.nav.sd.pa@pramuka.id';
  END IF;

  -- Juri 45: Juri 3 Orienteering Navigasi (Putra) (juri3.nav.sd.pa@pramuka.id)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'juri3.nav.sd.pa@pramuka.id') THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      '00000000-0000-4000-a000-000000000045'::uuid,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'juri3.nav.sd.pa@pramuka.id',
      pwd_hash,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'nama_lengkap', 'Juri 3 Orienteering Navigasi (Putra)',
        'role', 'juri',
        'assigned_kategori', 'SD',
        'assigned_gender', 'Laki-laki',
        'assigned_lomba_id', 'a0c6d26a-633d-4444-9359-454ef6f23c90'
      ),
      now(),
      now()
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = pwd_hash,
        email_confirmed_at = COALESCE(email_confirmed_at, now())
    WHERE email = 'juri3.nav.sd.pa@pramuka.id';
  END IF;

  -- Juri 46: Juri 1 Orienteering Navigasi (Putri) (juri1.nav.sd.pi@pramuka.id)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'juri1.nav.sd.pi@pramuka.id') THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      '00000000-0000-4000-a000-000000000046'::uuid,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'juri1.nav.sd.pi@pramuka.id',
      pwd_hash,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'nama_lengkap', 'Juri 1 Orienteering Navigasi (Putri)',
        'role', 'juri',
        'assigned_kategori', 'SD',
        'assigned_gender', 'Perempuan',
        'assigned_lomba_id', 'a0c6d26a-633d-4444-9359-454ef6f23c90'
      ),
      now(),
      now()
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = pwd_hash,
        email_confirmed_at = COALESCE(email_confirmed_at, now())
    WHERE email = 'juri1.nav.sd.pi@pramuka.id';
  END IF;

  -- Juri 47: Juri 2 Orienteering Navigasi (Putri) (juri2.nav.sd.pi@pramuka.id)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'juri2.nav.sd.pi@pramuka.id') THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      '00000000-0000-4000-a000-000000000047'::uuid,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'juri2.nav.sd.pi@pramuka.id',
      pwd_hash,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'nama_lengkap', 'Juri 2 Orienteering Navigasi (Putri)',
        'role', 'juri',
        'assigned_kategori', 'SD',
        'assigned_gender', 'Perempuan',
        'assigned_lomba_id', 'a0c6d26a-633d-4444-9359-454ef6f23c90'
      ),
      now(),
      now()
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = pwd_hash,
        email_confirmed_at = COALESCE(email_confirmed_at, now())
    WHERE email = 'juri2.nav.sd.pi@pramuka.id';
  END IF;

  -- Juri 48: Juri 3 Orienteering Navigasi (Putri) (juri3.nav.sd.pi@pramuka.id)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'juri3.nav.sd.pi@pramuka.id') THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      '00000000-0000-4000-a000-000000000048'::uuid,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'juri3.nav.sd.pi@pramuka.id',
      pwd_hash,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'nama_lengkap', 'Juri 3 Orienteering Navigasi (Putri)',
        'role', 'juri',
        'assigned_kategori', 'SD',
        'assigned_gender', 'Perempuan',
        'assigned_lomba_id', 'a0c6d26a-633d-4444-9359-454ef6f23c90'
      ),
      now(),
      now()
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = pwd_hash,
        email_confirmed_at = COALESCE(email_confirmed_at, now())
    WHERE email = 'juri3.nav.sd.pi@pramuka.id';
  END IF;

  -- Juri 49: Juri 1 Packing Perlengkapan (Putra) (juri1.pck.sd.pa@pramuka.id)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'juri1.pck.sd.pa@pramuka.id') THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      '00000000-0000-4000-a000-000000000049'::uuid,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'juri1.pck.sd.pa@pramuka.id',
      pwd_hash,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'nama_lengkap', 'Juri 1 Packing Perlengkapan (Putra)',
        'role', 'juri',
        'assigned_kategori', 'SD',
        'assigned_gender', 'Laki-laki',
        'assigned_lomba_id', 'b4318236-e4e3-4799-b408-188000482d0c'
      ),
      now(),
      now()
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = pwd_hash,
        email_confirmed_at = COALESCE(email_confirmed_at, now())
    WHERE email = 'juri1.pck.sd.pa@pramuka.id';
  END IF;

  -- Juri 50: Juri 2 Packing Perlengkapan (Putra) (juri2.pck.sd.pa@pramuka.id)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'juri2.pck.sd.pa@pramuka.id') THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      '00000000-0000-4000-a000-000000000050'::uuid,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'juri2.pck.sd.pa@pramuka.id',
      pwd_hash,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'nama_lengkap', 'Juri 2 Packing Perlengkapan (Putra)',
        'role', 'juri',
        'assigned_kategori', 'SD',
        'assigned_gender', 'Laki-laki',
        'assigned_lomba_id', 'b4318236-e4e3-4799-b408-188000482d0c'
      ),
      now(),
      now()
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = pwd_hash,
        email_confirmed_at = COALESCE(email_confirmed_at, now())
    WHERE email = 'juri2.pck.sd.pa@pramuka.id';
  END IF;

  -- Juri 51: Juri 3 Packing Perlengkapan (Putra) (juri3.pck.sd.pa@pramuka.id)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'juri3.pck.sd.pa@pramuka.id') THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      '00000000-0000-4000-a000-000000000051'::uuid,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'juri3.pck.sd.pa@pramuka.id',
      pwd_hash,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'nama_lengkap', 'Juri 3 Packing Perlengkapan (Putra)',
        'role', 'juri',
        'assigned_kategori', 'SD',
        'assigned_gender', 'Laki-laki',
        'assigned_lomba_id', 'b4318236-e4e3-4799-b408-188000482d0c'
      ),
      now(),
      now()
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = pwd_hash,
        email_confirmed_at = COALESCE(email_confirmed_at, now())
    WHERE email = 'juri3.pck.sd.pa@pramuka.id';
  END IF;

  -- Juri 52: Juri 1 Packing Perlengkapan (Putri) (juri1.pck.sd.pi@pramuka.id)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'juri1.pck.sd.pi@pramuka.id') THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      '00000000-0000-4000-a000-000000000052'::uuid,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'juri1.pck.sd.pi@pramuka.id',
      pwd_hash,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'nama_lengkap', 'Juri 1 Packing Perlengkapan (Putri)',
        'role', 'juri',
        'assigned_kategori', 'SD',
        'assigned_gender', 'Perempuan',
        'assigned_lomba_id', 'b4318236-e4e3-4799-b408-188000482d0c'
      ),
      now(),
      now()
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = pwd_hash,
        email_confirmed_at = COALESCE(email_confirmed_at, now())
    WHERE email = 'juri1.pck.sd.pi@pramuka.id';
  END IF;

  -- Juri 53: Juri 2 Packing Perlengkapan (Putri) (juri2.pck.sd.pi@pramuka.id)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'juri2.pck.sd.pi@pramuka.id') THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      '00000000-0000-4000-a000-000000000053'::uuid,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'juri2.pck.sd.pi@pramuka.id',
      pwd_hash,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'nama_lengkap', 'Juri 2 Packing Perlengkapan (Putri)',
        'role', 'juri',
        'assigned_kategori', 'SD',
        'assigned_gender', 'Perempuan',
        'assigned_lomba_id', 'b4318236-e4e3-4799-b408-188000482d0c'
      ),
      now(),
      now()
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = pwd_hash,
        email_confirmed_at = COALESCE(email_confirmed_at, now())
    WHERE email = 'juri2.pck.sd.pi@pramuka.id';
  END IF;

  -- Juri 54: Juri 3 Packing Perlengkapan (Putri) (juri3.pck.sd.pi@pramuka.id)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'juri3.pck.sd.pi@pramuka.id') THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      '00000000-0000-4000-a000-000000000054'::uuid,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'juri3.pck.sd.pi@pramuka.id',
      pwd_hash,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'nama_lengkap', 'Juri 3 Packing Perlengkapan (Putri)',
        'role', 'juri',
        'assigned_kategori', 'SD',
        'assigned_gender', 'Perempuan',
        'assigned_lomba_id', 'b4318236-e4e3-4799-b408-188000482d0c'
      ),
      now(),
      now()
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = pwd_hash,
        email_confirmed_at = COALESCE(email_confirmed_at, now())
    WHERE email = 'juri3.pck.sd.pi@pramuka.id';
  END IF;

  -- Juri 55: Juri 1 PPPK / PPGD (Putra) (juri1.pgd.sd.pa@pramuka.id)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'juri1.pgd.sd.pa@pramuka.id') THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      '00000000-0000-4000-a000-000000000055'::uuid,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'juri1.pgd.sd.pa@pramuka.id',
      pwd_hash,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'nama_lengkap', 'Juri 1 PPPK / PPGD (Putra)',
        'role', 'juri',
        'assigned_kategori', 'SD',
        'assigned_gender', 'Laki-laki',
        'assigned_lomba_id', 'e0d60070-1be2-4184-a367-efb663211a7c'
      ),
      now(),
      now()
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = pwd_hash,
        email_confirmed_at = COALESCE(email_confirmed_at, now())
    WHERE email = 'juri1.pgd.sd.pa@pramuka.id';
  END IF;

  -- Juri 56: Juri 2 PPPK / PPGD (Putra) (juri2.pgd.sd.pa@pramuka.id)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'juri2.pgd.sd.pa@pramuka.id') THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      '00000000-0000-4000-a000-000000000056'::uuid,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'juri2.pgd.sd.pa@pramuka.id',
      pwd_hash,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'nama_lengkap', 'Juri 2 PPPK / PPGD (Putra)',
        'role', 'juri',
        'assigned_kategori', 'SD',
        'assigned_gender', 'Laki-laki',
        'assigned_lomba_id', 'e0d60070-1be2-4184-a367-efb663211a7c'
      ),
      now(),
      now()
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = pwd_hash,
        email_confirmed_at = COALESCE(email_confirmed_at, now())
    WHERE email = 'juri2.pgd.sd.pa@pramuka.id';
  END IF;

  -- Juri 57: Juri 3 PPPK / PPGD (Putra) (juri3.pgd.sd.pa@pramuka.id)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'juri3.pgd.sd.pa@pramuka.id') THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      '00000000-0000-4000-a000-000000000057'::uuid,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'juri3.pgd.sd.pa@pramuka.id',
      pwd_hash,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'nama_lengkap', 'Juri 3 PPPK / PPGD (Putra)',
        'role', 'juri',
        'assigned_kategori', 'SD',
        'assigned_gender', 'Laki-laki',
        'assigned_lomba_id', 'e0d60070-1be2-4184-a367-efb663211a7c'
      ),
      now(),
      now()
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = pwd_hash,
        email_confirmed_at = COALESCE(email_confirmed_at, now())
    WHERE email = 'juri3.pgd.sd.pa@pramuka.id';
  END IF;

  -- Juri 58: Juri 1 PPPK / PPGD (Putri) (juri1.pgd.sd.pi@pramuka.id)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'juri1.pgd.sd.pi@pramuka.id') THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      '00000000-0000-4000-a000-000000000058'::uuid,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'juri1.pgd.sd.pi@pramuka.id',
      pwd_hash,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'nama_lengkap', 'Juri 1 PPPK / PPGD (Putri)',
        'role', 'juri',
        'assigned_kategori', 'SD',
        'assigned_gender', 'Perempuan',
        'assigned_lomba_id', 'e0d60070-1be2-4184-a367-efb663211a7c'
      ),
      now(),
      now()
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = pwd_hash,
        email_confirmed_at = COALESCE(email_confirmed_at, now())
    WHERE email = 'juri1.pgd.sd.pi@pramuka.id';
  END IF;

  -- Juri 59: Juri 2 PPPK / PPGD (Putri) (juri2.pgd.sd.pi@pramuka.id)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'juri2.pgd.sd.pi@pramuka.id') THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      '00000000-0000-4000-a000-000000000059'::uuid,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'juri2.pgd.sd.pi@pramuka.id',
      pwd_hash,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'nama_lengkap', 'Juri 2 PPPK / PPGD (Putri)',
        'role', 'juri',
        'assigned_kategori', 'SD',
        'assigned_gender', 'Perempuan',
        'assigned_lomba_id', 'e0d60070-1be2-4184-a367-efb663211a7c'
      ),
      now(),
      now()
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = pwd_hash,
        email_confirmed_at = COALESCE(email_confirmed_at, now())
    WHERE email = 'juri2.pgd.sd.pi@pramuka.id';
  END IF;

  -- Juri 60: Juri 3 PPPK / PPGD (Putri) (juri3.pgd.sd.pi@pramuka.id)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'juri3.pgd.sd.pi@pramuka.id') THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      '00000000-0000-4000-a000-000000000060'::uuid,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'juri3.pgd.sd.pi@pramuka.id',
      pwd_hash,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'nama_lengkap', 'Juri 3 PPPK / PPGD (Putri)',
        'role', 'juri',
        'assigned_kategori', 'SD',
        'assigned_gender', 'Perempuan',
        'assigned_lomba_id', 'e0d60070-1be2-4184-a367-efb663211a7c'
      ),
      now(),
      now()
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = pwd_hash,
        email_confirmed_at = COALESCE(email_confirmed_at, now())
    WHERE email = 'juri3.pgd.sd.pi@pramuka.id';
  END IF;

  -- Juri 61: Juri 1 Pionering (Putra) (juri1.pnr.sd.pa@pramuka.id)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'juri1.pnr.sd.pa@pramuka.id') THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      '00000000-0000-4000-a000-000000000061'::uuid,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'juri1.pnr.sd.pa@pramuka.id',
      pwd_hash,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'nama_lengkap', 'Juri 1 Pionering (Putra)',
        'role', 'juri',
        'assigned_kategori', 'SD',
        'assigned_gender', 'Laki-laki',
        'assigned_lomba_id', '16c6eb28-b2c4-4582-a05f-fb9bf0846211'
      ),
      now(),
      now()
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = pwd_hash,
        email_confirmed_at = COALESCE(email_confirmed_at, now())
    WHERE email = 'juri1.pnr.sd.pa@pramuka.id';
  END IF;

  -- Juri 62: Juri 2 Pionering (Putra) (juri2.pnr.sd.pa@pramuka.id)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'juri2.pnr.sd.pa@pramuka.id') THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      '00000000-0000-4000-a000-000000000062'::uuid,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'juri2.pnr.sd.pa@pramuka.id',
      pwd_hash,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'nama_lengkap', 'Juri 2 Pionering (Putra)',
        'role', 'juri',
        'assigned_kategori', 'SD',
        'assigned_gender', 'Laki-laki',
        'assigned_lomba_id', '16c6eb28-b2c4-4582-a05f-fb9bf0846211'
      ),
      now(),
      now()
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = pwd_hash,
        email_confirmed_at = COALESCE(email_confirmed_at, now())
    WHERE email = 'juri2.pnr.sd.pa@pramuka.id';
  END IF;

  -- Juri 63: Juri 3 Pionering (Putra) (juri3.pnr.sd.pa@pramuka.id)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'juri3.pnr.sd.pa@pramuka.id') THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      '00000000-0000-4000-a000-000000000063'::uuid,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'juri3.pnr.sd.pa@pramuka.id',
      pwd_hash,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'nama_lengkap', 'Juri 3 Pionering (Putra)',
        'role', 'juri',
        'assigned_kategori', 'SD',
        'assigned_gender', 'Laki-laki',
        'assigned_lomba_id', '16c6eb28-b2c4-4582-a05f-fb9bf0846211'
      ),
      now(),
      now()
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = pwd_hash,
        email_confirmed_at = COALESCE(email_confirmed_at, now())
    WHERE email = 'juri3.pnr.sd.pa@pramuka.id';
  END IF;

  -- Juri 64: Juri 1 Pionering (Putri) (juri1.pnr.sd.pi@pramuka.id)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'juri1.pnr.sd.pi@pramuka.id') THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      '00000000-0000-4000-a000-000000000064'::uuid,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'juri1.pnr.sd.pi@pramuka.id',
      pwd_hash,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'nama_lengkap', 'Juri 1 Pionering (Putri)',
        'role', 'juri',
        'assigned_kategori', 'SD',
        'assigned_gender', 'Perempuan',
        'assigned_lomba_id', '16c6eb28-b2c4-4582-a05f-fb9bf0846211'
      ),
      now(),
      now()
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = pwd_hash,
        email_confirmed_at = COALESCE(email_confirmed_at, now())
    WHERE email = 'juri1.pnr.sd.pi@pramuka.id';
  END IF;

  -- Juri 65: Juri 2 Pionering (Putri) (juri2.pnr.sd.pi@pramuka.id)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'juri2.pnr.sd.pi@pramuka.id') THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      '00000000-0000-4000-a000-000000000065'::uuid,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'juri2.pnr.sd.pi@pramuka.id',
      pwd_hash,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'nama_lengkap', 'Juri 2 Pionering (Putri)',
        'role', 'juri',
        'assigned_kategori', 'SD',
        'assigned_gender', 'Perempuan',
        'assigned_lomba_id', '16c6eb28-b2c4-4582-a05f-fb9bf0846211'
      ),
      now(),
      now()
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = pwd_hash,
        email_confirmed_at = COALESCE(email_confirmed_at, now())
    WHERE email = 'juri2.pnr.sd.pi@pramuka.id';
  END IF;

  -- Juri 66: Juri 3 Pionering (Putri) (juri3.pnr.sd.pi@pramuka.id)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'juri3.pnr.sd.pi@pramuka.id') THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      '00000000-0000-4000-a000-000000000066'::uuid,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'juri3.pnr.sd.pi@pramuka.id',
      pwd_hash,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'nama_lengkap', 'Juri 3 Pionering (Putri)',
        'role', 'juri',
        'assigned_kategori', 'SD',
        'assigned_gender', 'Perempuan',
        'assigned_lomba_id', '16c6eb28-b2c4-4582-a05f-fb9bf0846211'
      ),
      now(),
      now()
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = pwd_hash,
        email_confirmed_at = COALESCE(email_confirmed_at, now())
    WHERE email = 'juri3.pnr.sd.pi@pramuka.id';
  END IF;

  -- Juri 67: Juri 1 Semaphore (Putra) (juri1.smp.sd.pa@pramuka.id)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'juri1.smp.sd.pa@pramuka.id') THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      '00000000-0000-4000-a000-000000000067'::uuid,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'juri1.smp.sd.pa@pramuka.id',
      pwd_hash,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'nama_lengkap', 'Juri 1 Semaphore (Putra)',
        'role', 'juri',
        'assigned_kategori', 'SD',
        'assigned_gender', 'Laki-laki',
        'assigned_lomba_id', '9fa44cf1-e3b0-4ac6-a6ac-3610c820d442'
      ),
      now(),
      now()
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = pwd_hash,
        email_confirmed_at = COALESCE(email_confirmed_at, now())
    WHERE email = 'juri1.smp.sd.pa@pramuka.id';
  END IF;

  -- Juri 68: Juri 2 Semaphore (Putra) (juri2.smp.sd.pa@pramuka.id)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'juri2.smp.sd.pa@pramuka.id') THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      '00000000-0000-4000-a000-000000000068'::uuid,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'juri2.smp.sd.pa@pramuka.id',
      pwd_hash,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'nama_lengkap', 'Juri 2 Semaphore (Putra)',
        'role', 'juri',
        'assigned_kategori', 'SD',
        'assigned_gender', 'Laki-laki',
        'assigned_lomba_id', '9fa44cf1-e3b0-4ac6-a6ac-3610c820d442'
      ),
      now(),
      now()
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = pwd_hash,
        email_confirmed_at = COALESCE(email_confirmed_at, now())
    WHERE email = 'juri2.smp.sd.pa@pramuka.id';
  END IF;

  -- Juri 69: Juri 3 Semaphore (Putra) (juri3.smp.sd.pa@pramuka.id)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'juri3.smp.sd.pa@pramuka.id') THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      '00000000-0000-4000-a000-000000000069'::uuid,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'juri3.smp.sd.pa@pramuka.id',
      pwd_hash,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'nama_lengkap', 'Juri 3 Semaphore (Putra)',
        'role', 'juri',
        'assigned_kategori', 'SD',
        'assigned_gender', 'Laki-laki',
        'assigned_lomba_id', '9fa44cf1-e3b0-4ac6-a6ac-3610c820d442'
      ),
      now(),
      now()
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = pwd_hash,
        email_confirmed_at = COALESCE(email_confirmed_at, now())
    WHERE email = 'juri3.smp.sd.pa@pramuka.id';
  END IF;

  -- Juri 70: Juri 1 Semaphore (Putri) (juri1.smp.sd.pi@pramuka.id)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'juri1.smp.sd.pi@pramuka.id') THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      '00000000-0000-4000-a000-000000000070'::uuid,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'juri1.smp.sd.pi@pramuka.id',
      pwd_hash,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'nama_lengkap', 'Juri 1 Semaphore (Putri)',
        'role', 'juri',
        'assigned_kategori', 'SD',
        'assigned_gender', 'Perempuan',
        'assigned_lomba_id', '9fa44cf1-e3b0-4ac6-a6ac-3610c820d442'
      ),
      now(),
      now()
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = pwd_hash,
        email_confirmed_at = COALESCE(email_confirmed_at, now())
    WHERE email = 'juri1.smp.sd.pi@pramuka.id';
  END IF;

  -- Juri 71: Juri 2 Semaphore (Putri) (juri2.smp.sd.pi@pramuka.id)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'juri2.smp.sd.pi@pramuka.id') THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      '00000000-0000-4000-a000-000000000071'::uuid,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'juri2.smp.sd.pi@pramuka.id',
      pwd_hash,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'nama_lengkap', 'Juri 2 Semaphore (Putri)',
        'role', 'juri',
        'assigned_kategori', 'SD',
        'assigned_gender', 'Perempuan',
        'assigned_lomba_id', '9fa44cf1-e3b0-4ac6-a6ac-3610c820d442'
      ),
      now(),
      now()
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = pwd_hash,
        email_confirmed_at = COALESCE(email_confirmed_at, now())
    WHERE email = 'juri2.smp.sd.pi@pramuka.id';
  END IF;

  -- Juri 72: Juri 3 Semaphore (Putri) (juri3.smp.sd.pi@pramuka.id)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'juri3.smp.sd.pi@pramuka.id') THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      '00000000-0000-4000-a000-000000000072'::uuid,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'juri3.smp.sd.pi@pramuka.id',
      pwd_hash,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'nama_lengkap', 'Juri 3 Semaphore (Putri)',
        'role', 'juri',
        'assigned_kategori', 'SD',
        'assigned_gender', 'Perempuan',
        'assigned_lomba_id', '9fa44cf1-e3b0-4ac6-a6ac-3610c820d442'
      ),
      now(),
      now()
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = pwd_hash,
        email_confirmed_at = COALESCE(email_confirmed_at, now())
    WHERE email = 'juri3.smp.sd.pi@pramuka.id';
  END IF;

  -- Juri 73: Juri 1 Sandi-Sandi (Putra) (juri1.snd.sd.pa@pramuka.id)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'juri1.snd.sd.pa@pramuka.id') THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      '00000000-0000-4000-a000-000000000073'::uuid,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'juri1.snd.sd.pa@pramuka.id',
      pwd_hash,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'nama_lengkap', 'Juri 1 Sandi-Sandi (Putra)',
        'role', 'juri',
        'assigned_kategori', 'SD',
        'assigned_gender', 'Laki-laki',
        'assigned_lomba_id', '60bafddb-7337-4eeb-910e-1fc458801142'
      ),
      now(),
      now()
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = pwd_hash,
        email_confirmed_at = COALESCE(email_confirmed_at, now())
    WHERE email = 'juri1.snd.sd.pa@pramuka.id';
  END IF;

  -- Juri 74: Juri 2 Sandi-Sandi (Putra) (juri2.snd.sd.pa@pramuka.id)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'juri2.snd.sd.pa@pramuka.id') THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      '00000000-0000-4000-a000-000000000074'::uuid,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'juri2.snd.sd.pa@pramuka.id',
      pwd_hash,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'nama_lengkap', 'Juri 2 Sandi-Sandi (Putra)',
        'role', 'juri',
        'assigned_kategori', 'SD',
        'assigned_gender', 'Laki-laki',
        'assigned_lomba_id', '60bafddb-7337-4eeb-910e-1fc458801142'
      ),
      now(),
      now()
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = pwd_hash,
        email_confirmed_at = COALESCE(email_confirmed_at, now())
    WHERE email = 'juri2.snd.sd.pa@pramuka.id';
  END IF;

  -- Juri 75: Juri 3 Sandi-Sandi (Putra) (juri3.snd.sd.pa@pramuka.id)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'juri3.snd.sd.pa@pramuka.id') THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      '00000000-0000-4000-a000-000000000075'::uuid,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'juri3.snd.sd.pa@pramuka.id',
      pwd_hash,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'nama_lengkap', 'Juri 3 Sandi-Sandi (Putra)',
        'role', 'juri',
        'assigned_kategori', 'SD',
        'assigned_gender', 'Laki-laki',
        'assigned_lomba_id', '60bafddb-7337-4eeb-910e-1fc458801142'
      ),
      now(),
      now()
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = pwd_hash,
        email_confirmed_at = COALESCE(email_confirmed_at, now())
    WHERE email = 'juri3.snd.sd.pa@pramuka.id';
  END IF;

  -- Juri 76: Juri 1 Sandi-Sandi (Putri) (juri1.snd.sd.pi@pramuka.id)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'juri1.snd.sd.pi@pramuka.id') THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      '00000000-0000-4000-a000-000000000076'::uuid,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'juri1.snd.sd.pi@pramuka.id',
      pwd_hash,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'nama_lengkap', 'Juri 1 Sandi-Sandi (Putri)',
        'role', 'juri',
        'assigned_kategori', 'SD',
        'assigned_gender', 'Perempuan',
        'assigned_lomba_id', '60bafddb-7337-4eeb-910e-1fc458801142'
      ),
      now(),
      now()
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = pwd_hash,
        email_confirmed_at = COALESCE(email_confirmed_at, now())
    WHERE email = 'juri1.snd.sd.pi@pramuka.id';
  END IF;

  -- Juri 77: Juri 2 Sandi-Sandi (Putri) (juri2.snd.sd.pi@pramuka.id)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'juri2.snd.sd.pi@pramuka.id') THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      '00000000-0000-4000-a000-000000000077'::uuid,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'juri2.snd.sd.pi@pramuka.id',
      pwd_hash,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'nama_lengkap', 'Juri 2 Sandi-Sandi (Putri)',
        'role', 'juri',
        'assigned_kategori', 'SD',
        'assigned_gender', 'Perempuan',
        'assigned_lomba_id', '60bafddb-7337-4eeb-910e-1fc458801142'
      ),
      now(),
      now()
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = pwd_hash,
        email_confirmed_at = COALESCE(email_confirmed_at, now())
    WHERE email = 'juri2.snd.sd.pi@pramuka.id';
  END IF;

  -- Juri 78: Juri 3 Sandi-Sandi (Putri) (juri3.snd.sd.pi@pramuka.id)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'juri3.snd.sd.pi@pramuka.id') THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      '00000000-0000-4000-a000-000000000078'::uuid,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'juri3.snd.sd.pi@pramuka.id',
      pwd_hash,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'nama_lengkap', 'Juri 3 Sandi-Sandi (Putri)',
        'role', 'juri',
        'assigned_kategori', 'SD',
        'assigned_gender', 'Perempuan',
        'assigned_lomba_id', '60bafddb-7337-4eeb-910e-1fc458801142'
      ),
      now(),
      now()
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = pwd_hash,
        email_confirmed_at = COALESCE(email_confirmed_at, now())
    WHERE email = 'juri3.snd.sd.pi@pramuka.id';
  END IF;

  -- Juri 79: Juri 1 Menaksir (Putra) (juri1.tks.sd.pa@pramuka.id)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'juri1.tks.sd.pa@pramuka.id') THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      '00000000-0000-4000-a000-000000000079'::uuid,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'juri1.tks.sd.pa@pramuka.id',
      pwd_hash,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'nama_lengkap', 'Juri 1 Menaksir (Putra)',
        'role', 'juri',
        'assigned_kategori', 'SD',
        'assigned_gender', 'Laki-laki',
        'assigned_lomba_id', '6d435369-e9b5-4a12-a8bf-7d44b7093ecf'
      ),
      now(),
      now()
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = pwd_hash,
        email_confirmed_at = COALESCE(email_confirmed_at, now())
    WHERE email = 'juri1.tks.sd.pa@pramuka.id';
  END IF;

  -- Juri 80: Juri 2 Menaksir (Putra) (juri2.tks.sd.pa@pramuka.id)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'juri2.tks.sd.pa@pramuka.id') THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      '00000000-0000-4000-a000-000000000080'::uuid,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'juri2.tks.sd.pa@pramuka.id',
      pwd_hash,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'nama_lengkap', 'Juri 2 Menaksir (Putra)',
        'role', 'juri',
        'assigned_kategori', 'SD',
        'assigned_gender', 'Laki-laki',
        'assigned_lomba_id', '6d435369-e9b5-4a12-a8bf-7d44b7093ecf'
      ),
      now(),
      now()
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = pwd_hash,
        email_confirmed_at = COALESCE(email_confirmed_at, now())
    WHERE email = 'juri2.tks.sd.pa@pramuka.id';
  END IF;

  -- Juri 81: Juri 3 Menaksir (Putra) (juri3.tks.sd.pa@pramuka.id)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'juri3.tks.sd.pa@pramuka.id') THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      '00000000-0000-4000-a000-000000000081'::uuid,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'juri3.tks.sd.pa@pramuka.id',
      pwd_hash,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'nama_lengkap', 'Juri 3 Menaksir (Putra)',
        'role', 'juri',
        'assigned_kategori', 'SD',
        'assigned_gender', 'Laki-laki',
        'assigned_lomba_id', '6d435369-e9b5-4a12-a8bf-7d44b7093ecf'
      ),
      now(),
      now()
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = pwd_hash,
        email_confirmed_at = COALESCE(email_confirmed_at, now())
    WHERE email = 'juri3.tks.sd.pa@pramuka.id';
  END IF;

  -- Juri 82: Juri 1 Menaksir (Putri) (juri1.tks.sd.pi@pramuka.id)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'juri1.tks.sd.pi@pramuka.id') THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      '00000000-0000-4000-a000-000000000082'::uuid,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'juri1.tks.sd.pi@pramuka.id',
      pwd_hash,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'nama_lengkap', 'Juri 1 Menaksir (Putri)',
        'role', 'juri',
        'assigned_kategori', 'SD',
        'assigned_gender', 'Perempuan',
        'assigned_lomba_id', '6d435369-e9b5-4a12-a8bf-7d44b7093ecf'
      ),
      now(),
      now()
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = pwd_hash,
        email_confirmed_at = COALESCE(email_confirmed_at, now())
    WHERE email = 'juri1.tks.sd.pi@pramuka.id';
  END IF;

  -- Juri 83: Juri 2 Menaksir (Putri) (juri2.tks.sd.pi@pramuka.id)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'juri2.tks.sd.pi@pramuka.id') THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      '00000000-0000-4000-a000-000000000083'::uuid,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'juri2.tks.sd.pi@pramuka.id',
      pwd_hash,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'nama_lengkap', 'Juri 2 Menaksir (Putri)',
        'role', 'juri',
        'assigned_kategori', 'SD',
        'assigned_gender', 'Perempuan',
        'assigned_lomba_id', '6d435369-e9b5-4a12-a8bf-7d44b7093ecf'
      ),
      now(),
      now()
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = pwd_hash,
        email_confirmed_at = COALESCE(email_confirmed_at, now())
    WHERE email = 'juri2.tks.sd.pi@pramuka.id';
  END IF;

  -- Juri 84: Juri 3 Menaksir (Putri) (juri3.tks.sd.pi@pramuka.id)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'juri3.tks.sd.pi@pramuka.id') THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      '00000000-0000-4000-a000-000000000084'::uuid,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'juri3.tks.sd.pi@pramuka.id',
      pwd_hash,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'nama_lengkap', 'Juri 3 Menaksir (Putri)',
        'role', 'juri',
        'assigned_kategori', 'SD',
        'assigned_gender', 'Perempuan',
        'assigned_lomba_id', '6d435369-e9b5-4a12-a8bf-7d44b7093ecf'
      ),
      now(),
      now()
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = pwd_hash,
        email_confirmed_at = COALESCE(email_confirmed_at, now())
    WHERE email = 'juri3.tks.sd.pi@pramuka.id';
  END IF;

  -- Juri 85: Juri 1 Pentas Seni Budaya (Putra) (juri1.tsb.sd.pa@pramuka.id)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'juri1.tsb.sd.pa@pramuka.id') THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      '00000000-0000-4000-a000-000000000085'::uuid,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'juri1.tsb.sd.pa@pramuka.id',
      pwd_hash,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'nama_lengkap', 'Juri 1 Pentas Seni Budaya (Putra)',
        'role', 'juri',
        'assigned_kategori', 'SD',
        'assigned_gender', 'Laki-laki',
        'assigned_lomba_id', 'e605e267-fcc5-4d3b-9899-43a57699d125'
      ),
      now(),
      now()
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = pwd_hash,
        email_confirmed_at = COALESCE(email_confirmed_at, now())
    WHERE email = 'juri1.tsb.sd.pa@pramuka.id';
  END IF;

  -- Juri 86: Juri 2 Pentas Seni Budaya (Putra) (juri2.tsb.sd.pa@pramuka.id)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'juri2.tsb.sd.pa@pramuka.id') THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      '00000000-0000-4000-a000-000000000086'::uuid,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'juri2.tsb.sd.pa@pramuka.id',
      pwd_hash,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'nama_lengkap', 'Juri 2 Pentas Seni Budaya (Putra)',
        'role', 'juri',
        'assigned_kategori', 'SD',
        'assigned_gender', 'Laki-laki',
        'assigned_lomba_id', 'e605e267-fcc5-4d3b-9899-43a57699d125'
      ),
      now(),
      now()
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = pwd_hash,
        email_confirmed_at = COALESCE(email_confirmed_at, now())
    WHERE email = 'juri2.tsb.sd.pa@pramuka.id';
  END IF;

  -- Juri 87: Juri 3 Pentas Seni Budaya (Putra) (juri3.tsb.sd.pa@pramuka.id)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'juri3.tsb.sd.pa@pramuka.id') THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      '00000000-0000-4000-a000-000000000087'::uuid,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'juri3.tsb.sd.pa@pramuka.id',
      pwd_hash,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'nama_lengkap', 'Juri 3 Pentas Seni Budaya (Putra)',
        'role', 'juri',
        'assigned_kategori', 'SD',
        'assigned_gender', 'Laki-laki',
        'assigned_lomba_id', 'e605e267-fcc5-4d3b-9899-43a57699d125'
      ),
      now(),
      now()
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = pwd_hash,
        email_confirmed_at = COALESCE(email_confirmed_at, now())
    WHERE email = 'juri3.tsb.sd.pa@pramuka.id';
  END IF;

  -- Juri 88: Juri 1 Pentas Seni Budaya (Putri) (juri1.tsb.sd.pi@pramuka.id)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'juri1.tsb.sd.pi@pramuka.id') THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      '00000000-0000-4000-a000-000000000088'::uuid,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'juri1.tsb.sd.pi@pramuka.id',
      pwd_hash,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'nama_lengkap', 'Juri 1 Pentas Seni Budaya (Putri)',
        'role', 'juri',
        'assigned_kategori', 'SD',
        'assigned_gender', 'Perempuan',
        'assigned_lomba_id', 'e605e267-fcc5-4d3b-9899-43a57699d125'
      ),
      now(),
      now()
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = pwd_hash,
        email_confirmed_at = COALESCE(email_confirmed_at, now())
    WHERE email = 'juri1.tsb.sd.pi@pramuka.id';
  END IF;

  -- Juri 89: Juri 2 Pentas Seni Budaya (Putri) (juri2.tsb.sd.pi@pramuka.id)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'juri2.tsb.sd.pi@pramuka.id') THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      '00000000-0000-4000-a000-000000000089'::uuid,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'juri2.tsb.sd.pi@pramuka.id',
      pwd_hash,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'nama_lengkap', 'Juri 2 Pentas Seni Budaya (Putri)',
        'role', 'juri',
        'assigned_kategori', 'SD',
        'assigned_gender', 'Perempuan',
        'assigned_lomba_id', 'e605e267-fcc5-4d3b-9899-43a57699d125'
      ),
      now(),
      now()
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = pwd_hash,
        email_confirmed_at = COALESCE(email_confirmed_at, now())
    WHERE email = 'juri2.tsb.sd.pi@pramuka.id';
  END IF;

  -- Juri 90: Juri 3 Pentas Seni Budaya (Putri) (juri3.tsb.sd.pi@pramuka.id)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'juri3.tsb.sd.pi@pramuka.id') THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      '00000000-0000-4000-a000-000000000090'::uuid,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'juri3.tsb.sd.pi@pramuka.id',
      pwd_hash,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'nama_lengkap', 'Juri 3 Pentas Seni Budaya (Putri)',
        'role', 'juri',
        'assigned_kategori', 'SD',
        'assigned_gender', 'Perempuan',
        'assigned_lomba_id', 'e605e267-fcc5-4d3b-9899-43a57699d125'
      ),
      now(),
      now()
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = pwd_hash,
        email_confirmed_at = COALESCE(email_confirmed_at, now())
    WHERE email = 'juri3.tsb.sd.pi@pramuka.id';
  END IF;

END $$;

-- 2. Upsert ke public.profiles
INSERT INTO public.profiles (
  id, nama_lengkap, role, assigned_lomba_id, assigned_kategori, assigned_gender, is_verified, created_at
)
VALUES
  ('00000000-0000-4000-a000-000000000001'::uuid, 'Juri 1 Administrasi Regu (Putra)', 'juri', 'efb72c87-594c-41ed-9b41-83098e8c6f5c'::uuid, 'SD', 'Laki-laki', true, now()),
  ('00000000-0000-4000-a000-000000000002'::uuid, 'Juri 2 Administrasi Regu (Putra)', 'juri', 'efb72c87-594c-41ed-9b41-83098e8c6f5c'::uuid, 'SD', 'Laki-laki', true, now()),
  ('00000000-0000-4000-a000-000000000003'::uuid, 'Juri 3 Administrasi Regu (Putra)', 'juri', 'efb72c87-594c-41ed-9b41-83098e8c6f5c'::uuid, 'SD', 'Laki-laki', true, now()),
  ('00000000-0000-4000-a000-000000000004'::uuid, 'Juri 1 Administrasi Regu (Putri)', 'juri', 'efb72c87-594c-41ed-9b41-83098e8c6f5c'::uuid, 'SD', 'Perempuan', true, now()),
  ('00000000-0000-4000-a000-000000000005'::uuid, 'Juri 2 Administrasi Regu (Putri)', 'juri', 'efb72c87-594c-41ed-9b41-83098e8c6f5c'::uuid, 'SD', 'Perempuan', true, now()),
  ('00000000-0000-4000-a000-000000000006'::uuid, 'Juri 3 Administrasi Regu (Putri)', 'juri', 'efb72c87-594c-41ed-9b41-83098e8c6f5c'::uuid, 'SD', 'Perempuan', true, now()),
  ('00000000-0000-4000-a000-000000000007'::uuid, 'Juri 1 Forum Penggalang (Putra)', 'juri', 'b528b529-6152-42b1-b810-48f598cd6c0e'::uuid, 'SD', 'Laki-laki', true, now()),
  ('00000000-0000-4000-a000-000000000008'::uuid, 'Juri 2 Forum Penggalang (Putra)', 'juri', 'b528b529-6152-42b1-b810-48f598cd6c0e'::uuid, 'SD', 'Laki-laki', true, now()),
  ('00000000-0000-4000-a000-000000000009'::uuid, 'Juri 3 Forum Penggalang (Putra)', 'juri', 'b528b529-6152-42b1-b810-48f598cd6c0e'::uuid, 'SD', 'Laki-laki', true, now()),
  ('00000000-0000-4000-a000-000000000010'::uuid, 'Juri 1 Forum Penggalang (Putri)', 'juri', 'b528b529-6152-42b1-b810-48f598cd6c0e'::uuid, 'SD', 'Perempuan', true, now()),
  ('00000000-0000-4000-a000-000000000011'::uuid, 'Juri 2 Forum Penggalang (Putri)', 'juri', 'b528b529-6152-42b1-b810-48f598cd6c0e'::uuid, 'SD', 'Perempuan', true, now()),
  ('00000000-0000-4000-a000-000000000012'::uuid, 'Juri 3 Forum Penggalang (Putri)', 'juri', 'b528b529-6152-42b1-b810-48f598cd6c0e'::uuid, 'SD', 'Perempuan', true, now()),
  ('00000000-0000-4000-a000-000000000013'::uuid, 'Juri 1 Menyanyi Hymne & Mars (Putra)', 'juri', '400ee260-9d94-4327-b8f0-08790826bf69'::uuid, 'SD', 'Laki-laki', true, now()),
  ('00000000-0000-4000-a000-000000000014'::uuid, 'Juri 2 Menyanyi Hymne & Mars (Putra)', 'juri', '400ee260-9d94-4327-b8f0-08790826bf69'::uuid, 'SD', 'Laki-laki', true, now()),
  ('00000000-0000-4000-a000-000000000015'::uuid, 'Juri 3 Menyanyi Hymne & Mars (Putra)', 'juri', '400ee260-9d94-4327-b8f0-08790826bf69'::uuid, 'SD', 'Laki-laki', true, now()),
  ('00000000-0000-4000-a000-000000000016'::uuid, 'Juri 1 Menyanyi Hymne & Mars (Putri)', 'juri', '400ee260-9d94-4327-b8f0-08790826bf69'::uuid, 'SD', 'Perempuan', true, now()),
  ('00000000-0000-4000-a000-000000000017'::uuid, 'Juri 2 Menyanyi Hymne & Mars (Putri)', 'juri', '400ee260-9d94-4327-b8f0-08790826bf69'::uuid, 'SD', 'Perempuan', true, now()),
  ('00000000-0000-4000-a000-000000000018'::uuid, 'Juri 3 Menyanyi Hymne & Mars (Putri)', 'juri', '400ee260-9d94-4327-b8f0-08790826bf69'::uuid, 'SD', 'Perempuan', true, now()),
  ('00000000-0000-4000-a000-000000000019'::uuid, 'Juri 1 Obat Tradisional & KIM (Putra)', 'juri', '701c8117-12c6-4dbb-bd8a-1dc369f28ae3'::uuid, 'SD', 'Laki-laki', true, now()),
  ('00000000-0000-4000-a000-000000000020'::uuid, 'Juri 2 Obat Tradisional & KIM (Putra)', 'juri', '701c8117-12c6-4dbb-bd8a-1dc369f28ae3'::uuid, 'SD', 'Laki-laki', true, now()),
  ('00000000-0000-4000-a000-000000000021'::uuid, 'Juri 3 Obat Tradisional & KIM (Putra)', 'juri', '701c8117-12c6-4dbb-bd8a-1dc369f28ae3'::uuid, 'SD', 'Laki-laki', true, now()),
  ('00000000-0000-4000-a000-000000000022'::uuid, 'Juri 1 Obat Tradisional & KIM (Putri)', 'juri', '701c8117-12c6-4dbb-bd8a-1dc369f28ae3'::uuid, 'SD', 'Perempuan', true, now()),
  ('00000000-0000-4000-a000-000000000023'::uuid, 'Juri 2 Obat Tradisional & KIM (Putri)', 'juri', '701c8117-12c6-4dbb-bd8a-1dc369f28ae3'::uuid, 'SD', 'Perempuan', true, now()),
  ('00000000-0000-4000-a000-000000000024'::uuid, 'Juri 3 Obat Tradisional & KIM (Putri)', 'juri', '701c8117-12c6-4dbb-bd8a-1dc369f28ae3'::uuid, 'SD', 'Perempuan', true, now()),
  ('00000000-0000-4000-a000-000000000025'::uuid, 'Juri 1 Karnaval (Putra)', 'juri', '442a5d29-1703-40a9-9480-216ae536406e'::uuid, 'SD', 'Laki-laki', true, now()),
  ('00000000-0000-4000-a000-000000000026'::uuid, 'Juri 2 Karnaval (Putra)', 'juri', '442a5d29-1703-40a9-9480-216ae536406e'::uuid, 'SD', 'Laki-laki', true, now()),
  ('00000000-0000-4000-a000-000000000027'::uuid, 'Juri 3 Karnaval (Putra)', 'juri', '442a5d29-1703-40a9-9480-216ae536406e'::uuid, 'SD', 'Laki-laki', true, now()),
  ('00000000-0000-4000-a000-000000000028'::uuid, 'Juri 1 Karnaval (Putri)', 'juri', '442a5d29-1703-40a9-9480-216ae536406e'::uuid, 'SD', 'Perempuan', true, now()),
  ('00000000-0000-4000-a000-000000000029'::uuid, 'Juri 2 Karnaval (Putri)', 'juri', '442a5d29-1703-40a9-9480-216ae536406e'::uuid, 'SD', 'Perempuan', true, now()),
  ('00000000-0000-4000-a000-000000000030'::uuid, 'Juri 3 Karnaval (Putri)', 'juri', '442a5d29-1703-40a9-9480-216ae536406e'::uuid, 'SD', 'Perempuan', true, now()),
  ('00000000-0000-4000-a000-000000000031'::uuid, 'Juri 1 Morse Pluit (Putra)', 'juri', '80771c90-672d-4145-bc4f-29f57a3ebc57'::uuid, 'SD', 'Laki-laki', true, now()),
  ('00000000-0000-4000-a000-000000000032'::uuid, 'Juri 2 Morse Pluit (Putra)', 'juri', '80771c90-672d-4145-bc4f-29f57a3ebc57'::uuid, 'SD', 'Laki-laki', true, now()),
  ('00000000-0000-4000-a000-000000000033'::uuid, 'Juri 3 Morse Pluit (Putra)', 'juri', '80771c90-672d-4145-bc4f-29f57a3ebc57'::uuid, 'SD', 'Laki-laki', true, now()),
  ('00000000-0000-4000-a000-000000000034'::uuid, 'Juri 1 Morse Pluit (Putri)', 'juri', '80771c90-672d-4145-bc4f-29f57a3ebc57'::uuid, 'SD', 'Perempuan', true, now()),
  ('00000000-0000-4000-a000-000000000035'::uuid, 'Juri 2 Morse Pluit (Putri)', 'juri', '80771c90-672d-4145-bc4f-29f57a3ebc57'::uuid, 'SD', 'Perempuan', true, now()),
  ('00000000-0000-4000-a000-000000000036'::uuid, 'Juri 3 Morse Pluit (Putri)', 'juri', '80771c90-672d-4145-bc4f-29f57a3ebc57'::uuid, 'SD', 'Perempuan', true, now()),
  ('00000000-0000-4000-a000-000000000037'::uuid, 'Juri 1 Masak Nusantara (Putra)', 'juri', '336c78c2-4185-4179-9725-39285d46242e'::uuid, 'SD', 'Laki-laki', true, now()),
  ('00000000-0000-4000-a000-000000000038'::uuid, 'Juri 2 Masak Nusantara (Putra)', 'juri', '336c78c2-4185-4179-9725-39285d46242e'::uuid, 'SD', 'Laki-laki', true, now()),
  ('00000000-0000-4000-a000-000000000039'::uuid, 'Juri 3 Masak Nusantara (Putra)', 'juri', '336c78c2-4185-4179-9725-39285d46242e'::uuid, 'SD', 'Laki-laki', true, now()),
  ('00000000-0000-4000-a000-000000000040'::uuid, 'Juri 1 Masak Nusantara (Putri)', 'juri', '336c78c2-4185-4179-9725-39285d46242e'::uuid, 'SD', 'Perempuan', true, now()),
  ('00000000-0000-4000-a000-000000000041'::uuid, 'Juri 2 Masak Nusantara (Putri)', 'juri', '336c78c2-4185-4179-9725-39285d46242e'::uuid, 'SD', 'Perempuan', true, now()),
  ('00000000-0000-4000-a000-000000000042'::uuid, 'Juri 3 Masak Nusantara (Putri)', 'juri', '336c78c2-4185-4179-9725-39285d46242e'::uuid, 'SD', 'Perempuan', true, now()),
  ('00000000-0000-4000-a000-000000000043'::uuid, 'Juri 1 Orienteering Navigasi (Putra)', 'juri', 'a0c6d26a-633d-4444-9359-454ef6f23c90'::uuid, 'SD', 'Laki-laki', true, now()),
  ('00000000-0000-4000-a000-000000000044'::uuid, 'Juri 2 Orienteering Navigasi (Putra)', 'juri', 'a0c6d26a-633d-4444-9359-454ef6f23c90'::uuid, 'SD', 'Laki-laki', true, now()),
  ('00000000-0000-4000-a000-000000000045'::uuid, 'Juri 3 Orienteering Navigasi (Putra)', 'juri', 'a0c6d26a-633d-4444-9359-454ef6f23c90'::uuid, 'SD', 'Laki-laki', true, now()),
  ('00000000-0000-4000-a000-000000000046'::uuid, 'Juri 1 Orienteering Navigasi (Putri)', 'juri', 'a0c6d26a-633d-4444-9359-454ef6f23c90'::uuid, 'SD', 'Perempuan', true, now()),
  ('00000000-0000-4000-a000-000000000047'::uuid, 'Juri 2 Orienteering Navigasi (Putri)', 'juri', 'a0c6d26a-633d-4444-9359-454ef6f23c90'::uuid, 'SD', 'Perempuan', true, now()),
  ('00000000-0000-4000-a000-000000000048'::uuid, 'Juri 3 Orienteering Navigasi (Putri)', 'juri', 'a0c6d26a-633d-4444-9359-454ef6f23c90'::uuid, 'SD', 'Perempuan', true, now()),
  ('00000000-0000-4000-a000-000000000049'::uuid, 'Juri 1 Packing Perlengkapan (Putra)', 'juri', 'b4318236-e4e3-4799-b408-188000482d0c'::uuid, 'SD', 'Laki-laki', true, now()),
  ('00000000-0000-4000-a000-000000000050'::uuid, 'Juri 2 Packing Perlengkapan (Putra)', 'juri', 'b4318236-e4e3-4799-b408-188000482d0c'::uuid, 'SD', 'Laki-laki', true, now()),
  ('00000000-0000-4000-a000-000000000051'::uuid, 'Juri 3 Packing Perlengkapan (Putra)', 'juri', 'b4318236-e4e3-4799-b408-188000482d0c'::uuid, 'SD', 'Laki-laki', true, now()),
  ('00000000-0000-4000-a000-000000000052'::uuid, 'Juri 1 Packing Perlengkapan (Putri)', 'juri', 'b4318236-e4e3-4799-b408-188000482d0c'::uuid, 'SD', 'Perempuan', true, now()),
  ('00000000-0000-4000-a000-000000000053'::uuid, 'Juri 2 Packing Perlengkapan (Putri)', 'juri', 'b4318236-e4e3-4799-b408-188000482d0c'::uuid, 'SD', 'Perempuan', true, now()),
  ('00000000-0000-4000-a000-000000000054'::uuid, 'Juri 3 Packing Perlengkapan (Putri)', 'juri', 'b4318236-e4e3-4799-b408-188000482d0c'::uuid, 'SD', 'Perempuan', true, now()),
  ('00000000-0000-4000-a000-000000000055'::uuid, 'Juri 1 PPPK / PPGD (Putra)', 'juri', 'e0d60070-1be2-4184-a367-efb663211a7c'::uuid, 'SD', 'Laki-laki', true, now()),
  ('00000000-0000-4000-a000-000000000056'::uuid, 'Juri 2 PPPK / PPGD (Putra)', 'juri', 'e0d60070-1be2-4184-a367-efb663211a7c'::uuid, 'SD', 'Laki-laki', true, now()),
  ('00000000-0000-4000-a000-000000000057'::uuid, 'Juri 3 PPPK / PPGD (Putra)', 'juri', 'e0d60070-1be2-4184-a367-efb663211a7c'::uuid, 'SD', 'Laki-laki', true, now()),
  ('00000000-0000-4000-a000-000000000058'::uuid, 'Juri 1 PPPK / PPGD (Putri)', 'juri', 'e0d60070-1be2-4184-a367-efb663211a7c'::uuid, 'SD', 'Perempuan', true, now()),
  ('00000000-0000-4000-a000-000000000059'::uuid, 'Juri 2 PPPK / PPGD (Putri)', 'juri', 'e0d60070-1be2-4184-a367-efb663211a7c'::uuid, 'SD', 'Perempuan', true, now()),
  ('00000000-0000-4000-a000-000000000060'::uuid, 'Juri 3 PPPK / PPGD (Putri)', 'juri', 'e0d60070-1be2-4184-a367-efb663211a7c'::uuid, 'SD', 'Perempuan', true, now()),
  ('00000000-0000-4000-a000-000000000061'::uuid, 'Juri 1 Pionering (Putra)', 'juri', '16c6eb28-b2c4-4582-a05f-fb9bf0846211'::uuid, 'SD', 'Laki-laki', true, now()),
  ('00000000-0000-4000-a000-000000000062'::uuid, 'Juri 2 Pionering (Putra)', 'juri', '16c6eb28-b2c4-4582-a05f-fb9bf0846211'::uuid, 'SD', 'Laki-laki', true, now()),
  ('00000000-0000-4000-a000-000000000063'::uuid, 'Juri 3 Pionering (Putra)', 'juri', '16c6eb28-b2c4-4582-a05f-fb9bf0846211'::uuid, 'SD', 'Laki-laki', true, now()),
  ('00000000-0000-4000-a000-000000000064'::uuid, 'Juri 1 Pionering (Putri)', 'juri', '16c6eb28-b2c4-4582-a05f-fb9bf0846211'::uuid, 'SD', 'Perempuan', true, now()),
  ('00000000-0000-4000-a000-000000000065'::uuid, 'Juri 2 Pionering (Putri)', 'juri', '16c6eb28-b2c4-4582-a05f-fb9bf0846211'::uuid, 'SD', 'Perempuan', true, now()),
  ('00000000-0000-4000-a000-000000000066'::uuid, 'Juri 3 Pionering (Putri)', 'juri', '16c6eb28-b2c4-4582-a05f-fb9bf0846211'::uuid, 'SD', 'Perempuan', true, now()),
  ('00000000-0000-4000-a000-000000000067'::uuid, 'Juri 1 Semaphore (Putra)', 'juri', '9fa44cf1-e3b0-4ac6-a6ac-3610c820d442'::uuid, 'SD', 'Laki-laki', true, now()),
  ('00000000-0000-4000-a000-000000000068'::uuid, 'Juri 2 Semaphore (Putra)', 'juri', '9fa44cf1-e3b0-4ac6-a6ac-3610c820d442'::uuid, 'SD', 'Laki-laki', true, now()),
  ('00000000-0000-4000-a000-000000000069'::uuid, 'Juri 3 Semaphore (Putra)', 'juri', '9fa44cf1-e3b0-4ac6-a6ac-3610c820d442'::uuid, 'SD', 'Laki-laki', true, now()),
  ('00000000-0000-4000-a000-000000000070'::uuid, 'Juri 1 Semaphore (Putri)', 'juri', '9fa44cf1-e3b0-4ac6-a6ac-3610c820d442'::uuid, 'SD', 'Perempuan', true, now()),
  ('00000000-0000-4000-a000-000000000071'::uuid, 'Juri 2 Semaphore (Putri)', 'juri', '9fa44cf1-e3b0-4ac6-a6ac-3610c820d442'::uuid, 'SD', 'Perempuan', true, now()),
  ('00000000-0000-4000-a000-000000000072'::uuid, 'Juri 3 Semaphore (Putri)', 'juri', '9fa44cf1-e3b0-4ac6-a6ac-3610c820d442'::uuid, 'SD', 'Perempuan', true, now()),
  ('00000000-0000-4000-a000-000000000073'::uuid, 'Juri 1 Sandi-Sandi (Putra)', 'juri', '60bafddb-7337-4eeb-910e-1fc458801142'::uuid, 'SD', 'Laki-laki', true, now()),
  ('00000000-0000-4000-a000-000000000074'::uuid, 'Juri 2 Sandi-Sandi (Putra)', 'juri', '60bafddb-7337-4eeb-910e-1fc458801142'::uuid, 'SD', 'Laki-laki', true, now()),
  ('00000000-0000-4000-a000-000000000075'::uuid, 'Juri 3 Sandi-Sandi (Putra)', 'juri', '60bafddb-7337-4eeb-910e-1fc458801142'::uuid, 'SD', 'Laki-laki', true, now()),
  ('00000000-0000-4000-a000-000000000076'::uuid, 'Juri 1 Sandi-Sandi (Putri)', 'juri', '60bafddb-7337-4eeb-910e-1fc458801142'::uuid, 'SD', 'Perempuan', true, now()),
  ('00000000-0000-4000-a000-000000000077'::uuid, 'Juri 2 Sandi-Sandi (Putri)', 'juri', '60bafddb-7337-4eeb-910e-1fc458801142'::uuid, 'SD', 'Perempuan', true, now()),
  ('00000000-0000-4000-a000-000000000078'::uuid, 'Juri 3 Sandi-Sandi (Putri)', 'juri', '60bafddb-7337-4eeb-910e-1fc458801142'::uuid, 'SD', 'Perempuan', true, now()),
  ('00000000-0000-4000-a000-000000000079'::uuid, 'Juri 1 Menaksir (Putra)', 'juri', '6d435369-e9b5-4a12-a8bf-7d44b7093ecf'::uuid, 'SD', 'Laki-laki', true, now()),
  ('00000000-0000-4000-a000-000000000080'::uuid, 'Juri 2 Menaksir (Putra)', 'juri', '6d435369-e9b5-4a12-a8bf-7d44b7093ecf'::uuid, 'SD', 'Laki-laki', true, now()),
  ('00000000-0000-4000-a000-000000000081'::uuid, 'Juri 3 Menaksir (Putra)', 'juri', '6d435369-e9b5-4a12-a8bf-7d44b7093ecf'::uuid, 'SD', 'Laki-laki', true, now()),
  ('00000000-0000-4000-a000-000000000082'::uuid, 'Juri 1 Menaksir (Putri)', 'juri', '6d435369-e9b5-4a12-a8bf-7d44b7093ecf'::uuid, 'SD', 'Perempuan', true, now()),
  ('00000000-0000-4000-a000-000000000083'::uuid, 'Juri 2 Menaksir (Putri)', 'juri', '6d435369-e9b5-4a12-a8bf-7d44b7093ecf'::uuid, 'SD', 'Perempuan', true, now()),
  ('00000000-0000-4000-a000-000000000084'::uuid, 'Juri 3 Menaksir (Putri)', 'juri', '6d435369-e9b5-4a12-a8bf-7d44b7093ecf'::uuid, 'SD', 'Perempuan', true, now()),
  ('00000000-0000-4000-a000-000000000085'::uuid, 'Juri 1 Pentas Seni Budaya (Putra)', 'juri', 'e605e267-fcc5-4d3b-9899-43a57699d125'::uuid, 'SD', 'Laki-laki', true, now()),
  ('00000000-0000-4000-a000-000000000086'::uuid, 'Juri 2 Pentas Seni Budaya (Putra)', 'juri', 'e605e267-fcc5-4d3b-9899-43a57699d125'::uuid, 'SD', 'Laki-laki', true, now()),
  ('00000000-0000-4000-a000-000000000087'::uuid, 'Juri 3 Pentas Seni Budaya (Putra)', 'juri', 'e605e267-fcc5-4d3b-9899-43a57699d125'::uuid, 'SD', 'Laki-laki', true, now()),
  ('00000000-0000-4000-a000-000000000088'::uuid, 'Juri 1 Pentas Seni Budaya (Putri)', 'juri', 'e605e267-fcc5-4d3b-9899-43a57699d125'::uuid, 'SD', 'Perempuan', true, now()),
  ('00000000-0000-4000-a000-000000000089'::uuid, 'Juri 2 Pentas Seni Budaya (Putri)', 'juri', 'e605e267-fcc5-4d3b-9899-43a57699d125'::uuid, 'SD', 'Perempuan', true, now()),
  ('00000000-0000-4000-a000-000000000090'::uuid, 'Juri 3 Pentas Seni Budaya (Putri)', 'juri', 'e605e267-fcc5-4d3b-9899-43a57699d125'::uuid, 'SD', 'Perempuan', true, now())
ON CONFLICT (id) DO UPDATE SET
  nama_lengkap = EXCLUDED.nama_lengkap,
  role = 'juri',
  assigned_lomba_id = EXCLUDED.assigned_lomba_id,
  assigned_kategori = 'SD',
  assigned_gender = EXCLUDED.assigned_gender,
  is_verified = true;

-- 3. Hapus nilai testing lama pada tingkatan SD agar bersih
DELETE FROM public.penilaian
WHERE peserta_id IN (SELECT id FROM public.peserta WHERE kategori = 'SD');

-- 4. Masukkan Penilaian Uji Coba dari masing-masing 3 Juri untuk seluruh Regu SD
-- Menggunakan variasi penilaian realistis (70 - 95) dengan perbedaan 1-3 poin antar 3 juri
DO $$
DECLARE
  rec_peserta RECORD;
  juri_rec RECORD;
  base_score INT;
  score_juri INT;
  j_offset INT;
BEGIN
  -- Iterasi setiap peserta SD
  FOR rec_peserta IN SELECT id, nomor_dada, gender FROM public.peserta WHERE kategori = 'SD' ORDER BY nomor_dada LOOP
    -- Untuk setiap lomba SD
    FOR juri_rec IN 
      SELECT id, assigned_lomba_id, assigned_gender, nama_lengkap 
      FROM public.profiles 
      WHERE assigned_kategori = 'SD' AND assigned_gender = rec_peserta.gender AND assigned_lomba_id IS NOT NULL 
    LOOP
      -- Hitung base score berdasarkan kombinasi nomor_dada dan lomba
      -- Menghasilkan variasi nilai realistis antara 74 dan 94
      base_score := 75 + (mod(abs(hashtext(rec_peserta.id::text || juri_rec.assigned_lomba_id::text)), 18));
      
      -- Offset khusus untuk variasi penilaian juri 1, 2, dan 3 (± 1 s/d 3 poin)
      IF juri_rec.nama_lengkap LIKE 'Juri 1%' THEN
        j_offset := 0;
      ELSIF juri_rec.nama_lengkap LIKE 'Juri 2%' THEN
        j_offset := 2;
      ELSE
        j_offset := -1;
      END IF;

      score_juri := base_score + j_offset;
      IF score_juri > 98 THEN score_juri := 98; END IF;
      IF score_juri < 65 THEN score_juri := 65; END IF;

      -- Insert penilaian
      INSERT INTO public.penilaian (peserta_id, juri_id, lomba_id, nilai, updated_at)
      VALUES (rec_peserta.id, juri_rec.id, juri_rec.assigned_lomba_id, score_juri, now())
      ON CONFLICT (peserta_id, juri_id, lomba_id) DO UPDATE
      SET nilai = EXCLUDED.nilai, updated_at = now();

    END LOOP;
  END LOOP;
END $$;

-- 5. Hitung & Update total_nilai pada public.peserta (Sum of Lomba Averages)
UPDATE public.peserta p
SET total_nilai = sub.total
FROM (
  SELECT peserta_id, ROUND(COALESCE(SUM(rata_rata_lomba), 0), 2) as total
  FROM (
    SELECT peserta_id, AVG(nilai) as rata_rata_lomba
    FROM public.penilaian
    GROUP BY peserta_id, lomba_id
  ) per_lomba
  GROUP BY peserta_id
) sub
WHERE p.id = sub.peserta_id AND p.kategori = 'SD';

-- Selesai! Seluruh 90 juri dan 1000+ data penilaian SD siap diuji.
