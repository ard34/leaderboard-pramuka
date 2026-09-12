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

async function check() {
  const { data: allProfiles, error } = await sb
    .from("profiles")
    .select("*");
  console.log("Profiles count:", allProfiles?.length, "Error:", error);
  allProfiles?.forEach(p => console.log(p));

  const { data: allPenilaian } = await sb
    .from("penilaian")
    .select("id, peserta_id, juri_id, lomba_id, nilai");
  console.log("\nPenilaian count:", allPenilaian?.length);
  if (allPenilaian && allPenilaian.length > 0) {
    console.log("Sample penilaian:", allPenilaian.slice(0, 5));
  }
}

check();
