import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import { notificationService } from '@/lib/notifications/notification-service'
import { NotificationList } from './notification-list'

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient()
  
  return (
    <QueryClientProvider client={queryClient}>
      <NotificationWrapper>{children}</NotificationWrapper>
    </QueryClientProvider>
  )
}

function NotificationWrapper({ children }: { children: React.ReactNode }) {
  const { data: notifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationService.getNotifications(/* userId */),
    refetchInterval: 30000 // Oppdater hvert 30. sekund
  })
  
  return (
    <>
      {notifications && <NotificationList notifications={notifications} />}
      {children}
    </>
  )
} 