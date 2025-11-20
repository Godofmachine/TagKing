const els = {
  token: document.getElementById('token'),
  create: document.getElementById('create'),
  del: document.getElementById('deleteBtn'),
  sid: document.getElementById('sid'),
  status: document.getElementById('status'),
  me: document.getElementById('me'),
  qrRow: document.getElementById('qrRow'),
  qr: document.getElementById('qr'),
  loadGroups: document.getElementById('loadGroups'),
  groups: document.getElementById('groups'),
  text: document.getElementById('text'),
  send: document.getElementById('send'),
  log: document.getElementById('log')
};

let sessionId = null;
let pollTimer = null;
let ws = null;

// Backend API URL - change this when deploying
const API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3000'
  : (window.BACKEND_URL || 'https://YOUR-RENDER-APP.onrender.com');

const WS_URL = window.location.hostname === 'localhost'
  ? 'ws://localhost:3000'
  : (window.BACKEND_WS || 'wss://YOUR-RENDER-APP.onrender.com');

// Connect to WebSocket for live logs
function connectWebSocket() {
  ws = new WebSocket(WS_URL);
  
  ws.onopen = () => {
    log('🌐 Connected to server', 'success');
  };
  
  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      log(data.message, data.type);
    } catch (e) {
      console.error('WebSocket message error:', e);
    }
  };
  
  ws.onclose = () => {
    log('⚠️ Disconnected from server', 'warning');
    // Reconnect after 3 seconds
    setTimeout(connectWebSocket, 3000);
  };
  
  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };
}

// Initialize WebSocket on page load
connectWebSocket();

function authHeader() {
  const t = els.token.value.trim();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

function setStatus(s) { els.status.textContent = s; }
function setMe(m) { els.me.textContent = m || ''; }
function setQr(url) {
  if (url) {
    els.qr.src = url;
    els.qrRow.style.display = '';
  } else {
    els.qr.src = '';
    els.qrRow.style.display = 'none';
  }
}

function enableControls(connected) {
  els.loadGroups.disabled = !connected;
  els.groups.disabled = !connected;
  els.send.disabled = !connected || !els.groups.value;
  els.del.disabled = !sessionId ? true : false;
}

function log(msg, type = 'info') {
  const d = new Date().toLocaleTimeString();
  let emoji = '📝';
  if (type === 'success') emoji = '✅';
  if (type === 'error') emoji = '❌';
  if (type === 'warning') emoji = '⚠️';
  
  els.log.textContent = `[${d}] ${emoji} ${msg}\n` + els.log.textContent;
  
  // Keep only last 100 lines
  const lines = els.log.textContent.split('\n');
  if (lines.length > 100) {
    els.log.textContent = lines.slice(0, 100).join('\n');
  }
}

async function createSession() {
  try {
    log('Creating session...');
    els.create.disabled = true;
    const res = await fetch(`${API_URL}/api/session`, { method: 'POST', headers: { ...authHeader(), 'Content-Type': 'application/json' }});
    if (!res.ok) { 
      const t = await res.text(); 
      alert('Error: ' + t); 
      log('Failed to create session: ' + t);
      els.create.disabled = false;
      return; 
    }
    const data = await res.json();
    sessionId = data.id;
    els.sid.textContent = `Session: ${sessionId}`;
    log(`Session created: ${sessionId}`);
    els.del.disabled = false;
    pollStatus();
  } catch (err) {
    log('Error: ' + err.message);
    alert('Error creating session: ' + err.message);
    els.create.disabled = false;
  }
}

async function deleteSession() {
  if (!sessionId) return;
  await fetch(`${API_URL}/api/session/${sessionId}`, { method: 'DELETE', headers: { ...authHeader() }});
  clearInterval(pollTimer);
  sessionId = null;
  els.sid.textContent = '';
  setStatus('-'); setMe(''); setQr(null);
  enableControls(false);
  els.groups.innerHTML = '';
}

async function pollStatus() {
  if (pollTimer) clearInterval(pollTimer);
  const tick = async () => {
    if (!sessionId) return;
    const res = await fetch(`${API_URL}/api/session/${sessionId}/status`, { headers: { ...authHeader() }});
    if (!res.ok) return;
    const data = await res.json();
    setStatus(data.state);
    if (data.me) setMe(`${data.me.id || ''}`);
    setQr(data.qrDataUrl);
    enableControls(data.state === 'open');
  };
  await tick();
  pollTimer = setInterval(tick, 1500);
}

async function loadGroups() {
  if (!sessionId) {
    log('Error: No session ID');
    alert('Please create a session first');
    return;
  }
  
  try {
    log('Loading groups...');
    els.loadGroups.disabled = true;
    
    const res = await fetch(`${API_URL}/api/session/${sessionId}/groups`, { headers: { ...authHeader() }});
    
    if (!res.ok) {
      const error = await res.json();
      log(`Failed to load groups: ${error.error || res.statusText}`);
      alert(`Error: ${error.error || res.statusText}`);
      els.loadGroups.disabled = false;
      return;
    }
    
    const data = await res.json();
    log(`Found ${data.groups?.length || 0} groups`);
    
    els.groups.innerHTML = '<option value="">-- Select a group --</option>';
    (data.groups || []).forEach(g => {
      const opt = document.createElement('option');
      opt.value = g.id; 
      opt.textContent = g.subject;
      els.groups.appendChild(opt);
    });
    
    els.loadGroups.disabled = false;
    enableControls(true);
  } catch (err) {
    log('Error loading groups: ' + err.message);
    alert('Error loading groups: ' + err.message);
    els.loadGroups.disabled = false;
  }
}

async function sendEveryone() {
  if (!sessionId) {
    log('Error: No session ID');
    alert('Please create a session first');
    return;
  }
  
  const groupId = els.groups.value;
  if (!groupId) { 
    alert('Pick a group'); 
    return; 
  }
  
  try {
    log(`Sending message to group...`);
    els.send.disabled = true;
    
    const body = { groupId, text: els.text.value || '' };
    const res = await fetch(`${API_URL}/api/session/${sessionId}/everyone`, {
      method: 'POST',
      headers: { ...authHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    
    const data = await res.json();
    
    if (!res.ok) { 
      log(`Failed to send: ${data.error || 'Unknown error'}`);
      alert(data.error || 'Failed'); 
      els.send.disabled = false;
      return; 
    }
    
    log(`✅ Sent to ${data.members} members in ${data.sent} message(s).`);
    els.send.disabled = false;
  } catch (err) {
    log('Error sending message: ' + err.message);
    alert('Error: ' + err.message);
    els.send.disabled = false;
  }
}

els.create.addEventListener('click', createSession);
els.del.addEventListener('click', deleteSession);
els.loadGroups.addEventListener('click', loadGroups);
els.groups.addEventListener('change', () => enableControls(true));
els.send.addEventListener('click', sendEveryone);
