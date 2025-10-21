#!/usr/bin/env node

/**
 * Build configuration script for different environments
 * Usage: node scripts/build-config.js [environment]
 * Environments: development, staging, production
 */

const fs = require('fs');
const path = require('path');

const environment = process.argv[2] || 'production';
const validEnvironments = ['development', 'staging', 'production'];

if (!validEnvironments.includes(environment)) {
  console.error(`Invalid environment: ${environment}`);
  console.error(`Valid environments: ${validEnvironments.join(', ')}`);
  process.exit(1);
}

console.log(`🔧 Configuring build for ${environment} environment...`);

// Environment-specific configurations
const configs = {
  development: {
    REACT_APP_API_URL: 'http://localhost:8000/api',
    REACT_APP_ENVIRONMENT: 'development',
    GENERATE_SOURCEMAP: 'true',
    INLINE_RUNTIME_CHUNK: 'true',
    REACT_APP_ENABLE_ANALYTICS: 'false',
    REACT_APP_ENABLE_ERROR_REPORTING: 'false',
    REACT_APP_ENABLE_HTTPS: 'false',
    REACT_APP_SECURE_COOKIES: 'false',
    REACT_APP_CACHE_VERSION: '1.0.0-dev'
  },
  staging: {
    REACT_APP_API_URL: 'https://your-staging-api-domain.com/api',
    REACT_APP_ENVIRONMENT: 'staging',
    GENERATE_SOURCEMAP: 'true',
    INLINE_RUNTIME_CHUNK: 'false',
    REACT_APP_ENABLE_ANALYTICS: 'false',
    REACT_APP_ENABLE_ERROR_REPORTING: 'true',
    REACT_APP_ENABLE_HTTPS: 'true',
    REACT_APP_SECURE_COOKIES: 'true',
    REACT_APP_CACHE_VERSION: '1.0.0-staging'
  },
  production: {
    REACT_APP_API_URL: 'https://your-production-api-domain.com/api',
    REACT_APP_ENVIRONMENT: 'production',
    GENERATE_SOURCEMAP: 'false',
    INLINE_RUNTIME_CHUNK: 'false',
    REACT_APP_ENABLE_ANALYTICS: 'true',
    REACT_APP_ENABLE_ERROR_REPORTING: 'true',
    REACT_APP_ENABLE_HTTPS: 'true',
    REACT_APP_SECURE_COOKIES: 'true',
    REACT_APP_CACHE_VERSION: '1.0.0'
  }
};

// Create environment file content
const config = configs[environment];
const envContent = Object.entries(config)
  .map(([key, value]) => `${key}=${value}`)
  .join('\n');

// Write to .env file
const envPath = path.join(__dirname, '..', '.env');
fs.writeFileSync(envPath, envContent);

console.log(`✅ Environment configuration written to .env`);
console.log(`📝 Configuration:`);
Object.entries(config).forEach(([key, value]) => {
  console.log(`   ${key}=${value}`);
});

// Validate required environment variables
const requiredVars = [
  'REACT_APP_API_URL',
  'REACT_APP_ENVIRONMENT'
];

const missingVars = requiredVars.filter(varName => !config[varName]);
if (missingVars.length > 0) {
  console.error(`❌ Missing required environment variables: ${missingVars.join(', ')}`);
  process.exit(1);
}

console.log(`🚀 Ready to build for ${environment} environment!`);

// Additional build optimizations for production
if (environment === 'production') {
  console.log(`🔧 Production build optimizations enabled:`);
  console.log(`   - Source maps disabled for security`);
  console.log(`   - Runtime chunk inlining disabled for better caching`);
  console.log(`   - Analytics and error reporting enabled`);
  console.log(`   - HTTPS and secure cookies enabled`);
}

// Build size analysis recommendation
if (environment === 'production') {
  console.log(`\n📊 To analyze bundle size, run:`);
  console.log(`   npm run build`);
  console.log(`   npx serve -s build`);
  console.log(`   # Or use webpack-bundle-analyzer if installed`);
}

// Deployment checklist
if (environment === 'production') {
  console.log(`\n✅ Pre-deployment checklist:`);
  console.log(`   □ Update REACT_APP_API_URL to production API endpoint`);
  console.log(`   □ Verify all environment variables are set correctly`);
  console.log(`   □ Test the build locally with 'npx serve -s build'`);
  console.log(`   □ Ensure HTTPS is configured on the server`);
  console.log(`   □ Configure proper cache headers for static assets`);
  console.log(`   □ Set up error monitoring and analytics`);
}