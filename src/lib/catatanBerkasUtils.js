/**
 * Utilitas untuk mengelola field catatan_berkas pada tabel peserta.
 * 
 * Format penyimpanan di DB:
 * - Jika hanya catatan admin: string biasa, misalnya "DITOLAK: alasan"
 * - Jika ada rubrik juri: JSON string, misalnya {"admin_notes": "...", "rubrik": {...}}
 * - Jika keduanya kosong: "" atau null
 */

export function parseCatatanBerkas(catatanBerkas) {
  if (!catatanBerkas) return { admin_notes: "", rubrik: {} };

  const raw = typeof catatanBerkas === "string" ? catatanBerkas.trim() : catatanBerkas;

  if (typeof raw === "object" && !Array.isArray(raw)) {
    return {
      admin_notes: raw.admin_notes || "",
      rubrik: raw.rubrik || {},
    };
  }

  if (typeof raw === "string" && raw.startsWith("{")) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        return {
          admin_notes: parsed.admin_notes || "",
          rubrik: parsed.rubrik || {},
        };
      }
    } catch (_) {}
  }

  return {
    admin_notes: String(raw),
    rubrik: {},
  };
}

export function getAdminNotes(catatanBerkas) {
  return parseCatatanBerkas(catatanBerkas).admin_notes;
}

export function getRubrikFromCatatan(catatanBerkas) {
  return parseCatatanBerkas(catatanBerkas).rubrik;
}

export function getRubrikForLomba(catatanBerkas, lombaId) {
  const rubrik = getRubrikFromCatatan(catatanBerkas);
  return rubrik[lombaId] || null;
}

export function buildCatatanWithRubrik(existingCatatanBerkas, lombaId, rubrikData) {
  const { admin_notes, rubrik } = parseCatatanBerkas(existingCatatanBerkas);
  const updatedRubrik = { ...rubrik, [lombaId]: rubrikData };

  return JSON.stringify({
    admin_notes,
    rubrik: updatedRubrik,
  });
}

export function buildCatatanWithAdminNotes(existingCatatanBerkas, newAdminNotes) {
  const { rubrik } = parseCatatanBerkas(existingCatatanBerkas);
  const hasRubrik = Object.keys(rubrik).length > 0;

  if (!hasRubrik) {
    return newAdminNotes || "";
  }

  return JSON.stringify({
    admin_notes: newAdminNotes || "",
    rubrik,
  });
}

export function isDitolak(catatanBerkas) {
  const notes = getAdminNotes(catatanBerkas);
  return notes.startsWith("DITOLAK");
}
