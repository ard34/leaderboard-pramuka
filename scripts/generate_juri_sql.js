const fs = require("fs");
const path = require("path");

const LOMBA_SD = [
  { id: "efb72c87-594c-41ed-9b41-83098e8c6f5c", kode: "adm", nama: "Administrasi Regu" },
  { id: "b528b529-6152-42b1-b810-48f598cd6c0e", kode: "frp", nama: "Forum Penggalang" },
  { id: "400ee260-9d94-4327-b8f0-08790826bf69", kode: "hmn", nama: "Menyanyi Hymne & Mars" },
  { id: "701c8117-12c6-4dbb-bd8a-1dc369f28ae3", kode: "kim", nama: "Obat Tradisional & KIM" },
  { id: "442a5d29-1703-40a9-9480-216ae536406e", kode: "krn", nama: "Karnaval" },
  { id: "80771c90-672d-4145-bc4f-29f57a3ebc57", kode: "mrs", nama: "Morse Pluit" },
  { id: "336c78c2-4185-4179-9725-39285d46242e", kode: "msk", nama: "Masak Nusantara" },
  { id: "a0c6d26a-633d-4444-9359-454ef6f23c90", kode: "nav", nama: "Orienteering Navigasi" },
  { id: "b4318236-e4e3-4799-b408-188000482d0c", kode: "pck", nama: "Packing Perlengkapan" },
  { id: "e0d60070-1be2-4184-a367-efb663211a7c", kode: "pgd", nama: "PPPK / PPGD" },
  { id: "16c6eb28-b2c4-4582-a05f-fb9bf0846211", kode: "pnr", nama: "Pionering" },
  { id: "9fa44cf1-e3b0-4ac6-a6ac-3610c820d442", kode: "smp", nama: "Semaphore" },
  { id: "60bafddb-7337-4eeb-910e-1fc458801142", kode: "snd", nama: "Sandi-Sandi" },
  { id: "6d435369-e9b5-4a12-a8bf-7d44b7093ecf", kode: "tks", nama: "Menaksir" },
  { id: "e605e267-fcc5-4d3b-9899-43a57699d125", kode: "tsb", nama: "Pentas Seni Budaya" },
];

const GENDERS = [
  { key: "pa", label: "Putra", dbVal: "Laki-laki" },
  { key: "pi", label: "Putri", dbVal: "Perempuan" },
];

const PASSWORD_TEXT = "JuriLT2MekarBaru2026!";

// Generate deterministic UUIDs for each juri
function generateJuriList() {
  const list = [];
  let index = 1;

  LOMBA_SD.forEach((l) => {
    GENDERS.forEach((g) => {
      for (let j = 1; j <= 3; j++) {
        const email = `juri${j}.${l.kode}.sd.${g.key}@pramuka.id`;
        const nama = `Juri ${j} ${l.nama} (${g.label})`;
        const id = `00000000-0000-4000-a000-${String(index).padStart(12, "0")}`;
        list.push({
          index,
          id,
          email,
          nama,
          lombaId: l.id,
          lombaKode: l.kode.toUpperCase(),
          lombaNama: l.nama,
          genderKey: g.key,
          genderLabel: g.label,
          genderDb: g.dbVal,
          juriNum: j,
        });
        index++;
      }
    });
  });

  return list;
}

const juris = generateJuriList();
console.log(`Generated ${juris.length} judges definition.`);

// Build SQL
let sql = `-- ============================================================
-- SQL SEEDER: 90 DEWAN JURI TINGKAT SD & SIMULASI PENILAIAN LENGKAP
-- LT-II KWARTIR RANTING MEKAR BARU 2026
-- ============================================================
-- 15 Cabang Lomba x 2 Gender (Putra & Putri) x 3 Juri per lomba = 90 Juri
-- Kredensial Login Seragam:
-- Password: ${PASSWORD_TEXT}
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Insert/Upsert 90 Akun Dewan Juri ke auth.users
DO $$
DECLARE
  pwd_hash text;
BEGIN
  pwd_hash := crypt('${PASSWORD_TEXT}', gen_salt('bf'));

`;

juris.forEach((j) => {
  sql += `  -- Juri ${j.index}: ${j.nama} (${j.email})
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = '${j.email}') THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      '${j.id}'::uuid,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      '${j.email}',
      pwd_hash,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'nama_lengkap', '${j.nama}',
        'role', 'juri',
        'assigned_kategori', 'SD',
        'assigned_gender', '${j.genderDb}',
        'assigned_lomba_id', '${j.lombaId}'
      ),
      now(),
      now()
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = pwd_hash,
        email_confirmed_at = COALESCE(email_confirmed_at, now())
    WHERE email = '${j.email}';
  END IF;

`;
});

sql += `END $$;

-- 2. Upsert ke public.profiles
INSERT INTO public.profiles (
  id, nama_lengkap, role, assigned_lomba_id, assigned_kategori, assigned_gender, is_verified, created_at
)
VALUES
`;

const profileValues = juris.map((j) => {
  return `  ('${j.id}'::uuid, '${j.nama}', 'juri', '${j.lombaId}'::uuid, 'SD', '${j.genderDb}', true, now())`;
});

sql += profileValues.join(",\n");
sql += `
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
`;

fs.writeFileSync(path.resolve("seed-juri-sd-lengkap.sql"), sql);
console.log("Written seed-juri-sd-lengkap.sql successfully!");
