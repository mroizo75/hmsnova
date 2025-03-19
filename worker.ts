/**
 * Dette er en standalone arbeiderprosess som kjører utenfor webapplikasjonen.
 * Den kan startes med: npm run workers
 */

// Aktiver .env-støtte
import 'dotenv/config';

// Importer arbeideroppsettet
import { ensureWorkersStarted } from './src/lib/queue/worker-setup';
import { startSocketServer } from './src/lib/socket/server';

console.log('==================================');
console.log('Starter HMS Nova arbeiderprosess');
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

// Start arbeiderne
try {
  ensureWorkersStarted();
  console.log('Bakgrunnsarbeidere startet...');
} catch (error) {
  console.error('Feil ved start av bakgrunnsarbeidere:', error);
  console.log('Fortsetter uten bakgrunnsarbeidere');
}

// Start Socket.io-server
try {
  const io = startSocketServer();
  console.log('Socket.io-server startet på port', process.env.SOCKET_PORT || '3001');
} catch (error) {
  console.error('Feil ved start av Socket.io-server:', error);
  console.log('Fortsetter uten Socket.io-server');
}

console.log('Arbeiderprosess aktiv.');
console.log('Trykk Ctrl+C for å avslutte');
console.log('=================================='); 