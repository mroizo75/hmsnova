import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { SJAWithRelations } from '@/types/sja';

interface SJAQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

interface SJADataResponse {
  items: SJAWithRelations[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Custom hook for å hente SJA-data med React Query
 * Implementerer optimalisert caching-strategi med staleTime og retries
 */
export function useSJAData(params: SJAQueryParams = {}) {
  const { page = 1, limit = 10, search = '', status = '' } = params;
  const queryClient = useQueryClient();
  
  // Bygg URL med query-parametre
  const buildURL = () => {
    const url = new URL('/api/sja', window.location.origin);
    url.searchParams.append('page', page.toString());
    url.searchParams.append('limit', limit.toString());
    if (search) url.searchParams.append('search', search);
    if (status) url.searchParams.append('status', status);
    return url.toString();
  };

  // Fetch-funksjon med error handling
  const fetchSJAData = async (): Promise<SJADataResponse> => {
    const response = await fetch(buildURL());
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Kunne ikke hente SJA-data');
    }
    
    return await response.json();
  };

  // Bruk React Query med optimalisert caching
  const query = useQuery({
    queryKey: ['sja-list', { page, limit, search, status }],
    queryFn: fetchSJAData,
    staleTime: 1000 * 60 * 5, // 5 minutter før data anses som utdatert
    gcTime: 1000 * 60 * 10,   // 10 minutter før cache slettes hvis ubrukt
    retry: 2,                  // Prøv på nytt 2 ganger ved feil
    refetchOnWindowFocus: true, // Oppdater når vinduet får fokus
    refetchOnMount: true,      // Oppdater når komponenten mountes
  });

  // Mutation for å opprette ny SJA med optimistisk oppdatering
  const createSJAMutation = useMutation({
    mutationFn: async (nySja: Partial<SJAWithRelations>) => {
      const response = await fetch('/api/sja', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nySja),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Kunne ikke opprette SJA');
      }
      
      return await response.json();
    },
    onMutate: async (nySja) => {
      // Kanseller utestående spørringer for å unngå race conditions
      await queryClient.cancelQueries({ queryKey: ['sja-list'] });
      
      // Ta vare på tidligere tilstand
      const previousData = queryClient.getQueryData(['sja-list', { page, limit, search, status }]);
      
      // Optimistisk oppdatering
      queryClient.setQueryData(['sja-list', { page, limit, search, status }], (oldData: any) => {
        const currentData = oldData || { items: [], total: 0, page: 1, limit: 10, totalPages: 1 };
        
        // Beregn den optimistiske ID-en (vil bli overskrevet med faktisk ID når serveren svarer)
        const optimisticId = `temp-${Date.now()}`;
        
        // Opprett optimistisk SJA-objekt
        const optimisticSja = {
          id: optimisticId,
          ...nySja,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          // Legg til andre nødvendige standardverdier...
        };
        
        return {
          ...currentData,
          items: [optimisticSja, ...currentData.items],
          total: currentData.total + 1,
          totalPages: Math.ceil((currentData.total + 1) / limit),
        };
      });
      
      return { previousData };
    },
    onError: (error, variables, context) => {
      // Tilbakestill til tidligere tilstand
      queryClient.setQueryData(['sja-list', { page, limit, search, status }], context?.previousData);
      toast.error(error.message || 'Kunne ikke opprette SJA');
    },
    onSuccess: (data) => {
      toast.success('SJA ble opprettet');
      
      // Oppdater detalj-cache for den nye SJA-en
      queryClient.setQueryData(['sja-detail', data.id], data);
    },
    onSettled: () => {
      // Invalider spørringer for å sikre frisk data
      queryClient.invalidateQueries({ queryKey: ['sja-list'] });
    },
  });

  // Mutation for å oppdatere SJA med optimistisk oppdatering
  const updateSJAMutation = useMutation({
    mutationFn: async (sja: Partial<SJAWithRelations> & { id: string }) => {
      const response = await fetch('/api/sja', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sja),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Kunne ikke oppdatere SJA');
      }
      
      return await response.json();
    },
    onMutate: async (updatedSja) => {
      // Kanseller utestående spørringer
      await queryClient.cancelQueries({ queryKey: ['sja-list'] });
      await queryClient.cancelQueries({ queryKey: ['sja-detail', updatedSja.id] });
      
      // Ta vare på tidligere tilstand
      const previousListData = queryClient.getQueryData(['sja-list', { page, limit, search, status }]);
      const previousDetailData = queryClient.getQueryData(['sja-detail', updatedSja.id]);
      
      // Optimistisk oppdatering for listen
      queryClient.setQueryData(['sja-list', { page, limit, search, status }], (oldData: any) => {
        if (!oldData) return oldData;
        
        return {
          ...oldData,
          items: oldData.items.map((item: SJAWithRelations) => 
            item.id === updatedSja.id ? { ...item, ...updatedSja, updatedAt: new Date().toISOString() } : item
          ),
        };
      });
      
      // Optimistisk oppdatering for detaljer
      if (previousDetailData) {
        queryClient.setQueryData(['sja-detail', updatedSja.id], (oldData: any) => {
          if (!oldData) return oldData;
          return { ...oldData, ...updatedSja, updatedAt: new Date().toISOString() };
        });
      }
      
      return { previousListData, previousDetailData };
    },
    onError: (error, variables, context) => {
      // Tilbakestill til tidligere tilstand
      queryClient.setQueryData(['sja-list', { page, limit, search, status }], context?.previousListData);
      queryClient.setQueryData(['sja-detail', variables.id], context?.previousDetailData);
      toast.error(error.message || 'Kunne ikke oppdatere SJA');
    },
    onSuccess: (data) => {
      toast.success('SJA ble oppdatert');
      
      // Oppdater detalj-cache med server-respons
      queryClient.setQueryData(['sja-detail', data.id], data);
    },
    onSettled: (data) => {
      // Invalider spørringer for å sikre frisk data
      queryClient.invalidateQueries({ queryKey: ['sja-list'] });
      if (data) {
        queryClient.invalidateQueries({ queryKey: ['sja-detail', data.id] });
      }
    },
  });

  // Mutation for å slette SJA med optimistisk oppdatering
  const deleteSJAMutation = useMutation({
    mutationFn: async (id: string) => {
      const url = new URL('/api/sja', window.location.origin);
      url.searchParams.append('id', id);
      
      const response = await fetch(url.toString(), {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Kunne ikke slette SJA');
      }
      
      return await response.json();
    },
    onMutate: async (id) => {
      // Kanseller utestående spørringer
      await queryClient.cancelQueries({ queryKey: ['sja-list'] });
      await queryClient.cancelQueries({ queryKey: ['sja-detail', id] });
      
      // Ta vare på tidligere tilstand
      const previousListData = queryClient.getQueryData(['sja-list', { page, limit, search, status }]);
      
      // Optimistisk oppdatering
      queryClient.setQueryData(['sja-list', { page, limit, search, status }], (oldData: any) => {
        if (!oldData) return oldData;
        
        const filteredItems = oldData.items.filter((item: SJAWithRelations) => item.id !== id);
        
        return {
          ...oldData,
          items: filteredItems,
          total: oldData.total - 1,
          totalPages: Math.ceil((oldData.total - 1) / limit),
        };
      });
      
      // Fjern fra detalj-cache
      queryClient.removeQueries({ queryKey: ['sja-detail', id] });
      
      return { previousListData };
    },
    onError: (error, variables, context) => {
      // Tilbakestill til tidligere tilstand
      queryClient.setQueryData(['sja-list', { page, limit, search, status }], context?.previousListData);
      toast.error(error.message || 'Kunne ikke slette SJA');
    },
    onSuccess: () => {
      toast.success('SJA ble slettet');
    },
    onSettled: () => {
      // Invalider spørringer for å sikre frisk data
      queryClient.invalidateQueries({ queryKey: ['sja-list'] });
    },
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    isRefetching: query.isRefetching,
    createSJA: createSJAMutation.mutate,
    isCreating: createSJAMutation.isPending,
    updateSJA: updateSJAMutation.mutate,
    isUpdating: updateSJAMutation.isPending,
    deleteSJA: deleteSJAMutation.mutate,
    isDeleting: deleteSJAMutation.isPending,
    refetch: query.refetch,
  };
} 