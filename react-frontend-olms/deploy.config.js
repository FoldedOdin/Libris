/**
 * Deployment configuration for different hosting platforms
 * This file contains configurations for various deployment targets
 */

module.exports = {
  // Netlify deployment configuration
  netlify: {
    buildCommand: 'npm run build:prod',
    publishDirectory: 'build',
    environmentVariables: {
      NODE_VERSION: '18',
      NPM_VERSION: '9'
    },
    redirects: [
      {
        from: '/api/*',
        to: 'https://your-production-api-domain.com/api/:splat',
        status: 200,
        force: true
      },
      {
        from: '/*',
        to: '/index.html',
        status: 200
      }
    ],
    headers: [
      {
        for: '/static/*',
        values: {
          'Cache-Control': 'public, max-age=31536000, immutable'
        }
      },
      {
        for: '/*.js',
        values: {
          'Cache-Control': 'public, max-age=31536000, immutable'
        }
      },
      {
        for: '/*.css',
        values: {
          'Cache-Control': 'public, max-age=31536000, immutable'
        }
      },
      {
        for: '/index.html',
        values: {
          'Cache-Control': 'public, max-age=0, must-revalidate'
        }
      }
    ]
  },

  // Vercel deployment configuration
  vercel: {
    buildCommand: 'npm run build:prod',
    outputDirectory: 'build',
    installCommand: 'npm ci',
    framework: 'create-react-app',
    rewrites: [
      {
        source: '/api/(.*)',
        destination: 'https://your-production-api-domain.com/api/$1'
      },
      {
        source: '/(.*)',
        destination: '/index.html'
      }
    ],
    headers: [
      {
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      {
        source: '/(.*\\.(?:js|css))',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      }
    ]
  },

  // GitHub Pages deployment configuration
  githubPages: {
    buildCommand: 'npm run build:prod',
    publishDirectory: 'build',
    basePath: '/react-frontend-olms', // Update with your repository name
    assetPrefix: '/react-frontend-olms',
    trailingSlash: true
  },

  // AWS S3 + CloudFront deployment configuration
  aws: {
    s3: {
      bucket: 'your-s3-bucket-name',
      region: 'us-east-1',
      buildCommand: 'npm run build:prod',
      publishDirectory: 'build',
      cacheControl: {
        'static/**': 'public, max-age=31536000, immutable',
        '**/*.js': 'public, max-age=31536000, immutable',
        '**/*.css': 'public, max-age=31536000, immutable',
        'index.html': 'public, max-age=0, must-revalidate'
      }
    },
    cloudfront: {
      distributionId: 'your-cloudfront-distribution-id',
      invalidationPaths: ['/*'],
      customErrorPages: [
        {
          errorCode: 404,
          responseCode: 200,
          responsePage: '/index.html'
        },
        {
          errorCode: 403,
          responseCode: 200,
          responsePage: '/index.html'
        }
      ]
    }
  },

  // Docker deployment configuration
  docker: {
    baseImage: 'nginx:alpine',
    buildStage: {
      baseImage: 'node:18-alpine',
      workdir: '/app',
      buildCommand: 'npm run build:prod'
    },
    nginxConfig: `
      server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        # Handle client-side routing
        location / {
          try_files $uri $uri/ /index.html;
        }

        # API proxy (optional)
        location /api/ {
          proxy_pass https://your-production-api-domain.com/api/;
          proxy_set_header Host $host;
          proxy_set_header X-Real-IP $remote_addr;
          proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
          proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Static asset caching
        location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
          expires 1y;
          add_header Cache-Control "public, immutable";
        }

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;
      }
    `
  }
};

// Helper function to generate Netlify _redirects file
function generateNetlifyRedirects() {
  const config = module.exports.netlify;
  return config.redirects
    .map(redirect => `${redirect.from} ${redirect.to} ${redirect.status}${redirect.force ? '!' : ''}`)
    .join('\n');
}

// Helper function to generate Netlify _headers file
function generateNetlifyHeaders() {
  const config = module.exports.netlify;
  return config.headers
    .map(header => {
      const headerLines = [`${header.for}`];
      Object.entries(header.values).forEach(([key, value]) => {
        headerLines.push(`  ${key}: ${value}`);
      });
      return headerLines.join('\n');
    })
    .join('\n\n');
}

// Helper function to generate Dockerfile
function generateDockerfile() {
  const config = module.exports.docker;
  return `
# Build stage
FROM ${config.buildStage.baseImage} AS build
WORKDIR ${config.buildStage.workdir}
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN ${config.buildStage.buildCommand}

# Production stage
FROM ${config.baseImage}
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
`.trim();
}

module.exports.generateNetlifyRedirects = generateNetlifyRedirects;
module.exports.generateNetlifyHeaders = generateNetlifyHeaders;
module.exports.generateDockerfile = generateDockerfile;