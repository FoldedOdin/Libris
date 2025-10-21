#!/usr/bin/env node

/**
 * Deployment setup script
 * Generates deployment configuration files for different platforms
 */

const fs = require('fs');
const path = require('path');
const deployConfig = require('../deploy.config.js');

const platform = process.argv[2];
const validPlatforms = ['netlify', 'vercel', 'docker', 'aws'];

if (!platform) {
  console.log('🚀 Deployment Setup Script');
  console.log('Usage: node scripts/deploy-setup.js [platform]');
  console.log(`Available platforms: ${validPlatforms.join(', ')}`);
  process.exit(0);
}

if (!validPlatforms.includes(platform)) {
  console.error(`❌ Invalid platform: ${platform}`);
  console.error(`Valid platforms: ${validPlatforms.join(', ')}`);
  process.exit(1);
}

console.log(`🔧 Setting up deployment for ${platform}...`);

switch (platform) {
  case 'netlify':
    setupNetlify();
    break;
  case 'vercel':
    setupVercel();
    break;
  case 'docker':
    setupDocker();
    break;
  case 'aws':
    setupAWS();
    break;
}

function setupNetlify() {
  const config = deployConfig.netlify;
  
  // Create netlify.toml
  const netlifyToml = `
[build]
  command = "${config.buildCommand}"
  publish = "${config.publishDirectory}"

[build.environment]
  NODE_VERSION = "${config.environmentVariables.NODE_VERSION}"
  NPM_VERSION = "${config.environmentVariables.NPM_VERSION}"

[[redirects]]
  from = "/api/*"
  to = "https://your-production-api-domain.com/api/:splat"
  status = 200
  force = true

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/static/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.js"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.css"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/index.html"
  [headers.values]
    Cache-Control = "public, max-age=0, must-revalidate"
`.trim();

  fs.writeFileSync('netlify.toml', netlifyToml);
  
  // Create _redirects file
  const redirects = deployConfig.generateNetlifyRedirects();
  fs.writeFileSync(path.join('public', '_redirects'), redirects);
  
  console.log('✅ Netlify configuration files created:');
  console.log('   - netlify.toml');
  console.log('   - public/_redirects');
  console.log('\n📝 Next steps:');
  console.log('   1. Update API URL in netlify.toml');
  console.log('   2. Connect your repository to Netlify');
  console.log('   3. Deploy with: git push origin main');
}

function setupVercel() {
  const config = deployConfig.vercel;
  
  const vercelJson = {
    buildCommand: config.buildCommand,
    outputDirectory: config.outputDirectory,
    installCommand: config.installCommand,
    framework: config.framework,
    rewrites: config.rewrites,
    headers: config.headers
  };
  
  fs.writeFileSync('vercel.json', JSON.stringify(vercelJson, null, 2));
  
  console.log('✅ Vercel configuration file created:');
  console.log('   - vercel.json');
  console.log('\n📝 Next steps:');
  console.log('   1. Update API URL in vercel.json');
  console.log('   2. Install Vercel CLI: npm i -g vercel');
  console.log('   3. Deploy with: vercel --prod');
}

function setupDocker() {
  const dockerfile = deployConfig.generateDockerfile();
  const config = deployConfig.docker;
  
  fs.writeFileSync('Dockerfile', dockerfile);
  fs.writeFileSync('nginx.conf', config.nginxConfig.trim());
  
  // Create .dockerignore
  const dockerignore = `
node_modules
npm-debug.log
.git
.gitignore
README.md
.env
.nyc_output
coverage
.nyc_output
.coverage
.coverage/
*.md
.DS_Store
.vscode
.idea
`.trim();
  
  fs.writeFileSync('.dockerignore', dockerignore);
  
  console.log('✅ Docker configuration files created:');
  console.log('   - Dockerfile');
  console.log('   - nginx.conf');
  console.log('   - .dockerignore');
  console.log('\n📝 Next steps:');
  console.log('   1. Update API URL in nginx.conf');
  console.log('   2. Build image: docker build -t react-frontend-olms .');
  console.log('   3. Run container: docker run -p 80:80 react-frontend-olms');
}

function setupAWS() {
  const config = deployConfig.aws;
  
  // Create AWS deployment script
  const deployScript = `
#!/bin/bash

# AWS S3 + CloudFront deployment script
# Make sure AWS CLI is configured with proper credentials

echo "🚀 Deploying to AWS S3 + CloudFront..."

# Build the application
echo "📦 Building application..."
${config.s3.buildCommand}

# Sync to S3
echo "📤 Uploading to S3..."
aws s3 sync ${config.s3.publishDirectory}/ s3://${config.s3.bucket}/ --delete

# Set cache headers
echo "🔧 Setting cache headers..."
aws s3 cp s3://${config.s3.bucket}/static/ s3://${config.s3.bucket}/static/ --recursive --metadata-directive REPLACE --cache-control "public, max-age=31536000, immutable"
aws s3 cp s3://${config.s3.bucket}/index.html s3://${config.s3.bucket}/index.html --metadata-directive REPLACE --cache-control "public, max-age=0, must-revalidate"

# Invalidate CloudFront
echo "🔄 Invalidating CloudFront cache..."
aws cloudfront create-invalidation --distribution-id ${config.cloudfront.distributionId} --paths "/*"

echo "✅ Deployment complete!"
`.trim();

  fs.writeFileSync('scripts/deploy-aws.sh', deployScript);
  fs.chmodSync('scripts/deploy-aws.sh', '755');
  
  console.log('✅ AWS deployment script created:');
  console.log('   - scripts/deploy-aws.sh');
  console.log('\n📝 Next steps:');
  console.log('   1. Update S3 bucket name and CloudFront distribution ID');
  console.log('   2. Configure AWS CLI credentials');
  console.log('   3. Deploy with: ./scripts/deploy-aws.sh');
}

console.log(`\n🎉 ${platform} deployment setup complete!`);
console.log('💡 Remember to update API URLs and other environment-specific values.');