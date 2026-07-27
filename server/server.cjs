const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const storage = require('./storage.cjs');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Ensure uploads folder
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
app.use('/uploads', express.static(UPLOADS_DIR));

// Serve compiled frontend dist bundle
const DIST_DIR = path.join(__dirname, '..', 'dist');
if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
}

// Multer Storage config
const uploadStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9) + ext;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: uploadStorage,
  limits: { fileSize: 25 * 1024 * 1024 }
});

// REST API Endpoints
app.get('/api/initial', (req, res) => {
  res.json({
    users: storage.getUsers(),
    servers: storage.getServers(),
    friends: storage.data.friends
  });
});

app.get('/api/channels/:channelId/messages', (req, res) => {
  const { channelId } = req.params;
  res.json(storage.getChannelMessages(channelId));
});

app.get('/api/dms/:userA/:userB', (req, res) => {
  const { userA, userB } = req.params;
  res.json(storage.getDirectMessages(userA, userB));
});

app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const fileUrl = `http://localhost:${PORT}/uploads/${req.file.filename}`;
  res.json({
    url: fileUrl,
    filename: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size
  });
});

app.post('/api/users/profile', (req, res) => {
  const { userId, updates } = req.body;
  const updatedUser = storage.updateUser(userId, updates);
  if (updatedUser) {
    io.emit('user-updated', updatedUser);
    res.json(updatedUser);
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

app.post('/api/servers', (req, res) => {
  const serverData = req.body;
  const newServer = storage.createServer(serverData);
  io.emit('server-created', newServer);
  res.json(newServer);
});

app.post('/api/servers/join', (req, res) => {
  const { inviteCode } = req.body;
  const server = storage.getServers().find(s => s.inviteCode.toUpperCase() === inviteCode.trim().toUpperCase());
  if (server) {
    res.json(server);
  } else {
    res.status(404).json({ error: 'Invalid invite code' });
  }
});

app.post('/api/channels', (req, res) => {
  const { serverId, categoryId, channelData } = req.body;
  const newChannel = storage.createChannel(serverId, categoryId, channelData);
  if (newChannel) {
    io.emit('channel-created', { serverId, categoryId, channel: newChannel });
    res.json(newChannel);
  } else {
    res.status(400).json({ error: 'Failed to create channel' });
  }
});

// Active Voice Rooms tracking
const voiceRooms = new Map();
const connectedSockets = new Map();

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on('register-user', ({ userId }) => {
    connectedSockets.set(socket.id, userId);
    socket.userId = userId;
    const user = storage.getUserById(userId);
    if (user) {
      storage.updateUser(userId, { status: 'online' });
      io.emit('user-status-changed', { userId, status: 'online' });
    }
  });

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
  });

  socket.on('leave-room', (roomId) => {
    socket.leave(roomId);
  });

  // Messages
  socket.on('send-message', ({ channelId, content, authorId, attachment, replyTo }) => {
    const message = storage.addMessage(channelId, {
      authorId,
      content,
      attachment,
      replyTo
    });
    io.to(channelId).emit('new-message', message);
  });

  socket.on('edit-message', ({ channelId, messageId, content }) => {
    const updated = storage.updateMessage(channelId, messageId, { content });
    if (updated) {
      io.to(channelId).emit('message-updated', updated);
    }
  });

  socket.on('delete-message', ({ channelId, messageId }) => {
    const success = storage.deleteMessage(channelId, messageId);
    if (success) {
      io.to(channelId).emit('message-deleted', { channelId, messageId });
    }
  });

  socket.on('toggle-reaction', ({ channelId, messageId, emoji, userId }) => {
    const updated = storage.toggleReaction(channelId, messageId, emoji, userId);
    if (updated) {
      io.to(channelId).emit('message-updated', updated);
    }
  });

  socket.on('typing', ({ channelId, userId, username }) => {
    socket.to(channelId).emit('user-typing', { channelId, userId, username });
  });

  // DMs
  socket.on('send-dm', ({ senderId, receiverId, content, attachment }) => {
    const message = storage.addDirectMessage(senderId, receiverId, content, attachment);
    const dmKey = storage.getDMKey(senderId, receiverId);
    io.emit(`dm-message-${dmKey}`, message);
  });

  // WebRTC Voice & Video Signaling Engine
  socket.on('voice-join', ({ voiceChannelId, user, isMuted, isDeafened, isCamOn, isScreenSharing }) => {
    socket.join(voiceChannelId);
    socket.currentVoiceChannel = voiceChannelId;

    if (!voiceRooms.has(voiceChannelId)) {
      voiceRooms.set(voiceChannelId, new Map());
    }

    const roomMembers = voiceRooms.get(voiceChannelId);
    const memberData = {
      socketId: socket.id,
      userId: user.id,
      user,
      isMuted: !!isMuted,
      isDeafened: !!isDeafened,
      isCamOn: !!isCamOn,
      isScreenSharing: !!isScreenSharing
    };

    roomMembers.set(socket.id, memberData);

    const existingPeers = Array.from(roomMembers.values()).filter(m => m.socketId !== socket.id);

    socket.emit('voice-room-users', {
      channelId: voiceChannelId,
      peers: existingPeers
    });

    socket.to(voiceChannelId).emit('voice-peer-joined', memberData);

    io.emit('voice-channel-update', {
      channelId: voiceChannelId,
      members: Array.from(roomMembers.values())
    });
  });

  socket.on('voice-state-update', ({ voiceChannelId, isMuted, isDeafened, isCamOn, isScreenSharing }) => {
    if (voiceRooms.has(voiceChannelId)) {
      const room = voiceRooms.get(voiceChannelId);
      if (room.has(socket.id)) {
        const member = room.get(socket.id);
        member.isMuted = isMuted !== undefined ? isMuted : member.isMuted;
        member.isDeafened = isDeafened !== undefined ? isDeafened : member.isDeafened;
        member.isCamOn = isCamOn !== undefined ? isCamOn : member.isCamOn;
        member.isScreenSharing = isScreenSharing !== undefined ? isScreenSharing : member.isScreenSharing;

        io.to(voiceChannelId).emit('voice-peer-state-changed', {
          socketId: socket.id,
          userId: member.userId,
          isMuted: member.isMuted,
          isDeafened: member.isDeafened,
          isCamOn: member.isCamOn,
          isScreenSharing: member.isScreenSharing
        });

        io.emit('voice-channel-update', {
          channelId: voiceChannelId,
          members: Array.from(room.values())
        });
      }
    }
  });

  socket.on('webrtc-offer', ({ targetSocketId, offer }) => {
    io.to(targetSocketId).emit('webrtc-offer', {
      senderSocketId: socket.id,
      offer
    });
  });

  socket.on('webrtc-answer', ({ targetSocketId, answer }) => {
    io.to(targetSocketId).emit('webrtc-answer', {
      senderSocketId: socket.id,
      answer
    });
  });

  socket.on('webrtc-candidate', ({ targetSocketId, candidate }) => {
    io.to(targetSocketId).emit('webrtc-candidate', {
      senderSocketId: socket.id,
      candidate
    });
  });

  const leaveVoice = () => {
    const channelId = socket.currentVoiceChannel;
    if (channelId && voiceRooms.has(channelId)) {
      const room = voiceRooms.get(channelId);
      room.delete(socket.id);
      socket.leave(channelId);

      socket.to(channelId).emit('voice-peer-left', { socketId: socket.id });

      io.emit('voice-channel-update', {
        channelId,
        members: Array.from(room.values())
      });

      if (room.size === 0) {
        voiceRooms.delete(channelId);
      }
      socket.currentVoiceChannel = null;
    }
  };

  socket.on('voice-leave', leaveVoice);

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
    leaveVoice();
    const userId = connectedSockets.get(socket.id);
    if (userId) {
      connectedSockets.delete(socket.id);
      const hasOtherSockets = Array.from(connectedSockets.values()).includes(userId);
      if (!hasOtherSockets) {
        storage.updateUser(userId, { status: 'offline' });
        io.emit('user-status-changed', { userId, status: 'offline' });
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`⚡ Harmony Backend Server listening on http://localhost:${PORT}`);
});
