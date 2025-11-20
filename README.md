# WhatsApp Tag-All Platform (Baileys)

Multi-session web UI for connecting WhatsApp accounts and sending admin-gated @everyone mentions in groups.

## Features
- Create per-user sessions, scan QR, auto-reconnect
- List groups and verify admin before sending
- Chunked mentions with delay to avoid limits
- Simple UI + REST API, optional bearer auth

## Requirements
- Node.js 20+ (LTS)
- Windows or Linux

## Quick Start (PowerShell)
```powershell
npm install
npm start
```
Open http://localhost:3000 → Create Session → scan QR (WhatsApp → Linked Devices) → when status is "open", load groups and send.

## Environment (.env)
- `PORT` (default 3000)
- `ADMIN_TOKEN` (optional; protects API/UI)
- `MENTION_CHUNK_SIZE` (default 25)

Example `.env`:
```
PORT=3000
ADMIN_TOKEN=change-me
MENTION_CHUNK_SIZE=25
```

## API
- `POST /api/session` → { id }
- `GET /api/session/:id/status` → { state, qrDataUrl, me }
- `DELETE /api/session/:id` → { ok }
- `GET /api/session/:id/groups` → { groups }
- `POST /api/session/:id/everyone` body: { groupId, text }

## Notes
- This uses unofficial Web protocol (Baileys). Use responsibly and comply with group rules. Abuse/spam may lead to account restrictions.
