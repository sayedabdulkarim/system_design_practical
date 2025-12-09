require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const { createClient } = require('redis');

const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// ============ REDIS SETUP ============
// Publisher - messages bhejne ke liye
const pubClient = createClient();
// Subscriber - messages sunne ke liye
const subClient = createClient();

// Connect Redis
(async () => {
  await pubClient.connect();
  await subClient.connect();
  console.log(`[Server:${process.env.PORT}] Redis Connected`);

  // Subscribe to 'chat' channel
  await subClient.subscribe('chat', (message) => {
    // Jab Redis se message aaye, sab local users ko bhejo
    const data = JSON.parse(message);
    console.log(`[Server:${process.env.PORT}] Redis message received, broadcasting to local users`);
    io.emit('newMessage', data);
  });
})();

// ============ MIDDLEWARE ============
app.use(cors());
app.use(express.json());

// Log every request with port
app.use((req, res, next) => {
  console.log(`[Server:${process.env.PORT}] ${req.method} ${req.url}`);
  next();
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log('MongoDB Error:', err));

// Routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Basic route - shows which server is handling
app.get('/', (req, res) => {
  res.json({ message: 'Chat Server Running', port: process.env.PORT });
});

// Health check for load balancer
app.get('/health', (req, res) => {
  res.json({ status: 'ok', port: process.env.PORT });
});

// ============ SOCKET.IO ============
io.on('connection', (socket) => {
  console.log(`[Server:${process.env.PORT}] User connected:`, socket.id);

  // Join room
  socket.on('join', (userId) => {
    socket.userId = userId;
    console.log(`User ${userId} joined`);
  });

  // Handle message - PUBLISH TO REDIS
  socket.on('sendMessage', async (data) => {
    console.log(`[Server:${process.env.PORT}] Message received, publishing to Redis`);
    // Publish to Redis - sab servers ko milega
    await pubClient.publish('chat', JSON.stringify(data));
  });

  // Typing indicator
  socket.on('typing', (data) => {
    socket.broadcast.emit('userTyping', data);
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
