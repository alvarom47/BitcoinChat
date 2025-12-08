# ---------- FRONTEND BUILD STAGE ----------
FROM node:18-alpine AS frontend

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend ./
RUN npx vite build

# ---------- BACKEND BUILD STAGE ----------
FROM node:18-alpine AS backend

WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm install

COPY backend ./

# ---------- FINAL RUNTIME IMAGE ----------
FROM node:18-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

# Copiar backend listo
COPY --from=backend /app/backend ./backend

# Copiar frontend compilado
COPY --from=frontend /app/frontend/dist ./frontend/dist

# Instalar algún servidor estático para servir el frontend
RUN npm install -g serve

EXPOSE 8080

CMD ["sh", "-c", "node backend/src/server.js & serve -s frontend/dist -l 8080"]

