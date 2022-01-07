module.exports = {
  apps: [
    {
      name: 'crm-files',
      script: './dist/main.js',
      watch: false,
      wait_ready: true,
      stop_exit_codes: [0],
      env: {
        PORT: 5021,
      },
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],
};
