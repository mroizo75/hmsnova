import type { Notification } from '@/lib/notifications/notification-service'

interface NotificationListProps {
  notifications: Notification[]
}

export function NotificationList({ notifications }: NotificationListProps) {
  return (
    <div className="fixed top-4 right-4 z-50">
      {notifications.map((notification) => (
        <div 
          key={notification.id}
          className={`mb-2 p-4 rounded-lg shadow-lg ${
            notification.type === 'error' ? 'bg-red-500' :
            notification.type === 'warning' ? 'bg-yellow-500' :
            notification.type === 'success' ? 'bg-green-500' :
            'bg-blue-500'
          } text-white`}
        >
          <h4 className="font-bold">{notification.title}</h4>
          <p>{notification.message}</p>
        </div>
      ))}
    </div>
  )
} 