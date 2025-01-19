import { useQuery } from "@tanstack/react-query"

export function useSectionChanges(sectionId: string) {
  const { data } = useQuery({
    queryKey: ['section-changes', sectionId],
    queryFn: async () => {
      const res = await fetch(`/api/hms/sections/${sectionId}/changes`)
      return res.json()
    }
  })
  return data
} 