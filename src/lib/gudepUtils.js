/**
 * Memisahkan No. Gugus Depan berdasarkan gender.
 *
 * HANYA memisahkan jika format benar-benar pasangan Putra/Putri,
 * yaitu kedua sisi separator mengandung titik (contoh: "13.007-13.008").
 *
 * Nomor gudep tunggal yang mengandung dash (contoh: "13-001")
 * dikembalikan utuh tanpa dipisah.
 *
 * File ini aman digunakan di client ("use client") maupun server.
 */
export function getNoGudepByGender(noGudep, gender) {
  if (!noGudep) return "—";
  const cleaned = noGudep.trim();

  // Coba pisahkan dengan "-" atau "–" (en-dash)
  // Contoh pasangan: "13.007-13.008" atau "13.007 – 13.008"
  const parts = cleaned.split(/\s*[–\-]\s*/);

  // Hanya anggap sebagai pasangan Putra/Putri jika:
  // 1. Ada tepat 2 bagian
  // 2. KEDUA bagian mengandung titik (format gudep lengkap, misal "13.007")
  // Ini mencegah nomor tunggal seperti "13-001" dipecah jadi "13" dan "001"
  if (parts.length === 2 && parts[0].includes(".") && parts[1].includes(".")) {
    const isPutra =
      gender?.toLowerCase().includes("laki") ||
      gender?.toLowerCase().includes("putra");
    return isPutra ? parts[0].trim() : parts[1].trim();
  }

  // Kembalikan nomor gudep utuh (termasuk format "13-001", "13037", dll.)
  return cleaned;
}
