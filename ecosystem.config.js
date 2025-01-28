module.exports = {
  apps: [
    {
      name: "hmsnova",
      script: "npm",
      args: "start",
      env: {
        PORT: 3001,
        NODE_ENV: "production",
      },
    },
  ],
}; 