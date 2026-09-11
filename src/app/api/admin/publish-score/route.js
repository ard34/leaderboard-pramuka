import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseServiceKey) return null;
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });
}

// GET: Ambil daftar juri yang nilainya telah dipublish dan status publish global
export async function GET() {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Konfigurasi Supabase Server belum lengkap." }, { status: 500 });
    }

    const { data: infoData, error } = await supabaseAdmin
      .from("informasi")
      .select("id, text")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const publishedJuriIds = [];
    let publishAll = false;

    (infoData || []).forEach((row) => {
      if (row.text === "__PUBLISH_ALL_SCORES__:true" || row.text === "__PUBLISH_ALL_SCORES__") {
        publishAll = true;
      } else if (row.text && row.text.startsWith("__PUBLISHED_JURI__:")) {
        const juriId = row.text.replace("__PUBLISHED_JURI__:", "").trim();
        if (juriId && !publishedJuriIds.includes(juriId)) {
          publishedJuriIds.push(juriId);
        }
      }
    });

    return NextResponse.json({
      success: true,
      publishedJuriIds,
      publishAll,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST: Publish / Unpublish nilai per juri atau massal
export async function POST(request) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Konfigurasi Supabase Server belum lengkap." }, { status: 500 });
    }

    const body = await request.json();
    const { action, juri_id } = body;

    if (!action) {
      return NextResponse.json({ error: "Parameter action wajib diisi." }, { status: 400 });
    }

    // 1. Action: PUBLISH SATU JURI
    if (action === "publish") {
      if (!juri_id) {
        return NextResponse.json({ error: "Parameter juri_id wajib diisi untuk aksi publish." }, { status: 400 });
      }

      const flagText = `__PUBLISHED_JURI__:${juri_id}`;

      // Cek apakah sudah ada flag
      const { data: existing } = await supabaseAdmin
        .from("informasi")
        .select("id")
        .eq("text", flagText);

      if (!existing || existing.length === 0) {
        await supabaseAdmin.from("informasi").insert({ text: flagText });
      }

      // Jika kolom is_published tersedia di tabel penilaian, update juga secara opsional
      try {
        await supabaseAdmin
          .from("penilaian")
          .update({ is_published: true })
          .eq("juri_id", juri_id);
      } catch (_) {
        // Abaikan jika kolom belum ditambahkan di database
      }

      return NextResponse.json({
        success: true,
        message: `Nilai dewan juri berhasil dipublikasikan ke Leaderboard!`,
        juri_id,
        is_published: true,
      });
    }

    // 2. Action: UNPUBLISH SATU JURI (TARIK NILAI)
    if (action === "unpublish") {
      if (!juri_id) {
        return NextResponse.json({ error: "Parameter juri_id wajib diisi untuk aksi unpublish." }, { status: 400 });
      }

      const flagText = `__PUBLISHED_JURI__:${juri_id}`;

      await supabaseAdmin
        .from("informasi")
        .delete()
        .eq("text", flagText);

      // Juga hapus flag publish all jika sedang aktif agar penarikan spesifik berlaku
      await supabaseAdmin
        .from("informasi")
        .delete()
        .eq("text", "__PUBLISH_ALL_SCORES__:true");
      await supabaseAdmin
        .from("informasi")
        .delete()
        .eq("text", "__PUBLISH_ALL_SCORES__");

      try {
        await supabaseAdmin
          .from("penilaian")
          .update({ is_published: false })
          .eq("juri_id", juri_id);
      } catch (_) {}

      return NextResponse.json({
        success: true,
        message: `Nilai dewan juri berhasil ditarik dari Leaderboard (Status: Tertahan).`,
        juri_id,
        is_published: false,
      });
    }

    // 3. Action: PUBLISH SEMUA NILAI JURI
    if (action === "publish_all") {
      // Hapus duplikat lama lalu masukkan flag publish all
      await supabaseAdmin.from("informasi").delete().eq("text", "__PUBLISH_ALL_SCORES__:true");
      await supabaseAdmin.from("informasi").delete().eq("text", "__PUBLISH_ALL_SCORES__");
      await supabaseAdmin.from("informasi").insert({ text: "__PUBLISH_ALL_SCORES__:true" });

      try {
        await supabaseAdmin
          .from("penilaian")
          .update({ is_published: true });
      } catch (_) {}

      return NextResponse.json({
        success: true,
        message: `Seluruh nilai dari semua Dewan Juri berhasil dipublikasikan ke Leaderboard!`,
        publishAll: true,
      });
    }

    // 4. Action: UNPUBLISH SEMUA NILAI (TARIK SEMUA KE DRAFT)
    if (action === "unpublish_all") {
      // Hapus semua flag publish dari informasi
      const { data: allFlags } = await supabaseAdmin
        .from("informasi")
        .select("id, text");

      if (allFlags) {
        const toDeleteIds = allFlags
          .filter(f => f.text?.startsWith("__PUBLISHED_JURI__:") || f.text?.startsWith("__PUBLISH_ALL_SCORES__"))
          .map(f => f.id);

        if (toDeleteIds.length > 0) {
          await supabaseAdmin.from("informasi").delete().in("id", toDeleteIds);
        }
      }

      try {
        await supabaseAdmin
          .from("penilaian")
          .update({ is_published: false });
      } catch (_) {}

      return NextResponse.json({
        success: true,
        message: `Seluruh nilai berhasil ditarik. Semua skor juri kini berstatus tertahan.`,
        publishAll: false,
      });
    }

    return NextResponse.json({ error: "Aksi tidak dikenal." }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
