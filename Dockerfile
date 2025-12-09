# ---------- FRONTEND BUILD ----------
FROM node:18-alpine AS frontend

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend ./

RUN chmod +x node_modules/.bin/vite || true
RUN chmod +x node_modules/vite/bin/vite.js || true

RUN npx vite build

# ---------- BACKEND BUILD ----------
FROM node:18-alpine AS backend

WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm install

COPY backend ./

# ---------- FINAL IMAGE ----------
FROM node:18-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV BACKEND_PORT=3001

COPY --from=backend /app/backend ./backend
COPY --from=frontend /app/frontend/dist ./frontend/dist

RUN npm install -g serve

EXPOSE 8080 3001

CMD ["sh", "-c", "node backend/src/server.js & serve -s frontend/dist -l 8080"]


