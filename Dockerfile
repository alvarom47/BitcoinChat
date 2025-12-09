FROM node:18-alpine

WORKDIR /app

# -------------------------
# BACKEND
# -------------------------
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm install --production

COPY backend ./ 

# -------------------------
# FRONTEND
# -------------------------
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install

COPY frontend ./

# Asegurar permisos para Vite
RUN chmod -R 755 node_modules/.bin || true

# Build frontend
RUN npx vite build

# -------------------------
# RUNTIME
# -------------------------
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

CMD ["node", "backend/src/server.js"]




