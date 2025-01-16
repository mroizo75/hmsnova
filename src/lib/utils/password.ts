import { randomBytes } from "crypto"

export function generatePassword(length: number = 12): string {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
  const bytes = randomBytes(length)
  const result = new Array(length)
  
  for (let i = 0; i < length; i++) {
    result[i] = charset[bytes[i] % charset.length]
  }
  
  return result.join('')
}

export function validatePassword(password: string): boolean {
  // Minst 8 tegn
  if (password.length < 8) return false
  
  // Må inneholde minst ett tall
  if (!/\d/.test(password)) return false
  
  // Må inneholde minst én stor bokstav
  if (!/[A-Z]/.test(password)) return false
  
  // Må inneholde minst én liten bokstav
  if (!/[a-z]/.test(password)) return false
  
  return true
} 