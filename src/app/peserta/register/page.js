"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useOnlineStatus } from "@/lib/useOnlineStatus";

export default function RegisterPage() {
  const router = useRouter();
  const isOnline = useOnlineStatus();

  // Form states
  const [pangkalan, setPangkalan] = useState("");
  const [kwartirRanting, setKwartirRanting] = useState("Mekar Baru");
  const [alamatGudep, setAlamatGudep] = useState("");
  const [noGudep, setNoGudep] = useState("");
  const [namaRegu, setNamaRegu] = useState("");
  const [kategori, setKategori] = useState("SD");
  const [gender, setGender] = useState("Laki-laki");
  const [namaPembina, setNamaPembina] = useState("");
  const [kontakPerson, setKontakPerson] = useState("");
  const [email, setEmail] = useState("");

  // File Upload states
  const [fileKetersediaan, setFileKetersediaan] = useState(null);
  const [filePendaftaran, setFilePendaftaran] = useState(null);
  const [fileBiodataPeserta, setFileBiodataPeserta] = useState(null);
  const [fileBiodataPembina, setFileBiodataPembina] = useState(null);
  const [uploadingFiles, setUploadingFiles] = useState(false);

  // UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [nomorKapling, setNomorKapling] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isOnline) {
      setError("Koneksi internet terputus. Periksa jaringan Anda.");
      return;
    }

    // Input validations
    const cleanKwartir = kwartirRanting.trim();
    const cleanAlamat = alamatGudep.trim();
    const cleanNamaPembina = namaPembina.trim();
    const cleanPangkalan = `${pangkalan.trim()} - ${cleanAlamat} (Kwarran ${cleanKwartir})`;
    const cleanNoGudep = noGudep.trim();
    const cleanNamaRegu = namaRegu.trim();
    const cleanKontak = `${cleanNamaPembina} (${kontakPerson.trim()})`;
    const cleanEmail = email.trim();

    if (!pangkalan.trim() || !cleanAlamat || !cleanKwartir || !cleanNamaPembina || !cleanNoGudep || !cleanNamaRegu || !kontakPerson.trim() || !cleanEmail) {
      setError("Harap lengkapi semua bidang form pendaftaran termasuk email aktif.");
      return;
    }

    if (!fileKetersediaan || !filePendaftaran || !fileBiodataPeserta || !fileBiodataPembina) {
      setError("Harap unggah keempat berkas persyaratan yang diminta.");
      return;
    }

    setLoading(true);
    setUploadingFiles(true);
    setError(null);

    try {
      // 1. Upload files to Supabase Storage
      const uploadFile = async (file, folder) => {
        if (!file) return "";
        const fileExt = file.name.split('.').pop();
        const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const { data, error } = await supabase.storage
          .from("berkas_peserta")
          .upload(fileName, file, { cacheControl: "3600", upsert: false });
        
        if (error) throw error;
        
        const { data: publicUrlData } = supabase.storage.from("berkas_peserta").getPublicUrl(fileName);
        return publicUrlData.publicUrl;
      };

      let urlKetersediaan = "";
      let urlPendaftaran = "";
      let urlBiodataPeserta = "";
      let urlBiodataPembina = "";

      try {
        urlKetersediaan = await uploadFile(fileKetersediaan, "ketersediaan");
        urlPendaftaran = await uploadFile(filePendaftaran, "pendaftaran");
        urlBiodataPeserta = await uploadFile(fileBiodataPeserta, "biodata_peserta");
        urlBiodataPembina = await uploadFile(fileBiodataPembina, "biodata_pembina");
      } catch (uploadErr) {
        setError("Gagal mengunggah berkas. Pastikan ukuran file max 2MB dan koneksi stabil. " + uploadErr.message);
        setLoading(false);
        setUploadingFiles(false);
        return;
      }

      const payload = {
        nama_regu: cleanNamaRegu,
        pangkalan: cleanPangkalan,
        kategori,
        gender,
        no_gudep: cleanNoGudep,
        kontak_person: cleanKontak,
        email: cleanEmail,
        berkas_ketersediaan: urlKetersediaan,
        berkas_pendaftaran: urlPendaftaran,
        berkas_biodata_peserta: urlBiodataPeserta,
        berkas_biodata_pembina: urlBiodataPembina,
      };


      // 1. Primary: Server API Route endpoint (bypasses RLS restrictions)
      try {
        const apiRes = await fetch("/api/peserta/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const apiData = await apiRes.json();
        
        if (apiRes.ok && apiData.success) {
          setSuccess(true);
        } else {
          setError("Gagal mendaftar: " + (apiData.error || "Terjadi kesalahan pada server."));
        }
      } catch (err) {
        setError("Gagal menghubungi server pendaftaran: " + err.message);
      }


    } catch (err) {
      setError("Terjadi kesalahan sistem. Silakan coba lagi.");
    } finally {
      setLoading(false);
      setUploadingFiles(false);
    }
  };

  const handleFileChange = (e, setter) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert("Ukuran file maksimal 2MB!");
      e.target.value = "";
      return;
    }
    
    // Validate type
    const validTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      alert("Hanya file PDF, JPG, atau PNG yang diperbolehkan!");
      e.target.value = "";
      return;
    }
    
    setter(file);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 font-sans text-slate-200 relative overflow-hidden" style={{
      backgroundImage: "linear-gradient(135deg, rgba(3, 7, 18, 0.92) 0%, rgba(3, 7, 18, 0.96) 100%), url('/scout_event_live.png')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundAttachment: "fixed",
    }}>
      {/* Offline Banner */}
      {!isOnline && (
        <div className="offline-banner">
          ⚠️ KONEKSI TERPUTUS — Pendaftaran tidak dapat dikirim ke server
        </div>
      )}

      {/* Background Effects */}
      <div className="absolute top-[-20%] left-[10%] w-[500px] h-[500px] bg-emerald-500/8 blur-[120px] rounded-full pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-[-20%] right-[10%] w-[500px] h-[500px] bg-amber-500/5 blur-[120px] rounded-full pointer-events-none animate-pulse-glow" style={{ animationDelay: "2s" }} />
      <div className="bg-grid absolute inset-0 pointer-events-none" />

      <div className="relative z-10 max-w-lg w-full">
        {/* Logos Header Cluster */}
        <div className="text-center mb-6 flex justify-center items-center gap-3 md:gap-4 flex-wrap">
          <img src="/logo_wosm.png" alt="WOSM" className="h-14 md:h-18 w-auto object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]" />
          <img src="/logo_kwarran_mekarbaru.png" alt="Kwarran Mekar Baru" className="h-14 md:h-18 w-auto object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]" />
          <img src="/logo_lt2.png" alt="LT-II 2026" className="h-14 md:h-18 w-auto object-contain drop-shadow-[0_0_20px_rgba(245,166,35,0.5)]" />
          <img src="/logo_65.png" alt="HUT 65 Pramuka" className="h-14 md:h-18 w-auto object-contain drop-shadow-[0_0_20px_rgba(245,166,35,0.5)]" />
        </div>


        {/* Form Card */}
        <div className="glass-card p-6 md:p-8 shadow-[0_0_60px_rgba(245,166,35,0.08)] border border-amber-500/15">
          {!success ? (
            <>
              <div className="text-center space-y-2 mb-6">
                <h1 className="text-lg md:text-xl font-black tracking-widest text-white uppercase">
                  PENDAFTARAN PESERTA LOMBA TINGKAT II
                </h1>
                <p className="text-xs text-amber-400 font-bold uppercase tracking-wider">
                  Kwartir Ranting Mekar Baru
                </p>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-center text-sm font-semibold mb-6 flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Nama Regu */}
                  <div className="space-y-1.5">
                    <label className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-[0.1em]">
                      Nama Regu
                    </label>
                    <input
                      type="text"
                      value={namaRegu}
                      onChange={(e) => setNamaRegu(e.target.value)}
                      required
                      placeholder="Contoh: Rajawali"
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-700 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all text-sm"
                    />
                  </div>

                  {/* Asal Pangkalan */}
                  <div className="space-y-1.5">
                    <label className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-[0.1em]">
                      Nama Pangkalan (Sekolah)
                    </label>
                    <input
                      type="text"
                      value={pangkalan}
                      onChange={(e) => setPangkalan(e.target.value)}
                      required
                      placeholder="Contoh: SDN 1 Mekar Baru"
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-700 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Alamat Gudep */}
                  <div className="space-y-1.5">
                    <label className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-[0.1em]">
                      Alamat Lengkap Pangkalan / Gudep
                    </label>
                    <input
                      type="text"
                      value={alamatGudep}
                      onChange={(e) => setAlamatGudep(e.target.value)}
                      required
                      placeholder="Contoh: Jl. Raya Mekar Baru No 12, Kode Pos 15550"
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-700 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all text-sm"
                    />
                  </div>

                  {/* Kwartir Ranting */}
                  <div className="space-y-1.5">
                    <label className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-[0.1em]">
                      Kwartir Ranting
                    </label>
                    <input
                      type="text"
                      value={kwartirRanting}
                      onChange={(e) => setKwartirRanting(e.target.value)}
                      required
                      placeholder="Contoh: Mekar Baru"
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-700 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* No Gudep */}
                  <div className="space-y-1.5">
                    <label className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-[0.1em]">
                      No. Gugus Depan (Gudep)
                    </label>
                    <input
                      type="text"
                      value={noGudep}
                      onChange={(e) => setNoGudep(e.target.value)}
                      required
                      placeholder="Contoh: 01.001 - 01.002"
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-700 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all text-sm"
                    />
                  </div>

                  {/* Nama Pembina */}
                  <div className="space-y-1.5">
                    <label className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-[0.1em]">
                      Nama Pembina Pendamping
                    </label>
                    <input
                      type="text"
                      value={namaPembina}
                      onChange={(e) => setNamaPembina(e.target.value)}
                      required
                      placeholder="Contoh: Kak Budi Santoso"
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-700 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Kontak Person */}
                  <div className="space-y-1.5">
                    <label className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-[0.1em]">
                      No. WhatsApp Pembina
                    </label>
                    <input
                      type="text"
                      value={kontakPerson}
                      onChange={(e) => setKontakPerson(e.target.value)}
                      required
                      placeholder="Contoh: 0812xxxxxx"
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-700 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all text-sm"
                    />
                  </div>
                </div>

                {/* Email Aktif Pembina */}
                <div className="space-y-1.5">
                  <label className="text-[0.65rem] font-bold text-amber-400 uppercase tracking-[0.1em] flex items-center justify-between">
                    <span>Email Aktif Pembina / Regu</span>
                    <span className="text-[0.58rem] text-slate-500 font-normal lowercase">(untuk notifikasi no. kapling & verifikasi)</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Contoh: regu.rajawali@gmail.com"
                    className="w-full bg-slate-950/80 border border-amber-500/30 rounded-xl px-4 py-3 text-white placeholder-slate-700 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition-all text-sm font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  {/* Kategori Tingkat */}
                  <div className="space-y-1.5">
                    <label className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-[0.1em]">
                      Tingkat Lomba
                    </label>
                    <select
                      value={kategori}
                      onChange={(e) => setKategori(e.target.value)}
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all text-sm"
                    >
                      <option value="SD">SD / MI</option>
                      <option value="SMP">SMP / MTs</option>
                    </select>
                  </div>

                  {/* Gender / Regu */}
                  <div className="space-y-1.5">
                    <label className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-[0.1em]">
                      Kategori Regu (Gender)
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all text-sm"
                    >
                      <option value="Laki-laki">Putra (Laki-laki)</option>
                      <option value="Perempuan">Putri (Perempuan)</option>
                    </select>
                  </div>
                </div>

                {/* File Uploads Section */}
                <div className="mt-6 pt-4 border-t border-slate-800">
                  <h3 className="text-[0.7rem] font-black text-amber-400 mb-4 uppercase tracking-[0.1em]">
                    Upload Berkas Persyaratan (Max 2MB per file | PDF/JPG/PNG)
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-[0.1em]">
                        1. Formulir 01/LT-II 2026 (Kesediaan Gugus Depan)
                      </label>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileChange(e, setFileKetersediaan)}
                        required
                        className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2 text-white text-xs focus:outline-none focus:border-amber-500/50"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-[0.1em]">
                        2. Formulir 02/LT-II 2026 (Pendaftaran Peserta)
                      </label>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileChange(e, setFilePendaftaran)}
                        required
                        className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2 text-white text-xs focus:outline-none focus:border-amber-500/50"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-[0.1em]">
                        3. Formulir 03/LT-II 2026 (Biodata Peserta)
                      </label>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileChange(e, setFileBiodataPeserta)}
                        required
                        className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2 text-white text-xs focus:outline-none focus:border-amber-500/50"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-[0.1em]">
                        4. Formulir 03/LT-II 2026 (Biodata Pembina Pendamping)
                      </label>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileChange(e, setFileBiodataPembina)}
                        required
                        className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2 text-white text-xs focus:outline-none focus:border-amber-500/50"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !isOnline}
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-black py-3.5 px-4 rounded-xl mt-4 transition-all duration-300 shadow-[0_8px_25px_rgba(245,166,35,0.2)] hover:shadow-[0_12px_35px_rgba(245,166,35,0.3)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-[0_8px_25px_rgba(245,166,35,0.2)] tracking-wider text-sm"
                >
                  {uploadingFiles ? "MENGUNGGAH BERKAS..." : loading ? "MENGIRIM PENDAFTARAN..." : "DAFTAR SEKARANG"}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-6 space-y-6 animate-fade-in">
              <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="space-y-2">
                <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-wider">
                  MENUNGGU VERIFIKASI!
                </h2>
                <p className="text-sm text-slate-300 max-w-sm mx-auto">
                  Data Regu <strong className="text-emerald-400">{namaRegu}</strong> telah tersimpan dan <strong className="text-amber-400">sedang ditinjau oleh Admin</strong>.
                </p>
                <p className="text-xs text-slate-400 mt-2">
                  Nomor kapling dan bukti verifikasi akan dikirimkan ke email <strong>{email}</strong> setelah disetujui.
                </p>
              </div>
              <div className="pt-4">
                <button
                  onClick={() => {
                    setSuccess(false);
                    setPangkalan("");
                    setNoGudep("");
                    setNamaRegu("");
                    setKontakPerson("");
                    setNomorKapling("");
                    setEmailSent(false);
                  }}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-2.5 px-6 rounded-lg text-xs tracking-wider uppercase transition-colors"
                >
                  Daftar Regu Lain
                </button>
              </div>
            </div>
          )}

          <div className="mt-6 text-center border-t border-slate-800/40 pt-4">
            <a
              href="/"
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              ← Kembali ke Halaman Utama
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
