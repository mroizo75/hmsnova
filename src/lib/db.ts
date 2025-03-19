import { PrismaClient } from '@prisma/client'
import logger from './utils/logger'
import { EventEmitter } from 'events'

declare global {
  var prisma: PrismaClient | undefined
  var prismaEventHandlersRegistered: boolean | undefined
}

// Konfigurer Prisma-klienten med logging i utviklingsmiljø
const prismaClientSingleton = () => {
  // Sjekk om detaljert logging er aktivert
  const enableDetailedLogging = process.env.PRISMA_DETAILED_LOGGING === 'true';
  
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' && enableDetailedLogging
      ? [
          { emit: 'event', level: 'query' },
          { emit: 'event', level: 'error' },
          { emit: 'event', level: 'info' },
          { emit: 'event', level: 'warn' },
        ]
      : ['error'], // Logg bare feil som standard
  })
}

export const prisma = globalThis.prisma || prismaClientSingleton()

// Type definisjon for Prisma event-lyttere
type PrismaEvent = {
  timestamp: Date
  message: string
  target: string
  params: string
  duration: number
  query: string
}

// Legg til event-lyttere for logging i utviklingsmiljø
if (process.env.NODE_ENV === 'development' && !globalThis.prismaEventHandlersRegistered && process.env.PRISMA_DETAILED_LOGGING === 'true') {
  // Sett en global variabel for å unngå dobbel registrering
  globalThis.prismaEventHandlersRegistered = true;
  
  // @ts-ignore - Prisma event lyttere er ikke riktig typet i Prisma-klienten
  prisma.$on('query', (e: PrismaEvent) => {
    logger.debug('Prisma Query', { 
      context: 'prisma',
      data: { 
        query: e.query,
        params: e.params,
        duration: `${e.duration}ms`
      }
    })
  })

  // @ts-ignore - Prisma event lyttere er ikke riktig typet i Prisma-klienten
  prisma.$on('error', (e: PrismaEvent) => {
    logger.error('Prisma Error', { 
      context: 'prisma',
      error: new Error(e.message)
    })
  })

  // @ts-ignore - Prisma event lyttere er ikke riktig typet i Prisma-klienten
  prisma.$on('info', (e: PrismaEvent) => {
    logger.info('Prisma Info', { 
      context: 'prisma',
      data: { message: e.message }
    })
  })

  // @ts-ignore - Prisma event lyttere er ikke riktig typet i Prisma-klienten
  prisma.$on('warn', (e: PrismaEvent) => {
    logger.warn('Prisma Warning', { 
      context: 'prisma',
      data: { message: e.message }
    })
  })
  
  // Øk MaxListeners-grensen for å unngå advarsler hvis lyttere fortsatt akkumuleres
  // @ts-ignore - Prisma er en EventEmitter under panseret, men vi kan ikke få direkte tilgang til den
  if (prisma._engineClient && prisma._engineClient.listenerCount) {
    // @ts-ignore
    prisma._engineClient.setMaxListeners(20);
  }
}

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma
}

export default prisma 