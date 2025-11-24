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
import fetch from 'node-fetch';
import { EventEmitter } from 'events';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3001);
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || '';
const MENTION_CHUNK_SIZE = Number(process.env.MENTION_CHUNK_SIZE || 25);
const CONVEX_URL = process.env.CONVEX_URL || '';
const CONVEX_DEPLOY_KEY = process.env.CONVEX_DEPLOY_KEY || '';

console.log("CONVEX_URL:", CONVEX_URL);
console.log("CONVEX_DEPLOY_KEY loaded:", !!CONVEX_DEPLOY_KEY);

const app = express();
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://localhost:5173', 
    'https://tagking.vercel.app',
    'https://*.vercel.app'
  ],
  credentials: true
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', '..', 'public')));

const nanoid = customAlphabet('123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz', 10);
const sessions = new Map();
const wsClients = new Set();
const qrEmitter = new EventEmitter();

fs.mkdirSync(path.join(process.cwd(), 'sessions'), { recursive: true });

// Send log to Convex
async function sendLogToConvex(userId, sessionId, action, level, details = {}) {
  if (!CONVEX_URL) {
    console.log('Skipping Convex log: CONVEX_URL not set');
    return;
  }
  try {
    console.log(`Sending log to Convex: ${action} (${level})`);
    
    const headers = {
      'Content-Type': 'application/json'
    };
    
    // Only add Authorization if it's a valid-looking token (not a CLI credential with pipe)
    if (CONVEX_DEPLOY_KEY && !CONVEX_DEPLOY_KEY.includes('|')) {
      headers['Authorization'] = `Bearer ${CONVEX_DEPLOY_KEY}`;
    }

    const res = await fetch(`${CONVEX_URL}/api/mutation`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        path: 'logs:addLog',
        args: { userId, sessionId, action, level, details }
      })
    });
    
    if (!res.ok) {
      const text = await res.text();
      console.error(`Convex log failed (${res.status}):`, text);
    }
  } catch (err) {
    console.error('Convex log error:', err.message);
  }
}

// Update session status in Convex
async function updateConvexSession(sessionId, status, renderSessionId = null) {
  if (!CONVEX_URL) {
    console.log('Skipping Convex session update: CONVEX_URL not set');
    return;
  }
  try {
    console.log(`Updating Convex session: ${sessionId} -> ${status}`);
    
    const headers = {
      'Content-Type': 'application/json'
    };
    
    // Only add Authorization if it's a valid-looking token (not a CLI credential with pipe)
    if (CONVEX_DEPLOY_KEY && !CONVEX_DEPLOY_KEY.includes('|')) {
      headers['Authorization'] = `Bearer ${CONVEX_DEPLOY_KEY}`;
    }

    const res = await fetch(`${CONVEX_URL}/api/mutation`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        path: 'sessions:updateSessionStatus',
        args: { sessionId, status, renderSessionId }
      })
    });

    if (!res.ok) {
      const text = await res.text();
      console.error(`Convex session update failed (${res.status}):`, text);
    } else {
      const json = await res.json();
      console.log(`Convex session update success:`, JSON.stringify(json));
    }
  } catch (err) {
    console.error('Convex session update error:', err.message);
  }
}

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

function delay(ms) { return new Promise((r) => setTimeout(r, ms)); }

async function createClientForSession(session) {
  const client = new Client({
    authStrategy: new LocalAuth({
      clientId: session.id,
      dataPath: session.authDir
    }),
    puppeteer: {
      headless: true,
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    }
  });

  session.client = client;

  client.on('loading_screen', (percent, message) => {
    console.log(`[${session.id}] Loading: ${message} ${percent}%`);
    if (percent === 0) {
      broadcastLog(`⏳ Starting WhatsApp sync...`, 'info');
      if (session.userId) {
        sendLogToConvex(session.userId, session.id, 'Starting WhatsApp sync...', 'info');
      }
    }
  });

  client.on('qr', async (qr) => {
    broadcastLog(`📷 QR Code generated - scan with WhatsApp`, 'success');
    session.state = 'qr';
    session.qrDataUrl = await qrcode.toDataURL(qr, { margin: 1, scale: 6 });
    if (session.userId) {
      await sendLogToConvex(session.userId, session.id, 'QR Code generated', 'info', {});
      await updateConvexSession(session.id, 'qr', session.id);
    }
  });

  client.on('ready', async () => {
    broadcastLog(`✅ Bot ready! Connected as ${client.info.wid.user}`, 'success');
    session.state = 'open';
    session.qrDataUrl = null;
    if (session.userId) {
      await sendLogToConvex(session.userId, session.id, 'Session connected', 'success', {
        phoneNumber: client.info.wid.user
      });
      await updateConvexSession(session.id, 'open', session.id);
    }
  });

  client.on('authenticated', async () => {
    broadcastLog(`🔐 Authentication successful!`, 'success');
    session.state = 'authenticated';
    if (session.userId) {
      await sendLogToConvex(session.userId, session.id, 'Authentication successful', 'success', {});
      await updateConvexSession(session.id, 'authenticated', session.id);
    }
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
        if (session.userId) {
          await sendLogToConvex(session.userId, session.id, 'Tagged all members', 'success', {
            groupName: chat.name,
            memberCount: mentions.length,
            message: msg
          });
        }
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

  return session;
}

function createSession(userId) {
    const id = nanoid();
    const authDir = path.join(process.cwd(), 'sessions', id);
    fs.mkdirSync(authDir, { recursive: true });
    const sessionData = { id, state: 'starting', qrDataUrl: null, client: null, authDir, userId };
    sessions.set(id, sessionData);
    broadcastLog(`📱 Creating new session: ${id}`, 'info');
    
    // Use the event emitter for QR codes
    createClientForSession(sessionData).then(initializedSession => {
        initializedSession.client.on('qr', async (qr) => {
            console.log(`[${id}] QR RECEIVED (Length: ${qr.length})`);
            try {
                const qrDataUrl = await qrcode.toDataURL(qr);
                console.log(`[${id}] QR Data URL generated (Length: ${qrDataUrl.length}, Prefix: ${qrDataUrl.substring(0, 30)}...)`);
                qrEmitter.emit(id, { qr: qrDataUrl });
            } catch (err) {
                console.error(`[${id}] Error generating QR data URL:`, err);
                qrEmitter.emit(id, { error: err });
            }
        });

        initializedSession.client.on('ready', () => {
            console.log(`[${id}] Client is ready!`);
            qrEmitter.emit(id, { ready: true });
        });

        initializedSession.client.on('auth_failure', (msg) => {
            console.error(`[${id}] Auth failure: ${msg}`);
            qrEmitter.emit(id, { error: new Error(`Auth failure: ${msg}`) });
        });

        initializedSession.client.on('disconnected', (reason) => {
            console.error(`[${id}] Disconnected: ${reason}`);
            qrEmitter.emit(id, { error: new Error(`Disconnected: ${reason}`) });
        });

        console.log(`[${id}] Initializing client...`);
        initializedSession.client.initialize().catch(err => {
            console.error(`[${id}] Error during client initialization:`, err);
            qrEmitter.emit(id, { error: err });
        });
    }).catch(err => {
        console.error(`[${id}] Error during client setup:`, err);
        qrEmitter.emit(id, { error: err });
    });

    return id;
}

function getSession(id) {
    return sessions.get(id);
}

// API routes
app.post('/api/session', (req, res) => {
  const { userId } = req.body;
  if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
  }
  console.log(`[API] Received session creation request for userId: ${userId}`);
  
  const sessionId = createSession(userId);

  const timeout = setTimeout(() => {
    qrEmitter.removeAllListeners(sessionId);
    console.error(`[API] Session creation for ${sessionId} timed out.`);
    if (!res.headersSent) {
        res.status(504).json({ error: 'QR code generation timed out.' });
    }
  }, 120000); // 120-second timeout

  qrEmitter.once(sessionId, (data) => {
    clearTimeout(timeout);
    if (res.headersSent) return;

    if (data.error) {
      console.error(`[API] Error creating session ${sessionId}:`, data.error.message);
      res.status(500).json({ error: data.error.message });
    } else if (data.ready) {
      console.log(`[API] Session ${sessionId} is ready. No QR code needed.`);
      res.json({ id: sessionId, qr: null });
    } else {
      console.log(`[API] Sending QR code for session ${sessionId}`);
      res.json({ id: sessionId, qr: data.qr });
    }
  });
});

app.get('/api/session/:id', (req, res) => {
    const sessionData = getSession(req.params.id);
    if (sessionData && sessionData.client) {
        const clientInfo = sessionData.client.info;
        res.json({ id: sessionData.id, userId: sessionData.userId, ready: !!clientInfo });
    } else {
        res.status(404).json({ error: 'Session not found or not fully initialized' });
    }
});

app.get('/api/session/:id/qr', (req, res) => {
    const sessionData = getSession(req.params.id);
    if (sessionData && sessionData.qrDataUrl) {
        res.json({ qrDataUrl: sessionData.qrDataUrl });
    } else {
        res.status(404).json({ error: 'QR code not available' });
    }
});

app.delete('/api/session/:id', async (req, res) => {
    const sessionId = req.params.id;
    const sessionData = getSession(sessionId);

    if (!sessionData) {
        return res.status(404).json({ error: 'Session not found' });
    }

    try {
        if (sessionData.client) {
            console.log(`[${sessionId}] Destroying client...`);
            await sessionData.client.destroy();
        }
        
        // Remove from sessions map
        sessions.delete(sessionId);
        
        // Clean up session directory
        const sessionDir = path.join(process.cwd(), 'sessions', sessionId);
        if (fs.existsSync(sessionDir)) {
            fs.rmSync(sessionDir, { recursive: true, force: true });
        }

        broadcastLog(`🗑️ Session ${sessionId} deleted`, 'warning');
        res.json({ success: true, message: 'Session deleted successfully' });
    } catch (error) {
        console.error(`[${sessionId}] Error deleting session:`, error);
        res.status(500).json({ error: 'Failed to delete session' });
    }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'TagKing WhatsApp Bot',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      session: '/api/session',
      qr: '/api/session/:id/qr',
      status: '/api/session/:id/status',
      groups: '/api/session/:id/groups'
    }
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
