require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const HybridTxClient = require('./services/HybridTxClient');
const ChatMessage = require('./models/ChatMessage');

const txsRouter = require('./routes/txs');
const postsRouter = require('./routes/posts');

const app = express();
const server = http.createServer(app);

// IMPORTANT: Allow production domains
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// MongoDB
const MONGODB_URI = process.env.MONGODB_URI;
mongoose.set('strictQuery', false);

mongoose.connect(MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB error:", err));

// Health check required by Railway
app.get("/health", (_, res) => res.json({ ok: true }));

// API routes
app.use("/api/tx", txsRouter);
app.use("/api/posts", postsRouter);

// Sockets
io.on("connection", (socket) => {
  console.log("client connected:", socket.id);

  socket.on("join_live_chat", async ({ username }) => {
    if (!username || username.length < 2) {
      username = "anon_" + socket.id.slice(0, 6);
    }

    socket.data.username = username;
    socket.join("live_chat");

    const recent = await ChatMessage.find()
      .sort({ createdAt: -1 })
      .limit(200);

    socket.emit("chat_history", recent.reverse());
  });

  socket.on("live_chat_message", async ({ message }) => {
    if (!socket.data.username) return;

    const cleanMsg = String(message).slice(0, 500);

    const m = await ChatMessage.create({
      username: socket.data.username,
      message: cleanMsg,
      createdAt: new Date()
    });

    io.to("live_chat").emit("new_chat_message", m);
  });

  socket.on("disconnect", () =>
    console.log("client disconnected:", socket.id)
  );
});

// Hybrid client
HybridTxClient.start((tx) => {
  io.emit("tx", tx);
});

// IMPORTANT: Railway must control the port
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log("Backend running on port", PORT);
});

