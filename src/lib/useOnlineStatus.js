"use client";

import { useState, useEffect } from "react";

/**
 * Hook untuk mendeteksi status koneksi internet.
 * Digunakan di panel Juri dan Admin untuk menampilkan warning
 * saat koneksi terputus (FR: Mitigasi Jaringan Putus).
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Set initial status
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}
