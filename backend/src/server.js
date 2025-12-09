require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
const MempoolClient = require("./services/MempoolClient");
const ChatMessage = require("./models/ChatMessage");

const txsRouter = require("./routes/txs");
const postsRouter = require("./routes/posts");

const app = express();
const server = http.createServer(app);

// socket.io backend
const io = new Server(server, {
  cors: { origin: "*" },
});

app.use(cors());
app.use(express.json());

// MongoDB
const MONGO = process.env.MONGO_URL;
mongoose
  .connect(MONGO)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((e) => console.error("❌ MongoDB error:", e));

// API
app.get("/health", (_, res) => res.json({ ok: true }));

app.use("/api/tx", txsRouter);
app.use("/api/posts", postsRouter);

// SOCKET.IO Chat + TX
io.on("connection", (socket) => {
  console.log("🔥 socket connected:", socket.id);

  socket.on("join_live_chat", async ({ username }) => {
    username = username || "anon_" + socket.id.slice(0, 5);
    socket.data.username = username;
    socket.join("live_chat");

    const messages = await ChatMessage.find().sort({ createdAt: -1 }).limit(50);
    socket.emit("chat_history", messages.reverse());
  });

  socket.on("live_chat_message", async ({ message }) => {
    if (!socket.data.username) return;

    const msg = await ChatMessage.create({
      username: socket.data.username,
      message,
      createdAt: new Date(),
    });

    io.to("live_chat").emit("new_chat_message", msg);
  });
});

// Start mempool live feed
new MempoolClient((tx) => {
  io.emit("tx", tx);
}).start();

const PORT = process.env.PORT || 3001;
server.listen(PORT, () =>
  console.log(`🚀 Backend running on port ${PORT}`)
);






