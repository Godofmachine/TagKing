# 🤖 WhatsApp Group Tagger Bot

A production-ready WhatsApp bot that allows you to **tag all members** in group chats using the `@everyone` command.

## ✨ Features

- 🏷️ **Tag all members** in any WhatsApp group with `@everyone`
- 👑 **Admin-only** - Only group admins can use tagging commands
- 📊 **Real-time logs** - WebSocket-powered activity monitoring in the UI
- 🔄 **Session persistence** - Bot stays connected even after server restarts
- 🚀 **Production-ready** - Deploy to VPS, Heroku, Railway, or any cloud platform
- 🔒 **Secure** - Bearer token authentication for API endpoints

## 🎯 Quick Start

### Local Development

1. **Install dependencies:**
```bash
npm install
```

2. **Start the server:**
```bash
npm start
```

3. **Open the UI:**
```
http://localhost:3000
```

4. **Authenticate:**
   - Click "Create Session"
   - Scan the QR code with WhatsApp
   - Wait for "Bot ready!" message

5. **Use in WhatsApp groups:**
   - Open any group where you're admin
   - Type: `@everyone Your message here`
   - All members will be tagged automatically! 🎉

## 📖 Commands

### In WhatsApp Groups (Admin Only)

- `@everyone [message]` - Tag all group members
- `/tagall [message]` - Same as @everyone
- `/help` - Show help message

### Examples

```
@everyone Meeting at 3pm! 📅
/tagall Don't forget to submit your reports
@everyone 🎉 Happy New Year everyone!
```

## 🛠️ Configuration

Create a `.env` file:

```env
PORT=3000
ADMIN_TOKEN=your-secure-token-here
MENTION_CHUNK_SIZE=25
```

## 🌐 Production Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

**This bot works in production!** Deploy to any VPS or cloud platform.

## 📊 Real-time Activity Logs

The UI displays live logs:
- ✅ Session creation/authentication
- 🎯 Command detection
- 👑 Admin verification
- 📤 Tagging progress
- ❌ Errors and warnings

---

**Made with ❤️ for easier WhatsApp group management**
