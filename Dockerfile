# ---------- BASE IMAGE ----------
FROM node:18 AS base
WORKDIR /app

# ---------- FRONTEND BUILD ----------
FROM base AS frontend

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend ./

# Build using NodeJS directly to avoid permission issues
RUN node node_modules/vite/bin/vite.js build


# ---------- BACKEND BUILD ----------
FROM base AS backend

WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm install --production

COPY backend ./


# ---------- FINAL RUNTIME ----------
FROM node:18

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

# Copy backend
COPY --from=backend /app/backend ./backend

# Copy frontend dist
COPY --from=frontend /app/frontend/dist ./frontend/dist

# Install static server for frontend
RUN npm install -g serve

EXPOSE 8080

CMD ["sh", "-c", "node backend/src/server.js & serve -s frontend/dist -l 8080"]



