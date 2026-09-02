import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";

export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, password } = body;

    if (!userId || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
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

    // 1. Update auth user password
    const { error: updateAuthError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: password
    });

    if (updateAuthError) {
      return NextResponse.json({ error: "Gagal update password auth: " + updateAuthError.message }, { status: 400 });
    }

    // 2. Update profiles table to set is_verified = true and fetch assignment details
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({ is_verified: true })
      .eq("id", userId)
      .select(`
        assigned_kategori,
        assigned_gender,
        lomba (nama_lomba)
      `)
      .single();

    if (profileError) {
      return NextResponse.json({ error: "Gagal update status verifikasi: " + profileError.message }, { status: 500 });
    }

    // 3. Fetch user email for notification
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);
    const targetEmail = userData?.user?.email;
    const juriName = userData?.user?.user_metadata?.nama_lengkap || "Dewan Juri";

    if (!targetEmail) {
      return NextResponse.json({ success: true, warning: "Juri diverifikasi, tetapi gagal mendapatkan email." });
    }

    // Extract Assignment Details
    const tingkatName = profileData?.assigned_kategori || "SEMUA TINGKATAN (Bebas Akses)";
    const lombaName = profileData?.lomba?.nama_lomba || "SEMUA POS LOMBA (Bebas Akses)";
    const genderName = profileData?.assigned_gender === "SEMUA" || !profileData?.assigned_gender 
      ? "SEMUA GENDER (Putra & Putri)" 
      : (profileData.assigned_gender === "Laki-laki" ? "KHUSUS PUTRA (Laki-laki)" : "KHUSUS PUTRI (Perempuan)");

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.siloti-kwaranmekarbaru.my.id";
    const loginUrl = `${baseUrl}/login`;

    // 4. Send email notification
    let emailSent = false;
    let emailStatusMessage = "";

    const mailSubject = `[AKUN JURI AKTIF] Akses Login LT-II Kwarran Mekar Baru 2026`;
    const plainTextBody = `Salam Pramuka, Kak ${juriName}!\n\nAkun Dewan Juri Anda telah DIVERIFIKASI dan AKTIF.\nAnda ditugaskan sebagai Juri dengan rincian berikut:\n- Pos Lomba: ${lombaName}\n- Tingkat: ${tingkatName}\n- Kategori: ${genderName}\n\nBerikut adalah detail akses login Anda:\nEmail / Username: ${targetEmail}\nPassword: ${password}\n\nSilakan login melalui tautan berikut: ${loginUrl}\n\nTerima kasih,\nPanitia LT-II Mekar Baru 2026`;
    const mailtoUrl = `mailto:${targetEmail}?subject=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(plainTextBody)}`;

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
          <div style="background-color: rgba(255, 255, 255, 0.02); border-radius: 12px; padding: 24px; border: 1px solid rgba(255,255,255,0.05);">
            <p style="font-size: 15px; line-height: 1.6; margin-top: 0;">
              Salam Pramuka, Kak <strong>${juriName}</strong>!<br/><br/>
              Akun Dewan Juri Anda telah berhasil <strong>DIVERIFIKASI</strong> oleh Admin. Anda kini secara resmi ditugaskan sebagai Juri dengan rincian tugas berikut:
            </p>
            
            <div style="background: rgba(245, 166, 35, 0.1); border-left: 4px solid #fbbf24; padding: 16px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0 0 8px 0; color: #fbbf24; font-size: 12px; text-transform: uppercase; font-weight: bold;">Tugas Penilaian Anda</p>
              <div style="margin-bottom: 6px;">
                <span style="color: #cbd5e1; font-size: 13px;">Pos Lomba:</span> 
                <strong style="color: #ffffff; font-size: 14px;">${lombaName}</strong>
              </div>
              <div style="margin-bottom: 6px;">
                <span style="color: #cbd5e1; font-size: 13px;">Tingkatan:</span> 
                <strong style="color: #ffffff; font-size: 14px;">${tingkatName}</strong>
              </div>
              <div>
                <span style="color: #cbd5e1; font-size: 13px;">Kategori Regu:</span> 
                <strong style="color: #ffffff; font-size: 14px;">${genderName}</strong>
              </div>
            </div>

            <div style="background: rgba(0,0,0,0.3); border-left: 4px solid #10b981; padding: 16px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0 0 8px 0; color: #94a3b8; font-size: 12px; text-transform: uppercase;">Akses Login Akun Anda</p>
              <div style="margin-bottom: 8px;">
                <span style="color: #94a3b8; font-size: 14px;">Email (Username):</span><br/>
                <strong style="color: #38bdf8; font-size: 16px;">${targetEmail}</strong>
              </div>
              <div>
                <span style="color: #94a3b8; font-size: 14px;">Password Sementara:</span><br/>
                <strong style="color: #fbbf24; font-size: 18px; letter-spacing: 1px;">${password}</strong>
              </div>
            </div>
            
            <div style="text-align: center; margin-top: 30px; margin-bottom: 20px;">
              <a href="${loginUrl}" target="_blank" style="display: inline-block; background-color: #0ea5e9; color: #ffffff; font-weight: bold; font-size: 15px; text-decoration: none; padding: 14px 28px; border-radius: 8px; box-shadow: 0 4px 10px rgba(14, 165, 233, 0.4);">
                🔒 Login ke Sistem Penilaian
              </a>
            </div>

            <p style="font-size: 13px; color: #94a3b8; font-style: italic; text-align: center;">
              * Harap simpan informasi login ini dengan baik dan jangan bagikan kepada siapa pun.
            </p>
          </div>
        </div>
      `;

      if (smtpUser && smtpPass) {
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: smtpPort,
          secure: smtpPort === 465,
          auth: { user: smtpUser, pass: smtpPass },
        });

        await transporter.sendMail({
          from: `"Panitia LT-II Mekar Baru" <${smtpUser}>`,
          to: targetEmail,
          subject: mailSubject,
          text: plainTextBody,
          html: htmlBody,
        });
        
        emailSent = true;
        emailStatusMessage = `✅ Email login terkirim otomatis ke ${targetEmail}`;
      } else {
        emailSent = false;
        emailStatusMessage = `ℹ️ Email disiapkan untuk ${targetEmail}. (Kirim via Mail Client dibuka)`;
      }
    } catch (emailErr) {
      emailSent = false;
      emailStatusMessage = `⚠️ Pengiriman email otomatis gagal, mengalihkan ke Mail Client...`;
    }

    return NextResponse.json({ 
      success: true,
      emailSent,
      mailtoUrl,
      emailMessage: emailStatusMessage
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Terjadi kesalahan server: " + err.message },
      { status: 500 }
    );
  }
}
