import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formaterer en dato til norsk format (DD.MM.YYYY)
 */
export function formatDate(date: Date | string | null): string {
  if (!date) return 'Ikke satt';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  
  return d.toLocaleDateString('nb-NO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}
