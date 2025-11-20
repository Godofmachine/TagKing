# 🚀 Production Deployment Guide

## What You Have Built

A WhatsApp bot that allows you to **tag all members** in any WhatsApp group where you're an admin using `@everyone` command.

### Features
- ✅ Tag all group members with `@everyone [message]`
- ✅ Real-time WebSocket logs in the UI
- ✅ Session persistence (survives restarts)
- ✅ Production-ready architecture
- ✅ Secure bearer token authentication

---

## 🌐 Production Deployment

### Option 1: VPS (DigitalOcean, Linode, Vultr)

**Requirements:**
- Ubuntu 20.04+ or similar Linux server
- Node.js 18+
- PM2 for process management

**Steps:**

1. **SSH into your server:**
```bash
ssh root@your-server-ip
```

2. **Install Node.js:**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

3. **Install PM2:**
```bash
npm install -g pm2
```

4. **Upload your files:**
```bash
scp -r "c:\xampp\htdocs\Whatsapp bot" root@your-server-ip:/var/www/whatsapp-bot
```

5. **On the server:**
```bash
cd /var/www/whatsapp-bot
npm install
```

6. **Create `.env` file:**
```bash
nano .env
```

Add:
```
PORT=3000
ADMIN_TOKEN=your-secure-random-token-here
MENTION_CHUNK_SIZE=25
```

7. **Start with PM2:**
```bash
pm2 start src/lib/server-simple.js --name whatsapp-bot
pm2 save
pm2 startup
```

8. **Setup Nginx reverse proxy:**
```bash
sudo apt install nginx
sudo nano /etc/nginx/sites-available/whatsapp-bot
```

Add:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/whatsapp-bot /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

9. **Setup SSL (optional but recommended):**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

### Option 2: Heroku

1. **Install Heroku CLI:**
```bash
npm install -g heroku
```

2. **Login and create app:**
```bash
heroku login
heroku create your-app-name
```

3. **Add buildpack:**
```bash
heroku buildpacks:add heroku/nodejs
heroku buildpacks:add jontewks/puppeteer
```

4. **Set environment variables:**
```bash
heroku config:set ADMIN_TOKEN=your-token-here
heroku config:set MENTION_CHUNK_SIZE=25
```

5. **Create `Procfile`:**
```
web: node src/lib/server-simple.js
```

6. **Deploy:**
```bash
git init
git add .
git commit -m "Deploy WhatsApp bot"
git push heroku main
```

---

### Option 3: Railway.app (Easiest)

1. Go to https://railway.app
2. Click "New Project" → "Deploy from GitHub"
3. Connect your repository
4. Set environment variables:
   - `ADMIN_TOKEN`: your-secure-token
   - `MENTION_CHUNK_SIZE`: 25
5. Railway auto-deploys!

---

## 🔒 Security

1. **Always set ADMIN_TOKEN:**
```env
ADMIN_TOKEN=use-a-long-random-string-here
```

2. **Use HTTPS in production** (SSL certificate)

3. **Restrict access** to the UI (use authentication middleware)

---

## 📊 Monitoring

**Check logs with PM2:**
```bash
pm2 logs whatsapp-bot
```

**Monitor performance:**
```bash
pm2 monit
```

**Restart bot:**
```bash
pm2 restart whatsapp-bot
```

---

## 🎯 How to Use in Production

1. Open `http://your-domain.com`
2. Enter your `ADMIN_TOKEN`
3. Click "Create Session"
4. Scan QR code with WhatsApp
5. Open any WhatsApp group (where you're admin)
6. Type: `@everyone Your message here`
7. All members get tagged! 🎉

---

## 💡 Tips

- **Session persistence:** Sessions are saved in `sessions/` folder
- **Multiple sessions:** You can run multiple WhatsApp accounts (create multiple sessions)
- **Chunk size:** Adjust `MENTION_CHUNK_SIZE` if you get rate-limited (default: 25)
- **Activity logs:** Monitor real-time logs in the UI to see bot actions

---

## 🐛 Troubleshooting

**Bot not receiving messages:**
- Check if session is authenticated (status should be "open")
- Restart the session if needed

**QR code not appearing:**
- Clear browser cache
- Check server logs with `pm2 logs`

**Mentions not working:**
- Ensure you're an admin in the group
- Check Activity Log for error messages

---

## ✅ This Bot Is Production-Ready!

Your bot is fully functional and can handle production traffic. Just deploy to your preferred platform and start tagging! 🚀
