import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

const PUBLISH_FILE_PATH = path.join(process.cwd(), "src", "lib", "publishState.json");

let memoryPublishState = {
  publishAll: true,
  publishedJuriIds: [],
  showWinners: false,
  updatedAt: Date.now(),
};

function getPublishState() {
  try {
    if (fs.existsSync(PUBLISH_FILE_PATH)) {
      const data = JSON.parse(fs.readFileSync(PUBLISH_FILE_PATH, "utf8"));
      memoryPublishState = { ...memoryPublishState, ...data };
      return memoryPublishState;
    }
  } catch (_) {}
  return memoryPublishState;
}

function savePublishState(newState) {
  memoryPublishState = {
    ...memoryPublishState,
    ...newState,
    updatedAt: Date.now(),
  };
  try {
    fs.writeFileSync(PUBLISH_FILE_PATH, JSON.stringify(memoryPublishState, null, 2), "utf8");
  } catch (_) {}
  return memoryPublishState;
}

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseServiceKey) return null;
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });
}

// GET: Ambil status publikasi nilai dan mode pengumuman juara
export async function GET() {
  try {
    const state = getPublishState();

    // Opsional: Cek jika ada informasi tambahan di Supabase
    const supabaseAdmin = getSupabaseAdmin();
    if (supabaseAdmin) {
      try {
        const { data: infoData } = await supabaseAdmin
          .from("informasi")
          .select("id, text")
          .order("created_at", { ascending: false });

        if (infoData && infoData.length > 0) {
          infoData.forEach((row) => {
            if (row.text === "__PUBLISH_ALL_SCORES__:true" || row.text === "__PUBLISH_ALL_SCORES__") {
              state.publishAll = true;
            } else if (row.text === "__CONFIG_SHOW_WINNERS:true" || row.text === "__SHOW_WINNERS__") {
              state.showWinners = true;
            } else if (row.text && row.text.startsWith("__PUBLISHED_JURI__:")) {
              const juriId = row.text.replace("__PUBLISHED_JURI__:", "").trim();
              if (juriId && !state.publishedJuriIds.includes(juriId)) {
                state.publishedJuriIds.push(juriId);
              }
            }
          });
        }
      } catch (_) {}
    }

    return NextResponse.json({
      success: true,
      publishAll: state.publishAll,
      publishedJuriIds: state.publishedJuriIds || [],
      showWinners: state.showWinners || false,
    });
  } catch (err) {
    const fallback = getPublishState();
    return NextResponse.json({
      success: true,
      publishAll: fallback.publishAll,
      publishedJuriIds: fallback.publishedJuriIds,
      showWinners: fallback.showWinners,
    });
  }
}

// POST: Ubah status publikasi nilai
export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { action, juri_id, showWinners: reqShowWinners } = body;

    if (!action) {
      return NextResponse.json({ error: "Parameter action wajib diisi." }, { status: 400 });
    }

    const currentState = getPublishState();
    const supabaseAdmin = getSupabaseAdmin();

    // 1. Action: PUBLISH SATU JURI
    if (action === "publish") {
      if (!juri_id) {
        return NextResponse.json({ error: "Parameter juri_id wajib diisi untuk aksi publish." }, { status: 400 });
      }

      const updatedIds = Array.from(new Set([...(currentState.publishedJuriIds || []), juri_id]));
      savePublishState({ publishedJuriIds: updatedIds });

      if (supabaseAdmin) {
        try {
          const flagText = `__PUBLISHED_JURI__:${juri_id}`;
          await supabaseAdmin.from("informasi").insert({ text: flagText });
        } catch (_) {}
      }

      return NextResponse.json({
        success: true,
        message: "Nilai juri berhasil dipublikasikan!",
        juri_id,
        publishAll: currentState.publishAll,
        publishedJuriIds: updatedIds,
      });
    }

    // 2. Action: UNPUBLISH SATU JURI (TARIK NILAI)
    if (action === "unpublish") {
      if (!juri_id) {
        return NextResponse.json({ error: "Parameter juri_id wajib diisi untuk aksi unpublish." }, { status: 400 });
      }

      const updatedIds = (currentState.publishedJuriIds || []).filter((id) => id !== juri_id);
      savePublishState({ publishedJuriIds: updatedIds, publishAll: false });

      if (supabaseAdmin) {
        try {
          await supabaseAdmin.from("informasi").delete().eq("text", `__PUBLISHED_JURI__:${juri_id}`);
          await supabaseAdmin.from("informasi").delete().eq("text", "__PUBLISH_ALL_SCORES__:true");
          await supabaseAdmin.from("informasi").delete().eq("text", "__PUBLISH_ALL_SCORES__");
        } catch (_) {}
      }

      return NextResponse.json({
        success: true,
        message: "Nilai juri berhasil ditarik dari Leaderboard.",
        juri_id,
        publishAll: false,
        publishedJuriIds: updatedIds,
      });
    }

    // 3. Action: PUBLISH SEMUA NILAI JURI
    if (action === "publish_all") {
      savePublishState({ publishAll: true });

      if (supabaseAdmin) {
        try {
          await supabaseAdmin.from("informasi").delete().eq("text", "__PUBLISH_ALL_SCORES__:true");
          await supabaseAdmin.from("informasi").delete().eq("text", "__PUBLISH_ALL_SCORES__");
          await supabaseAdmin.from("informasi").insert({ text: "__PUBLISH_ALL_SCORES__:true" });
        } catch (_) {}
      }

      return NextResponse.json({
        success: true,
        message: "Seluruh nilai dari semua Dewan Juri berhasil dipublikasikan ke Leaderboard!",
        publishAll: true,
        publishedJuriIds: currentState.publishedJuriIds,
      });
    }

    // 4. Action: UNPUBLISH SEMUA NILAI (TARIK SEMUA)
    if (action === "unpublish_all") {
      savePublishState({ publishAll: false, publishedJuriIds: [] });

      if (supabaseAdmin) {
        try {
          const { data: allFlags } = await supabaseAdmin.from("informasi").select("id, text");
          if (allFlags) {
            const toDel = allFlags
              .filter((f) => f.text?.startsWith("__PUBLISHED_JURI__:") || f.text?.startsWith("__PUBLISH_ALL_SCORES__"))
              .map((f) => f.id);
            if (toDel.length > 0) {
              await supabaseAdmin.from("informasi").delete().in("id", toDel);
            }
          }
        } catch (_) {}
      }

      return NextResponse.json({
        success: true,
        message: "Seluruh nilai berhasil ditarik. Semua skor juri kini berstatus tertahan.",
        publishAll: false,
        publishedJuriIds: [],
      });
    }

    // 5. Action: TOGGLE MODE JUARA
    if (action === "toggle_show_winners") {
      const nextShowWinners = reqShowWinners !== undefined ? !!reqShowWinners : !currentState.showWinners;
      savePublishState({ showWinners: nextShowWinners });

      if (supabaseAdmin) {
        try {
          if (nextShowWinners) {
            await supabaseAdmin.from("informasi").delete().eq("text", "__CONFIG_SHOW_WINNERS:false");
            await supabaseAdmin.from("informasi").insert({ text: "__CONFIG_SHOW_WINNERS:true" });
          } else {
            await supabaseAdmin.from("informasi").delete().eq("text", "__CONFIG_SHOW_WINNERS:true");
            await supabaseAdmin.from("informasi").delete().eq("text", "__SHOW_WINNERS__");
          }
        } catch (_) {}
      }

      return NextResponse.json({
        success: true,
        showWinners: nextShowWinners,
        message: nextShowWinners ? "Mode Juara Aktif" : "Mode Juara Non-Aktif",
      });
    }

    return NextResponse.json({ error: "Aksi tidak dikenal." }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
