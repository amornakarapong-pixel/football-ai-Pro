module.exports = {
  apps: [
    {
      name: "football-ai-pro",
      script: "./server.js",

      instances: 1,
      exec_mode: "fork",

      autorestart: true,
      watch: false,

      max_memory_restart: "512M",

      env: {
        NODE_ENV: "production"
      },

      error_file: "./logs/error.log",
      out_file: "./logs/output.log",
      merge_logs: true,
      time: true
    }
  ]
};