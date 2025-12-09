# ---------- FRONTEND BUILD ----------
FROM node:18-alpine AS frontend

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend ./

# Fix Vite permission issue
RUN chmod +x node_modules/.bin/vite || true

RUN npx vite build


# ---------- BACKEND BUILD ----------
FROM node:18-alpine AS backend

WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm install

COPY backend ./


# ---------- FINAL RUNTIME ----------
FROM node:18-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV BACKEND_PORT=3001
ENV PORT=8080

COPY --from=backend /app/backend ./backend
COPY --from=frontend /app/frontend/dist ./frontend/dist

RUN npm install -g serve

EXPOSE 8080

CMD ["sh", "-c", "node backend/src/server.js & serve -s frontend/dist -l 8080"]



