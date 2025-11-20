import path from 'path';
import fs from 'fs';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import qrcode from 'qrcode';
import pino from 'pino';
import { customAlphabet } from 'nanoid';
import makeWASocket, { useMultiFileAuthState, fetchLatestBaileysVersion, DisconnectReason } from '@whiskeysockets/baileys';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || '';
const MENTION_CHUNK_SIZE = Number(process.env.MENTION_CHUNK_SIZE || 25);

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', '..', 'public')));

const nanoid = customAlphabet('123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz', 10);
const sessions = new Map(); // id -> { id, state, qrDataUrl, sock, saveCreds, authDir }

fs.mkdirSync(path.join(process.cwd(), 'sessions'), { recursive: true });

function bearerAuth(req, res, next) {
  if (!ADMIN_TOKEN) return next();
  const auth = (req.headers.authorization || '').split(' ');
  if (auth[0] === 'Bearer' && auth[1] === ADMIN_TOKEN) return next();
  res.status(401).json({ error: 'Unauthorized' });
}

function delay(ms) { return new Promise((r) => setTimeout(r, ms)); }

async function createSocketForSession(session) {
  const logger = pino({ level: 'silent' }); // Reduce log noise
  const { state, saveCreds } = await useMultiFileAuthState(session.authDir);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    printQRInTerminal: false,
    auth: state,
    logger,
    browser: ['WhatsApp Bot', 'Chrome', '120.0.0'],
    syncFullHistory: false,
    markOnlineOnConnect: false,
    connectTimeoutMs: 60000,
    defaultQueryTimeoutMs: 60000,
    retryRequestDelayMs: 250,
    keepAliveIntervalMs: 30000
  });
  session.sock = sock;
  session.saveCreds = saveCreds;

  sock.ev.on('creds.update', saveCreds);
  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      session.state = 'qr';
      session.qrDataUrl = await qrcode.toDataURL(qr, { margin: 1, scale: 6 });
    }

    if (connection === 'open') {
      session.state = 'open';
      session.qrDataUrl = null;
      console.log(`✅ Session ${session.id} connected! WhatsApp commands enabled.`);
    } else if (connection === 'close') {
      const status = lastDisconnect?.error?.output?.statusCode;
      const message = lastDisconnect?.error?.message;
      const shouldReconnect = (status !== DisconnectReason.loggedOut) && (message !== 'Logged Out');
      
      console.log(`Session ${session.id} closed. Status: ${status}, Message: ${message}, Reconnect: ${shouldReconnect}`);
      
      session.state = shouldReconnect ? 'reconnecting' : 'closed';
      session.qrDataUrl = null;
      if (shouldReconnect) {
        console.log(`Reconnecting session ${session.id} in 3 seconds...`);
        setTimeout(() => createSocketForSession(session), 3000);
      }
    }
  });

  // Handle incoming messages for commands
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;
    
    for (const msg of messages) {
      try {
        // Only process text messages from yourself
        if (!msg.message?.conversation && !msg.message?.extendedTextMessage?.text) continue;
        
        const text = (msg.message?.conversation || msg.message?.extendedTextMessage?.text || '').trim();
        const fromMe = msg.key.fromMe;
        const chatJid = msg.key.remoteJid;
        
        // Only respond to messages from yourself
        if (!fromMe) continue;
        
        console.log(`Received command: ${text}`);

        // Command: /help
        if (text === '/help') {
          const helpText = `🤖 *WhatsApp Bot Commands*\n\n` +
            `📋 /listgroups - Show all your groups\n` +
            `📢 /broadcast GroupName | Message - Broadcast to a group\n` +
            `ℹ️ /help - Show this help\n\n` +
            `*Example:*\n` +
            `/broadcast Family | Happy New Year everyone! 🎉`;
          
          await sock.sendMessage(chatJid, { text: helpText });
          continue;
        }

        // Command: /listgroups
        if (text === '/listgroups') {
          try {
            const groupsMap = await sock.groupFetchAllParticipating();
            const groups = Object.values(groupsMap);
            
            if (groups.length === 0) {
              await sock.sendMessage(chatJid, { text: '📋 You have no groups.' });
              continue;
            }
            
            let response = `📋 *Your Groups (${groups.length}):*\n\n`;
            groups.forEach((g, i) => {
              response += `${i + 1}. ${g.subject}\n`;
            });
            response += `\n💡 Use: /broadcast GroupName | Your message`;
            
            await sock.sendMessage(chatJid, { text: response });
          } catch (err) {
            console.error('Error listing groups:', err);
            await sock.sendMessage(chatJid, { text: '❌ Failed to fetch groups. Try again.' });
          }
          continue;
        }

        // Command: /broadcast GroupName | Message
        if (text.startsWith('/broadcast ')) {
          const parts = text.slice(11).split('|');
          if (parts.length < 2) {
            await sock.sendMessage(chatJid, { 
              text: '❌ *Usage:*\n/broadcast GroupName | Your message here\n\n*Example:*\n/broadcast Family | Happy New Year! 🎉' 
            });
            continue;
          }
          
          const groupName = parts[0].trim();
          const messageText = parts.slice(1).join('|').trim();
          
          if (!messageText) {
            await sock.sendMessage(chatJid, { text: '❌ Message cannot be empty!' });
            continue;
          }
          
          try {
            // Find the group
            const groupsMap = await sock.groupFetchAllParticipating();
            const groups = Object.values(groupsMap);
            const group = groups.find(g => 
              g.subject.toLowerCase().includes(groupName.toLowerCase())
            );
            
            if (!group) {
              await sock.sendMessage(chatJid, { 
                text: `❌ Group "${groupName}" not found.\n\nUse /listgroups to see all groups.` 
              });
              continue;
            }
            
            await sock.sendMessage(chatJid, { 
              text: `🚀 Broadcasting to *${group.subject}*...\n\nMessage: "${messageText}"` 
            });
            
            // Get group metadata
            const md = await sock.groupMetadata(group.id);
            const participants = md.participants || [];
            const myJid = sock.user?.id;
            
            // Check if admin
            const iAmAdmin = !!participants.find(p => p.id === myJid && (p.admin === 'admin' || p.admin === 'superadmin'));
            if (!iAmAdmin) {
              await sock.sendMessage(chatJid, { 
                text: `❌ You're not an admin in *${group.subject}*. Cannot broadcast.` 
              });
              continue;
            }
            
            // Get participant JIDs (exclude yourself)
            const jids = participants.filter(p => p.id !== myJid).map(p => p.id);
            
            if (jids.length === 0) {
              await sock.sendMessage(chatJid, { text: '❌ No members to broadcast to.' });
              continue;
            }
            
            // Send in chunks with mentions
            const chunks = [];
            for (let i = 0; i < jids.length; i += MENTION_CHUNK_SIZE) {
              chunks.push(jids.slice(i, i + MENTION_CHUNK_SIZE));
            }
            
            let sent = 0;
            for (const chunk of chunks) {
              await sock.sendMessage(group.id, {
                text: messageText,
                mentions: chunk
              });
              sent++;
              await delay(1200);
            }
            
            await sock.sendMessage(chatJid, { 
              text: `✅ *Broadcast complete!*\n\nGroup: ${group.subject}\nSent: ${sent} message(s)\nMembers: ${jids.length}` 
            });
            
          } catch (err) {
            console.error('Error broadcasting:', err);
            await sock.sendMessage(chatJid, { 
              text: `❌ Broadcast failed: ${err.message}` 
            });
          }
          continue;
        }
        
      } catch (err) {
        console.error('Error processing message:', err);
      }
    }
  });

  return session;
}

async function createSession() {
  const id = nanoid();
  const authDir = path.join(process.cwd(), 'sessions', id);
  fs.mkdirSync(authDir, { recursive: true });
  const session = { id, state: 'starting', qrDataUrl: null, sock: null, saveCreds: null, authDir };
  sessions.set(id, session);
  console.log(`📱 Creating new session: ${id}`);
  await createSocketForSession(session);
  return session;
}

// API routes
app.post('/api/session', bearerAuth, async (req, res) => {
  try {
    const session = await createSession();
    res.json({ id: session.id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/session/:id/status', bearerAuth, (req, res) => {
  const session = sessions.get(req.params.id);
  if (!session) return res.status(404).json({ error: 'Not found' });
  res.json({
    id: session.id,
    state: session.state,
    qrDataUrl: session.qrDataUrl || null,
    me: session.sock?.user || null
  });
});

app.delete('/api/session/:id', bearerAuth, async (req, res) => {
  const session = sessions.get(req.params.id);
  if (!session) return res.status(404).json({ error: 'Not found' });
  try {
    sessions.delete(req.params.id);
    if (session.sock?.end) await session.sock.end();
    await fs.promises.rm(session.authDir, { recursive: true, force: true });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/session/:id/groups', bearerAuth, async (req, res) => {
  const session = sessions.get(req.params.id);
  if (!session || session.state !== 'open') return res.status(400).json({ error: 'Session not ready' });
  try {
    const groupsMap = await session.sock.groupFetchAllParticipating();
    const groups = Object.values(groupsMap).map(g => ({ id: g.id, subject: g.subject }));
    res.json({ groups });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/session/:id/everyone', bearerAuth, async (req, res) => {
  const { groupId, text } = req.body || {};
  const session = sessions.get(req.params.id);
  if (!session || session.state !== 'open') return res.status(400).json({ error: 'Session not ready' });
  if (!groupId) return res.status(400).json({ error: 'groupId required' });

  try {
    const md = await session.sock.groupMetadata(groupId);
    const participants = md.participants || [];
    const myJid = session.sock.user?.id;
    const iAmAdmin = !!participants.find(p => p.id === myJid && (p.admin === 'admin' || p.admin === 'superadmin'));
    if (!iAmAdmin) return res.status(403).json({ error: 'Not a group admin' });

    const jids = participants.map(p => p.id);
    const chunks = [];
    for (let i = 0; i < jids.length; i += MENTION_CHUNK_SIZE) {
      chunks.push(jids.slice(i, i + MENTION_CHUNK_SIZE));
    }

    for (const chunk of chunks) {
      await session.sock.sendMessage(groupId, {
        text: (text && text.trim()) ? text : 'Attention everyone',
        mentions: chunk
      });
      await delay(1200);
    }

    res.json({ ok: true, sent: chunks.length, members: jids.length });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', '..', 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
  if (ADMIN_TOKEN) console.log('Admin token enabled');
});
