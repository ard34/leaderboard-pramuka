import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";
import { generatePdfBukti } from "@/lib/generatePdfBukti";
export async function POST(request) {
  try {
    const body = await request.json();
    const { peserta_id, nomor_kapling } = body;

    if (!peserta_id) {
      return NextResponse.json(
        { error: "Parameter peserta_id wajib diisi." },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: "Konfigurasi Supabase Server belum lengkap." },
        { status: 500 }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    // 1. Fetch participant details
    const { data: peserta, error: fetchError } = await supabaseAdmin
      .from("peserta")
      .select("*")
      .eq("id", peserta_id)
      .single();

    if (fetchError || !peserta) {
      return NextResponse.json(
        { error: "Peserta tidak ditemukan: " + (fetchError?.message || "") },
        { status: 404 }
      );
    }

    // 2. Determine Kapling Number (Putra = Ganjil / 001, Putri = Genap / 002)
    let finalKapling = Number(nomor_kapling);
    if (!finalKapling || isNaN(finalKapling) || finalKapling <= 0) {
      if (peserta.nomor_dada) {
        finalKapling = Number(peserta.nomor_dada);
      } else {
        // Query active participants with kaplings to determine next odd/even
        const { data: allPeserta } = await supabaseAdmin
          .from("peserta")
          .select("nomor_dada, gender")
          .not("nomor_dada", "is", null);

        const isPutra = peserta.gender?.toLowerCase().includes("laki") || peserta.gender?.toLowerCase().includes("putra");
        const validKaplings = (allPeserta || [])
          .map((p) => Number(p.nomor_dada))
          .filter((n) => !isNaN(n) && n > 0);

        if (isPutra) {
          const oddNumbers = validKaplings.filter((n) => n % 2 !== 0);
          finalKapling = oddNumbers.length > 0 ? Math.max(...oddNumbers) + 2 : 1;
        } else {
          const evenNumbers = validKaplings.filter((n) => n % 2 === 0);
          finalKapling = evenNumbers.length > 0 ? Math.max(...evenNumbers) + 2 : 2;
        }
      }
    }

    const kaplingFormatted = String(finalKapling).padStart(3, "0");
    peserta.nomor_dada = finalKapling;

    // 3. Update participant to verified with nomor kapling
    const payload = {
      is_verified: true,
      nomor_dada: finalKapling,
    };
    const { error: updateError } = await supabaseAdmin
      .from("peserta")
      .update(payload)
      .eq("id", peserta_id);

    if (updateError) {
      return NextResponse.json(
        { error: "Gagal mengupdate status verifikasi: " + updateError.message },
        { status: 500 }
      );
    }

    // 4. Extract valid email address from email field or kontak_person
    let emailSent = false;
    let emailStatusMessage = "";

    const rawTarget = `${peserta.email || ""} ${peserta.kontak_person || ""}`;
    const emailMatch = rawTarget.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const targetEmail = emailMatch ? emailMatch[0] : null;

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.siloti-kwaranmekarbaru.my.id";
    const cetakUrl = `${baseUrl}/peserta/cetak/${peserta.id}`;
    const groupWaUrl = "https://chat.whatsapp.com/G8fYg03xvHjL2lsVKCorPG?s=cl&p=a&mlu=4&ilr=4";

    const mailSubject = `[VERIFIKASI RESMI] Regu ${peserta.nama_regu} - NO. KAPLING: #${kaplingFormatted} | LT-II Kwarran Mekar Baru 2026`;
    const plainTextBody = `Salam Pramuka!\n\nPemberitahuan Resmi Panitia LT-II Kwarran Mekar Baru 2026 kepada Pembina Pendamping Regu ${peserta.nama_regu} (${peserta.pangkalan}).\n\nPendaftaran regu Kakak telah DIVERIFIKASI RESMI & LENGKAP.\n\n📋 INFORMASI KAPLING & REGU:\n• Nomor Kapling Tenda: #${kaplingFormatted}\n• Nama Regu: ${peserta.nama_regu} (${peserta.gender === 'Laki-laki' ? 'Putra' : 'Putri'})\n• Asal Sekolah / Pangkalan: ${peserta.pangkalan}\n• No. Gugus Depan: ${peserta.no_gudep || "—"}\n• Tingkat: ${peserta.kategori}\n• Status: TERVERIFIKASI RESMI ✅\n\nBukti Pendaftaran Resmi telah kami lampirkan dalam email ini. Silakan unduh dan cetak Bukti Pendaftaran tersebut, lalu wajib dibawa saat PENDAFTARAN ULANG untuk mendapatkan surat izin mendirikan tenda.\n\n(Tunjukkan bukti cetak tersebut kepada Panitia saat tiba di Bumi Perkemahan untuk konfirmasi lokasi penempatan kapling tenda #${kaplingFormatted})\n\n👥 GABUNG GRUP WHATSAPP RESMI PEMBINA PENDAMPING:\nUntuk koordinasi teknis, informasi kapling, jadwal kegiatan, dan pengumuman panitia, Pembina Pendamping diwajibkan segera bergabung ke grup WhatsApp berikut:\n${groupWaUrl}\n\nTerima kasih atas partisipasinya dan salam Pramuka!\nPanitia Pelaksana LT-II Kwarran Mekar Baru 2026`;
    const mailtoUrl = targetEmail ? `mailto:${targetEmail}?subject=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(plainTextBody)}` : null;

    if (targetEmail) {
      try {
        const smtpHost = process.env.SMTP_HOST || process.env.smtp_host || "smtp.gmail.com";
        const smtpPort = Number(process.env.SMTP_PORT || process.env.smtp_port) || 587;
        const smtpUser = process.env.SMTP_USER || process.env.smtp_user || process.env.EMAIL_USER || process.env.GMAIL_USER;
        const smtpPass = process.env.SMTP_PASS || process.env.smtp_pass || process.env.smtp_pss || process.env.SMTP_PSS || process.env.EMAIL_PASS || process.env.GMAIL_PASS;


        const htmlBody = `
          <div style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #0b1329; color: #f8fafc; padding: 30px; border-radius: 16px; max-width: 600px; margin: 0 auto; border: 1px solid rgba(245, 166, 35, 0.3);">
            <div style="text-align: center; margin-bottom: 24px;">
              <h1 style="color: #fbbf24; font-size: 22px; font-weight: 900; margin: 0; text-transform: uppercase; letter-spacing: 1.5px;">
                KWARTIR RANTING MEKAR BARU
              </h1>
              <p style="color: #67e8f9; font-size: 13px; font-weight: 700; margin-top: 4px; text-transform: uppercase; letter-spacing: 1px;">
                LOMBA TINGKAT REGU PRAMUKA PENGGALANG DUA (LT-II) TAHUN 2026
              </p>
            </div>

            <div style="background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.4); padding: 16px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
              <span style="color: #34d399; font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">
                ✅ PENDAFTARAN RESMI DIVERIFIKASI
              </span>
            </div>

            <p style="font-size: 14px; line-height: 1.6; color: #e2e8f0;">
              Salam Pramuka! Panitia LT-II Kwartir Ranting Mekar Baru menginformasikan kepada <strong>Kakak Pembina Pendamping</strong> bahwa berkas persyaratan dan pendaftaran regu <strong>${peserta.nama_regu}</strong> (${peserta.pangkalan}) telah <strong>DIVERIFIKASI RESMI & LENGKAP</strong> oleh Panitia.
            </p>

            <!-- STATUS BUKTI & NOMOR KAPLING TENDA -->
            <div style="text-align: center; margin: 24px 0; background: linear-gradient(135deg, rgba(245, 166, 35, 0.25) 0%, rgba(245, 166, 35, 0.08) 100%); border: 2px solid #fbbf24; padding: 22px; border-radius: 16px; box-shadow: 0 0 30px rgba(251, 191, 36, 0.2);">
              <div style="font-size: 12px; font-weight: 800; color: #fde68a; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 4px;">
                ⛺ NOMOR KAPLING TENDA RESMI
              </div>
              <div style="font-size: 46px; font-weight: 900; color: #fbbf24; font-family: 'Courier New', monospace; letter-spacing: 4px; margin: 8px 0;">
                #${kaplingFormatted}
              </div>
              <div style="font-size: 13px; color: #f1f5f9; margin-bottom: 18px; line-height: 1.5;">
                Nomor kapling ini adalah <strong>lokasi penempatan tenda resmi</strong> bagi regu Kakak di Bumi Perkemahan.
              </div>
              <div style="background: rgba(251,191,36,0.08); border: 1px dashed rgba(251,191,36,0.4); border-radius: 10px; padding: 14px; margin-bottom: 16px; font-size: 13px; color: #fde68a; line-height: 1.6;">
                📄 <strong>Bukti Pendaftaran Resmi</strong> sudah kami lampirkan dalam email ini.<br/>
                Silakan <strong>unduh & cetak</strong> lampiran tersebut, lalu <strong>wajib dibawa</strong> saat pendaftaran ulang untuk mendapatkan surat izin mendirikan tenda.
              </div>
              <a href="${cetakUrl}" target="_blank" style="display: inline-block; background-color: #fbbf24; color: #000; font-weight: bold; font-size: 14px; text-decoration: none; padding: 13px 28px; border-radius: 8px; box-shadow: 0 4px 10px rgba(251, 191, 36, 0.35);">
                🖨️ Unduh & Cetak Bukti Pendaftaran Resmi
              </a>
            </div>

            <!-- GABUNG GRUP WHATSAPP PEMBINA PENDAMPING -->
            <div style="text-align: center; margin: 24px 0; background: linear-gradient(135deg, rgba(37, 211, 102, 0.2) 0%, rgba(37, 211, 102, 0.05) 100%); border: 2px solid #25D366; padding: 20px; border-radius: 16px; box-shadow: 0 0 25px rgba(37, 211, 102, 0.2);">
              <div style="font-size: 15px; font-weight: 900; color: #25D366; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">
                👥 GRUP WHATSAPP RESMI PEMBINA PENDAMPING
              </div>
              <p style="font-size: 13px; color: #e2e8f0; line-height: 1.6; margin: 0 0 16px 0;">
                Untuk koordinasi teknis lomba, informasi kapling tenda, jadwal kegiatan, dan pengumuman panitia, Pembina Pendamping <strong>diwajibkan untuk langsung bergabung ke grup WhatsApp resmi</strong> berikut:
              </p>
              <a href="${groupWaUrl}" target="_blank" style="display: inline-block; background-color: #25D366; color: #ffffff; font-weight: bold; font-size: 14px; text-decoration: none; padding: 13px 26px; border-radius: 8px; box-shadow: 0 4px 10px rgba(37, 211, 102, 0.4);">
                💬 Gabung Grup WhatsApp Pembina Pendamping
              </a>
              <div style="font-size: 11px; color: #94a3b8; margin-top: 10px;">
                Tautan: <a href="${groupWaUrl}" style="color: #67e8f9; text-decoration: underline;">${groupWaUrl}</a>
              </div>
            </div>

            <!-- DETAIL REGU & PEMBINA PENDAMPING -->
            <div style="background: rgba(255,255,255,0.03); border-radius: 12px; padding: 16px; margin-bottom: 24px;">
              <h3 style="color: #67e8f9; font-size: 14px; margin-top: 0; margin-bottom: 12px; border-bottom: 1px solid rgba(103, 232, 249, 0.2); padding-bottom: 8px;">KETERANGAN REGU & PEMBINA PENDAMPING</h3>
              <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                <tr style="border-bottom: 1px dashed rgba(255,255,255,0.15); background: rgba(251, 191, 36, 0.1);">
                  <td style="padding: 10px 8px; color: #fbbf24; font-weight: bold;">No. Kapling Tenda</td>
                  <td style="padding: 10px 8px; color: #fbbf24; font-weight: 900; font-family: monospace; font-size: 16px; text-align: right;">#${kaplingFormatted}</td>
                </tr>
                <tr style="border-bottom: 1px dashed rgba(255,255,255,0.1);">
                  <td style="padding: 8px; color: #94a3b8;">Nama Regu</td>
                  <td style="padding: 8px; color: #ffffff; font-weight: bold; text-align: right;">${peserta.nama_regu}</td>
                </tr>
                <tr style="border-bottom: 1px dashed rgba(255,255,255,0.1);">
                  <td style="padding: 8px; color: #94a3b8;">Sekolah / Pangkalan</td>
                  <td style="padding: 8px; color: #ffffff; font-weight: bold; text-align: right;">${peserta.pangkalan}</td>
                </tr>
                <tr style="border-bottom: 1px dashed rgba(255,255,255,0.1);">
                  <td style="padding: 8px; color: #94a3b8;">No. Gugus Depan</td>
                  <td style="padding: 8px; color: #ffffff; font-weight: bold; font-family: monospace; text-align: right;">${peserta.no_gudep || "—"}</td>
                </tr>
                <tr style="border-bottom: 1px dashed rgba(255,255,255,0.1);">
                  <td style="padding: 8px; color: #94a3b8;">Tingkat & Gender</td>
                  <td style="padding: 8px; color: #ffffff; font-weight: bold; text-align: right;">${peserta.kategori} - ${peserta.gender} (${peserta.gender === 'Laki-laki' ? 'Putra' : 'Putri'})</td>
                </tr>
                <tr>
                  <td style="padding: 8px; color: #94a3b8;">Tanggal Pendaftaran</td>
                  <td style="padding: 8px; color: #ffffff; font-weight: bold; text-align: right;">${new Date(peserta.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</td>
                </tr>
              </table>
            </div>

            <!-- CHECKLIST DOKUMEN -->
            <div style="background: rgba(16, 185, 129, 0.05); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 12px; padding: 16px; margin-bottom: 24px;">
              <h3 style="color: #34d399; font-size: 14px; margin-top: 0; margin-bottom: 12px; border-bottom: 1px solid rgba(52, 211, 153, 0.2); padding-bottom: 8px;">KELENGKAPAN DOKUMEN (DIVERIFIKASI)</h3>
              <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                <tr>
                  <td style="padding: 6px 0; color: #e2e8f0;">✅ Form Ketersediaan Gudep</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #e2e8f0;">✅ Form Pendaftaran Peserta</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #e2e8f0;">✅ Biodata Peserta (Regu)</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #e2e8f0;">✅ Biodata Pembina Pendamping</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #e2e8f0;">✅ Bukti Pembayaran (Camp Fee)</td>
                </tr>
              </table>
            </div>

            <div style="text-align: center; margin-top: 30px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 20px;">
              <p style="font-size: 12px; color: #fbbf24; font-style: italic; font-weight: 700;">
                "SATYAKU KUDARMAKAN DARMAKU KUBAKTIKAN"
              </p>
              <p style="font-size: 11px; color: #64748b; margin-top: 6px;">
                Panitia Pelaksana LT-II Kwarran Mekar Baru 2026
              </p>
            </div>
          </div>
        `;

        if (smtpUser && smtpPass) {
          const cleanPass = smtpPass.trim().replace(/\s+/g, ""); // Strip any spaces from Google App Password

          let transporter;
          if (smtpHost.includes("gmail") || smtpUser.includes("@gmail.com")) {
            transporter = nodemailer.createTransport({
              service: "gmail",
              auth: { user: smtpUser.trim(), pass: cleanPass },
              connectionTimeout: 10000,
              greetingTimeout: 10000,
              socketTimeout: 10000,
            });
          } else {
            transporter = nodemailer.createTransport({
              host: smtpHost.trim(),
              port: smtpPort,
              secure: smtpPort === 465,
              auth: { user: smtpUser.trim(), pass: cleanPass },
              tls: { rejectUnauthorized: false },
              connectionTimeout: 10000,
              greetingTimeout: 10000,
              socketTimeout: 10000,
            });
          }

          let docBuffer = null;
          const safeFilenameName = (peserta.nama_regu || "regu").replace(/[^a-z0-9]/gi, '_').toLowerCase();
          let filename = `Bukti_Pendaftaran_${safeFilenameName}.pdf`;
          try {
            docBuffer = await generatePdfBukti(peserta, peserta_id, kaplingFormatted);
          } catch (e) {
            console.error("Gagal generate PDF: ", e);
          }

          const mailOptions = {
            from: `"Panitia LT-II Mekar Baru" <${smtpUser.trim()}>`,
            to: targetEmail,
            subject: mailSubject,
            html: htmlBody,
          };

          if (docBuffer) {
            mailOptions.attachments = [
              {
                filename: filename,
                content: docBuffer,
                contentType: "application/pdf",
              }
            ];
          }

          await transporter.sendMail(mailOptions);
          emailSent = true;
          emailStatusMessage = `✅ Email notifikasi terkirim otomatis ke ${targetEmail}`;
        } else {
          // Dev / fallback info
          console.log(`[VERIFICATION EMAIL DISPATCH LOG] To: ${targetEmail}`);
          emailSent = false;
          emailStatusMessage = `ℹ️ Email disiapkan untuk ${targetEmail}. (Kirim via Mail Client dibuka)`;
        }
      } catch (mailErr) {
        console.error("Gagal mengirim email verifikasi:", mailErr);
        emailSent = false;
        emailStatusMessage = `⚠️ Email gagal terkirim otomatis (${mailErr.message}). Mail Client telah dibuka untuk pengiriman manual.`;
      }

    } else {
      emailStatusMessage = "⚠️ Regu ini tidak mencantumkan alamat email (@). Verifikasi berhasil tanpa pengiriman email.";
    }

    return NextResponse.json({
      success: true,
      nomor_kapling: finalKapling,
      nomor_kapling_formatted: kaplingFormatted,
      targetEmail,
      mailtoUrl,
      emailSent,
      emailMessage: emailStatusMessage,
    });

  } catch (err) {
    return NextResponse.json(
      { error: "Terjadi kesalahan server: " + err.message },
      { status: 500 }
    );
  }
}
