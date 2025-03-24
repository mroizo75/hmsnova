/**
 * Dette er en standalone arbeiderprosess som kjører utenfor webapplikasjonen.
 * Denne filen er en CommonJS-versjon av worker som brukes med PM2
 */

// Aktiver .env-støtte
require('dotenv').config();
const { createServer } = require('http');
const { Server } = require('socket.io');
const IORedis = require('ioredis');

console.log('==================================');
console.log('Starter HMS Nova arbeiderprosess (CommonJS)');
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

// Forsøk å importere worker-modulene
let workers = null;
let socketServer = null;

try {
  // Forsøk å importere modulene
  try {
    workers = require('./src/lib/queue/worker-setup');
    if (workers && workers.ensureWorkersStarted) {
      console.log('Bakgrunnsarbeidere modul funnet...');
      workers.ensureWorkersStarted();
      console.log('Bakgrunnsarbeidere startet...');
    } else {
      console.warn('Bakgrunnsarbeidermodul finner, men mangler ensureWorkersStarted-funksjon');
    }
  } catch (workerError) {
    console.error('Kunne ikke starte bakgrunnsarbeidere:', workerError);
    console.log('Fortsetter uten bakgrunnsarbeidere');
  }

  try {
    socketServer = require('./src/lib/socket/server');
    if (socketServer && socketServer.startSocketServer) {
      const io = socketServer.startSocketServer();
      console.log('Socket.io-server startet via modul...');
    } else {
      console.warn('Socket-modul finner, men mangler startSocketServer-funksjon');
      // Start Socket.io-server manuelt
      startSocketServerManually();
    }
  } catch (socketError) {
    console.error('Kunne ikke starte socket server via modul:', socketError);
    console.log('Prøver å starte socket server manuelt...');
    startSocketServerManually();
  }
} catch (error) {
  console.error('Generell feil ved oppstart:', error);
  console.log('Starter socket server manuelt som fallback...');
  startSocketServerManually();
}

// Manuell Socket.io-server oppstart som fallback
function startSocketServerManually() {
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
      console.log('Socket.io-server startet manuelt på port', port);
    });
    
    // Sett opp feilhåndtering på HTTP-serveren
    httpServer.on('error', (error) => {
      console.error('HTTP server feil:', error);
    });
    
  } catch (error) {
    console.error('Feil ved start av manuell Socket.io-server:', error);
    console.log('Fortsetter uten Socket.io-server');
  }

  return io;
}

console.log('Arbeiderprosess aktiv.');
console.log('Trykk Ctrl+C for å avslutte');
console.log('==================================');

// Hold prosessen åpen
process.on('SIGINT', () => {
  console.log('Avslutter arbeiderprosess...');
  process.exit(0);
}); 