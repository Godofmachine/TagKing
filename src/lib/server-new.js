import path from 'path';
import fs from 'fs';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import qrcode from 'qrcode';
import { customAlphabet } from 'nanoid';
import { Client, LocalAuth } from 'whatsapp-web.js';
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
const sessions = new Map(); // id -> { id, state, qrDataUrl, client, authDir }

fs.mkdirSync(path.join(process.cwd(), 'sessions'), { recursive: true });

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

  client.on('qr', async (qr) => {
    console.log(`📷 QR Code generated for session ${session.id}`);
    session.state = 'qr';
    session.qrDataUrl = await qrcode.toDataURL(qr, { margin: 1, scale: 6 });
  });

  client.on('ready', () => {
    console.log(`✅ Session ${session.id} is ready! Number: ${client.info.wid.user}`);
    session.state = 'open';
    session.qrDataUrl = null;
  });

  client.on('authenticated', () => {
    console.log(`🔐 Session ${session.id} authenticated`);
    session.state = 'authenticated';
  });

  client.on('auth_failure', (msg) => {
    console.error(`❌ Authentication failed for session ${session.id}:`, msg);
    session.state = 'auth_failure';
    session.qrDataUrl = null;
  });

  client.on('disconnected', (reason) => {
    console.log(`🔌 Session ${session.id} disconnected:`, reason);
    session.state = 'closed';
    session.qrDataUrl = null;
  });

  // Handle incoming messages for commands
  client.on('message', async (message) => {
    try {
      const text = message.body.trim();
      const fromMe = message.fromMe;
      
      // Only respond to messages from yourself
      if (!fromMe) return;
      
      console.log(`📱 Command received: ${text}`);

      // Command: /help
      if (text === '/help') {
        const helpText = `🤖 *WhatsApp Bot Commands*\n\n` +
          `📋 /listgroups - Show all your groups\n` +
          `📢 /broadcast GroupName | Message - Broadcast to a group\n` +
          `ℹ️ /help - Show this help\n\n` +
          `*Example:*\n` +
          `/broadcast Family | Happy New Year everyone! 🎉`;
        
        await message.reply(helpText);
        return;
      }

      // Command: /listgroups
      if (text === '/listgroups') {
        try {
          const chats = await client.getChats();
          const groups = chats.filter(chat => chat.isGroup);
          
          if (groups.length === 0) {
            await message.reply('📋 You have no groups.');
            return;
          }
          
          let response = `📋 *Your Groups (${groups.length}):*\n\n`;
          groups.forEach((g, i) => {
            response += `${i + 1}. ${g.name}\n`;
          });
          response += `\n💡 Use: /broadcast GroupName | Your message`;
          
          await message.reply(response);
        } catch (err) {
          console.error('Error listing groups:', err);
          await message.reply('❌ Failed to fetch groups. Try again.');
        }
        return;
      }

      // Command: /broadcast GroupName | Message
      if (text.startsWith('/broadcast ')) {
        const parts = text.slice(11).split('|');
        if (parts.length < 2) {
          await message.reply('❌ *Usage:*\n/broadcast GroupName | Your message here\n\n*Example:*\n/broadcast Family | Happy New Year! 🎉');
          return;
        }
        
        const groupName = parts[0].trim();
        const messageText = parts.slice(1).join('|').trim();
        
        if (!messageText) {
          await message.reply('❌ Message cannot be empty!');
          return;
        }
        
        try {
          // Find the group
          const chats = await client.getChats();
          const groups = chats.filter(chat => chat.isGroup);
          const group = groups.find(g => 
            g.name.toLowerCase().includes(groupName.toLowerCase())
          );
          
          if (!group) {
            await message.reply(`❌ Group "${groupName}" not found.\n\nUse /listgroups to see all groups.`);
            return;
          }
          
          await message.reply(`🚀 Broadcasting to *${group.name}*...\n\nMessage: "${messageText}"`);
          
          // Get participants
          const participants = await group.participants;
          const myNumber = client.info.wid.user;
          
          // Check if you're admin
          const me = participants.find(p => p.id.user === myNumber);
          if (!me || !me.isAdmin) {
            await message.reply(`❌ You're not an admin in *${group.name}*. Cannot broadcast.`);
            return;
          }
          
          // Filter out yourself
          const others = participants.filter(p => p.id.user !== myNumber);
          
          if (others.length === 0) {
            await message.reply('❌ No members to broadcast to.');
            return;
          }
          
          // Send in chunks with mentions
          const mentions = others.map(p => p.id._serialized);
          const chunks = [];
          for (let i = 0; i < mentions.length; i += MENTION_CHUNK_SIZE) {
            chunks.push(mentions.slice(i, i + MENTION_CHUNK_SIZE));
          }
          
          let sent = 0;
          for (const chunk of chunks) {
            await group.sendMessage(messageText, {
              mentions: chunk
            });
            sent++;
            await delay(1200);
          }
          
          await message.reply(`✅ *Broadcast complete!*\n\nGroup: ${group.name}\nSent: ${sent} message(s)\nMembers: ${others.length}`);
          
        } catch (err) {
          console.error('Error broadcasting:', err);
          await message.reply(`❌ Broadcast failed: ${err.message}`);
        }
        return;
      }
      
    } catch (err) {
      console.error('Error processing message:', err);
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
  console.log(`📱 Creating new session: ${id}`);
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
    if (session.client) {
      await session.client.destroy();
    }
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
  try {
    const chats = await session.client.getChats();
    const groups = chats
      .filter(chat => chat.isGroup)
      .map(g => ({ id: g.id._serialized, subject: g.name }));
    res.json({ groups });
  } catch (e) {
    console.error('Error fetching groups:', e);
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/session/:id/everyone', bearerAuth, async (req, res) => {
  const { groupId, text } = req.body || {};
  const session = sessions.get(req.params.id);
  if (!session || session.state !== 'open') {
    return res.status(400).json({ error: 'Session not ready' });
  }
  if (!groupId) return res.status(400).json({ error: 'groupId required' });

  try {
    const chat = await session.client.getChatById(groupId);
    if (!chat.isGroup) {
      return res.status(400).json({ error: 'Not a group' });
    }

    const participants = await chat.participants;
    const myNumber = session.client.info.wid.user;
    
    // Check if admin
    const me = participants.find(p => p.id.user === myNumber);
    if (!me || !me.isAdmin) {
      return res.status(403).json({ error: 'Not a group admin' });
    }

    // Get all participant IDs except yourself
    const mentions = participants
      .filter(p => p.id.user !== myNumber)
      .map(p => p.id._serialized);

    // Send in chunks
    const chunks = [];
    for (let i = 0; i < mentions.length; i += MENTION_CHUNK_SIZE) {
      chunks.push(mentions.slice(i, i + MENTION_CHUNK_SIZE));
    }

    for (const chunk of chunks) {
      await chat.sendMessage((text && text.trim()) ? text : 'Attention everyone', {
        mentions: chunk
      });
      await delay(1200);
    }

    res.json({ ok: true, sent: chunks.length, members: mentions.length });
  } catch (e) {
    console.error('Error sending message:', e);
    res.status(500).json({ error: e.message });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', '..', 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
  if (ADMIN_TOKEN) console.log('🔐 Admin token enabled');
  console.log('📱 Using whatsapp-web.js for stable connections');
});
