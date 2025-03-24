// Dette er en CommonJS-fil for PM2
module.exports = {
  apps: [
    {
      name: "hmsnova-app",
      script: "npm",
      args: "start",
      env: {
        PORT: 3001,
        NODE_ENV: "production",
        // Legg til Redis-konfigurasjon her:
        REDIS_HOST: process.env.REDIS_HOST,
        REDIS_PASSWORD: process.env.REDIS_PASSWORD,
        REDIS_PORT: process.env.UPSTASH_REDIS_PORT,
        // Bruk riktig Redis URL
        REDIS_URL: process.env.REDIS_URL,
        // Aktiver fallback-modus for å unngå tilkoblingsfeil
        REDIS_FALLBACK: "true"
      },
      max_memory_restart: "500M",
      instances: 1,
      exec_mode: "fork",
      restart_delay: 3000,
      exp_backoff_restart_delay: 100,
      max_restarts: 10
    },
    {
      name: "hmsnova-socket",
      script: "npm",
      args: "run workers:prod",
      env: {
        NODE_ENV: "production",
        REDIS_FALLBACK: "true",
        // Kopier samme Redis-konfigurasjon:
        REDIS_HOST: process.env.REDIS_HOST,
        REDIS_PASSWORD: process.env.REDIS_PASSWORD,
        REDIS_PORT: process.env.UPSTASH_REDIS_PORT,
        REDIS_URL: process.env.REDIS_URL,
        // Socket.io konfigurasjon
        SOCKET_PORT: 3002,
        // Websokets konfigurasjon
        WS_PING_INTERVAL: 25000, // 25 sekunder
        WS_PING_TIMEOUT: 10000 // 10 sekunder
      },
      max_memory_restart: "300M", 
      restart_delay: 5000,
      exp_backoff_restart_delay: 100,
      max_restarts: 10
    }
  ]
}; 