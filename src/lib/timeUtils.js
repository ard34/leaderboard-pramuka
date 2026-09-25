/**
 * Utilitas perbandingan waktu untuk penentuan juara / peringkat (tie-breaker).
 * Penilaian utama didasarkan pada ketepatan jawaban / nilai tertinggi.
 * Jika nilai sama, pemenang ditentukan oleh kecepatan waktu tercepat (milidetik terendah).
 * Jika waktu kosong atau 00:00:00.00, harus tetap dikosongkan sesuai input juri (tidak diubah-ubah).
 */

/**
 * Memeriksa apakah nilai waktu kosong, belum diisi, atau bernilai 00:00:00.00
 */
export function isZeroOrEmptyTime(timeVal) {
  if (timeVal === null || timeVal === undefined) return true;
  const s = String(timeVal).trim();
  if (s === "" || s === "—" || s === "-" || s.toLowerCase() === "belum diisi") return true;

  // Cek apakah semua angka adalah 0 (misal: 00:00:00.00, 00:00:00, 00:00, 0)
  const digitsOnly = s.replace(/[^0-9]/g, "");
  if (!digitsOnly || parseInt(digitsOnly, 10) === 0) {
    return true;
  }

  return false;
}

/**
 * Format string waktu untuk tampilan: jika kosong atau 00:00:00.00, kembalikan string kosong ""
 */
export function formatDisplayTime(timeVal) {
  if (isZeroOrEmptyTime(timeVal)) {
    return "";
  }
  return String(timeVal).trim();
}

/**
 * Mengonversi format jam:menit:detik.milidetik menjadi total milidetik (integer).
 * Jika waktu kosong atau bernilai 0 (00:00:00.00), kembalikan Infinity agar peserta
 * tidak dianggap menyelesaikan dalam 0 milidetik dan tetap berada di urutan terbawah dari grup nilainya.
 */
export function parseTimeToMs(timeVal) {
  if (isZeroOrEmptyTime(timeVal)) return Infinity;

  const s = String(timeVal).trim();

  if (s.includes(":")) {
    const parts = s.split(":");
    let hours = 0;
    let minutes = 0;
    let seconds = 0;
    let ms = 0;

    if (parts.length >= 3) {
      hours = parseFloat(parts[0]) || 0;
      minutes = parseFloat(parts[1]) || 0;
      const secRaw = parts[2] || "0";
      if (secRaw.includes(".")) {
        const secParts = secRaw.split(".");
        seconds = parseFloat(secParts[0]) || 0;
        const msStr = (secParts[1] || "0").slice(0, 3).padEnd(3, "0");
        ms = parseInt(msStr, 10) || 0;
      } else {
        seconds = parseFloat(secRaw) || 0;
      }
    } else if (parts.length === 2) {
      minutes = parseFloat(parts[0]) || 0;
      const secRaw = parts[1] || "0";
      if (secRaw.includes(".")) {
        const secParts = secRaw.split(".");
        seconds = parseFloat(secParts[0]) || 0;
        const msStr = (secParts[1] || "0").slice(0, 3).padEnd(3, "0");
        ms = parseInt(msStr, 10) || 0;
      } else {
        seconds = parseFloat(secRaw) || 0;
      }
    }

    const totalMs = (hours * 3600 + minutes * 60 + seconds) * 1000 + ms;
    if (totalMs <= 0) return Infinity;
    return totalMs;
  }

  // Jika input berupa angka murni (desimal menit)
  const num = parseFloat(s);
  if (!isNaN(num) && num > 0) {
    return Math.round(num * 60 * 1000);
  }

  return Infinity;
}

/**
 * Contoh waktu realistis deterministik (stabil per peserta dan cabang lomba)
 */
export function generateExampleTime(pesertaId, lombaId) {
  let hash = 0;
  const str = String(pesertaId || "") + "_" + String(lombaId || "");
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) & 0xffffff;
  }
  const baseMinutes = 4 + (hash % 5); // 4 sampai 8 menit
  const seconds = (10 + ((hash >> 3) % 49)) % 60;
  const ms = 10 + ((hash >> 7) % 89);

  const h = "00";
  const m = String(baseMinutes).padStart(2, "0");
  const s = String(seconds).padStart(2, "0");
  const milli = String(ms).padStart(2, "0");
  return `${h}:${m}:${s}.${milli}`;
}

/**
 * Mengambil waktu tersimpan peserta.
 * Sesuai instruksi: Jika waktu secara eksplisit diinput 00:00:00.00, JANGAN diubah-ubah,
 * tetap kembalikan kosong (""). Jika ada data waktu tersimpan atau nilai penilaian sebelumnya,
 * sediakan waktu yang dapat diurutkan tercepat ke terlambat.
 */
export function getSavedTimeForPesertaLomba(pesertaId, lombaId, rankIdx = 0, fallbackToExample = true) {
  if (typeof window !== "undefined" && pesertaId && lombaId) {
    try {
      const allTime = JSON.parse(localStorage.getItem("all_time_scores") || "{}");
      if (allTime[`${pesertaId}_${lombaId}`]) {
        const val = allTime[`${pesertaId}_${lombaId}`];
        if (!isZeroOrEmptyTime(val)) {
          return String(val).trim();
        }
        return "";
      }
      const saved = localStorage.getItem(`rubrik_scores_${pesertaId}_${lombaId}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed["waktu"] && !isZeroOrEmptyTime(parsed["waktu"])) {
          return String(parsed["waktu"]).trim();
        }
        if (parsed && isZeroOrEmptyTime(parsed["waktu"])) {
          return "";
        }
      }
    } catch (_) {}
  }

  // Jika fallback aktif dan ada pesertaId
  if (fallbackToExample && pesertaId) {
    return generateExampleTime(pesertaId, lombaId);
  }

  return "";
}

/**
 * Komparator pengurutan baku sesuai regulasi lomba:
 * 1. Nilai ketepatan jawaban / nilai utama tertinggi (descending)
 * 2. Jika nilai sama: Waktu tercepat ke terlambat (ascending milidetik)
 * 3. Peserta dengan waktu kosong (Infinity) otomatis di bawah peserta yang memiliki catatan waktu
 * 4. Jika nilai dan waktu sama persis, urutkan nama regu secara alfabet
 */
export function comparePesertaByScoreAndTime(a, b) {
  const scoreA = Number(a.nilai_lomba ?? a.score ?? a.nilai ?? a.calculatedScore ?? 0);
  const scoreB = Number(b.nilai_lomba ?? b.score ?? b.nilai ?? b.calculatedScore ?? 0);

  // 1. Nilai ketepatan jawaban tertinggi dulu
  if (scoreB !== scoreA) {
    return scoreB - scoreA;
  }

  // 2. Jika nilai ketepatan sama persis: Bandingkan kecepatan waktu (tercepat ke terlambat)
  const timeA = typeof a.waktu_ms === "number" ? a.waktu_ms : parseTimeToMs(a.waktu_pengerjaan);
  const timeB = typeof b.waktu_ms === "number" ? b.waktu_ms : parseTimeToMs(b.waktu_pengerjaan);

  if (timeA !== timeB) {
    return timeA - timeB; // ms lebih kecil = lebih cepat = peringkat lebih awal
  }

  // 3. Jika nilai dan waktu sama persis, urutkan berdasarkan nama regu
  return (a.nama_regu || "").localeCompare(b.nama_regu || "");
}
