// server.js — Railway READY
require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");

const HybridTxClient = require("./services/HybridTxClient");
const ChatMessage = require("./models/ChatMessage");

const txsRouter = require("./routes/txs");
const postsRouter = require("./routes/posts");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ---------- DATABASE ----------
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("❌ ERROR: MONGODB_URI is missing");
  process.exit(1);
}

mongoose.set("strictQuery", false);
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB error", err));

// ---------- API ----------
app.get("/health", (_, res) =>
  res.json({ ok: true, time: new Date().toISOString() })
);

app.use("/api/tx", txsRouter);
app.use("/api/posts", postsRouter);

// ---------- SERVER ----------
const server = http.createServer(app);

// Backend must NOT use 8080 in Railway — frontend uses that port.
const PORT = process.env.BACKEND_PORT || 3001;

// ---------- SOCKET.IO ----------
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("socket connected", socket.id);

  // Join live chat
  socket.on("join_live_chat", async ({ username }) => {
    if (!username || username.trim().length < 2)
      username = "anon_" + socket.id.slice(0, 6);

    socket.data.username = username;
    socket.join("live_chat");

    const recent = await ChatMessage.find()
      .sort({ createdAt: -1 })
      .limit(200);

    socket.emit("chat_history", recent.reverse());
  });

  // Receive a message
  socket.on("live_chat_message", async ({ message }) => {
    if (!socket.data.username) return;

    const sanitize = require("./utils/sanitize");
    const clean = sanitize(String(message || "").slice(0, 800));

    const saved = await ChatMessage.create({
      username: socket.data.username,
      message: clean,
      createdAt: new Date(),
    });

    io.to("live_chat").emit("new_chat_message", saved);
  });

  socket.on("disconnect", () => {
    console.log("socket disconnected", socket.id);
  });
});

// ---------- HYBRID TX STREAM ----------
HybridTxClient.start((tx) => {
  io.emit("tx", tx);
});

// ---------- LISTEN ----------
server.listen(PORT, "0.0.0.0", () =>
  console.log("🚀 Backend running on port", PORT)
);



