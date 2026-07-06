-- ============================================================
-- TEMPLATE DATA PESERTA — Lomba Pramuka 2026
-- ============================================================
-- Copas seluruh isi file ini ke Supabase SQL Editor lalu klik RUN.
-- Total: 45 regu (15 SD + 15 SMP + 15 SMK)
-- ============================================================

-- ============================
-- TINGKAT SD / MI (15 Regu)
-- ============================
INSERT INTO public.peserta (nomor_dada, nama_regu, pangkalan, kategori, gender, total_nilai) VALUES
(101, 'Regu Elang',       'SDN 1 Cibadak',           'SD', 'Laki-laki', 0),
(102, 'Regu Rajawali',    'SDN 2 Palabuhanratu',     'SD', 'Laki-laki', 0),
(103, 'Regu Garuda',      'MI Al-Hidayah Sukabumi',  'SD', 'Laki-laki', 0),
(104, 'Regu Cendrawasih', 'SDN 3 Cisaat',            'SD', 'Laki-laki', 0),
(105, 'Regu Merak',       'SDN 1 Sukaraja',          'SD', 'Laki-laki', 0),
(106, 'Regu Kutilang',    'MI Nurul Falah Cianjur',  'SD', 'Laki-laki', 0),
(107, 'Regu Jalak',       'SDN 4 Cikembar',          'SD', 'Laki-laki', 0),
(108, 'Regu Kenari',      'SDN 2 Cicurug',           'SD', 'Laki-laki', 0),
(109, 'Regu Melati',      'SDN 1 Cibadak',           'SD', 'Perempuan', 0),
(110, 'Regu Mawar',       'SDNParungkuda',           'SD', 'Perempuan', 0),
(111, 'Regu Tulip',       'SDN 3 Jampang Kulon',     'SD', 'Perempuan', 0),
(112, 'Regu Dahlia',      'MI Darul Ulum Bogor',     'SD', 'Perempuan', 0),
(113, 'Regu Sakura',      'SDN 5 Nyalindung',        'SD', 'Perempuan', 0),
(114, 'Regu Lily',        'SDN 2 Gegerbitung',       'SD', 'Perempuan', 0),
(115, 'Regu Anggrek',     'MI Al-Ikhlas Cisolok',    'SD', 'Perempuan', 0);

-- ============================
-- TINGKAT SMP / MTs (15 Regu)
-- ============================
INSERT INTO public.peserta (nomor_dada, nama_regu, pangkalan, kategori, gender, total_nilai) VALUES
(201, 'Regu Harimau',     'SMPN 1 Sukabumi',         'SMP', 'Laki-laki', 0),
(202, 'Regu Macan',       'SMPN 2 Cibadak',          'SMP', 'Laki-laki', 0),
(203, 'Regu Singa',       'MTs Nurul Huda Cianjur',  'SMP', 'Laki-laki', 0),
(204, 'Regu Cheetah',     'SMPN 3 Palabuhanratu',    'SMP', 'Laki-laki', 0),
(205, 'Regu Serigala',    'SMPN 1 Cisaat',           'SMP', 'Laki-laki', 0),
(206, 'Regu Beruang',     'MTs Al-Muawanah Bogor',   'SMP', 'Laki-laki', 0),
(207, 'Regu Banteng',     'SMPN 4 Sukaraja',         'SMP', 'Laki-laki', 0),
(208, 'Regu Kerbau',      'SMPN 2 Cicurug',          'SMP', 'Laki-laki', 0),
(209, 'Regu Sakura',      'MTs Darul Falah Cisolok', 'SMP', 'Perempuan', 0),
(210, 'Regu Lavender',    'SMPN 1 Cikembar',         'SMP', 'Perempuan', 0),
(211, 'Regu Lily',        'SMPN 3 Jampang Kulon',    'SMP', 'Perempuan', 0),
(212, 'Regu Anggrek',     'MTs Al-Falah Parungkuda', 'SMP', 'Perempuan', 0),
(213, 'Regu Dahlia',      'SMPN 2 Nyalindung',       'SMP', 'Perempuan', 0),
(214, 'Regu Jasmine',     'SMPN 5 Gegerbitung',      'SMP', 'Perempuan', 0),
(215, 'Regu Kenanga',     'MTs Mathlaul Anwar',      'SMP', 'Perempuan', 0);

-- ============================
-- TINGKAT SMA / SMK / MA (15 Regu)
-- ============================
INSERT INTO public.peserta (nomor_dada, nama_regu, pangkalan, kategori, gender, total_nilai) VALUES
(301, 'Regu Arjuna',      'SMAN 1 Sukabumi',         'SMK', 'Laki-laki', 0),
(302, 'Regu Bima',        'SMKN 1 Cibadak',          'SMK', 'Laki-laki', 0),
(303, 'Regu Gatotkaca',   'MA Al-Hidayah Cianjur',   'SMK', 'Laki-laki', 0),
(304, 'Regu Nakula',      'SMAN 2 Palabuhanratu',    'SMK', 'Laki-laki', 0),
(305, 'Regu Sadewa',      'SMKN 3 Cisaat',           'SMK', 'Laki-laki', 0),
(306, 'Regu Werkudara',   'MA Nurul Falah Bogor',    'SMK', 'Laki-laki', 0),
(307, 'Regu Yudhistira',  'SMAN 1 Sukaraja',         'SMK', 'Laki-laki', 0),
(308, 'Regu Kresna',      'SMKN 2 Cicurug',          'SMK', 'Laki-laki', 0),
(309, 'Regu Shinta',      'SMAN 1 Sukabumi',         'SMK', 'Perempuan', 0),
(310, 'Regu Srikandi',    'SMAN 4 Cikembar',         'SMK', 'Perempuan', 0),
(311, 'Regu Drupadi',     'SMKN 1 Jampang Kulon',    'SMK', 'Perempuan', 0),
(312, 'Regu Larasati',    'MA Al-Ikhlas Parungkuda', 'SMK', 'Perempuan', 0),
(313, 'Regu Lesmana',     'SMAN 3 Nyalindung',       'SMK', 'Perempuan', 0),
(314, 'Regu Subadra',     'SMKN 5 Gegerbitung',      'SMK', 'Perempuan', 0),
(315, 'Regu Kunthi',      'MA Mathlaul Anwar',       'SMK', 'Perempuan', 0);

-- ============================================================
-- (OPSIONAL) CONTOH DATA PENILAIAN
-- ============================================================
-- Uncomment blok di bawah jika ingin langsung ada nilai contoh.
-- Nilai ini akan otomatis meng-update total_nilai via trigger.
-- Ganti 'JURI-UUID' dengan UUID juri dari tabel profiles.
-- ============================================================

/*
-- Contoh: Juri menilai 3 regu SD di pos Pionering
INSERT INTO public.penilaian (peserta_id, juri_id, pos_nilai, nilai) VALUES
((SELECT id FROM peserta WHERE nomor_dada = 101), 'JURI-UUID', 'Pionering', 80),
((SELECT id FROM peserta WHERE nomor_dada = 101), 'JURI-UUID', 'Semaphore', 78),
((SELECT id FROM peserta WHERE nomor_dada = 101), 'JURI-UUID', 'Morse', 82),
((SELECT id FROM peserta WHERE nomor_dada = 101), 'JURI-UUID', 'Sandi', 90),
((SELECT id FROM peserta WHERE nomor_dada = 101), 'JURI-UUID', 'Peta Pita', 80),
((SELECT id FROM peserta WHERE nomor_dada = 101), 'JURI-UUID', 'PPGD', 89),
((SELECT id FROM peserta WHERE nomor_dada = 101), 'JURI-UUID', 'Memasak', 94),
((SELECT id FROM peserta WHERE nomor_dada = 101), 'JURI-UUID', 'Menaksir', 83),
((SELECT id FROM peserta WHERE nomor_dada = 101), 'JURI-UUID', 'Baris Berbaris', 95),
((SELECT id FROM peserta WHERE nomor_dada = 101), 'JURI-UUID', 'Yel-Yel', 88),
((SELECT id FROM peserta WHERE nomor_dada = 101), 'JURI-UUID', 'Hasta Karya', 85),
((SELECT id FROM peserta WHERE nomor_dada = 101), 'JURI-UUID', 'Cerita Rakyat', 99),
((SELECT id FROM peserta WHERE nomor_dada = 101), 'JURI-UUID', 'Poster', 93),
((SELECT id FROM peserta WHERE nomor_dada = 101), 'JURI-UUID', 'Teknologi Tepat Guna', 87),
((SELECT id FROM peserta WHERE nomor_dada = 101), 'JURI-UUID', 'Keagamaan', 92);
*/
