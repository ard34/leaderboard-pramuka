"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import LeaderboardTable from "@/components/LeaderboardTable";
import LiveTicker from "@/components/LiveTicker";

export default function LeaderboardSMP() {
  const [peserta, setPeserta] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel("realtime-leaderboard-smp")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "peserta", filter: "kategori=eq.SMP" },
        (payload) => {
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
        { event: "INSERT", schema: "public", table: "peserta", filter: "kategori=eq.SMP" },
        (payload) => {
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
  }, []);

  const fetchData = async () => {
    const { data, error } = await supabase
      .from("peserta")
      .select("id, nomor_dada, nama_regu, pangkalan, total_nilai")
      .eq("kategori", "SMP")
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
          <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
          <span className="text-cyan-400 font-bold tracking-widest text-sm">MEMUAT KLASEMEN SMP...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <LeaderboardTable
        data={peserta}
        accentColor="cyan"
        tingkat="Tingkat Menengah Pertama (SMP/MTs)"
      />
      <LiveTicker accentColor="cyan" kategori="SMP" />
    </>
  );
}