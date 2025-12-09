// backend/src/server.js
require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const { Server } = require("socket.io");

const MempoolClient = require("./services/MempoolClient");
const ChatMessage = require("./models/ChatMessage");

const txsRouter = require("./routes/txs");
const postsRouter = require("./routes/posts");

const app = express();
const server = http.createServer(app);

// ------------------ SOCKET.IO ------------------
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// ------------------ MIDDLEWARE ------------------
app.use(cors());
app.use(bodyParser.json());

// ------------------ MONGO ------------------
const MONGO_URL = process.env.MONGO_URL;

if (!MONGO_URL) {
  console.error("❌ ERROR: Missing MONGO_URL environment variable");
  process.exit(1);
}

mongoose
  .connect(MONGO_URL)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// ------------------ HEALTH CHECK ------------------
app.get("/health", (_, res) => res.json({ ok: true, time: new Date().toISOString() }));

// ------------------ ROUTES ------------------
app.use("/api/tx", txsRouter);
app.use("/api/posts", postsRouter);

// ------------------ SOCKET EVENTS ------------------
io.on("connection", (socket) => {
  console.log("🟢 Client connected:", socket.id);

  // Join chat room
  socket.on("join_live_chat", async ({ username }) => {
    if (!username || username.trim().length < 2) {
      username = "anon_" + socket.id.slice(0, 6);
    }

    socket.data.username = username;
    socket.join("live_chat");

    // Send last 200 messages
    const recent = await ChatMessage.find()
      .sort({ createdAt: -1 })
      .limit(200);

    socket.emit("chat_history", recent.reverse());
  });

  // Chat messages
  socket.on("live_chat_message", async ({ message }) => {
    if (!socket.data.username) return;

    const now = Date.now();
    socket.lastMsgAt = socket.lastMsgAt || 0;

    if (now - socket.lastMsgAt < 400) {
      socket.emit("rate_limited");
      return;
    }

    socket.lastMsgAt = now;

    const sanitize = require("./utils/sanitize");
    const clean = sanitize(String(message || "").slice(0, 800));

    const msg = await ChatMessage.create({
      username: socket.data.username,
      message: clean,
      createdAt: new Date(),
    });

    io.to("live_chat").emit("new_chat_message", msg);
  });

  socket.on("disconnect", () => {
    console.log("🔴 Client disconnected:", socket.id);
  });
});

// ------------------ MEMPOOL LIVE STREAM ------------------
console.log("[MEMPOOL] Starting mempool live listener...");

MempoolClient.start((tx) => {
  io.emit("tx", tx); // broadcast transaction to frontend
});

// ------------------ START SERVER ------------------
const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});






