import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // Data er "fresh" i 5 minutter
      cacheTime: 1000 * 60 * 30, // Cache beholdes i 30 minutter
      retry: 1,
      refetchOnWindowFocus: false,
      // Sørg for at data er serialisert
      select: (data: any) => JSON.parse(JSON.stringify(data))
    }
  }
}) 