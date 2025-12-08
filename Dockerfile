# ---------- FRONTEND BUILD ----------
FROM node:18-alpine AS frontend

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend ./
RUN npm run build


# ---------- BACKEND BUILD ----------
FROM node:18-alpine AS backend

WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm install --production

COPY backend ./


# ---------- FINAL RUNTIME ----------
FROM node:18-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

# Copy backend
COPY --from=backend /app/backend ./backend

# Copy frontend build
COPY --from=frontend /app/frontend/dist ./frontend/dist

# Install only what backend needs
WORKDIR /app/backend

EXPOSE 8080

CMD ["node", "src/server.js"]


