import { createServer } from 'http';
import { Server } from 'socket.io';
import { getIO, setIO } from './store';
import { logger } from '@/lib/utils/logger';
import IORedis from 'ioredis';

export function startSocketServer() {
  try {
    const httpServer = createServer();
    
    // Konfigurer Socket.IO-server med feilsikring for Redis
    const ioOptions: any = {
      cors: {
        origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true
      },
      path: '/socket.io',
      // Økte intervaller for å redusere frekvensen av hjerteslagmeldinger
      pingTimeout: 60000, // 60 sekunder (standard er 20s)
      pingInterval: 30000  // 30 sekunder (standard er 25s)
    };
    
    // Legg til Redis-adapter hvis Redis er tilgjengelig og REDIS_FALLBACK ikke er satt
    if (process.env.REDIS_URL && process.env.REDIS_FALLBACK !== 'true') {
      try {
        const redisUrl = process.env.REDIS_URL;
        
        // Konfigurer tilkoblingsopsjoner for Redis med optimaliserte innstillinger
        const redisOptions: {
          maxRetriesPerRequest: number | null;
          enableReadyCheck: boolean;
          reconnectOnError?: (err: Error) => boolean;
          tls?: { rejectUnauthorized: boolean };
          disconnectTimeout?: number;
          connectTimeout?: number;
          commandTimeout?: number;
          retryStrategy?: (times: number) => number | null;
        } = {
          maxRetriesPerRequest: 3, // Begrens antall forsøk per forespørsel
          enableReadyCheck: false,
          connectTimeout: 5000, // 5s tilkoblingstimeout
          commandTimeout: 3000, // 3s kommandotimeout
          reconnectOnError: (err: Error) => {
            const targetError = "READONLY";
            if (err.message.includes(targetError)) {
              // Kun forsøk å koble til på nytt ved READONLY-feil
              return true;
            }
            return false;
          },
          retryStrategy: (times) => {
            // Maks 5 forsøk med eksponentiell backoff
            if (times > 5) return null; 
            return Math.min(times * 200, 5000);
          }
        };
        
        // Legg til TLS opsjoner for Upstash
        if (redisUrl.includes('upstash.io')) {
          redisOptions.tls = { rejectUnauthorized: false };
        }
        
        // Opprett Redis-klient direkte uten "test"-kobling
        logger.info('Konfigurerer Socket.IO med Redis-tilkobling', {
          context: 'socket-server'
        });
        
        // Her kan du legge til Redis-adapter kode hvis nødvendig i fremtiden
        
      } catch (error) {
        logger.warn('Kunne ikke konfigurere Redis for Socket.IO', {
          context: 'socket-server',
          error: error instanceof Error ? error : new Error(String(error))
        });
      }
    } else {
      logger.info('Starter Socket.IO uten Redis-adapter (redis ikke konfigurert eller fallback aktivert)', {
        context: 'socket-server'
      });
    }
    
    // Opprett Socket.IO-server
    const io = new Server(httpServer, ioOptions);

    io.on('connection', (socket) => {
      // Logger kun ved oppkobling og frakobling, ikke ved hver hendelse
      logger.info('Socket.io klient tilkoblet', {
        context: 'socket-server',
        data: { socketId: socket.id }
      });

      socket.on('join-company', (companyId) => {
        socket.join(`company-${companyId}`);
        // Denne typen logg er viktig for å feilsøke tilgangsproblemer
        logger.info(`Socket tilknyttet bedrift`, {
          context: 'socket-server',
          data: { socketId: socket.id, companyId }
        });
      });

      socket.on('disconnect', () => {
        logger.info('Socket.io klient frakoblet', {
          context: 'socket-server', 
          data: { socketId: socket.id }
        });
      });
    });

    const port = parseInt(process.env.SOCKET_PORT || '3001', 10);
    httpServer.listen(port, () => {
      logger.info(`Socket.IO server startet på port ${port}`, {
        context: 'socket-server'
      });
    });

    // Lagre IO-instansen i den delte lagringen
    setIO(io);

    return io;
  } catch (error) {
    logger.error('Feil ved oppstart av Socket.io-server', {
      context: 'socket-server',
      error: error instanceof Error ? error : new Error(String(error))
    });
    throw error;
  }
} 