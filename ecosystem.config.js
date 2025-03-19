module.exports = {
  apps: [
    {
      name: "hmsnova-app",
      script: "npm",
      args: "start",
      env: {
        PORT: 3000,
        NODE_ENV: "production",
      },
      max_memory_restart: "500M",
      instances: 1,
      exec_mode: "fork",
      restart_delay: 3000,
      exp_backoff_restart_delay: 100,
      max_restarts: 10
    },
    {
      name: "hmsnova-workers",
      script: "npm",
      args: "run workers",
      env: {
        NODE_ENV: "production",
        REDIS_FALLBACK: "true" // Bruk fallback for Redis
      },
      max_memory_restart: "300M", 
      restart_delay: 5000,
      exp_backoff_restart_delay: 100,
      max_restarts: 10
    }
  ],
}; 