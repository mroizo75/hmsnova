export function formatDate(date: Date | string): string {
  const d = new Date(date)
  return new Intl.DateTimeFormat('nb-NO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(d)
}

export function formatDateShort(date: Date | string): string {
  const d = new Date(date)
  return new Intl.DateTimeFormat('nb-NO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(d)
}

export function formatTime(date: Date | string): string {
  const d = new Date(date)
  return new Intl.DateTimeFormat('nb-NO', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(d)
}

export function isToday(date: Date | string): boolean {
  const today = new Date()
  const d = new Date(date)
  return d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
}

export function isYesterday(date: Date | string): boolean {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const d = new Date(date)
  return d.getDate() === yesterday.getDate() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getFullYear() === yesterday.getFullYear()
}

export function formatRelativeDate(date: Date | string): string {
  const d = new Date(date)
  
  if (isToday(d)) {
    return `I dag, ${formatTime(d)}`
  }
  
  if (isYesterday(d)) {
    return `I går, ${formatTime(d)}`
  }
  
  return formatDate(d)
} 