#!/usr/bin/env node

/**
 * Build optimization script
 * Analyzes and optimizes the production build
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Analyzing build optimization...');

const buildDir = path.join(__dirname, '..', 'build');

if (!fs.existsSync(buildDir)) {
  console.error('❌ Build directory not found. Run "npm run build" first.');
  process.exit(1);
}

// Analyze build size
function analyzeBuildSize() {
  console.log('\n📊 Build Size Analysis:');
  
  const staticDir = path.join(buildDir, 'static');
  const jsDir = path.join(staticDir, 'js');
  const cssDir = path.join(staticDir, 'css');
  
  let totalSize = 0;
  let jsSize = 0;
  let cssSize = 0;
  
  // Calculate JS bundle sizes
  if (fs.existsSync(jsDir)) {
    const jsFiles = fs.readdirSync(jsDir);
    jsFiles.forEach(file => {
      const filePath = path.join(jsDir, file);
      const stats = fs.statSync(filePath);
      jsSize += stats.size;
      console.log(`   JS: ${file} - ${formatBytes(stats.size)}`);
    });
  }
  
  // Calculate CSS bundle sizes
  if (fs.existsSync(cssDir)) {
    const cssFiles = fs.readdirSync(cssDir);
    cssFiles.forEach(file => {
      const filePath = path.join(cssDir, file);
      const stats = fs.statSync(filePath);
      cssSize += stats.size;
      console.log(`   CSS: ${file} - ${formatBytes(stats.size)}`);
    });
  }
  
  totalSize = jsSize + cssSize;
  
  console.log(`\n📈 Summary:`);
  console.log(`   Total JS: ${formatBytes(jsSize)}`);
  console.log(`   Total CSS: ${formatBytes(cssSize)}`);
  console.log(`   Total Assets: ${formatBytes(totalSize)}`);
  
  // Size recommendations
  if (jsSize > 1024 * 1024) { // 1MB
    console.log(`\n⚠️  JavaScript bundle is large (${formatBytes(jsSize)})`);
    console.log(`   Consider code splitting or removing unused dependencies`);
  }
  
  if (cssSize > 512 * 1024) { // 512KB
    console.log(`\n⚠️  CSS bundle is large (${formatBytes(cssSize)})`);
    console.log(`   Consider removing unused CSS or using CSS-in-JS`);
  }
  
  return { totalSize, jsSize, cssSize };
}

// Check for optimization opportunities
function checkOptimizations() {
  console.log('\n🔧 Optimization Opportunities:');
  
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
  const dependencies = Object.keys(packageJson.dependencies || {});
  
  // Check for large dependencies
  const largeDependencies = [
    'moment', 'lodash', 'material-ui', '@mui/material', 'antd'
  ];
  
  const foundLargeDeps = dependencies.filter(dep => 
    largeDependencies.some(large => dep.includes(large))
  );
  
  if (foundLargeDeps.length > 0) {
    console.log(`   📦 Large dependencies found: ${foundLargeDeps.join(', ')}`);
    console.log(`   Consider using lighter alternatives or tree shaking`);
  }
  
  // Check for source maps in production
  const jsFiles = fs.readdirSync(path.join(buildDir, 'static', 'js'));
  const hasSourceMaps = jsFiles.some(file => file.endsWith('.map'));
  
  if (hasSourceMaps) {
    console.log(`   🗺️  Source maps found in production build`);
    console.log(`   Set GENERATE_SOURCEMAP=false for production`);
  } else {
    console.log(`   ✅ Source maps disabled for production`);
  }
  
  // Check for service worker
  const hasServiceWorker = fs.existsSync(path.join(buildDir, 'service-worker.js'));
  if (!hasServiceWorker) {
    console.log(`   📱 Consider adding a service worker for caching`);
  }
  
  // Check for gzip compression
  console.log(`   🗜️  Enable gzip compression on your server for better performance`);
}

// Generate performance recommendations
function generateRecommendations(buildStats) {
  console.log('\n💡 Performance Recommendations:');
  
  console.log(`   1. Enable gzip/brotli compression on your server`);
  console.log(`   2. Set proper cache headers for static assets`);
  console.log(`   3. Use a CDN for global content delivery`);
  console.log(`   4. Implement lazy loading for routes and components`);
  console.log(`   5. Optimize images (use WebP format when possible)`);
  
  if (buildStats.jsSize > 512 * 1024) {
    console.log(`   6. Consider code splitting to reduce initial bundle size`);
  }
  
  console.log(`   7. Monitor Core Web Vitals in production`);
  console.log(`   8. Use React.memo() for expensive components`);
  console.log(`   9. Implement virtual scrolling for large lists`);
  console.log(`   10. Use React Suspense for better loading states`);
}

// Create performance budget
function createPerformanceBudget() {
  const budget = {
    maxBundleSize: '1MB',
    maxInitialLoad: '500KB',
    maxCSSSize: '200KB',
    maxImageSize: '100KB',
    maxFonts: '50KB',
    lighthouse: {
      performance: 90,
      accessibility: 95,
      bestPractices: 90,
      seo: 90
    }
  };
  
  fs.writeFileSync(
    path.join(__dirname, '..', 'performance-budget.json'),
    JSON.stringify(budget, null, 2)
  );
  
  console.log('\n📋 Performance budget created: performance-budget.json');
}

// Utility function to format bytes
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Main execution
try {
  const buildStats = analyzeBuildSize();
  checkOptimizations();
  generateRecommendations(buildStats);
  createPerformanceBudget();
  
  console.log('\n🎉 Build optimization analysis complete!');
  console.log('\n📚 Additional tools you can use:');
  console.log('   - webpack-bundle-analyzer: npm install --save-dev webpack-bundle-analyzer');
  console.log('   - Lighthouse CI: npm install --save-dev @lhci/cli');
  console.log('   - Bundle size tracking: bundlesize or size-limit');
  
} catch (error) {
  console.error('❌ Error during build analysis:', error.message);
  process.exit(1);
}