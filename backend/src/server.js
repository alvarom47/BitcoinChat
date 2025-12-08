require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");

// --- SERVICES & MODELS ---
const HybridTxClient = require("./services/HybridTxClient");
const ChatMessage = require("./models/ChatMessage");

// --- ROUTES ---
const txsRouter = require("./routes/txs");
const postsRouter = require("./routes/posts");

// --- EXPRESS APP ---
const app = express();
app.use(cors());
app.use(bodyParser.json());

// --- HTTP & SOCKET.IO SERVER ---
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

// --- DATABASE ---
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/bitcoin_live";

mongoose.set("strictQuery", false);
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB error:", err));

// --- HEALTHCHECK ---
app.get("/health", (_, res) =>
  res.json({ ok: true, time: new Date().toISOString() })
);

// --- API ROUTES ---
app.use("/api/tx", txsRouter);
app.use("/api/posts", postsRouter);

// --- SOCKET.IO EVENTS ---
io.on("connection", (socket) => {
  console.log("socket connected:", socket.id);

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

  socket.on("disconnect", () =>
    console.log("socket disconnected:", socket.id)
  );
});

// --- HYBRID CLIENT: TX BROADCAST ---
HybridTxClient.start((tx) => {
  io.emit("tx", tx);
});

// --- FRONTEND BUILD SERVING (IMPORTANT FOR RAILWAY) ---
const distPath = path.join(__dirname, "..", "..", "frontend", "dist");
app.use(express.static(distPath));

app.get("*", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

// --- START SERVER ---
const PORT = process.env.PORT || 8080;

server.listen(PORT, () => {
  console.log("🚀 Backend + Frontend running on port", PORT);
});


