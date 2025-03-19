export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

export function formatCurrency(
  value: number, 
  locale: string = 'nb-NO', 
  currency: string = 'NOK', 
  maximumFractionDigits: number = 0,
  compact: boolean = false
): string {
  if (compact && value >= 1000) {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M ${currency}`
    }
    return `${(value / 1000).toFixed(0)}k ${currency}`
  }
  
  return new Intl.NumberFormat(locale, { 
    style: 'currency', 
    currency, 
    maximumFractionDigits 
  }).format(value)
} 