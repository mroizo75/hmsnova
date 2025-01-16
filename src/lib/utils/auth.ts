import { hash, compare } from 'bcryptjs'
import { createHash } from 'crypto'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"

// Interface for passordvalidering
interface PasswordValidation {
  isValid: boolean;
  errors: string[];
}

// Konstanter for passordkrav
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 128;

// Konstanter for passordgenerering
const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz'
const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const NUMBERS = '0123456789'
const SYMBOLS = '!@#$%^&*'

export async function hashPassword(password: string): Promise<string> {
  return hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return compare(password, hashedPassword)
}

// Sjekk for passordstyrke
export function validatePassword(password: string): PasswordValidation {
  const errors: string[] = [];

  if (password.length < PASSWORD_MIN_LENGTH) {
    errors.push(`Passordet må være minst ${PASSWORD_MIN_LENGTH} tegn`);
  }

  if (password.length > PASSWORD_MAX_LENGTH) {
    errors.push(`Passordet kan ikke være lengre enn ${PASSWORD_MAX_LENGTH} tegn`);
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Passordet må inneholde minst én stor bokstav');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Passordet må inneholde minst én liten bokstav');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Passordet må inneholde minst ett tall');
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Passordet må inneholde minst ett spesialtegn');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Rate limiting helper
export class RateLimiter {
  private attempts: Map<string, number> = new Map();
  private timestamps: Map<string, number> = new Map();
  private readonly maxAttempts: number;
  private readonly windowMs: number;

  constructor(maxAttempts = 5, windowMs = 15 * 60 * 1000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  async checkLimit(key: string): Promise<boolean> {
    const now = Date.now();
    const timestamp = this.timestamps.get(key) || 0;
    
    if (now - timestamp > this.windowMs) {
      this.attempts.set(key, 1);
      this.timestamps.set(key, now);
      return true;
    }

    const attempts = this.attempts.get(key) || 0;
    if (attempts >= this.maxAttempts) {
      return false;
    }

    this.attempts.set(key, attempts + 1);
    return true;
  }

  reset(key: string): void {
    this.attempts.delete(key);
    this.timestamps.delete(key);
  }
}

// Sikker email normalisering
export function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

// Generate secure token
export function generateSecureToken(length = 32): string {
  return createHash('sha256')
    .update(crypto.randomBytes(length).toString('hex'))
    .digest('hex');
}

export function generatePassword(length = 12): string {
  const allChars = LOWERCASE + UPPERCASE + NUMBERS + SYMBOLS
  let password = ''

  // Sikre at vi har minst én av hver type
  password += UPPERCASE[Math.floor(Math.random() * UPPERCASE.length)]
  password += LOWERCASE[Math.floor(Math.random() * LOWERCASE.length)]
  password += NUMBERS[Math.floor(Math.random() * NUMBERS.length)]
  password += SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]

  // Fyll resten med tilfeldige tegn
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)]
  }

  // Bland passordtegnene
  return password.split('').sort(() => Math.random() - 0.5).join('')
}

export async function requireAuth() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    throw new Error("Ikke innlogget")
  }

  if (!session.user.companyId) {
    throw new Error("Bruker er ikke tilknyttet et selskap")
  }

  return session
} 