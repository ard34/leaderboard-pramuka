"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import LeaderboardTable from "@/components/LeaderboardTable";

export default function LeaderboardSD() {
  const [peserta, setPeserta] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gender, setGender] = useState(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("_lb_sd_gender") || "Laki-laki";
    }
    return "Laki-laki";
  });

  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel(`realtime-leaderboard-sd-${gender}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "peserta", filter: "kategori=eq.SD" },
        (payload) => {
          if (payload.new.gender !== gender) return;
          setPeserta((currentData) => {
            const updatedData = currentData.map((p) =>
              p.id === payload.new.id ? { ...p, total_nilai: payload.new.total_nilai } : p
            );
            return updatedData.sort((a, b) => (b.total_nilai ?? 0) - (a.total_nilai ?? 0));
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "peserta", filter: "kategori=eq.SD" },
        (payload) => {
          if (payload.new.gender !== gender) return;
          setPeserta((currentData) => {
            const exists = currentData.find((p) => p.id === payload.new.id);
            if (exists) return currentData;
            const updated = [...currentData, payload.new];
            return updated.sort((a, b) => (b.total_nilai ?? 0) - (a.total_nilai ?? 0));
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gender]);

  useEffect(() => {
    try { sessionStorage.setItem("_lb_sd_gender", gender); } catch (_) {}
  }, [gender]);

  const fetchData = async () => {
    const { data, error } = await supabase
      .from("peserta")
      .select("id, nomor_dada, nama_regu, pangkalan, total_nilai, gender, no_gudep")
      .eq("kategori", "SD")
      .eq("gender", gender)
      .eq("is_verified", true)
      .order("total_nilai", { ascending: false });

    if (!error && data) {
      setPeserta(data);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
          <span className="text-emerald-400 font-bold tracking-widest text-sm">MEMUAT KLASEMEN SD...</span>
        </div>
      </div>
    );
  }

  return (
    <LeaderboardTable
      data={peserta}
      accentColor="emerald"
      tingkat="Tingkat Sekolah Dasar (SD/MI)"
      gender={gender}
      onGenderChange={(g) => { setGender(g); setLoading(true); }}
    />
  );
}