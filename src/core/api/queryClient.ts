import { QueryClient } from '@tanstack/react-query'

/**
 * Cliente de TanStack Query: caché, reintentos y estados de carga
 * para todas las lecturas de datos del sistema.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000, // 1 min: evita refetch agresivo
      gcTime: 5 * 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
})
