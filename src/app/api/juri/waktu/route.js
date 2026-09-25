import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { isZeroOrEmptyTime } from "@/lib/timeUtils";

const TIME_SCORES_PATH = path.join(process.cwd(), "src", "lib", "timeScores.json");

let memoryTimeScores = {};

function getTimeScores() {
  try {
    if (fs.existsSync(TIME_SCORES_PATH)) {
      const data = JSON.parse(fs.readFileSync(TIME_SCORES_PATH, "utf8"));
      memoryTimeScores = { ...memoryTimeScores, ...data };
    }
  } catch (_) {}
  return memoryTimeScores;
}

function saveTimeScores(scoresToUpdate) {
  getTimeScores();
  for (const [key, val] of Object.entries(scoresToUpdate)) {
    if (isZeroOrEmptyTime(val)) {
      delete memoryTimeScores[key];
    } else {
      memoryTimeScores[key] = String(val).trim();
    }
  }
  try {
    fs.writeFileSync(TIME_SCORES_PATH, JSON.stringify(memoryTimeScores, null, 2), "utf8");
  } catch (_) {}
  return memoryTimeScores;
}

export async function GET() {
  const times = getTimeScores();
  return NextResponse.json({ success: true, times });
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const updates = {};

    if (body.peserta_id && body.lomba_id) {
      const key = `${body.peserta_id}_${body.lomba_id}`;
      updates[key] = body.waktu;
    } else if (body.times && typeof body.times === "object") {
      Object.assign(updates, body.times);
    }

    const saved = saveTimeScores(updates);
    return NextResponse.json({ success: true, times: saved });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
