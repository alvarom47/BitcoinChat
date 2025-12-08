Bitcoin Live — PRO Hybrid (English)

This repo is prepared to deploy on Railway (Hybrid transaction client: Blockstream + Blockchair + mempool.space fallback).

Folders:
- backend/: Node + Express + Socket.IO
- frontend/: React + Vite (build to static, Dockerfile included)

Quick local run (backend):
1. cd backend
2. npm install
3. create .env with MONGODB_URI and optional POLL_INTERVAL
4. npm start

Quick local run (frontend dev):
1. cd frontend
2. npm install
3. npm run dev
Set VITE_BACKEND_URL in .env to http://localhost:4000 for local dev.

Railway deployment:
- Push to a GitHub repo, connect Railway.
- Create MongoDB plugin in Railway and copy MONGODB_URI to Service Environment.
- Deploy backend service (use backend folder).
- Deploy frontend service (use frontend folder) or serve frontend from backend.

Notes:
- Hybrid mode may hit rate limits from public APIs. Consider caching or using mempool.space only if you get many 429s.
