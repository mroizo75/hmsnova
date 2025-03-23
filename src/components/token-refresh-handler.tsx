"use client";

import { useEffect, useRef } from "react";

interface TokenRefreshHandlerProps {
  onRefresh: () => Promise<any>;
  refreshInterval?: number;
}

export function TokenRefreshHandler({
  onRefresh,
  refreshInterval = 5 * 60 * 1000, // 5 minutter standard intervall
}: TokenRefreshHandlerProps) {
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Sett opp timer som kjører refresh-funksjonen med jevne mellomrom
    const refreshToken = async () => {
      try {
        await onRefresh();
        console.log("Token refreshed successfully");
      } catch (error) {
        console.error("Failed to refresh token:", error);
      }
    };

    // Initialiser timeren
    refreshTimerRef.current = setInterval(refreshToken, refreshInterval);

    // Rydd opp timeren når komponenten avmonteres
    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, [onRefresh, refreshInterval]);

  // Denne komponenten rendrer ikke noe UI
  return null;
} 