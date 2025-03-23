// Script for å teste Redis-tilkobling
const { Queue } = require('bullmq');
const IORedis = require('ioredis');
require('dotenv').config();

console.log('Redis URL:', process.env.REDIS_URL);

// Opprett Redis-tilkobling
const redisUrl = process.env.REDIS_URL;
const isUpstash = redisUrl.includes('upstash.io');
const connectionOptions = {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  connectTimeout: 1000,
  reconnectOnError: (err) => {
    console.error('Redis-feil:', err.message);
    return false;
  }
};

// Legg til TLS-opsjoner for Upstash
if (isUpstash) {
  connectionOptions.tls = {
    rejectUnauthorized: false
  };
  console.log('Bruker TLS for Upstash Redis');
  
  // Sjekk om URL bruker SSL
  if (!redisUrl.startsWith('rediss://')) {
    console.warn('ADVARSEL: Redis URL bruker ikke SSL (rediss://). Dette kan føre til tilkoblingsproblemer med Upstash.');
    console.log('Nåværende URL:', redisUrl);
    console.log('Anbefalt format: rediss://default:password@host:port');
  }
}

// Test tilkoblingen
console.log('Kobler til Redis med følgende opsjoner:', JSON.stringify(connectionOptions, null, 2));
const connection = new IORedis(redisUrl, connectionOptions);

connection.on('connect', () => {
  console.log('Tilkobling opprettet!');
});

connection.on('error', (err) => {
  console.error('Tilkoblingsfeil:', err);
});

// Test at vi kan sette og hente en verdi
async function testRedis() {
  try {
    await connection.set('test-key', 'Test-verdi fra script');
    const value = await connection.get('test-key');
    console.log('Hentet testverdi:', value);
    
    // Test en enkel kø
    const queue = new Queue('test-queue', { connection });
    await queue.add('test-job', { test: 'data' });
    console.log('Testjobb lagt til i køen');
    
    // Rydd opp
    await queue.close();
    connection.disconnect();
    
    console.log('Test fullført vellykket!');
  } catch (error) {
    console.error('Testfeil:', error);
  }
}

testRedis(); 