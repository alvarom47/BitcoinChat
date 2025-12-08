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

const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(bodyParser.json());

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bitcoin_live';
mongoose.set('strictQuery', false);
mongoose.connect(MONGODB_URI).then(()=>console.log('MongoDB connected')).catch(e=>console.error('MongoDB error', e));

app.get('/health', (_, res) => res.json({ ok: true, time: new Date().toISOString() }));

app.use('/api/tx', txsRouter);
app.use('/api/posts', postsRouter);

// Socket.IO: live chat + transactions
io.on('connection', (socket) => {
  console.log('socket connected', socket.id);

  socket.on('join_live_chat', async ({ username }) => {
    if (!username || username.trim().length < 2) username = 'anon_' + socket.id.slice(0,6);
    socket.data.username = username;
    socket.join('live_chat');
    const recent = await ChatMessage.find().sort({ createdAt: -1 }).limit(200);
    socket.emit('chat_history', recent.reverse());
  });

  socket.on('live_chat_message', async ({ message }) => {
    if (!socket.data.username) return;
    const now = Date.now();
    socket.lastMsgAt = socket.lastMsgAt || 0;
    if (now - socket.lastMsgAt < 400) { socket.emit('rate_limited'); return; }
    socket.lastMsgAt = now;
    const sanitize = require('./utils/sanitize');
    const clean = sanitize(String(message || '').slice(0,800));
    const m = await ChatMessage.create({ username: socket.data.username, message: clean, createdAt: new Date() });
    io.to('live_chat').emit('new_chat_message', m);
  });

  socket.on('disconnect', () => console.log('socket disconnected', socket.id));
});

// Start hybrid tx client and broadcast txs to clients
HybridTxClient.start((tx) => {
  io.emit('tx', tx);
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log('Backend listening on', PORT));
