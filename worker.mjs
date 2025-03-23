/**
 * Dette er en standalone arbeiderprosess som kjører utenfor webapplikasjonen.
 * Denne filen er en konvertert ES Module-versjon (mjs) av worker.ts
 * for bruk i produksjonsmiljø med Node.js
 */

// Aktiver .env-støtte
import 'dotenv/config';
import { createServer } from 'http';
import { Server } from 'socket.io';
import IORedis from 'ioredis';

console.log('==================================');
console.log('Starter HMS Nova arbeiderprosess (ESM)');
console.log('==================================');
console.log('Miljø:', process.env.NODE_ENV || 'development');

// Sjekk om vi skal bruke Redis-fallback
const useRedisFallback = process.env.REDIS_FALLBACK === 'true';

if (useRedisFallback) {
  console.log('MERKNAD: Kjører med REDIS_FALLBACK=true. Redis-funksjoner vil være begrenset.');
} else {
  // Vis Redis URL trygt (skjul passord)
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  const safeRedisUrl = redisUrl.replace(/\/\/(.+?)@/, '//****@');
  console.log('Redis URL:', safeRedisUrl);
}

console.log('----------------------------------');

// Start Socket.io-server
let io = null;
try {
  const httpServer = createServer();
  const port = parseInt(process.env.SOCKET_PORT || '3002', 10);
  
  // Konfigurer Socket.io med forbedrede innstillinger
  io = new Server(httpServer, {
    cors: {
      origin: ["http://localhost:3000", "http://localhost:3001", process.env.NEXT_PUBLIC_BASE_URL || "*"],
      methods: ["GET", "POST"],
      credentials: true
    },
    pingInterval: parseInt(process.env.WS_PING_INTERVAL || '25000', 10),
    pingTimeout: parseInt(process.env.WS_PING_TIMEOUT || '10000', 10),
    connectTimeout: 45000, // 45 sekunder
    transports: ['websocket', 'polling']
  });

  // Håndter tilkoblinger
  io.on('connection', (socket) => {
    console.log('Ny socket-tilkobling:', socket.id);
    
    socket.on('disconnect', (reason) => {
      console.log(`Socket ${socket.id} frakoblet. Årsak: ${reason}`);
    });
    
    socket.on('error', (error) => {
      console.error(`Socket ${socket.id} feil:`, error);
    });
    
    // Enkelt ping/pong for å holde tilkoblingen åpen
    socket.on('ping', (callback) => {
      if (typeof callback === 'function') {
        callback({ status: 'pong', time: Date.now() });
      }
    });
  });

  // Start serveren
  httpServer.listen(port, () => {
    console.log('Socket.io-server startet på port', port);
  });
  
  // Sett opp feilhåndtering på HTTP-serveren
  httpServer.on('error', (error) => {
    console.error('HTTP server feil:', error);
  });
  
} catch (error) {
  console.error('Feil ved start av Socket.io-server:', error);
  console.log('Fortsetter uten Socket.io-server');
}

// Enkel funksjon for å sende en melding til alle tilkoblede klienter
const broadcastToAll = (event, data) => {
  if (io) {
    io.emit(event, data);
    return true;
  }
  return false;
};

// Eksporter funksjoner for ekstern bruk
export const socketServer = {
  io,
  broadcastToAll
};

console.log('Arbeiderprosess aktiv.');
console.log('Trykk Ctrl+C for å avslutte');
console.log('==================================');

// Hold prosessen åpen
process.on('SIGINT', () => {
  console.log('Avslutter arbeiderprosess...');
  if (io) {
    io.close();
  }
  process.exit(0);
}); 