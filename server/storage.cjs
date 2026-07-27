const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

const INITIAL_DATA = {
  users: [
    {
      id: 'usr_owner',
      username: 'Alex_Dev',
      displayName: 'Alex (Host)',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      status: 'online',
      customStatus: '🚀 Hosting Harmony Server locally',
      bannerColor: '#5865F2',
      roles: ['Admin', 'Developer'],
      createdAt: new Date().toISOString()
    },
    {
      id: 'usr_synth',
      username: 'SynthBot',
      displayName: 'Synth Bot 🤖',
      avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
      status: 'online',
      customStatus: '⚡ Automated Local Assistant',
      bannerColor: '#EB459E',
      isBot: true,
      roles: ['Bot', 'System'],
      createdAt: new Date().toISOString()
    },
    {
      id: 'usr_elena',
      username: 'Elena_Design',
      displayName: 'Elena Design',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      status: 'idle',
      customStatus: '🎨 Working on dark glassmorphism UI',
      bannerColor: '#57F287',
      roles: ['Designer'],
      createdAt: new Date().toISOString()
    },
    {
      id: 'usr_marcus',
      username: 'Marcus_Gamer',
      displayName: 'Marcus G.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      status: 'dnd',
      customStatus: '🎮 In Voice Lounge (Do Not Disturb)',
      bannerColor: '#FEE75C',
      roles: ['Gamer'],
      createdAt: new Date().toISOString()
    }
  ],
  servers: [
    {
      id: 'srv_harmony',
      name: 'Harmony HQ',
      icon: '⚡',
      iconBg: 'linear-gradient(135deg, #5865F2 0%, #7289DA 100%)',
      description: 'The official local self-hosted hub for chat, voice, and video.',
      ownerId: 'usr_owner',
      inviteCode: 'HARMONY-LOCAL-2026',
      categories: [
        {
          id: 'cat_welcome',
          name: 'WELCOME & INFO',
          channels: [
            { id: 'chn_announcements', name: 'announcements', type: 'text', topic: 'Official updates & local hosting announcements' },
            { id: 'chn_rules', name: 'rules-and-faq', type: 'text', topic: 'Local server guidelines & quick commands' }
          ]
        },
        {
          id: 'cat_text',
          name: 'TEXT CHANNELS',
          channels: [
            { id: 'chn_general', name: 'general', type: 'text', topic: 'General lounge for everyone!' },
            { id: 'chn_dev', name: 'dev-lounge', type: 'text', topic: 'WebRTC, Node.js & local hosting discussions' },
            { id: 'chn_media', name: 'media-and-screenshots', type: 'text', topic: 'Share images, code snippets, and designs' }
          ]
        },
        {
          id: 'cat_voice',
          name: 'VOICE & VIDEO ROOMS',
          channels: [
            { id: 'chn_voice_gen', name: 'General Voice', type: 'voice', userLimit: 0 },
            { id: 'chn_voice_gaming', name: 'Gaming Lounge 🎮', type: 'voice', userLimit: 10 },
            { id: 'chn_voice_stream', name: 'Screen Share 🎥', type: 'voice', userLimit: 5 }
          ]
        }
      ]
    },
    {
      id: 'srv_gaming',
      name: 'LAN Gaming Realm',
      icon: '🎮',
      iconBg: 'linear-gradient(135deg, #ED4245 0%, #E67E22 100%)',
      description: 'High performance local gaming server for voice & squad tactics.',
      ownerId: 'usr_marcus',
      inviteCode: 'GAMING-LAN-99',
      categories: [
        {
          id: 'cat_gaming_text',
          name: 'TEXT CHANNELS',
          channels: [
            { id: 'chn_squad_chat', name: 'squad-chat', type: 'text', topic: 'Coordinate matches and gaming sessions' }
          ]
        },
        {
          id: 'cat_gaming_voice',
          name: 'SQUAD VOICE',
          channels: [
            { id: 'chn_squad_voice_1', name: 'Squad Voice A', type: 'voice', userLimit: 5 },
            { id: 'chn_squad_voice_2', name: 'Squad Voice B', type: 'voice', userLimit: 5 }
          ]
        }
      ]
    }
  ],
  messages: {
    chn_announcements: [
      {
        id: 'msg_welcome_1',
        channelId: 'chn_announcements',
        authorId: 'usr_synth',
        content: '# 🚀 Welcome to Harmony!\nThis is your **self-hosted, ultra-fast Discord alternative** running locally on your machine or local network.\n\n### Key Features Enabled:\n- **Real-time Messaging** with rich Markdown & attachments\n- **WebRTC Voice & Video Channels** with high audio fidelity\n- **Screen Share** with zero cloud telemetry\n- **Direct Messages & Custom User Profiles**\n- 100% data privacy & local persistence!',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        reactions: { '🎉': ['usr_owner', 'usr_elena'], '🚀': ['usr_marcus'] },
        pinned: true
      }
    ],
    chn_general: [
      {
        id: 'msg_gen_1',
        channelId: 'chn_general',
        authorId: 'usr_owner',
        content: 'Hey everyone! Welcome to our local Harmony node. How is the audio quality on the local WebRTC voice channel?',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        reactions: { '👍': ['usr_elena', 'usr_marcus'] }
      },
      {
        id: 'msg_gen_2',
        channelId: 'chn_general',
        authorId: 'usr_elena',
        content: 'The voice quality is crystal clear! Also loving the dark glassmorphism aesthetic. Feels just like Discord but completely under our control. 🎨',
        timestamp: new Date(Date.now() - 1200000).toISOString(),
        reactions: { '🔥': ['usr_owner'] },
        replyTo: {
          id: 'msg_gen_1',
          authorName: 'Alex (Host)',
          content: 'Hey everyone! Welcome to our local Harmony node...'
        }
      },
      {
        id: 'msg_gen_3',
        channelId: 'chn_general',
        authorId: 'usr_marcus',
        content: 'I created a second server for LAN Gaming! Anyone up for testing screen share in the Screen Share voice channel?',
        timestamp: new Date(Date.now() - 600000).toISOString(),
        reactions: { '🎮': ['usr_owner', 'usr_synth'] }
      }
    ],
    chn_dev: [
      {
        id: 'msg_dev_1',
        channelId: 'chn_dev',
        authorId: 'usr_owner',
        content: '```javascript\n// WebRTC PeerConnection setup snippet\nconst peer = new RTCPeerConnection({\n  iceServers: [{ urls: "stun:stun.l.google.com:19302" }]\n});\nconsole.log("Connected locally via Socket.io signaling!");\n```',
        timestamp: new Date(Date.now() - 2400000).toISOString(),
        reactions: { '💻': ['usr_synth'] }
      }
    ]
  },
  directMessages: {
    'usr_owner_usr_elena': [
      {
        id: 'dm_1',
        senderId: 'usr_elena',
        receiverId: 'usr_owner',
        content: 'Hey Alex! Just sent over the new icon designs for the server categories.',
        timestamp: new Date(Date.now() - 500000).toISOString()
      }
    ]
  },
  friends: [
    { userId: 'usr_owner', friendId: 'usr_elena', status: 'accepted' },
    { userId: 'usr_owner', friendId: 'usr_marcus', status: 'accepted' },
    { userId: 'usr_owner', friendId: 'usr_synth', status: 'accepted' }
  ]
};

class Storage {
  constructor() {
    this.ensureDirectory();
    this.load();
  }

  ensureDirectory() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
        this.data.users = this.data.users || INITIAL_DATA.users;
        this.data.servers = this.data.servers || INITIAL_DATA.servers;
        this.data.messages = this.data.messages || INITIAL_DATA.messages;
        this.data.directMessages = this.data.directMessages || INITIAL_DATA.directMessages;
        this.data.friends = this.data.friends || INITIAL_DATA.friends;
      } else {
        this.data = JSON.parse(JSON.stringify(INITIAL_DATA));
        this.save();
      }
    } catch (err) {
      console.error('Error loading DB, resetting to defaults:', err);
      this.data = JSON.parse(JSON.stringify(INITIAL_DATA));
      this.save();
    }
  }

  save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving DB:', err);
    }
  }

  getUsers() { return this.data.users; }
  getUserById(id) { return this.data.users.find(u => u.id === id); }
  createUser(user) {
    const newUser = {
      id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      status: 'online',
      customStatus: '',
      bannerColor: '#5865F2',
      roles: ['Member'],
      createdAt: new Date().toISOString(),
      ...user
    };
    this.data.users.push(newUser);
    this.save();
    return newUser;
  }

  updateUser(id, updates) {
    const idx = this.data.users.findIndex(u => u.id === id);
    if (idx !== -1) {
      this.data.users[idx] = { ...this.data.users[idx], ...updates };
      this.save();
      return this.data.users[idx];
    }
    return null;
  }

  getServers() { return this.data.servers; }
  getServerById(id) { return this.data.servers.find(s => s.id === id); }
  createServer(serverData) {
    const newServer = {
      id: 'srv_' + Date.now(),
      icon: serverData.icon || '💬',
      iconBg: serverData.iconBg || 'linear-gradient(135deg, #5865F2 0%, #7289DA 100%)',
      description: serverData.description || 'A new local server.',
      inviteCode: (serverData.name.replace(/\s+/g, '-').toUpperCase() + '-' + Math.floor(1000 + Math.random() * 9000)),
      categories: [
        {
          id: 'cat_text_' + Date.now(),
          name: 'TEXT CHANNELS',
          channels: [
            { id: 'chn_gen_' + Date.now(), name: 'general', type: 'text', topic: 'Welcome to your new server!' }
          ]
        },
        {
          id: 'cat_voice_' + Date.now(),
          name: 'VOICE CHANNELS',
          channels: [
            { id: 'chn_voice_' + Date.now(), name: 'General Voice', type: 'voice', userLimit: 0 }
          ]
        }
      ],
      ...serverData
    };
    this.data.servers.push(newServer);
    this.save();
    return newServer;
  }

  createChannel(serverId, categoryId, channelData) {
    const server = this.getServerById(serverId);
    if (!server) return null;
    let category = server.categories.find(c => c.id === categoryId);
    if (!category) {
      category = server.categories[0];
    }
    const newChannel = {
      id: 'chn_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      name: channelData.name.toLowerCase().replace(/\s+/g, '-'),
      type: channelData.type || 'text',
      topic: channelData.topic || '',
      userLimit: channelData.userLimit || 0
    };
    category.channels.push(newChannel);
    this.save();
    return newChannel;
  }

  getChannelMessages(channelId) {
    return this.data.messages[channelId] || [];
  }

  addMessage(channelId, msg) {
    if (!this.data.messages[channelId]) {
      this.data.messages[channelId] = [];
    }
    const newMsg = {
      id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      channelId,
      timestamp: new Date().toISOString(),
      reactions: {},
      pinned: false,
      ...msg
    };
    this.data.messages[channelId].push(newMsg);
    this.save();
    return newMsg;
  }

  updateMessage(channelId, messageId, updates) {
    const msgs = this.data.messages[channelId];
    if (!msgs) return null;
    const idx = msgs.findIndex(m => m.id === messageId);
    if (idx !== -1) {
      msgs[idx] = { ...msgs[idx], ...updates, edited: true };
      this.save();
      return msgs[idx];
    }
    return null;
  }

  deleteMessage(channelId, messageId) {
    const msgs = this.data.messages[channelId];
    if (!msgs) return false;
    this.data.messages[channelId] = msgs.filter(m => m.id !== messageId);
    this.save();
    return true;
  }

  toggleReaction(channelId, messageId, emoji, userId) {
    const msgs = this.data.messages[channelId];
    if (!msgs) return null;
    const msg = msgs.find(m => m.id === messageId);
    if (!msg) return null;

    if (!msg.reactions) msg.reactions = {};
    if (!msg.reactions[emoji]) msg.reactions[emoji] = [];

    const userIdx = msg.reactions[emoji].indexOf(userId);
    if (userIdx > -1) {
      msg.reactions[emoji].splice(userIdx, 1);
      if (msg.reactions[emoji].length === 0) {
        delete msg.reactions[emoji];
      }
    } else {
      msg.reactions[emoji].push(userId);
    }
    this.save();
    return msg;
  }

  getDMKey(userA, userB) {
    return [userA, userB].sort().join('_');
  }

  getDirectMessages(userA, userB) {
    const key = this.getDMKey(userA, userB);
    return this.data.directMessages[key] || [];
  }

  addDirectMessage(senderId, receiverId, content, attachment = null) {
    const key = this.getDMKey(senderId, receiverId);
    if (!this.data.directMessages[key]) {
      this.data.directMessages[key] = [];
    }
    const newMsg = {
      id: 'dm_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      senderId,
      receiverId,
      content,
      attachment,
      timestamp: new Date().toISOString()
    };
    this.data.directMessages[key].push(newMsg);
    this.save();
    return newMsg;
  }
}

module.exports = new Storage();
