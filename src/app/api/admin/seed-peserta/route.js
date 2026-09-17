import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      success: false,
      error: "Fitur seed peserta uji coba dinonaktifkan. Seluruh data peserta dan juri disinkronkan langsung dari Database Supabase Produksi.",
    },
    { status: 403 }
  );
}
