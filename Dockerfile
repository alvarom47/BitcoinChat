FROM node:18-alpine

# Install tools
RUN apk update && apk add --no-cache bash

# Set root workdir
WORKDIR /app

# Copy backend first
COPY backend ./backend

# Install backend deps
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install --production

# Copy frontend and build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend ./

# Fix vite permissions AFTER copying source
RUN chmod -R 755 node_modules/.bin || true
RUN chmod -R 755 node_modules/vite || true

# Build frontend
RUN npx vite build

# ---------------------------
# Serve frontend + backend
# ---------------------------
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

CMD ["sh", "-c", "node backend/src/server.js"]



