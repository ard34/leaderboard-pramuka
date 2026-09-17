/**
 * Utilitas perbandingan waktu untuk penentuan juara / peringkat (tie-breaker).
 * Penilaian utama didasarkan pada ketepatan nilai tertinggi.
 * Jika nilai sama, pemenang ditentukan oleh waktu tercepat (milidetik terendah).
 */

export function parseTimeToMs(timeVal) {
  if (timeVal === null || timeVal === undefined || timeVal === "") return Infinity;
  const s = String(timeVal).trim();
  if (s === "—" || s === "-" || s.toLowerCase() === "belum diisi") return Infinity;

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

    return (hours * 3600 + minutes * 60 + seconds) * 1000 + ms;
  }

  // Jika input berupa angka murni (desimal menit)
  const num = parseFloat(s);
  if (!isNaN(num) && num > 0) {
    return Math.round(num * 60 * 1000);
  }

  return Infinity;
}

export function generateExampleTime(pesertaId, lombaId, rankIdx = 0) {
  let hash = 0;
  const str = String(pesertaId || "") + String(lombaId || "");
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) & 0xffffff;
  }
  // Menghasilkan catatan waktu realistis dalam format jam:menit:detik.milidetik
  const baseMinutes = Math.min(25, 5 + Math.floor(rankIdx * 0.9) + (hash % 3));
  const seconds = (14 + (hash % 40) + rankIdx * 5) % 60;
  const ms = 10 + (hash % 85);

  const h = "00";
  const m = String(baseMinutes).padStart(2, "0");
  const s = String(seconds).padStart(2, "0");
  const milli = String(ms).padStart(2, "0");
  return `${h}:${m}:${s}.${milli}`;
}

export function getSavedTimeForPesertaLomba(pesertaId, lombaId, rankIdx = 0, fallbackToExample = true) {
  if (typeof window !== "undefined" && pesertaId && lombaId) {
    try {
      const allTime = JSON.parse(localStorage.getItem("all_time_scores") || "{}");
      if (allTime[`${pesertaId}_${lombaId}`]) {
        return allTime[`${pesertaId}_${lombaId}`];
      }
      const saved = localStorage.getItem(`rubrik_scores_${pesertaId}_${lombaId}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed["waktu"] && String(parsed["waktu"]).trim() !== "") {
          return parsed["waktu"];
        }
      }
    } catch (_) {}
  }
  if (fallbackToExample && pesertaId) {
    return generateExampleTime(pesertaId, lombaId, rankIdx);
  }
  return null;
}
