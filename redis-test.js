// Script for å teste Redis-tilkobling
const { Queue } = require('bullmq');
const IORedis = require('ioredis');
require('dotenv').config();

console.log('Redis URL:', process.env.REDIS_URL);

// Opprett Redis-tilkobling
const redisUrl = process.env.REDIS_URL;
const isUpstash = redisUrl.includes('upstash.io');
const connectionOptions = {
  maxRetriesPerRequest: 3,
  enableReadyCheck: false,
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
}

// Test tilkoblingen
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