// Shared configuration for all environments
const sharedConfig = {
  script: './dist/server.js',
  cwd: './',

  // Performance & Scaling
  max_memory_restart: '1G',
  min_uptime: '10s',
  max_restarts: 10,

  // File watching
  watch: false,
  ignore_watch: ['node_modules', 'logs', '*.log'],

  // Logging Configuration
  log_type: 'json',
  log_file: './logs/combined.log',
  out_file: './logs/out.log',
  error_file: './logs/error.log',
  log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
  merge_logs: true,

  // Advanced Options
  kill_timeout: 5000,
  listen_timeout: 3000,
  shutdown_with_message: true,

  // Health Monitoring
  health_check_url: 'http://localhost:3500/health',
  health_check_grace_period: 3000,

  // Source Maps Support
  node_args: '--enable-source-maps',

  watch_options: {
    followSymlinks: false,
    usePolling: false,
  },
};

module.exports = {
  apps: [
    {
      ...sharedConfig,
      name: 'assure-health-api-dev',
      instances: 2,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'development',
      },
    },
    {
      ...sharedConfig,
      name: 'assure-health-api-prod',
      instances: 6,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],

  // Deployment Configuration (Optional)
  deploy: {
    production: {
      user: 'node',
      host: 'your-server.com',
      ref: 'origin/main',
      repo: 'https://github.com/your-username/assure-health-api.git',
      path: '/var/www/assure-health-api',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': 'apt update && apt install git -y'
    },
    staging: {
      user: 'node',
      host: 'staging-server.com',
      ref: 'origin/develop',
      repo: 'https://github.com/your-username/assure-health-api.git',
      path: '/var/www/staging-assure-health-api',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env staging'
    }
  }
};
