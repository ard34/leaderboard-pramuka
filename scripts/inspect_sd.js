const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

const envFile = fs.readFileSync(path.resolve(".env.local"), "utf8");
const env = {};
envFile.split(/\r?\n/).forEach((line) => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, "");
  }
});

const sb = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function inspectData() {
  const { data: lomba } = await sb
    .from("lomba")
    .select("id, nama_lomba, kode_lomba, kategori")
    .eq("kategori", "SD")
    .order("kode_lomba");
  console.log("SD Lomba:", lomba);

  const { data: peserta } = await sb
    .from("peserta")
    .select("id, nomor_dada, nama_regu, pangkalan, gender, no_gudep")
    .eq("kategori", "SD")
    .order("nomor_dada");
  console.log(`Total SD peserta: ${peserta?.length}`);
  console.log("SD Putra:", peserta?.filter(p => p.gender === "Laki-laki").length);
  console.log("SD Putri:", peserta?.filter(p => p.gender === "Perempuan").length);
}

inspectData();
