import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import { notificationService } from '@/lib/notifications/notification-service'
import { NotificationList } from './notification-list'
import { useSession } from "next-auth/react"

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient()
  
  return (
    <QueryClientProvider client={queryClient}>
      <NotificationWrapper>{children}</NotificationWrapper>
    </QueryClientProvider>
  )
}

function NotificationWrapper({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()

  const { data: notifications } = useQuery({
    queryKey: ['notifications', session?.user?.id],
    queryFn: () => notificationService.getNotifications(session?.user?.id as string),
    enabled: !!session?.user?.id,
    refetchInterval: 30000
  })
  
  return (
    <>
      {notifications && <NotificationList notifications={notifications} />}
      {children}
    </>
  )
} 