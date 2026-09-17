-- ============================================================
-- SINKRONISASI 12 NAMA CABANG MATA LOMBA RESMI LT-II MEKAR BARU
-- ============================================================

UPDATE public.lomba SET nama_lomba = 'Lomba Paduan Suara' WHERE kode_lomba = 'HMN';
UPDATE public.lomba SET nama_lomba = 'Lomba Tari Nusantara' WHERE kode_lomba = 'TSB';
UPDATE public.lomba SET nama_lomba = 'Lomba Pionering' WHERE kode_lomba = 'PNR';
UPDATE public.lomba SET nama_lomba = 'PPGD' WHERE kode_lomba = 'PGD';
UPDATE public.lomba SET nama_lomba = 'Sandi - Sandi' WHERE kode_lomba = 'SND';
UPDATE public.lomba SET nama_lomba = 'Orienteering Navigasi' WHERE kode_lomba = 'NAV';
UPDATE public.lomba SET nama_lomba = 'Menaksir' WHERE kode_lomba = 'TKS';
UPDATE public.lomba SET nama_lomba = 'Semaphore' WHERE kode_lomba = 'SMP';
UPDATE public.lomba SET nama_lomba = 'Morse' WHERE kode_lomba = 'MRS';
UPDATE public.lomba SET nama_lomba = 'Lomba KIM' WHERE kode_lomba = 'KIM';
UPDATE public.lomba SET nama_lomba = 'Lomba Karnaval' WHERE kode_lomba = 'KRN';
UPDATE public.lomba SET nama_lomba = 'Masak Nusantara' WHERE kode_lomba = 'MSK';

-- Verifikasi hasil update
SELECT id, kode_lomba, nama_lomba, kategori FROM public.lomba ORDER BY kategori, kode_lomba;
