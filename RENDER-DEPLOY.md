# 🚀 Render.com Deployment Guide

## Quick Deploy to Render.com

### Step 1: Prepare Your Repository

1. **Push your code to GitHub** (if not already)
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
git push -u origin main
```

### Step 2: Deploy to Render

1. **Go to** https://render.com
2. **Sign up/Login** with GitHub
3. **Click** "New +" → "Web Service"
4. **Connect** your GitHub repository
5. **Configure:**
   - Name: `whatsapp-bot` (or any name)
   - Region: `Oregon (US West)` or closest to you
   - Branch: `main`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Plan: **FREE**

6. **Add Environment Variables:**
   - `PORT`: `10000`
   - `ADMIN_TOKEN`: Click "Generate" (or paste your own secure token)
   - `MENTION_CHUNK_SIZE`: `25`
   - `RENDER`: `true`

7. **Add Persistent Disk:**
   - Click "Add Disk"
   - Name: `whatsapp-sessions`
   - Mount Path: `/opt/render/project/src/sessions`
   - Size: `1 GB`

8. **Click** "Create Web Service"

### Step 3: Wait for Deployment

- First deployment takes 5-10 minutes
- Watch the build logs
- Once you see "Live ✓", your app is running!

### Step 4: Get Your App URL

You'll get a URL like: `https://whatsapp-bot-xxxx.onrender.com`

---

## ⏰ Setup Cron Job (Keep Awake)

Render's free tier sleeps after 15 minutes of inactivity. Use cron-job.org to keep it awake:

### Step 1: Create Cron Job

1. **Go to** https://cron-job.org
2. **Sign up** (free account)
3. **Click** "Create Cronjob"

### Step 2: Configure

- **Title:** `WhatsApp Bot Keep-Alive`
- **URL:** `https://YOUR-APP-NAME.onrender.com/health`
- **Schedule:** Every 10 minutes
  - Pattern: `*/10 * * * *`
  - Or use GUI: "Every 10 minutes"
- **Enabled:** ✅ Yes

### Step 3: Save

Click "Create" - Your bot will now stay awake 24/7! 🎉

---

## 📱 Using Your Bot

1. **Open:** `https://YOUR-APP-NAME.onrender.com`
2. **Enter ADMIN_TOKEN** (find it in Render Dashboard → Environment)
3. **Create Session** and scan QR code
4. **Use in WhatsApp:**
   - Go to any group where you're admin
   - Type: `@everyone Your message here`
   - Everyone gets tagged! 🎯

---

## 🔧 Monitoring

### View Logs
1. Go to Render Dashboard
2. Click your service
3. Click "Logs" tab
4. See real-time bot activity

### Check Health
Visit: `https://YOUR-APP-NAME.onrender.com/health`

Response:
```json
{
  "status": "ok",
  "uptime": 123456,
  "sessions": 1,
  "timestamp": "2025-11-19T..."
}
```

---

## ⚠️ Important Notes

### Free Tier Limits:
- ✅ 750 hours/month (enough for 24/7 with cron job)
- ✅ 512 MB RAM
- ✅ 1 GB persistent storage
- ⚠️ Spins down after 15 min inactivity (solved by cron job)
- ⚠️ 30 second cold start when waking up

### Session Persistence:
- Sessions are saved to disk (mounted at `/opt/render/project/src/sessions`)
- Sessions survive restarts
- **Backup important sessions** by downloading from Dashboard → "Shell" → `tar -czf sessions.tar.gz sessions/`

### Updating Your Bot:
```bash
# Make changes locally
git add .
git commit -m "Update bot"
git push

# Render auto-deploys! (takes ~2 minutes)
```

---

## 🐛 Troubleshooting

**Bot not responding:**
- Check Logs in Render Dashboard
- Verify session state is "open"
- Restart service if needed

**Cron job not working:**
- Check cron-job.org execution history
- Verify URL is correct
- Ensure service is deployed

**Out of memory:**
- Reduce `MENTION_CHUNK_SIZE` to `15`
- Upgrade to paid plan ($7/month for 512MB → 2GB)

---

## 💰 Upgrade Options

If you need more resources:

**Render Paid Plan** ($7/month):
- 2 GB RAM
- No sleep
- Faster builds
- Better support

**Switch to Fly.io** (Free):
- 256 MB RAM (free tier)
- No sleep on free tier
- See DEPLOYMENT.md

---

## ✅ You're Done!

Your WhatsApp bot is now running 24/7 on Render.com for FREE! 🎉

**Next Steps:**
1. Save your ADMIN_TOKEN somewhere safe
2. Test @everyone in a WhatsApp group
3. Monitor the Activity Log in the UI
4. Share with friends! 🚀
