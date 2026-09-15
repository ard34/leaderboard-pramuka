-- ============================================================
-- SQL SEED TESTING LOKAL LENGKAP — SISTEM LEADERBOARD PRAMUKA LT-II
-- ============================================================
-- Rincian Data:
-- • SD/MI : 19 Sekolah (SD Test 1 s/d SD Test 19)
--          - 19 Regu Putra (Kapling 101 s/d 119)
--          - 19 Regu Putri (Kapling 121 s/d 139)
--          Total SD: 38 Regu
--
-- • SMP/MTs: 7 Sekolah (SMP Test 1 s/d SMP Test 7)
--          - 7 Regu Putra (Kapling 201 s/d 207)
--          - 7 Regu Putri (Kapling 211 s/d 217)
--          Total SMP: 14 Regu
--
-- • Total Peserta Keseluruhan: 52 Regu
-- • Total Dewan Juri: 60 Dewan Juri (2 Juri / Cabang Lomba / Tingkat)
-- • Penilaian: Terisi lengkap dan otomatis terakumulasi per pos lomba
-- ============================================================

-- 0. Normalisasi Nama Lomba SD & SMP
UPDATE public.lomba SET nama_lomba = 'Pionering & Tali-Temali' WHERE kode_lomba = 'PNR';

-- 1. Lepas sementara foreign key profiles ke auth.users agar pembuatan profil juri testing fleksibel
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- 2. Bersihkan Data Testing Lama (Menjaga Akun Admin Utama Tetap Aman)
DELETE FROM public.penilaian;
DELETE FROM public.peserta;
DELETE FROM public.profiles WHERE role <> 'admin';

-- 3. Masukkan 38 Peserta SD / MI (19 Sekolah: SD Test 1 s/d SD Test 19)
INSERT INTO public.peserta (nomor_dada, nama_regu, pangkalan, no_gudep, kontak_person, email, kategori, gender, is_verified, total_nilai) VALUES
(101, 'Regu Garuda', 'SD Test 1', '01.001', '08123456101', 'sdtest1@gmail.com', 'SD', 'Laki-laki', true, 0),
(102, 'Regu Elang', 'SD Test 2', '01.003', '08123456102', 'sdtest2@gmail.com', 'SD', 'Laki-laki', true, 0),
(103, 'Regu Rajawali', 'SD Test 3', '01.005', '08123456103', 'sdtest3@gmail.com', 'SD', 'Laki-laki', true, 0),
(104, 'Regu Singa', 'SD Test 4', '01.007', '08123456104', 'sdtest4@gmail.com', 'SD', 'Laki-laki', true, 0),
(105, 'Regu Harimau', 'SD Test 5', '01.009', '08123456105', 'sdtest5@gmail.com', 'SD', 'Laki-laki', true, 0),
(106, 'Regu Badak', 'SD Test 6', '01.011', '08123456106', 'sdtest6@gmail.com', 'SD', 'Laki-laki', true, 0),
(107, 'Regu Banteng', 'SD Test 7', '01.013', '08123456107', 'sdtest7@gmail.com', 'SD', 'Laki-laki', true, 0),
(108, 'Regu Serigala', 'SD Test 8', '01.015', '08123456108', 'sdtest8@gmail.com', 'SD', 'Laki-laki', true, 0),
(109, 'Regu Cobra', 'SD Test 9', '01.017', '08123456109', 'sdtest9@gmail.com', 'SD', 'Laki-laki', true, 0),
(110, 'Regu Scorpio', 'SD Test 10', '01.019', '08123456110', 'sdtest10@gmail.com', 'SD', 'Laki-laki', true, 0),
(111, 'Regu Jaguar', 'SD Test 11', '01.021', '08123456111', 'sdtest11@gmail.com', 'SD', 'Laki-laki', true, 0),
(112, 'Regu Panther', 'SD Test 12', '01.023', '08123456112', 'sdtest12@gmail.com', 'SD', 'Laki-laki', true, 0),
(113, 'Regu Kancil', 'SD Test 13', '01.025', '08123456113', 'sdtest13@gmail.com', 'SD', 'Laki-laki', true, 0),
(114, 'Regu Kucing Hutan', 'SD Test 14', '01.027', '08123456114', 'sdtest14@gmail.com', 'SD', 'Laki-laki', true, 0),
(115, 'Regu Beruang', 'SD Test 15', '01.029', '08123456115', 'sdtest15@gmail.com', 'SD', 'Laki-laki', true, 0),
(116, 'Regu Merak', 'SD Test 16', '01.031', '08123456116', 'sdtest16@gmail.com', 'SD', 'Laki-laki', true, 0),
(117, 'Regu Jalak', 'SD Test 17', '01.033', '08123456117', 'sdtest17@gmail.com', 'SD', 'Laki-laki', true, 0),
(118, 'Regu Kutilang', 'SD Test 18', '01.035', '08123456118', 'sdtest18@gmail.com', 'SD', 'Laki-laki', true, 0),
(119, 'Regu Kenari', 'SD Test 19', '01.037', '08123456119', 'sdtest19@gmail.com', 'SD', 'Laki-laki', true, 0),
(121, 'Regu Melati', 'SD Test 1', '01.002', '08123456121', 'sdtest1@gmail.com', 'SD', 'Perempuan', true, 0),
(122, 'Regu Mawar', 'SD Test 2', '01.004', '08123456122', 'sdtest2@gmail.com', 'SD', 'Perempuan', true, 0),
(123, 'Regu Anggrek', 'SD Test 3', '01.006', '08123456123', 'sdtest3@gmail.com', 'SD', 'Perempuan', true, 0),
(124, 'Regu Dahlia', 'SD Test 4', '01.008', '08123456124', 'sdtest4@gmail.com', 'SD', 'Perempuan', true, 0),
(125, 'Regu Teratai', 'SD Test 5', '01.010', '08123456125', 'sdtest5@gmail.com', 'SD', 'Perempuan', true, 0),
(126, 'Regu Sakura', 'SD Test 6', '01.012', '08123456126', 'sdtest6@gmail.com', 'SD', 'Perempuan', true, 0),
(127, 'Regu Tulip', 'SD Test 7', '01.014', '08123456127', 'sdtest7@gmail.com', 'SD', 'Perempuan', true, 0),
(128, 'Regu Cempaka', 'SD Test 8', '01.016', '08123456128', 'sdtest8@gmail.com', 'SD', 'Perempuan', true, 0),
(129, 'Regu Flamboyan', 'SD Test 9', '01.018', '08123456129', 'sdtest9@gmail.com', 'SD', 'Perempuan', true, 0),
(130, 'Regu Kenanga', 'SD Test 10', '01.020', '08123456130', 'sdtest10@gmail.com', 'SD', 'Perempuan', true, 0),
(131, 'Regu Lily', 'SD Test 11', '01.022', '08123456131', 'sdtest11@gmail.com', 'SD', 'Perempuan', true, 0),
(132, 'Regu Lavender', 'SD Test 12', '01.024', '08123456132', 'sdtest12@gmail.com', 'SD', 'Perempuan', true, 0),
(133, 'Regu Asoka', 'SD Test 13', '01.026', '08123456133', 'sdtest13@gmail.com', 'SD', 'Perempuan', true, 0),
(134, 'Regu Bougenville', 'SD Test 14', '01.028', '08123456134', 'sdtest14@gmail.com', 'SD', 'Perempuan', true, 0),
(135, 'Regu Edelweis', 'SD Test 15', '01.030', '08123456135', 'sdtest15@gmail.com', 'SD', 'Perempuan', true, 0),
(136, 'Regu Kamboja', 'SD Test 16', '01.032', '08123456136', 'sdtest16@gmail.com', 'SD', 'Perempuan', true, 0),
(137, 'Regu Matahari', 'SD Test 17', '01.034', '08123456137', 'sdtest17@gmail.com', 'SD', 'Perempuan', true, 0),
(138, 'Regu Sedap Malam', 'SD Test 18', '01.036', '08123456138', 'sdtest18@gmail.com', 'SD', 'Perempuan', true, 0),
(139, 'Regu Nusa Indah', 'SD Test 19', '01.038', '08123456139', 'sdtest19@gmail.com', 'SD', 'Perempuan', true, 0);

-- 4. Masukkan 14 Peserta SMP / MTs (7 Sekolah: SMP Test 1 s/d SMP Test 7)
INSERT INTO public.peserta (nomor_dada, nama_regu, pangkalan, no_gudep, kontak_person, email, kategori, gender, is_verified, total_nilai) VALUES
(201, 'Regu Harimau', 'SMP Test 1', '02.001', '08123456201', 'smptest1@gmail.com', 'SMP', 'Laki-laki', true, 0),
(202, 'Regu Singa', 'SMP Test 2', '02.003', '08123456202', 'smptest2@gmail.com', 'SMP', 'Laki-laki', true, 0),
(203, 'Regu Rajawali', 'SMP Test 3', '02.005', '08123456203', 'smptest3@gmail.com', 'SMP', 'Laki-laki', true, 0),
(204, 'Regu Garuda', 'SMP Test 4', '02.007', '08123456204', 'smptest4@gmail.com', 'SMP', 'Laki-laki', true, 0),
(205, 'Regu Elang', 'SMP Test 5', '02.009', '08123456205', 'smptest5@gmail.com', 'SMP', 'Laki-laki', true, 0),
(206, 'Regu Serigala', 'SMP Test 6', '02.011', '08123456206', 'smptest6@gmail.com', 'SMP', 'Laki-laki', true, 0),
(207, 'Regu Banteng', 'SMP Test 7', '02.013', '08123456207', 'smptest7@gmail.com', 'SMP', 'Laki-laki', true, 0),
(211, 'Regu Melati', 'SMP Test 1', '02.002', '08123456211', 'smptest1@gmail.com', 'SMP', 'Perempuan', true, 0),
(212, 'Regu Mawar', 'SMP Test 2', '02.004', '08123456212', 'smptest2@gmail.com', 'SMP', 'Perempuan', true, 0),
(213, 'Regu Anggrek', 'SMP Test 3', '02.006', '08123456213', 'smptest3@gmail.com', 'SMP', 'Perempuan', true, 0),
(214, 'Regu Dahlia', 'SMP Test 4', '02.008', '08123456214', 'smptest4@gmail.com', 'SMP', 'Perempuan', true, 0),
(215, 'Regu Sakura', 'SMP Test 5', '02.010', '08123456215', 'smptest5@gmail.com', 'SMP', 'Perempuan', true, 0),
(216, 'Regu Lily', 'SMP Test 6', '02.012', '08123456216', 'smptest6@gmail.com', 'SMP', 'Perempuan', true, 0),
(217, 'Regu Teratai', 'SMP Test 7', '02.014', '08123456217', 'smptest7@gmail.com', 'SMP', 'Perempuan', true, 0);

-- 5. Masukkan 60 Dewan Juri Resmi (2 Juri per Cabang Lomba per Tingkatan)
INSERT INTO public.profiles (id, nama_lengkap, role, assigned_lomba_id, assigned_kategori, assigned_gender, is_verified)
VALUES
  ('10000000-0000-0000-0000-000000000001', 'Kak Rizky Pratama (Juri 1)', 'juri', (SELECT id FROM public.lomba WHERE kode_lomba = 'HMN' AND kategori = 'SD'), 'SD', 'SEMUA', true),
  ('10000000-0000-0000-0000-000000000002', 'Kak Siti Aminah (Juri 2)', 'juri', (SELECT id FROM public.lomba WHERE kode_lomba = 'HMN' AND kategori = 'SD'), 'SD', 'SEMUA', true),
  ('10000000-0000-0000-0000-000000000003', 'Kak Maya Anggraini (Juri 1)', 'juri', (SELECT id FROM public.lomba WHERE kode_lomba = 'TSB' AND kategori = 'SD'), 'SD', 'SEMUA', true),
  ('10000000-0000-0000-0000-000000000004', 'Kak Dian Permata (Juri 2)', 'juri', (SELECT id FROM public.lomba WHERE kode_lomba = 'TSB' AND kategori = 'SD'), 'SD', 'SEMUA', true),
  ('10000000-0000-0000-0000-000000000005', 'Kak Budi Santoso (Juri 1)', 'juri', (SELECT id FROM public.lomba WHERE kode_lomba = 'PNR' AND kategori = 'SD'), 'SD', 'SEMUA', true),
  ('10000000-0000-0000-0000-000000000006', 'Kak Hendra Wijaya (Juri 2)', 'juri', (SELECT id FROM public.lomba WHERE kode_lomba = 'PNR' AND kategori = 'SD'), 'SD', 'SEMUA', true),
  ('10000000-0000-0000-0000-000000000007', 'Kak dr. Faisal Akbar (Juri 1)', 'juri', (SELECT id FROM public.lomba WHERE kode_lomba = 'PGD' AND kategori = 'SD'), 'SD', 'SEMUA', true),
  ('10000000-0000-0000-0000-000000000008', 'Kak Ns. Rina Marlina (Juri 2)', 'juri', (SELECT id FROM public.lomba WHERE kode_lomba = 'PGD' AND kategori = 'SD'), 'SD', 'SEMUA', true),
  ('10000000-0000-0000-0000-000000000009', 'Kak Agus Setiawan (Juri 1)', 'juri', (SELECT id FROM public.lomba WHERE kode_lomba = 'SND' AND kategori = 'SD'), 'SD', 'SEMUA', true),
  ('10000000-0000-0000-0000-000000000010', 'Kak Eko Prasetyo (Juri 2)', 'juri', (SELECT id FROM public.lomba WHERE kode_lomba = 'SND' AND kategori = 'SD'), 'SD', 'SEMUA', true),
  ('10000000-0000-0000-0000-000000000011', 'Kak Letda Inf. Wahyu (Juri 1)', 'juri', (SELECT id FROM public.lomba WHERE kode_lomba = 'NAV' AND kategori = 'SD'), 'SD', 'SEMUA', true),
  ('10000000-0000-0000-0000-000000000012', 'Kak Sertu Bambang (Juri 2)', 'juri', (SELECT id FROM public.lomba WHERE kode_lomba = 'NAV' AND kategori = 'SD'), 'SD', 'SEMUA', true),
  ('10000000-0000-0000-0000-000000000013', 'Kak Ir. Dedi Mulyadi (Juri 1)', 'juri', (SELECT id FROM public.lomba WHERE kode_lomba = 'TKS' AND kategori = 'SD'), 'SD', 'SEMUA', true),
  ('10000000-0000-0000-0000-000000000014', 'Kak Yayan Sofyan (Juri 2)', 'juri', (SELECT id FROM public.lomba WHERE kode_lomba = 'TKS' AND kategori = 'SD'), 'SD', 'SEMUA', true),
  ('10000000-0000-0000-0000-000000000015', 'Kak Doni Tata (Juri 1)', 'juri', (SELECT id FROM public.lomba WHERE kode_lomba = 'PCK' AND kategori = 'SD'), 'SD', 'SEMUA', true),
  ('10000000-0000-0000-0000-000000000016', 'Kak Roni Gunawan (Juri 2)', 'juri', (SELECT id FROM public.lomba WHERE kode_lomba = 'PCK' AND kategori = 'SD'), 'SD', 'SEMUA', true),
  ('10000000-0000-0000-0000-000000000017', 'Kak Surya Saputra (Juri 1)', 'juri', (SELECT id FROM public.lomba WHERE kode_lomba = 'SMP' AND kategori = 'SD'), 'SD', 'SEMUA', true),
  ('10000000-0000-0000-0000-000000000018', 'Kak Dimas Seto (Juri 2)', 'juri', (SELECT id FROM public.lomba WHERE kode_lomba = 'SMP' AND kategori = 'SD'), 'SD', 'SEMUA', true),
  ('10000000-0000-0000-0000-000000000019', 'Kak Fajar Sidik (Juri 1)', 'juri', (SELECT id FROM public.lomba WHERE kode_lomba = 'MRS' AND kategori = 'SD'), 'SD', 'SEMUA', true),
  ('10000000-0000-0000-0000-000000000020', 'Kak Galih Ginanjar (Juri 2)', 'juri', (SELECT id FROM public.lomba WHERE kode_lomba = 'MRS' AND kategori = 'SD'), 'SD', 'SEMUA', true),
  ('10000000-0000-0000-0000-000000000021', 'Kak Apt. Dewi Sartika (Juri 1)', 'juri', (SELECT id FROM public.lomba WHERE kode_lomba = 'KIM' AND kategori = 'SD'), 'SD', 'SEMUA', true),
  ('10000000-0000-0000-0000-000000000022', 'Kak Apt. Nurul Fadhilah (Juri 2)', 'juri', (SELECT id FROM public.lomba WHERE kode_lomba = 'KIM' AND kategori = 'SD'), 'SD', 'SEMUA', true),
  ('10000000-0000-0000-0000-000000000023', 'Kak Ivan Gunawan (Juri 1)', 'juri', (SELECT id FROM public.lomba WHERE kode_lomba = 'KRN' AND kategori = 'SD'), 'SD', 'SEMUA', true),
  ('10000000-0000-0000-0000-000000000024', 'Kak Anne Avantie (Juri 2)', 'juri', (SELECT id FROM public.lomba WHERE kode_lomba = 'KRN' AND kategori = 'SD'), 'SD', 'SEMUA', true),
  ('10000000-0000-0000-0000-000000000025', 'Kak Drs. H. Mulyadi (Juri 1)', 'juri', (SELECT id FROM public.lomba WHERE kode_lomba = 'ADM' AND kategori = 'SD'), 'SD', 'SEMUA', true),
  ('10000000-0000-0000-0000-000000000026', 'Kak Hj. Romlah (Juri 2)', 'juri', (SELECT id FROM public.lomba WHERE kode_lomba = 'ADM' AND kategori = 'SD'), 'SD', 'SEMUA', true),
  ('10000000-0000-0000-0000-000000000027', 'Kak Anang Hermansyah (Juri 1)', 'juri', (SELECT id FROM public.lomba WHERE kode_lomba = 'FRP' AND kategori = 'SD'), 'SD', 'SEMUA', true),
  ('10000000-0000-0000-0000-000000000028', 'Kak Ashanty (Juri 2)', 'juri', (SELECT id FROM public.lomba WHERE kode_lomba = 'FRP' AND kategori = 'SD'), 'SD', 'SEMUA', true),
  ('10000000-0000-0000-0000-000000000029', 'Kak Chef Junaidi (Juri 1)', 'juri', (SELECT id FROM public.lomba WHERE kode_lomba = 'MSK' AND kategori = 'SD'), 'SD', 'SEMUA', true),
  ('10000000-0000-0000-0000-000000000030', 'Kak Chef Renatta (Juri 2)', 'juri', (SELECT id FROM public.lomba WHERE kode_lomba = 'MSK' AND kategori = 'SD'), 'SD', 'SEMUA', true),
  ('20000000-0000-0000-0000-000000000001', 'Kak Judika Sihotang (Juri 1)', 'juri', (SELECT id FROM public.lomba WHERE kode_lomba = 'HMN' AND kategori = 'SMP'), 'SMP', 'SEMUA', true),
  ('20000000-0000-0000-0000-000000000002', 'Kak Rossa Roslaina (Juri 2)', 'juri', (SELECT id FROM public.lomba WHERE kode_lomba = 'HMN' AND kategori = 'SMP'), 'SMP', 'SEMUA', true),
  ('20000000-0000-0000-0000-000000000003', 'Kak Didik Nini Thowok (Juri 1)', 'juri', (SELECT id FROM public.lomba WHERE kode_lomba = 'TSB' AND kategori = 'SMP'), 'SMP', 'SEMUA', true),
  ('20000000-0000-0000-0000-000000000004', 'Kak Soimah Pancawati (Juri 2)', 'juri', (SELECT id FROM public.lomba WHERE kode_lomba = 'TSB' AND kategori = 'SMP'), 'SMP', 'SEMUA', true),
  ('20000000-0000-0000-0000-000000000005', 'Kak Mayor Inf. Sugeng (Juri 1)', 'juri', (SELECT id FROM public.lomba WHERE kode_lomba = 'PNR' AND kategori = 'SMP'), 'SMP', 'SEMUA', true),
  ('20000000-0000-0000-0000-000000000006', 'Kak Kapten Czi. Joko (Juri 2)', 'juri', (SELECT id FROM public.lomba WHERE kode_lomba = 'PNR' AND kategori = 'SMP'), 'SMP', 'SEMUA', true),
  ('20000000-0000-0000-0000-000000000007', 'Kak dr. Tirta Mandira (Juri 1)', 'juri', (SELECT id FROM public.lomba WHERE kode_lomba = 'PGD' AND kategori = 'SMP'), 'SMP', 'SEMUA', true),
  ('20000000-0000-0000-0000-000000000008', 'Kak Ns. Siti Khodijah (Juri 2)', 'juri', (SELECT id FROM public.lomba WHERE kode_lomba = 'PGD' AND kategori = 'SMP'), 'SMP', 'SEMUA', true),
  ('20000000-0000-0000-0000-000000000009', 'Kak Rudi Hartono (Juri 1)', 'juri', (SELECT id FROM public.lomba WHERE kode_lomba = 'SND' AND kategori = 'SMP'), 'SMP', 'SEMUA', true),
  ('20000000-0000-0000-0000-000000000010', 'Kak Tommy Sugiarto (Juri 2)', 'juri', (SELECT id FROM public.lomba WHERE kode_lomba = 'SND' AND kategori = 'SMP'), 'SMP', 'SEMUA', true),
  ('20000000-0000-0000-0000-000000000011', 'Kak Kapten Aris Munandar (Juri 1)', 'juri', (SELECT id FROM public.lomba WHERE kode_lomba = 'NAV' AND kategori = 'SMP'), 'SMP', 'SEMUA', true),
  ('20000000-0000-0000-0000-000000000012', 'Kak Serka Danang (Juri 2)', 'juri', (SELECT id FROM public.lomba WHERE kode_lomba = 'NAV' AND kategori = 'SMP'), 'SMP', 'SEMUA', true),
  ('20000000-0000-0000-0000-000000000013', 'Kak Lukman Hakim (Juri 1)', 'juri', (SELECT id FROM public.lomba WHERE kode_lomba = 'TKS' AND kategori = 'SMP'), 'SMP', 'SEMUA', true),
  ('20000000-0000-0000-0000-000000000014', 'Kak Syahrul Gunawan (Juri 2)', 'juri', (SELECT id FROM public.lomba WHERE kode_lomba = 'TKS' AND kategori = 'SMP'), 'SMP', 'SEMUA', true),
  ('20000000-0000-0000-0000-000000000015', 'Kak Vicky Prasetyo (Juri 1)', 'juri', (SELECT id FROM public.lomba WHERE kode_lomba = 'PCK' AND kategori = 'SMP'), 'SMP', 'SEMUA', true),
  ('20000000-0000-0000-0000-000000000016', 'Kak Sandy Aulia (Juri 2)', 'juri', (SELECT id FROM public.lomba WHERE kode_lomba = 'PCK' AND kategori = 'SMP'), 'SMP', 'SEMUA', true),
  ('20000000-0000-0000-0000-000000000017', 'Kak Ade Raihan (Juri 1)', 'juri', (SELECT id FROM public.lomba WHERE kode_lomba = 'SMP' AND kategori = 'SMP'), 'SMP', 'SEMUA', true),
  ('20000000-0000-0000-0000-000000000018', 'Kak Firman Utina (Juri 2)', 'juri', (SELECT id FROM public.lomba WHERE kode_lomba = 'SMP' AND kategori = 'SMP'), 'SMP', 'SEMUA', true),
  ('20000000-0000-0000-0000-000000000019', 'Kak Gatot Subroto (Juri 1)', 'juri', (SELECT id FROM public.lomba WHERE kode_lomba = 'MRS' AND kategori = 'SMP'), 'SMP', 'SEMUA', true),
  ('20000000-0000-0000-0000-000000000020', 'Kak Herman Dzumafo (Juri 2)', 'juri', (SELECT id FROM public.lomba WHERE kode_lomba = 'MRS' AND kategori = 'SMP'), 'SMP', 'SEMUA', true),
  ('20000000-0000-0000-0000-000000000021', 'Kak Tri Handayani (Juri 1)', 'juri', (SELECT id FROM public.lomba WHERE kode_lomba = 'KIM' AND kategori = 'SMP'), 'SMP', 'SEMUA', true),
  ('20000000-0000-0000-0000-000000000022', 'Kak Wati Sukmawati (Juri 2)', 'juri', (SELECT id FROM public.lomba WHERE kode_lomba = 'KIM' AND kategori = 'SMP'), 'SMP', 'SEMUA', true),
  ('20000000-0000-0000-0000-000000000023', 'Kak Benny Simanjuntak (Juri 1)', 'juri', (SELECT id FROM public.lomba WHERE kode_lomba = 'KRN' AND kategori = 'SMP'), 'SMP', 'SEMUA', true),
  ('20000000-0000-0000-0000-000000000024', 'Kak Jerry Sambuaga (Juri 2)', 'juri', (SELECT id FROM public.lomba WHERE kode_lomba = 'KRN' AND kategori = 'SMP'), 'SMP', 'SEMUA', true),
  ('20000000-0000-0000-0000-000000000025', 'Kak Dra. Hj. Maryati (Juri 1)', 'juri', (SELECT id FROM public.lomba WHERE kode_lomba = 'ADM' AND kategori = 'SMP'), 'SMP', 'SEMUA', true),
  ('20000000-0000-0000-0000-000000000026', 'Kak Eni Rohaeni (Juri 2)', 'juri', (SELECT id FROM public.lomba WHERE kode_lomba = 'ADM' AND kategori = 'SMP'), 'SMP', 'SEMUA', true),
  ('20000000-0000-0000-0000-000000000027', 'Kak H. Asep Saepudin (Juri 1)', 'juri', (SELECT id FROM public.lomba WHERE kode_lomba = 'FRP' AND kategori = 'SMP'), 'SMP', 'SEMUA', true),
  ('20000000-0000-0000-0000-000000000028', 'Kak Usman Harun (Juri 2)', 'juri', (SELECT id FROM public.lomba WHERE kode_lomba = 'FRP' AND kategori = 'SMP'), 'SMP', 'SEMUA', true),
  ('20000000-0000-0000-0000-000000000029', 'Kak Chef Arnoldi (Juri 1)', 'juri', (SELECT id FROM public.lomba WHERE kode_lomba = 'MSK' AND kategori = 'SMP'), 'SMP', 'SEMUA', true),
  ('20000000-0000-0000-0000-000000000030', 'Kak Farah Quinn (Juri 2)', 'juri', (SELECT id FROM public.lomba WHERE kode_lomba = 'MSK' AND kategori = 'SMP'), 'SMP', 'SEMUA', true)
ON CONFLICT (id) DO UPDATE SET
  nama_lengkap = EXCLUDED.nama_lengkap,
  assigned_lomba_id = EXCLUDED.assigned_lomba_id,
  assigned_kategori = EXCLUDED.assigned_kategori,
  assigned_gender = EXCLUDED.assigned_gender,
  is_verified = true;

-- 6. Masukkan Penilaian Lengkap Secara Otomatis untuk Seluruh Peserta SD & SMP
DO $$
DECLARE
  rec_peserta RECORD;
  rec_juri RECORD;
  base_score INT;
  score_juri INT;
  j_offset INT;
BEGIN
  -- Iterasi setiap peserta yang telah dimasukkan
  FOR rec_peserta IN SELECT id, nomor_dada, kategori, gender FROM public.peserta ORDER BY nomor_dada LOOP
    -- Iterasi setiap juri yang ditugaskan pada kategori tingkatan peserta tersebut
    FOR rec_juri IN 
      SELECT id, assigned_lomba_id, nama_lengkap 
      FROM public.profiles 
      WHERE assigned_kategori = rec_peserta.kategori AND role = 'juri' AND assigned_lomba_id IS NOT NULL 
    LOOP
      -- Hitung base score berdasarkan kombinasi peserta dan lomba (rentang 72 - 94)
      base_score := 74 + (mod(abs(hashtext(rec_peserta.id::text || rec_juri.assigned_lomba_id::text)), 19));
      
      -- Variasi penilaian juri 1 dan juri 2 (selisih realistis 1-3 poin)
      IF rec_juri.nama_lengkap LIKE '%Juri 1%' THEN
        j_offset := 0;
      ELSE
        j_offset := (mod(abs(hashtext(rec_juri.id::text || rec_peserta.id::text)), 5)) - 2;
      END IF;

      score_juri := base_score + j_offset;
      IF score_juri > 98 THEN score_juri := 98; END IF;
      IF score_juri < 65 THEN score_juri := 65; END IF;

      -- Masukkan penilaian
      INSERT INTO public.penilaian (peserta_id, juri_id, lomba_id, nilai, updated_at)
      VALUES (rec_peserta.id, rec_juri.id, rec_juri.assigned_lomba_id, score_juri, now())
      ON CONFLICT (peserta_id, juri_id, lomba_id) DO UPDATE
      SET nilai = EXCLUDED.nilai, updated_at = now();
    END LOOP;
  END LOOP;
END $$;

-- 7. Hitung Akumulasi Total Nilai Rata-rata dari Seluruh Cabang Lomba
UPDATE public.peserta p
SET total_nilai = sub.total_akumulasi
FROM (
  SELECT 
    peserta_id,
    ROUND(SUM(rata_lomba), 2) as total_akumulasi
  FROM (
    SELECT 
      peserta_id,
      lomba_id,
      AVG(nilai) as rata_lomba
    FROM public.penilaian
    GROUP BY peserta_id, lomba_id
  ) per_lomba
  GROUP BY peserta_id
) sub
WHERE p.id = sub.peserta_id;

-- 8. Konfigurasi Publikasi Nilai & Pengumuman Juara (Tampil di Layar Broadcast)
DELETE FROM public.informasi WHERE text LIKE '__CONFIG_%' OR text LIKE '__PUBLISH%';
INSERT INTO public.informasi (text) VALUES
('__PUBLISH_ALL_SCORES__:true'),
('__CONFIG_SHOW_WINNERS:true');

-- Selesai! Seluruh 52 Peserta (19 SD & 7 SMP Putra-Putri), 60 Juri, dan Penilaian Lengkap telah siap diuji coba.
