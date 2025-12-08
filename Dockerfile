# ----- Builder Backend -----
FROM node:18-alpine AS backend
WORKDIR /backend
COPY backend/package*.json ./
RUN npm install
COPY backend .

# ----- Builder Frontend -----
FROM node:18-alpine AS frontend
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend .
RUN npx vite build

# ----- Final Image -----
FROM node:18-alpine
WORKDIR /app

# Copy backend
COPY --from=backend /backend ./backend

# Copy frontend build (dist folder)
COPY --from=frontend /frontend/dist ./frontend-dist

WORKDIR /app/backend
RUN npm install --omit=dev

ENV PORT=8080
EXPOSE 8080

CMD ["node", "src/server.js"]

