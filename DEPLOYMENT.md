# 🚀 Deployment Guide

This guide covers deployment options for the A'chik Garo Language Platform.

## ✅ Pre-Deployment Checklist

- [ ] `npm install` - all dependencies installed
- [ ] `npm run build` - production build successful
- [ ] `npm start` - server runs without errors
- [ ] Test locally at http://localhost:3001
- [ ] All pages load correctly
- [ ] Translation engine works
- [ ] Dictionary searches return results
- [ ] Mobile responsive design verified

## 📦 Production Building

```bash
# Building
npm run build

# Verify dist/ folder exists and contains:
# - index.html (entry point)
# - assets/ (bundled JS and CSS)
```

## 🌐 Deployment Options

### 1. Render.com (Recommended - Free)

#### Setup:
1. Push code to GitHub
2. Go to [render.com](https://render.com)
3. Create new "Web Service"
4. Connect GitHub repository
5. Configure:
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: Production
   - **Port**: 3001 (set as PORT env var if needed)

#### Environment Variables:
```
PORT=3001
NODE_ENV=production
```

**Deployment Time**: ~5 minutes
**Cost**: Free tier available

---

### 2. Vercel.com (Easiest)

#### Setup:
1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

3. Follow prompts and accept defaults

#### Or via GitHub:
1. Go to [vercel.com](https://vercel.com)
2. Install GitHub app
3. Select repository
4. Vercel auto-deploys on push

**Deployment Time**: ~2 minutes
**Cost**: Free tier includes 100GB bandwidth/month

---

### 3. Netlify.com

#### Setup:
1. Install Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```

2. Deploy:
   ```bash
   npm run build
   netlify deploy --prod --dir=dist
   ```

#### Or via GitHub:
1. Go to [netlify.com](https://netlify.com)
2. Connect GitHub
3. Select repository
4. Set Build command: `npm run build`
5. Set Publish directory: `dist/`

**Deployment Time**: ~3 minutes
**Cost**: Free tier includes 100GB/month

---

### 4. GitHub Pages

#### Setup:
1. Update `vite.config.js`:
   ```javascript
   export default defineConfig({
     base: '/Learn-garo/',  // your repo name
     // ... rest of config
   })
   ```

2. Build and deploy:
   ```bash
   npm run build
   git add dist/
   git commit -m "Build for GitHub Pages"
   git push
   ```

3. Go to repository Settings → Pages
4. Set source to `master` branch, `/dist` folder
5. Wait for deployment

**URL**: `https://t-barman.github.io/Learn-garo/`
**Cost**: Free

---

### 5. Docker + Any Cloud Provider

#### Create Dockerfile:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3001

CMD ["npm", "start"]
```

#### Deploy to:
- **Railway**: `railway up`
- **Heroku**: `git push heroku main`
- **AWS**: Use ECS or Elastic Beanstalk
- **Google Cloud**: Cloud Run or Compute Engine
- **Azure**: App Service
- **DigitalOcean**: App Platform or Droplet

#### Docker Commands:
```bash
# Build image
docker build -t garo-platform .

# Run locally
docker run -p 3001:3001 garo-platform

# Push to registry
docker push yourusername/garo-platform:latest
```

---

### 6. Traditional VPS (Linode, DigitalOcean, Vultr)

#### Setup (Ubuntu 22.04):
```bash
# SSH into server
ssh root@your_server_ip

# Update system
apt update && apt upgrade

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt install -y nodejs

# Install git
apt install -y git

# Clone repository
cd /home
git clone https://github.com/t-barman/Learn-garo.git
cd Learn-garo

# Install dependencies
npm install

# Build
npm run build

# Install PM2 for process management
npm install -g pm2

# Start with PM2
pm2 start npm --name "garo-platform" -- start

# Configure auto-start
pm2 startup
pm2 save

# Setup Nginx reverse proxy (optional)
apt install -y nginx

# Create Nginx config at /etc/nginx/sites-available/garo
server {
    listen 80;
    server_name your_domain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Enable site
ln -s /etc/nginx/sites-available/garo /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx

# Install SSL with Certbot
apt install -y certbot python3-certbot-nginx
certbot --nginx -d your_domain.com
```

---

### 7. Replit

#### Setup:
1. Go to [replit.com](https://replit.com)
2. Click "Create Repl"
3. Select "Node.js"
4. Paste repository URL or clone manually
5. Replit auto-detects and runs

#### Run:
- Click "Run" button
- Replit opens a new tab with your app

**Note**: Replit free tier may have limitations

---

## 📊 Deployment Comparison

| Platform | Setup Time | Cost | Uptime | Custom Domain | Scale |
|----------|-----------|------|--------|---------------|-------|
| Render | 5 min | Free | 99.9% | Yes | Auto |
| Vercel | 2 min | Free | 99.9% | Yes | Auto |
| Netlify | 3 min | Free | 99% | Yes | Auto |
| Railway | 5 min | Free trial | 99.9% | Yes | Auto |
| GitHub Pages | 5 min | Free | 99.9% | Custom* | Static |
| VPS | 30 min | $5-20/mo | Manual | Yes | Manual |
| Docker | 10 min | Varies | Varies | Custom | Manual |

*GitHub Pages requires repository name in URL or custom domain setup

## 🔄 Continuous Deployment

### GitHub Actions (Automatic)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install
        run: npm install
      
      - name: Build
        run: npm run build
      
      - name: Deploy to Render
        run: curl "https://api.render.com/deploy/srv-?key=${{ secrets.RENDER_DEPLOY_KEY }}"
```

---

## 🔒 Environment Variables

Create `.env.production`:

```
PORT=3001
NODE_ENV=production
```

Never commit sensitive credentials to git.

---

## 📈 Monitoring & Maintenance

### Uptime Monitoring
- [UptimeRobot](https://uptimerobot.com) - Free monitoring
- [Pingdom](https://www.pingdom.com) - Status alerts

### Log Monitoring
- Render/Vercel/Netlify: Built-in dashboards
- VPS: `pm2 logs` or `journalctl`

### Updates
```bash
# Keep dependencies updated
npm update

# Check for vulnerabilities
npm audit
npm audit fix
```

---

## ❌ Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9

# Or use different port
PORT=3002 npm start
```

### Module Not Found
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Build Fails
```bash
# Check for errors
npm run build

# Verify dist/ created
ls -la dist/
```

### Translation Engine Issues
- Ensure `garo_dictionary.json` is in root
- Check browser console for errors
- Verify JSON syntax is valid: `jq . garo_dictionary.json`

### Static Files Not Serving
- Ensure `dist/` folder exists after build
- Check `server.js` static path configuration
- Verify Express is serving `/dist` as static

---

## 🚀 Post-Deployment

1. **Test Live Site**:
   - Visit your deployment URL
   - Test all 4 pages
   - Try translations
   - Check responsive design

2. **Set Up Domain**:
   - Update DNS records
   - Set up HTTPS certificate
   - Configure CNAME/A records

3. **Monitor Performance**:
   - Check page load times
   - Monitor error rates
   - Set up alerts

4. **Enable Analytics** (Optional):
   - Google Analytics
   - Vercel Analytics
   - Custom logging

---

## 📞 Support

For deployment issues:
1. Check platform-specific documentation
2. Review deployment logs
3. Verify environment variables
4. Test locally first: `npm start`
5. Check GitHub Issues

---

**Ready to deploy! Choose your platform above and follow the steps. Your Garo language platform will be live in minutes! 🎉**
