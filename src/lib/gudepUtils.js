/**
 * Memisahkan No. Gugus Depan berdasarkan gender.
 * Jika format "A-B" atau "A – B", Putra = A, Putri = B.
 * Jika hanya satu nomor, kembalikan nomor itu langsung.
 *
 * File ini aman digunakan di client ("use client") maupun server.
 */
export function getNoGudepByGender(noGudep, gender) {
  if (!noGudep) return "—";
  const cleaned = noGudep.trim();
  // Coba pisahkan dengan "-" atau "–" (en-dash)
  // Contoh: "13.007-13.008" atau "13.007 - 13.008" atau "13.007 – 13.008"
  const parts = cleaned.split(/\s*[–\-]\s*/);
  if (parts.length >= 2) {
    const isPutra =
      gender?.toLowerCase().includes("laki") ||
      gender?.toLowerCase().includes("putra");
    return isPutra ? parts[0].trim() : parts[1].trim();
  }
  return cleaned;
}
