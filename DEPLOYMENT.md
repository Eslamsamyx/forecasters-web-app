# Production Deployment Guide - VPS Ubuntu

This guide covers deploying the X Prediction Analytics system on a VPS with Ubuntu and internal PostgreSQL.

## Prerequisites

- Ubuntu VPS (20.04+ recommended)
- Node.js 18+ and npm
- PostgreSQL 13+ installed locally
- PM2 for process management
- Nginx for reverse proxy

## Environment Setup

### 1. Database Configuration

```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Create database and user
sudo -u postgres psql
CREATE DATABASE prism_analytics;
CREATE USER prism_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE prism_analytics TO prism_user;
\q
```

### 2. Environment Variables

Create `.env.production` file:

```env
# Database
DATABASE_URL="postgresql://prism_user:your_secure_password@localhost:5432/prism_analytics"

# API Keys
GOOGLE_API_KEY="your_google_api_key"
RAPIDAPI_KEY="your_rapidapi_key"

# Auth
NEXTAUTH_SECRET="your_32_char_secret"
NEXTAUTH_URL="https://yourdomain.com"

# Environment
NODE_ENV="production"
```

### 3. Application Deployment

```bash
# Clone and build
git clone your-repo
cd prism-v2
npm install
npm run build

# Run database migrations
npx prisma generate
npx prisma db push
```

## Service Management

### Automatic Service Initialization

The system now **automatically starts background services** when deployed in production:

- ✅ **Auto-initialization**: Services start automatically when NODE_ENV=production
- ✅ **X Collection**: Collects from X channels every 10 minutes
- ✅ **Asset Updates**: Updates asset prices every 5 minutes
- ✅ **Prediction Validation**: Validates predictions every 15 minutes
- ✅ **Daily Jobs**: Brier scores and rankings calculated daily

### Health Monitoring

Monitor service status at: `GET /api/admin/health-check`

```bash
curl https://yourdomain.com/api/admin/health-check
```

Expected healthy response:
```json
{
  "overall": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "services": [
    {
      "name": "Cron Service",
      "status": "healthy",
      "details": "Background jobs running"
    },
    {
      "name": "X Collection",
      "status": "healthy",
      "details": "5 active channels, 12 collections in 24h"
    }
  ],
  "database": {
    "connected": true,
    "latency": 45
  }
}
```

## PM2 Process Management

### 1. Install PM2

```bash
npm install -g pm2
```

### 2. Create ecosystem.config.js

```javascript
module.exports = {
  apps: [{
    name: 'prism-analytics',
    script: 'npm',
    args: 'start',
    cwd: '/path/to/prism-v2',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    instances: 1,
    exec_mode: 'cluster',
    watch: false,
    max_memory_restart: '1G',
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
```

### 3. Start Application

```bash
# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu
```

## Nginx Configuration

### 1. Install Nginx

```bash
sudo apt install nginx
```

### 2. Configure Site

Create `/etc/nginx/sites-available/prism-analytics`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
}
```

### 3. Enable Site

```bash
sudo ln -s /etc/nginx/sites-available/prism-analytics /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## SSL Setup (Optional)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## Monitoring & Maintenance

### Check Service Status

```bash
# PM2 status
pm2 status
pm2 logs prism-analytics

# Health check
curl http://localhost/api/admin/health-check

# Database status
sudo -u postgres psql -d prism_analytics -c "SELECT COUNT(*) FROM \"ForecasterChannel\";"
```

### Manual Service Control

If needed, you can manually control services:

```bash
# Start services (usually not needed - auto-starts)
curl -X POST http://localhost/api/admin/start-services

# View logs
pm2 logs prism-analytics --lines 100
```

### Backup Strategy

```bash
# Database backup
sudo -u postgres pg_dump prism_analytics > backup_$(date +%Y%m%d).sql

# Application backup
tar -czf app_backup_$(date +%Y%m%d).tar.gz /path/to/prism-v2
```

## Troubleshooting

### Services Not Starting

1. Check PM2 logs: `pm2 logs prism-analytics`
2. Verify database connection: `npx prisma db push`
3. Check environment variables in `.env.production`
4. Verify API keys are valid

### X Collection Not Working

1. Check health endpoint: `/api/admin/health-check`
2. Verify RapidAPI key is valid
3. Check ForecasterChannel table has active channels
4. View collection logs in PM2

### Database Issues

1. Check PostgreSQL status: `sudo systemctl status postgresql`
2. Verify database permissions
3. Check disk space: `df -h`

## Key Features Verified

✅ **Auto-initialization**: Services start automatically on deployment
✅ **X Integration**: Full X.com collection and extraction
✅ **ForecasterChannel**: New channel-based collection system
✅ **Health Monitoring**: Real-time service status monitoring
✅ **Production Ready**: Optimized for VPS deployment

The system will automatically collect X predictions every 10 minutes and maintain all background processes without manual intervention.