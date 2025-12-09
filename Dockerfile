# -----------------------------
# 1) FRONTEND BUILD (Vite)
# -----------------------------
FROM node:18-alpine AS frontend

WORKDIR /app/frontend

# Ensure permission tools exist
RUN apk update && apk add --no-cache bash

COPY frontend/package*.json ./
RUN npm install

# Fix vite binary permissions BEFORE copying source
RUN chmod -R 755 node_modules/.bin || true
RUN chmod -R 755 node_modules/vite || true

# Now copy source
COPY frontend ./

# Build frontend
RUN npx --yes vite build


# -----------------------------
# 2) BACKEND BUILD
# -----------------------------
FROM node:18-alpine AS backend

WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm install

COPY backend ./


# -----------------------------
# 3) FINAL RUNTIME IMAGE
# -----------------------------
FROM node:18-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

# Copy backend app
COPY --from=backend /app/backend ./backend

# Copy built frontend
COPY --from=frontend /app/frontend/dist ./public

# Install only root dependencies if any
COPY package.json ./
RUN npm install --omit=dev || true

EXPOSE 8080

CMD ["node", "backend/src/server.js"]



