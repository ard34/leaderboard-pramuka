import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";

export async function POST(request) {
  try {
    const body = await request.json();
    const { peserta_id } = body;

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
        { status: 444 }
      );
    }

    // 2. Update participant to verified
    const payload = {
      is_verified: true
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

    const mailSubject = `[VERIFIKASI RESMI] Regu ${peserta.nama_regu} | LT-II Kwarran Mekar Baru 2026`;
    const plainTextBody = `Salam Pramuka!\n\nPendaftaran Regu ${peserta.nama_regu} (${peserta.pangkalan}) telah DIVERIFIKASI RESMI oleh Panitia LT-II Kwarran Mekar Baru 2026.\n\nSTATUS: TERVERIFIKASI\nTunjukkan bukti pendaftaran ini kepada Panitia untuk mengambil Nomor Kapling Tenda Anda.\n\nGudep: ${peserta.no_gudep || "—"}\nTingkat/Gender: ${peserta.kategori} - ${peserta.gender}\n\nTerima kasih.\nPanitia LT-II Mekar Baru 2026`;
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
              <p style="color: #67e8f9; font-size: 13px; font-weight: 700; margin-top: 4px; uppercase; tracking-widest;">
                LOMBA TINGKAT REGU PRAMUKA PENGGALANG DUA (LT-II) TAHUN 2026
              </p>
            </div>

            <div style="background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.4); padding: 16px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
              <span style="color: #34d399; font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">
                ✅ PENDAFTARAN RESMI DIVERIFIKASI
              </span>
            </div>

            <p style="font-size: 14px; line-height: 1.6; color: #e2e8f0;">
              Salam Pramuka! Panitia LT-II Kwartir Ranting Mekar Baru menerangkan bahwa regu Anda telah resmi terdaftar dan dokumen pendaftaran telah <strong>DIVERIFIKASI LENGKAP</strong> oleh Admin.
            </p>

            <!-- STATUS BUKTI -->
            <div style="text-align: center; margin: 28px 0; background: linear-gradient(135deg, rgba(245, 166, 35, 0.2) 0%, rgba(245, 166, 35, 0.05) 100%); border: 2px solid #fbbf24; padding: 20px; border-radius: 16px; box-shadow: 0 0 25px rgba(251, 191, 36, 0.15);">
              <div style="font-size: 16px; font-weight: 900; color: #fbbf24; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 6px;">
                STATUS: TERVERIFIKASI
              </div>
              <div style="font-size: 12px; color: #cbd5e1; margin-top: 8px;">
                Tunjukkan bukti pendaftaran ini kepada Panitia untuk mengambil <strong>Nomor Kapling Tenda</strong> Anda.
              </div>
            </div>

            <!-- DETAIL REGU -->
            <div style="background: rgba(255,255,255,0.03); border-radius: 12px; padding: 16px; margin-bottom: 24px;">
              <h3 style="color: #67e8f9; font-size: 14px; margin-top: 0; margin-bottom: 12px; border-bottom: 1px solid rgba(103, 232, 249, 0.2); padding-bottom: 8px;">KETERANGAN PESERTA</h3>
              <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                <tr style="border-bottom: 1px dashed rgba(255,255,255,0.1);">
                  <td style="padding: 8px 0; color: #94a3b8;">Nama Regu</td>
                  <td style="padding: 8px 0; color: #ffffff; font-weight: bold; text-align: right;">${peserta.nama_regu}</td>
                </tr>
                <tr style="border-bottom: 1px dashed rgba(255,255,255,0.1);">
                  <td style="padding: 8px 0; color: #94a3b8;">Sekolah / Pangkalan</td>
                  <td style="padding: 8px 0; color: #ffffff; font-weight: bold; text-align: right;">${peserta.pangkalan}</td>
                </tr>
                <tr style="border-bottom: 1px dashed rgba(255,255,255,0.1);">
                  <td style="padding: 8px 0; color: #94a3b8;">No. Gugus Depan</td>
                  <td style="padding: 8px 0; color: #ffffff; font-weight: bold; font-family: monospace; text-align: right;">${peserta.no_gudep || "—"}</td>
                </tr>
                <tr style="border-bottom: 1px dashed rgba(255,255,255,0.1);">
                  <td style="padding: 8px 0; color: #94a3b8;">Tingkat & Gender</td>
                  <td style="padding: 8px 0; color: #ffffff; font-weight: bold; text-align: right;">${peserta.kategori} - ${peserta.gender}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #94a3b8;">Tanggal Pendaftaran</td>
                  <td style="padding: 8px 0; color: #ffffff; font-weight: bold; text-align: right;">${new Date(peserta.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</td>
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

          await transporter.sendMail({
            from: `"Panitia LT-II Mekar Baru" <${smtpUser.trim()}>`,
            to: targetEmail,
            subject: mailSubject,
            html: htmlBody,
          });
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
