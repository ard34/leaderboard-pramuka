import PDFDocument from "pdfkit";

/**
 * Memisahkan No. Gugus Depan berdasarkan gender.
 * Jika format "A-B" atau "A – B", Putra = A, Putri = B.
 * Jika hanya satu nomor, kembalikan nomor itu langsung.
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

/**
 * Generate buffer PDF Bukti Pendaftaran.
 * @param {object} peserta - Data peserta dari Supabase
 * @param {string} peserta_id - UUID peserta
 * @param {string} kaplingFormatted - Nomor kapling (misal "001")
 * @returns {Promise<Buffer>}
 */
export function generatePdfBukti(peserta, peserta_id, kaplingFormatted) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margin: 55,
      info: {
        Title: `Bukti Pendaftaran - ${peserta.nama_regu}`,
        Author: "Panitia LT-II Kwarran Mekar Baru 2026",
      },
    });

    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const pageW = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const noGudep = getNoGudepByGender(peserta.no_gudep, peserta.gender);
    const namaRegu = peserta.nama_regu || "—";
    const pangkalan = peserta.pangkalan || "—";
    const kategori = peserta.kategori || "—";
    const jenisKelamin = peserta.gender || "—";
    const tglDaftar = new Date(peserta.created_at).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const noReg = peserta_id.slice(0, 8).toUpperCase();

    // ── KOP SURAT ─────────────────────────────────────────────────────────────
    doc
      .fontSize(15)
      .font("Helvetica-Bold")
      .text("GERAKAN PRAMUKA", { align: "center" });
    doc
      .fontSize(13)
      .font("Helvetica-Bold")
      .text("KWARTIR RANTING MEKAR BARU", { align: "center" });
    doc
      .fontSize(9)
      .font("Helvetica")
      .text(
        "Jl. KH Suhaemi Ds. Mekar Baru Kec. Mekar Baru Kab. Tangerang Banten 15550",
        { align: "center" }
      );
    doc
      .fontSize(8)
      .font("Helvetica")
      .fillColor("#1d4ed8")
      .text(
        "Website: mekarbaru.kwarcabtangerang.or.id  //  Email: kwarran.mekarbaru@gmail.com",
        { align: "center" }
      )
      .fillColor("black");

    // Garis pembatas kop
    const y1 = doc.y + 6;
    doc.moveTo(55, y1).lineTo(55 + pageW, y1).lineWidth(2).stroke();
    doc.moveTo(55, y1 + 4).lineTo(55 + pageW, y1 + 4).lineWidth(0.5).stroke();
    doc.moveDown(1);

    // ── JUDUL ─────────────────────────────────────────────────────────────────
    doc
      .fontSize(13)
      .font("Helvetica-Bold")
      .text("TANDA BUKTI VERIFIKASI PENDAFTARAN", { align: "center", underline: true });
    doc.moveDown(0.3);
    doc
      .fontSize(10)
      .font("Helvetica")
      .text(`No. Registrasi: ${noReg}`, { align: "center" });
    doc.moveDown(1);

    // ── ISI SURAT ─────────────────────────────────────────────────────────────
    doc
      .fontSize(11)
      .font("Helvetica")
      .text(
        "Panitia Pelaksana Lomba Tingkat Regu Pramuka Penggalang Dua (LT-II) Kwartir Ranting Mekar Baru Tahun 2026 menerangkan bahwa:",
        { align: "justify" }
      );
    doc.moveDown(0.8);

    // Tabel data peserta
    const col1X = 75;   // Label
    const col2X = 220;  // ":"
    const col3X = 235;  // Nilai

    const rows = [
      ["Nama Regu", `${namaRegu}${kaplingFormatted ? ` (Kapling #${kaplingFormatted})` : ""}`],
      ["Pangkalan / Sekolah", pangkalan],
      ["No. Gugus Depan", noGudep],
      ["Kategori Peserta", kategori],
      ["Jenis Kelamin", jenisKelamin],
      ["Tanggal Daftar", tglDaftar],
    ];

    rows.forEach(([label, value]) => {
      const startY = doc.y;
      doc.font("Helvetica-Bold").fontSize(11).text(label, col1X, startY, { width: col2X - col1X - 4 });
      doc.font("Helvetica").text(":", col2X, startY, { width: 14 });
      doc.text(value, col3X, startY, { width: pageW - (col3X - 55) });
      doc.moveDown(0.35);
    });

    doc.moveDown(0.8);
    doc
      .fontSize(11)
      .font("Helvetica")
      .text(
        "Telah menyerahkan kelengkapan dokumen persyaratan dan dinyatakan ",
        { continued: true }
      )
      .font("Helvetica-Bold")
      .text("SAH & TERVERIFIKASI", { continued: true })
      .font("Helvetica")
      .text(
        ` sebagai Peserta LT-II Kwartir Ranting Mekar Baru Tahun 2026.`,
        { align: "justify" }
      );

    doc.moveDown(1);

    // ── BOX INSTRUKSI ─────────────────────────────────────────────────────────
    const boxTop = doc.y;
    const instruksi = [
      "1. Surat ini adalah bukti sah pendaftaran regu.",
      "2. Silakan cetak (print) / simpan surat ini sebagai PDF.",
      "3. Bawa surat fisik/PDF ini saat registrasi ulang di lokasi perkemahan (Bumi Perkemahan) untuk ditukarkan dengan Nomor Kapling Tenda dan ID Card.",
    ];
    const instrHeight = instruksi.length * 20 + 30;
    doc
      .rect(55, boxTop, pageW, instrHeight)
      .lineWidth(0.8)
      .strokeColor("black")
      .fillColor("#f8f8f8")
      .fillAndStroke()
      .fillColor("black");

    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .text("Instruksi untuk Peserta:", 65, boxTop + 10);
    instruksi.forEach((line, i) => {
      doc.font("Helvetica").fontSize(10).text(line, 65, boxTop + 26 + i * 18, {
        width: pageW - 20,
      });
    });
    doc.y = boxTop + instrHeight + 16;
    doc.moveDown(1.5);

    // ── TTD ───────────────────────────────────────────────────────────────────
    const ttdX = 55 + pageW / 2;
    doc
      .fontSize(11)
      .font("Helvetica")
      .text(`Mekar Baru, ${tglDaftar}`, ttdX, doc.y, { width: pageW / 2, align: "center" });
    doc.text("Panitia / Admin", ttdX, doc.y, { width: pageW / 2, align: "center" });
    doc.text("LT-II Kwarran Mekar Baru", ttdX, doc.y, { width: pageW / 2, align: "center" });

    doc.end();
  });
}
