# ──────────────── ROOT DOCKERFILE FOR RAILWAY ────────────────
FROM node:18-alpine AS builder

# Install backend dependencies
WORKDIR /app/backend
COPY backend/package.json backend/package-lock.json ./
RUN npm install
COPY backend .

# Install frontend dependencies + build
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm install
COPY frontend .
RUN npx vite build

# ──────────────── FINAL IMAGE ────────────────
FROM node:18-alpine

WORKDIR /app

# Copy backend
COPY --from=builder /app/backend ./backend

# Copy frontend build output
COPY --from=builder /app/frontend/dist ./frontend/dist

# Install serve for static hosting
RUN npm install -g serve

EXPOSE 8080

CMD node backend/src/server.js & serve -s frontend/dist -l 4173
