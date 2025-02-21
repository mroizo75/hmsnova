import { useQuery } from "@tanstack/react-query"

export function useCompanyStats(companyId: string) {
  return useQuery({
    queryKey: ['companyStats', companyId],
    queryFn: async () => {
      const response = await fetch(`/api/stats/company/${companyId}`)
      if (!response.ok) throw new Error('Failed to fetch company stats')
      return response.json()
    }
  })
} 