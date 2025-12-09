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

// --------------------- PORT FIX FOR RAILWAY ---------------------
const BACKEND_PORT = process.env.BACKEND_PORT || 3001; // backend port (NOT 8080)
// ----------------------------------------------------------------

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(bodyParser.json());

// --------------------- MONGO CONNECTION FIX ---------------------
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("❌ ERROR: Missing MONGODB_URI in Railway Environment Variables");
} else if (
  !MONGODB_URI.startsWith("mongodb://") &&
  !MONGODB_URI.startsWith("mongodb+srv://")
) {
  console.error("❌ Invalid MongoDB connection string format:", MONGODB_URI);
}

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));
// ----------------------------------------------------------------

app.get("/health", (req, res) =>
  res.json({ ok: true, backend: true, time: new Date().toISOString() })
);

app.use("/api/tx", txsRouter);
app.use("/api/posts", postsRouter);

// ---------------------- SOCKET.IO ----------------------
io.on("connection", (socket) => {
  console.log("🔌 Socket connected:", socket.id);

  socket.on("join_live_chat", async ({ username }) => {
    username =
      username && username.trim().length > 1
        ? username.trim()
        : "anon_" + socket.id.slice(0, 6);

    socket.data.username = username;
    socket.join("live_chat");

    const recent = await ChatMessage.find()
      .sort({ createdAt: -1 })
      .limit(200);

    socket.emit("chat_history", recent.reverse());
  });

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

    const m = await ChatMessage.create({
      username: socket.data.username,
      message: clean,
      createdAt: new Date(),
    });

    io.to("live_chat").emit("new_chat_message", m);
  });

  socket.on("disconnect", () =>
    console.log("❌ Socket disconnected:", socket.id)
  );
});
// --------------------------------------------------------

// Start hybrid mempool client and forward txs to all clients
HybridTxClient.start((tx) => {
  io.emit("tx", tx);
});

// ---------------------- START SERVER ----------------------
server.listen(BACKEND_PORT, () =>
  console.log(`🚀 Backend running on port ${BACKEND_PORT}`)
);




