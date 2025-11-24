module.exports = {
  apps: [
    {
      name: 'opinionpointer',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/opinionpointer',
      instances: 4, // 4 instances for 6 CPUs (leaving 2 for system/nginx)
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      env_production: {
        NODE_ENV: 'production'
      },
      // Auto-restart configuration
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',

      // Logging
      error_file: '/var/log/pm2/opinionpointer-error.log',
      out_file: '/var/log/pm2/opinionpointer-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,

      // Graceful shutdown
      kill_timeout: 5000,
      listen_timeout: 3000,
      shutdown_with_message: true,

      // Process management
      min_uptime: '10s',
      max_restarts: 10,

      // Cluster mode specific
      instance_var: 'INSTANCE_ID',

      // Environment-specific ports for each instance
      increment_var: 'PORT'
    }
  ]
};
