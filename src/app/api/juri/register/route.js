import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";
import { getSupabaseAdmin } from "@/lib/supabaseServerAdmin";

export async function POST(request) {
  try {
    const body = await request.json();
    const { nama_lengkap, email, kategori, gender, lombaId, noWa } = body;

    const cleanNama = nama_lengkap?.trim();
    const cleanEmail = email?.trim()?.toLowerCase();

    if (!cleanNama || !cleanEmail || !kategori || !gender || !lombaId) {
      return NextResponse.json(
        { error: "Harap isi seluruh kolom formulir registrasi juri." },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    let supabaseAdmin = await getSupabaseAdmin();
    if (!supabaseAdmin && supabaseUrl && supabaseServiceKey) {
      supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
        auth: { persistSession: false },
      });
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Konfigurasi Supabase Server belum lengkap." },
        { status: 500 }
      );
    }

    // Ensure valid UUID for assigned_lomba_id
    let validLombaId = null;
    let lombaNama = null;

    if (lombaId === "SEMUA" || !lombaId) {
      validLombaId = null;
      lombaNama = "Bebas Akses (Semua Pos Lomba)";
    } else {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(lombaId);
      if (isUuid) {
        validLombaId = lombaId;
        const { data: lData } = await supabaseAdmin
          .from("lomba")
          .select("nama_lomba")
          .eq("id", validLombaId)
          .maybeSingle();
        if (lData) lombaNama = lData.nama_lomba;
      } else {
        // Find matching lomba row in public.lomba
        const { data: matched } = await supabaseAdmin
          .from("lomba")
          .select("id, nama_lomba")
          .eq("kategori", kategori === "SEMUA" ? "SD" : kategori)
          .ilike("nama_lomba", `%${lombaId.replace(/fallback-.*-/g, '')}%`)
          .maybeSingle();

        if (matched) {
          validLombaId = matched.id;
          lombaNama = matched.nama_lomba;
        }
      }
    }

    const assignedKategoriVal = kategori !== "SEMUA" ? kategori : null;
    const assignedLombaVal = lombaId !== "SEMUA" ? validLombaId : null;

    // Generate a temporary random password for the user
    const tempPassword = Math.random().toString(36).slice(-10) + "A1!";

    // 1. Create auth user with auto-email confirm
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: cleanEmail,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        nama_lengkap: cleanNama,
        assigned_kategori: assignedKategoriVal,
        assigned_gender: gender,
        assigned_lomba_id: assignedLombaVal,
        role: "juri",
        no_wa: noWa,
      },
    });

    let userId = authData?.user?.id;

    if (authError) {
      // If user already registered in Auth, attempt login/profile link
      if (authError.message.includes("already registered") || authError.status === 422) {
        const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
        const found = existingUsers?.users?.find((u) => u.email === cleanEmail);
        if (found) {
          userId = found.id;
        } else {
          return NextResponse.json({ error: "Email sudah terdaftar. Silakan login." }, { status: 400 });
        }
      } else {
        return NextResponse.json({ error: authError.message }, { status: 400 });
      }
    }

    // 2. Upsert profile with is_verified: false
    const { error: profileError } = await supabaseAdmin.from("profiles").upsert({
      id: userId,
      nama_lengkap: cleanNama,
      role: "juri",
      assigned_lomba_id: assignedLombaVal,
      assigned_kategori: assignedKategoriVal,
      assigned_gender: gender,
      no_wa: noWa,
      is_verified: false,
    });

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    // 3. Send registration acknowledgment email to juri
    try {
      const smtpHost = process.env.SMTP_HOST || process.env.smtp_host || "smtp.gmail.com";
      const smtpPort = Number(process.env.SMTP_PORT || process.env.smtp_port) || 587;
      const smtpUser = process.env.SMTP_USER || process.env.smtp_user || process.env.EMAIL_USER || process.env.GMAIL_USER;
      const smtpPass = process.env.SMTP_PASS || process.env.smtp_pass || process.env.smtp_pss || process.env.SMTP_PSS || process.env.EMAIL_PASS || process.env.GMAIL_PASS;

      if (smtpUser && smtpPass && cleanEmail) {
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: smtpPort,
          secure: smtpPort === 465,
          auth: { user: smtpUser, pass: smtpPass },
        });

        const subject = `[PENDAFTARAN JURI DITERIMA] LT-II Kwarran Mekar Baru 2026`;
        const text = `Salam Pramuka, Kak ${cleanNama}!\n\nPendaftaran akun Dewan Juri Anda telah berhasil kami terima.\n\nDetail Pendaftaran:\n- Nama: ${cleanNama}\n- Email: ${cleanEmail}\n- Tingkat: ${kategori}\n- Kategori Regu: ${gender}\n- Pos Lomba: ${lombaNama || lombaId}\n\nStatus saat ini: MENUNGGU VERIFIKASI ADMIN.\nSetelah akun Anda disetujui oleh Panitia, Anda akan menerima email kedua yang berisi password dan petunjuk akses login ke aplikasi penilaian.\n\nTerima kasih atas partisipasinya,\nPanitia Pelaksana LT-II Kwarran Mekar Baru 2026`;
        
        const html = `
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
                Salam Pramuka, Kak <strong>${cleanNama}</strong>!<br/><br/>
                Pendaftaran akun Dewan Juri Anda telah <strong>BERHASIL DITERIMA</strong> oleh sistem kami.
              </p>
              
              <div style="background: rgba(245, 166, 35, 0.1); border-left: 4px solid #fbbf24; padding: 16px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0 0 8px 0; color: #fbbf24; font-size: 12px; text-transform: uppercase; font-weight: bold;">Rincian Pendaftaran</p>
                <div style="margin-bottom: 6px;"><span style="color: #cbd5e1; font-size: 13px;">Pos Lomba:</span> <strong style="color: #ffffff; font-size: 14px;">${lombaNama || lombaId}</strong></div>
                <div style="margin-bottom: 6px;"><span style="color: #cbd5e1; font-size: 13px;">Tingkatan:</span> <strong style="color: #ffffff; font-size: 14px;">${kategori}</strong></div>
                <div><span style="color: #cbd5e1; font-size: 13px;">Kategori Regu:</span> <strong style="color: #ffffff; font-size: 14px;">${gender}</strong></div>
              </div>

              <div style="background: rgba(56, 189, 248, 0.1); border-left: 4px solid #38bdf8; padding: 16px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0; color: #38bdf8; font-size: 13px; font-weight: 600;">
                  ⏳ Status: <strong>MENUNGGU VERIFIKASI ADMIN</strong>
                </p>
                <p style="margin: 6px 0 0 0; color: #cbd5e1; font-size: 12px; line-height: 1.5;">
                  Panitia akan memeriksa dan memverifikasi data Anda. Setelah akun diverifikasi, sistem akan secara otomatis mengirimkan email lanjutan berisi password akun dan link login resmi.
                </p>
              </div>

              <p style="font-size: 13px; color: #94a3b8; font-style: italic; text-align: center; margin-top: 24px;">
                Terima kasih atas dedikasi dan kesediaannya menjadi Dewan Juri LT-II Kwarran Mekar Baru 2026.
              </p>
            </div>
          </div>
        `;

        await transporter.sendMail({
          from: `"Panitia LT-II Mekar Baru" <${smtpUser}>`,
          to: cleanEmail,
          subject,
          text,
          html,
        });
      }
    } catch (mailErr) {
      console.warn("Gagal mengirim email pendaftaran juri awal:", mailErr);
    }

    return NextResponse.json({ success: true, userId });
  } catch (err) {
    return NextResponse.json(
      { error: "Terjadi kesalahan server: " + err.message },
      { status: 500 }
    );
  }
}
