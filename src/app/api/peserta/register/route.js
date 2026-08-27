import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request) {
  try {
    const body = await request.json();
    const { nama_regu, pangkalan, kategori, gender, no_gudep, kontak_person, email } = body;

    const cleanNamaRegu = nama_regu?.trim();
    const cleanPangkalan = pangkalan?.trim();
    const cleanNoGudep = no_gudep?.trim();
    const cleanKontak = kontak_person?.trim();
    const cleanEmail = email?.trim();

    if (!cleanNamaRegu || !cleanPangkalan || !cleanNoGudep || !cleanKontak) {
      return NextResponse.json(
        { error: "Harap lengkapi semua bidang form pendaftaran." },
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

    // Create client with service role key (or anon key fallback)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    // 1. Calculate Auto-Kapling (Odd for Putra, Even for Putri)
    let nextKapling = 0;
    const isPutra = gender?.toLowerCase().includes("putra") || gender?.toLowerCase().includes("laki");
    
    // Fetch existing verified participants to determine next kapling
    const { data: existingPeserta } = await supabaseAdmin
      .from("peserta")
      .select("nomor_dada")
      .eq("is_verified", true);
      
    const validKaplings = (existingPeserta || []).map((p) => p.nomor_dada).filter((n) => n > 0);
    
    if (isPutra) {
      const oddNumbers = validKaplings.filter((n) => n % 2 !== 0);
      nextKapling = oddNumbers.length > 0 ? Math.max(...oddNumbers) + 2 : 1;
    } else {
      const evenNumbers = validKaplings.filter((n) => n % 2 === 0);
      nextKapling = evenNumbers.length > 0 ? Math.max(...evenNumbers) + 2 : 2;
    }

    const payload = {
      nama_regu: cleanNamaRegu,
      pangkalan: cleanPangkalan,
      kategori,
      gender,
      no_gudep: cleanNoGudep,
      kontak_person: cleanKontak,
      email: cleanEmail || "",
      is_verified: true, // Auto Verified
      nomor_dada: nextKapling, // Auto Kapling
    };

    // Primary insert attempt
    let { data: insertedData, error: insertError } = await supabaseAdmin
      .from("peserta")
      .insert(payload)
      .select("*")
      .single();

    // Fallback 1: if 'email' column does not exist in DB schema yet
    if (insertError && (insertError.message.includes("email") || insertError.code === "PGRST204" || insertError.code === "42703")) {
      delete payload.email;
      payload.kontak_person = `${cleanKontak} (Email: ${cleanEmail})`;
      const retryRes = await supabaseAdmin.from("peserta").insert(payload).select("*").single();
      insertError = retryRes.error;
      insertedData = retryRes.data;
    }

    if (insertError) {
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      );
    }

    // 2. Auto-Send Email
    let emailSent = false;
    const kaplingFormatted = nextKapling.toString().padStart(3, "0");
    const rawTarget = `${insertedData?.email || ""} ${insertedData?.kontak_person || ""}`;
    const emailMatch = rawTarget.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const targetEmail = emailMatch ? emailMatch[0] : null;

    if (targetEmail) {
      try {
        const nodemailer = require("nodemailer");
        const smtpHost = process.env.SMTP_HOST || process.env.smtp_host || "smtp.gmail.com";
        const smtpPort = Number(process.env.SMTP_PORT || process.env.smtp_port) || 587;
        const smtpUser = process.env.SMTP_USER || process.env.smtp_user || process.env.EMAIL_USER || process.env.GMAIL_USER;
        const smtpPass = process.env.SMTP_PASS || process.env.smtp_pass || process.env.smtp_pss || process.env.SMTP_PSS || process.env.EMAIL_PASS || process.env.GMAIL_PASS;

        if (smtpUser && smtpPass) {
          const cleanPass = smtpPass.trim().replace(/\s+/g, "");
          let transporter;
          if (smtpHost.includes("gmail") || smtpUser.includes("@gmail.com")) {
            transporter = nodemailer.createTransport({
              service: "gmail",
              auth: { user: smtpUser.trim(), pass: cleanPass },
              connectionTimeout: 8000,
            });
          } else {
            transporter = nodemailer.createTransport({
              host: smtpHost.trim(),
              port: smtpPort,
              secure: smtpPort === 465,
              auth: { user: smtpUser.trim(), pass: cleanPass },
              tls: { rejectUnauthorized: false },
              connectionTimeout: 8000,
            });
          }

          const htmlBody = `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #0b1329; color: #f8fafc; padding: 30px; border-radius: 16px; max-width: 600px; margin: 0 auto; border: 1px solid rgba(245, 166, 35, 0.3);">
              <div style="text-align: center; margin-bottom: 24px;">
                <h1 style="color: #fbbf24; font-size: 22px; font-weight: 900; margin: 0; text-transform: uppercase; letter-spacing: 1.5px;">
                  KWARTIR RANTING MEKAR BARU
                </h1>
                <p style="color: #67e8f9; font-size: 13px; font-weight: 700; margin-top: 4px;">
                  LOMBA TINGKAT REGU PRAMUKA PENGGALANG DUA (LT-II) TAHUN 2026
                </p>
              </div>

              <div style="background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.4); padding: 16px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
                <span style="color: #34d399; font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">
                  ✅ PENDAFTARAN BERHASIL (OTOMATIS DIVERIFIKASI)
                </span>
              </div>

              <p style="font-size: 14px; line-height: 1.6; color: #e2e8f0;">
                Salam Pramuka! Pendaftaran regu Anda telah kami terima dan <strong>DIVERIFIKASI SECARA OTOMATIS</strong> oleh sistem.
              </p>

              <!-- KAPLING BADGE -->
              <div style="text-align: center; margin: 28px 0; background: linear-gradient(135deg, rgba(245, 166, 35, 0.2) 0%, rgba(245, 166, 35, 0.05) 100%); border: 2px solid #fbbf24; padding: 20px; border-radius: 16px;">
                <div style="font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 6px;">
                  NOMOR KAPLING TENDA RESMI
                </div>
                <div style="font-size: 42px; font-weight: 900; color: #fbbf24; font-family: monospace; letter-spacing: 4px;">
                  ${kaplingFormatted}
                </div>
              </div>

              <!-- DETAIL REGU -->
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 13px;">
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.08);">
                  <td style="padding: 10px 0; color: #94a3b8; font-weight: 600;">Nama Regu</td>
                  <td style="padding: 10px 0; color: #ffffff; font-weight: 800; text-align: right;">${cleanNamaRegu}</td>
                </tr>
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.08);">
                  <td style="padding: 10px 0; color: #94a3b8; font-weight: 600;">Asal Pangkalan / Sekolah</td>
                  <td style="padding: 10px 0; color: #ffffff; font-weight: 800; text-align: right;">${cleanPangkalan}</td>
                </tr>
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.08);">
                  <td style="padding: 10px 0; color: #94a3b8; font-weight: 600;">Tingkat & Gender</td>
                  <td style="padding: 10px 0; color: #ffffff; font-weight: 700; text-align: right;">${kategori} - ${isPutra ? '👦 Putra' : '👧 Putri'}</td>
                </tr>
              </table>
              <div style="text-align: center; margin-top: 30px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 20px;">
                <p style="font-size: 12px; color: #fbbf24; font-style: italic; font-weight: 700;">"SATYAKU KUDARMAKAN DARMAKU KUBAKTIKAN"</p>
              </div>
            </div>
          `;

          await transporter.sendMail({
            from: `"Panitia LT-II Mekar Baru" <${smtpUser.trim()}>`,
            to: targetEmail,
            subject: `[PENDAFTARAN SUKSES] Regu ${cleanNamaRegu} - KAPLING: ${kaplingFormatted} | LT-II Mekar Baru 2026`,
            html: htmlBody,
          });
          emailSent = true;
        }
      } catch (e) {
        console.error("Auto email failed:", e);
      }
    }

    return NextResponse.json({ 
      success: true,
      nomor_kapling: kaplingFormatted,
      emailSent
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Terjadi kesalahan server: " + err.message },
      { status: 500 }
    );
  }
}

