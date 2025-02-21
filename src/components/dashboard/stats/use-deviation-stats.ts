import { useQuery } from "@tanstack/react-query"

export function useDeviationStats(companyId: string) {
  return useQuery({
    queryKey: ['deviationStats', companyId],
    queryFn: async () => {
      const response = await fetch(`/api/stats/deviations/${companyId}`)
      if (!response.ok) throw new Error('Failed to fetch deviation stats')
      return response.json()
    }
  })
} 