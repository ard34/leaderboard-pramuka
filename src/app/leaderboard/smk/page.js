"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import LeaderboardTable from "@/components/LeaderboardTable";

export default function LeaderboardSMK() {
  const [peserta, setPeserta] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel("realtime-leaderboard-smk")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "peserta", filter: "kategori=eq.SMK" },
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
        { event: "INSERT", schema: "public", table: "peserta", filter: "kategori=eq.SMK" },
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
      .eq("kategori", "SMK")
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
          <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
          <span className="text-purple-400 font-bold tracking-widest text-sm">MEMUAT KLASEMEN SMK...</span>
        </div>
      </div>
    );
  }

  return (
    <LeaderboardTable
      data={peserta}
      accentColor="purple"
      tingkat="Tingkat Atas/Kejuruan (SMA/SMK/MA)"
    />
  );
}