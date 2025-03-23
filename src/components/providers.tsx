"use client"

import { useState } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { SessionProvider, useSession } from "next-auth/react"
import { TokenRefreshHandler } from "./token-refresh-handler"
import { Toaster } from "./ui/toaster"

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutter
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  }))

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <TokenRefreshWithSession />
        <Toaster />
        {children}
      </QueryClientProvider>
    </SessionProvider>
  )
}

function TokenRefreshWithSession() {
  const { data: session } = useSession()
  const refreshToken = async () => {
    if (session?.user?.email) {
      try {
        const response = await fetch("/api/auth/session", {
          method: "GET",
          credentials: "include",
        })

        if (!response.ok) {
          throw new Error("Kunne ikke oppdatere sesjon")
        }

        return await response.json()
      } catch (error) {
        console.error("Feil ved tokenoppdatering:", error)
        throw error
      }
    }
    return null
  }

  return session ? <TokenRefreshHandler onRefresh={refreshToken} /> : null
} 