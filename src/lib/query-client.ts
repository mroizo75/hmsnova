import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // Data er "fresh" i 1 minutt
      gcTime: 1000 * 60 * 5, // Garbage collection etter 5 minutter (erstatter cacheTime i v4+)
      retry: 1,
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      refetchOnReconnect: true,
      // Sørg for at data er serialisert
      select: (data: any) => JSON.parse(JSON.stringify(data))
    }
  }
}) 