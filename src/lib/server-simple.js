import path from 'path';
import fs from 'fs';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import qrcode from 'qrcode';
import { customAlphabet } from 'nanoid';
import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || '';
const MENTION_CHUNK_SIZE = Number(process.env.MENTION_CHUNK_SIZE || 25);

const app = express();
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'https://*.vercel.app'],
  credentials: true
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', '..', 'public')));

const nanoid = customAlphabet('123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz', 10);
const sessions = new Map();
const wsClients = new Set();

fs.mkdirSync(path.join(process.cwd(), 'sessions'), { recursive: true });

// Broadcast log to all WebSocket clients
function broadcastLog(message, type = 'info') {
  const timestamp = new Date().toLocaleTimeString();
  const logMsg = JSON.stringify({ type, message, timestamp });
  wsClients.forEach(client => {
    if (client.readyState === 1) { // WebSocket.OPEN
      client.send(logMsg);
    }
  });
  console.log(`[${timestamp}] ${message}`);
}

function bearerAuth(req, res, next) {
  if (!ADMIN_TOKEN) return next();
  const auth = (req.headers.authorization || '').split(' ');
  if (auth[0] === 'Bearer' && auth[1] === ADMIN_TOKEN) return next();
  res.status(401).json({ error: 'Unauthorized' });
}

function delay(ms) { return new Promise((r) => setTimeout(r, ms)); }

async function createClientForSession(session) {
  const client = new Client({
    authStrategy: new LocalAuth({
      clientId: session.id,
      dataPath: session.authDir
    }),
    puppeteer: {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
  });

  session.client = client;

  client.on('qr', async (qr) => {
    broadcastLog(`📷 QR Code generated - scan with WhatsApp`, 'success');
    session.state = 'qr';
    session.qrDataUrl = await qrcode.toDataURL(qr, { margin: 1, scale: 6 });
  });

  client.on('ready', () => {
    broadcastLog(`✅ Bot ready! Connected as ${client.info.wid.user}`, 'success');
    session.state = 'open';
    session.qrDataUrl = null;
  });

  client.on('authenticated', () => {
    broadcastLog(`🔐 Authentication successful!`, 'success');
    session.state = 'authenticated';
  });

  client.on('auth_failure', (msg) => {
    broadcastLog(`❌ Authentication failed: ${msg}`, 'error');
    session.state = 'auth_failure';
  });

  client.on('disconnected', (reason) => {
    broadcastLog(`🔌 Disconnected: ${reason}`, 'warning');
    session.state = 'closed';
  });

  // ============= BOT MESSAGE HANDLER =============
  client.on('message_create', async (message) => {
    try {
      const text = message.body?.trim() || '';
      if (!text) return;
      if (message.from === 'status@broadcast') return;
      
      const chat = await message.getChat();
      const chatName = chat.isGroup ? chat.name : 'DM';
      
      // Log all messages
      if (message.fromMe) {
        broadcastLog(`✅ YOU [${chatName}]: "${text.substring(0, 40)}"`, 'info');
      }
      
      // ONLY process YOUR messages
      if (!message.fromMe) return;
      
      // ========== @everyone command ==========
      if (chat.isGroup && (text.startsWith('@everyone') || text.startsWith('/tagall'))) {
        broadcastLog(`🎯 @everyone command detected in "${chat.name}"`, 'success');
        
        const participants = await chat.participants;
        const myNumber = client.info.wid.user;
        const me = participants.find(p => p.id.user === myNumber);
        
        if (!me || !me.isAdmin) {
          broadcastLog(`❌ Not admin in "${chat.name}" - command ignored`, 'warning');
          await chat.sendMessage('❌ Admin only command');
          return;
        }
        
        broadcastLog(`✅ Admin verified - Tagging ${participants.length - 1} members...`, 'success');
        
        let msg = text.replace(/^(@everyone|\/tagall)\s*/, '').trim();
        if (!msg) msg = '📢 Attention!';
        
        const mentions = participants
          .filter(p => p.id.user !== myNumber)
          .map(p => p.id._serialized);
        
        // Build message with @ tags
        let mentionText = '';
        for (const mention of mentions) {
          mentionText += `@${mention.split('@')[0]} `;
        }
        const fullMessage = `${mentionText}\n\n${msg}`;
        
        try { await message.delete(true); } catch (e) {}
        
        // Send in chunks
        for (let i = 0; i < mentions.length; i += MENTION_CHUNK_SIZE) {
          const chunk = mentions.slice(i, i + MENTION_CHUNK_SIZE);
          await chat.sendMessage(fullMessage, { mentions: chunk });
          const sent = Math.min(i + MENTION_CHUNK_SIZE, mentions.length);
          broadcastLog(`📤 Tagged ${sent}/${mentions.length} members`, 'info');
          if (i + MENTION_CHUNK_SIZE < mentions.length) {
            await delay(1200);
          }
        }
        
        broadcastLog(`✅ Successfully tagged all ${mentions.length} members in "${chat.name}"!`, 'success');
        return;
      }
      
      // ========== /help command ==========
      if (text === '/help') {
        const help = `🤖 *Bot Commands*\n\n` +
          `*In Groups (admin):*\n` +
          `@everyone [msg] - Tag all\n` +
          `/tagall [msg] - Tag all\n\n` +
          `*Example:*\n` +
          `@everyone Meeting at 3pm!`;
        
        await chat.sendMessage(help);
        broadcastLog(`📖 Help command sent`, 'info');
        return;
      }
      
    } catch (error) {
      broadcastLog(`❌ Error: ${error.message}`, 'error');
    }
  });

  await client.initialize();
  return session;
}

async function createSession() {
  const id = nanoid();
  const authDir = path.join(process.cwd(), 'sessions', id);
  fs.mkdirSync(authDir, { recursive: true });
  const session = { id, state: 'starting', qrDataUrl: null, client: null, authDir };
  sessions.set(id, session);
  broadcastLog(`📱 Creating new session: ${id}`, 'info');
  await createClientForSession(session);
  return session;
}

// API routes
app.post('/api/session', bearerAuth, async (req, res) => {
  try {
    const session = await createSession();
    res.json({ id: session.id });
  } catch (e) {
    console.error('Error creating session:', e);
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/session/:id/status', bearerAuth, (req, res) => {
  const session = sessions.get(req.params.id);
  if (!session) return res.status(404).json({ error: 'Not found' });
  
  const me = session.client?.info ? {
    id: session.client.info.wid.user,
    pushname: session.client.info.pushname
  } : null;
  
  res.json({
    id: session.id,
    state: session.state,
    qrDataUrl: session.qrDataUrl || null,
    me: me
  });
});

app.delete('/api/session/:id', bearerAuth, async (req, res) => {
  const session = sessions.get(req.params.id);
  if (!session) return res.status(404).json({ error: 'Not found' });
  try {
    sessions.delete(req.params.id);
    if (session.client) await session.client.destroy();
    await fs.promises.rm(session.authDir, { recursive: true, force: true });
    res.json({ ok: true });
  } catch (e) {
    console.error('Error deleting session:', e);
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/session/:id/groups', bearerAuth, async (req, res) => {
  const session = sessions.get(req.params.id);
  if (!session || session.state !== 'open') {
    return res.status(400).json({ error: 'Session not ready' });
  }
  res.json({ 
    groups: [],
    message: 'Use @everyone or /tagall directly in WhatsApp groups'
  });
});

// Health check endpoint for monitoring and keep-alive
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    uptime: process.uptime(),
    sessions: sessions.size,
    timestamp: new Date().toISOString()
  });
});

// Create HTTP server and WebSocket server
const server = createServer(app);
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  wsClients.add(ws);
  broadcastLog('🌐 New UI client connected', 'info');
  
  ws.on('close', () => {
    wsClients.delete(ws);
  });
});

server.listen(PORT, () => {
  broadcastLog(`🚀 Server listening on http://localhost:${PORT}`, 'success');
  broadcastLog(`📱 Bot ready - Use @everyone in groups to tag all members`, 'info');
  broadcastLog(`🌐 Production ready - can be deployed to VPS/Cloud`, 'success');
  
  // Keep-alive for Render.com (prevents sleep)
  if (process.env.RENDER) {
    const hostname = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;
    setInterval(() => {
      fetch(hostname)
        .then(() => console.log('Keep-alive ping sent'))
        .catch(() => console.log('Keep-alive ping failed'));
    }, 14 * 60 * 1000); // Ping every 14 minutes
    broadcastLog(`⏰ Keep-alive enabled for Render.com`, 'info');
  }
});
