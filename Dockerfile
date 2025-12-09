# -----------------------------
# 1) FRONTEND BUILD (Vite)
# -----------------------------
FROM node:18-alpine AS frontend

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend ./

RUN npx vite build


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

# Copy built frontend to /public
COPY --from=frontend /app/frontend/dist ./public

# Backend may need root package.json (if present)
COPY package.json ./
RUN npm install --omit=dev || true

EXPOSE 8080

CMD ["node", "backend/src/server.js"]


