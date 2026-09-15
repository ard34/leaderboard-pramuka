-- ============================================================
-- SQL INSERT: DAFTAR SEKOLAH TEST PRAMUKA LT-II
-- 19 Sekolah SD/MI (19 Putra & 19 Putri = 38 Regu)
-- 7 Sekolah SMP/MTs (7 Putra & 7 Putri = 14 Regu)
-- Total: 52 Regu Resmi (Langsung Aktif & Terverifikasi)
-- ============================================================

-- 1. Bersihkan data peserta lama
DELETE FROM public.penilaian;
DELETE FROM public.peserta;

-- 2. Masukkan 38 Regu SD / MI (SD Test 1 s/d SD Test 19)
INSERT INTO public.peserta (nomor_dada, nama_regu, pangkalan, no_gudep, kontak_person, email, kategori, gender, is_verified, total_nilai) VALUES
-- SD Test Putra (101 - 119)
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

-- SD Test Putri (121 - 139)
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

-- 3. Masukkan 14 Regu SMP / MTs (SMP Test 1 s/d SMP Test 7)
INSERT INTO public.peserta (nomor_dada, nama_regu, pangkalan, no_gudep, kontak_person, email, kategori, gender, is_verified, total_nilai) VALUES
-- SMP Test Putra (201 - 207)
(201, 'Regu Harimau', 'SMP Test 1', '02.001', '08123456201', 'smptest1@gmail.com', 'SMP', 'Laki-laki', true, 0),
(202, 'Regu Singa', 'SMP Test 2', '02.003', '08123456202', 'smptest2@gmail.com', 'SMP', 'Laki-laki', true, 0),
(203, 'Regu Rajawali', 'SMP Test 3', '02.005', '08123456203', 'smptest3@gmail.com', 'SMP', 'Laki-laki', true, 0),
(204, 'Regu Garuda', 'SMP Test 4', '02.007', '08123456204', 'smptest4@gmail.com', 'SMP', 'Laki-laki', true, 0),
(205, 'Regu Elang', 'SMP Test 5', '02.009', '08123456205', 'smptest5@gmail.com', 'SMP', 'Laki-laki', true, 0),
(206, 'Regu Serigala', 'SMP Test 6', '02.011', '08123456206', 'smptest6@gmail.com', 'SMP', 'Laki-laki', true, 0),
(207, 'Regu Banteng', 'SMP Test 7', '02.013', '08123456207', 'smptest7@gmail.com', 'SMP', 'Laki-laki', true, 0),

-- SMP Test Putri (211 - 217)
(211, 'Regu Melati', 'SMP Test 1', '02.002', '08123456211', 'smptest1@gmail.com', 'SMP', 'Perempuan', true, 0),
(212, 'Regu Mawar', 'SMP Test 2', '02.004', '08123456212', 'smptest2@gmail.com', 'SMP', 'Perempuan', true, 0),
(213, 'Regu Anggrek', 'SMP Test 3', '02.006', '08123456213', 'smptest3@gmail.com', 'SMP', 'Perempuan', true, 0),
(214, 'Regu Dahlia', 'SMP Test 4', '02.008', '08123456214', 'smptest4@gmail.com', 'SMP', 'Perempuan', true, 0),
(215, 'Regu Sakura', 'SMP Test 5', '02.010', '08123456215', 'smptest5@gmail.com', 'SMP', 'Perempuan', true, 0),
(216, 'Regu Lily', 'SMP Test 6', '02.012', '08123456216', 'smptest6@gmail.com', 'SMP', 'Perempuan', true, 0),
(217, 'Regu Teratai', 'SMP Test 7', '02.014', '08123456217', 'smptest7@gmail.com', 'SMP', 'Perempuan', true, 0);
