# ---------- BASE IMAGE ----------
FROM node:18-alpine AS builder

WORKDIR /app

# ---------- BACKEND ----------
COPY backend/package.json backend/package-lock.json ./backend/
RUN cd backend && npm install

COPY backend ./backend


# ---------- FRONTEND ----------
COPY frontend/package.json frontend/package-lock.json ./frontend/
RUN cd frontend && npm install

COPY frontend ./frontend
RUN cd frontend && npx vite build


# ---------- FINAL IMAGE ----------
FROM node:18-alpine
WORKDIR /app

# Copy backend
COPY --from=builder /app/backend ./backend

# Copy frontend build output
COPY --from=builder /app/frontend/dist ./frontend-dist

# Install serve for static hosting
RUN npm install -g serve

ENV PORT=8080
EXPOSE 8080

CMD ["sh", "-c", "cd backend && node src/server.js & serve ../frontend-dist -l 8080"]
