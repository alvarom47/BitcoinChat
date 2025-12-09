require("dotenv").config();
const express = require("express");
const http = require("http");
const path = require("path");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const { Server } = require("socket.io");

const ChatMessage = require("./models/ChatMessage");
const txsRouter = require("./routes/txs");
const postsRouter = require("./routes/posts");

const MempoolClient = require("./services/MempoolClient");

const app = express();
const server = http.createServer(app);

// Socket.IO
const io = new Server(server, {
  cors: { origin: "*" },
});

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// ------------------------------
// MongoDB
// ------------------------------
const MONGO = process.env.MONGO_URL;

console.log("🔌 Connecting to Mongo:", MONGO);

mongoose
  .connect(MONGO, { serverSelectionTimeoutMS: 30000 })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB ERROR:", err));

// ------------------------------
// API Routes
// ------------------------------
app.use("/api/tx", txsRouter);
app.use("/api/posts", postsRouter);

app.get("/health", (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

// ------------------------------
// Serve React frontend (public folder)
// ------------------------------
app.use(express.static(path.join(__dirname, "../../public")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../../public/index.html"));
});

// ------------------------------
// Socket.IO Events
// ------------------------------
io.on("connection", async (socket) => {
  console.log("🟢 Socket connected:", socket.id);

  socket.on("join_live_chat", async ({ username }) => {
    if (!username || username.trim().length < 2)
      username = "anon_" + socket.id.slice(0, 5);

    socket.data.username = username;
    socket.join("live_chat");

    const history = await ChatMessage.find()
      .sort({ createdAt: -1 })
      .limit(200);

    socket.emit("chat_history", history.reverse());
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

    const clean = String(message || "").slice(0, 800);

    const msg = await ChatMessage.create({
      username: socket.data.username,
      message: clean,
      createdAt: new Date(),
    });

    io.to("live_chat").emit("new_chat_message", msg);
  });

  socket.on("disconnect", () =>
    console.log("🔴 Socket disconnected:", socket.id)
  );
});

// ------------------------------
// Mempool live transactions
// ------------------------------
MempoolClient.start((tx) => {
  io.emit("tx", tx);
});

// ------------------------------
// Start server
// ------------------------------
const PORT = process.env.PORT || 8080;

server.listen(PORT, "0.0.0.0", () => {
  console.log("🚀 Backend running on port", PORT);
});





