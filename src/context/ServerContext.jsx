import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';
import { soundFx } from '../utils/soundEffects';
import { getServerUrl } from '../utils/apiConfig';

const ServerContext = createContext();

export const ServerProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const { socket } = useSocket();

  const [servers, setServers] = useState([]);
  const [activeServerId, setActiveServerId] = useState(null); // 'home' for DMs, or serverId
  const [activeChannelId, setActiveChannelId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [activeDMUser, setActiveDMUser] = useState(null);
  const [typingUsers, setTypingUsers] = useState({}); // channelId -> Array of usernames

  // Fetch initial servers & data
  const fetchServers = async () => {
    try {
      const baseUrl = getServerUrl();
      const res = await fetch(`${baseUrl}/api/initial`);
      const data = await res.json();
      setServers(data.servers || []);

      if (data.servers && data.servers.length > 0) {
        const savedServerId = localStorage.getItem('panda_active_server_id');
        const savedChannelId = localStorage.getItem('panda_active_channel_id');

        const foundServer = data.servers.find(s => s.id === savedServerId) || data.servers[0];
        setActiveServerId(prev => prev || savedServerId || foundServer.id);

        const allChannels = foundServer.categories?.flatMap(c => c.channels) || [];
        const foundChannel = allChannels.find(ch => ch.id === savedChannelId) || allChannels[0];
        if (foundChannel) {
          setActiveChannelId(prev => prev || savedChannelId || foundChannel.id);
        }
      }
    } catch (err) {
      console.error('Error fetching servers:', err);
    }
  };

  useEffect(() => {
    fetchServers();
  }, []);

  useEffect(() => {
    if (activeServerId) localStorage.setItem('panda_active_server_id', activeServerId);
  }, [activeServerId]);

  useEffect(() => {
    if (activeChannelId) localStorage.setItem('panda_active_channel_id', activeChannelId);
  }, [activeChannelId]);

  // Fetch messages when active channel changes
  const fetchMessages = useCallback(async (channelId) => {
    if (!channelId) return;
    try {
      const baseUrl = getServerUrl();
      const res = await fetch(`${baseUrl}/api/channels/${channelId}/messages`);
      const data = await res.json();
      setMessages(data);
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  }, []);

  // Fetch DM messages when active DM user changes
  const fetchDMMessages = useCallback(async (userA, userB) => {
    if (!userA || !userB) return;
    try {
      const baseUrl = getServerUrl();
      const res = await fetch(`${baseUrl}/api/dms/${userA}/${userB}`);
      const data = await res.json();
      setMessages(data);
    } catch (err) {
      console.error('Error fetching DM messages:', err);
    }
  }, []);

  useEffect(() => {
    if (activeServerId === 'home') {
      if (activeDMUser && currentUser) {
        fetchDMMessages(currentUser.id, activeDMUser.id);
      }
    } else if (activeChannelId) {
      fetchMessages(activeChannelId);
    }
  }, [activeServerId, activeChannelId, activeDMUser, currentUser, fetchMessages, fetchDMMessages]);

  // Socket listeners for real-time messages & server/channel updates
  useEffect(() => {
    if (!socket) return;

    if (activeChannelId) {
      socket.emit('join-room', activeChannelId);
    }

    const handleNewMessage = (msg) => {
      if (msg.channelId === activeChannelId) {
        setMessages(prev => [...prev, msg]);
        if (currentUser && msg.authorId !== currentUser.id) {
          soundFx.playMessagePing();
        }
      }
    };

    const handleMessageUpdated = (msg) => {
      if (msg.channelId === activeChannelId) {
        setMessages(prev => prev.map(m => m.id === msg.id ? msg : m));
      }
    };

    const handleMessageDeleted = ({ channelId, messageId }) => {
      if (channelId === activeChannelId) {
        setMessages(prev => prev.filter(m => m.id !== messageId));
      }
    };

    const handleUserTyping = ({ channelId, userId, username }) => {
      setTypingUsers(prev => {
        const list = prev[channelId] || [];
        if (!list.includes(username)) {
          return { ...prev, [channelId]: [...list, username] };
        }
        return prev;
      });

      // Clear typing after 3 seconds
      setTimeout(() => {
        setTypingUsers(prev => {
          const list = prev[channelId] || [];
          return { ...prev, [channelId]: list.filter(u => u !== username) };
        });
      }, 3000);
    };

    const handleServerCreated = (newServer) => {
      setServers(prev => [...prev, newServer]);
    };

    const handleChannelCreated = ({ serverId, categoryId, channel }) => {
      setServers(prev => prev.map(s => {
        if (s.id === serverId) {
          const updatedCategories = s.categories.map(c => {
            if (c.id === categoryId) {
              return { ...c, channels: [...c.channels, channel] };
            }
            return c;
          });
          return { ...s, categories: updatedCategories };
        }
        return s;
      }));
    };

    socket.on('new-message', handleNewMessage);
    socket.on('message-updated', handleMessageUpdated);
    socket.on('message-deleted', handleMessageDeleted);
    socket.on('user-typing', handleUserTyping);
    socket.on('server-created', handleServerCreated);
    socket.on('channel-created', handleChannelCreated);

    return () => {
      if (activeChannelId) {
        socket.emit('leave-room', activeChannelId);
      }
      socket.off('new-message', handleNewMessage);
      socket.off('message-updated', handleMessageUpdated);
      socket.off('message-deleted', handleMessageDeleted);
      socket.off('user-typing', handleUserTyping);
      socket.off('server-created', handleServerCreated);
      socket.off('channel-created', handleChannelCreated);
    };
  }, [socket, activeChannelId, currentUser]);

  // Actions
  const sendMessage = (content, attachment = null, replyTo = null) => {
    if (!socket || !currentUser) return;
    if (activeServerId === 'home' && activeDMUser) {
      socket.emit('send-dm', {
        senderId: currentUser.id,
        receiverId: activeDMUser.id,
        content,
        attachment
      });
    } else if (activeChannelId) {
      socket.emit('send-message', {
        channelId: activeChannelId,
        authorId: currentUser.id,
        content,
        attachment,
        replyTo
      });
    }
  };

  const editMessage = (messageId, content) => {
    if (!socket || !activeChannelId) return;
    socket.emit('edit-message', { channelId: activeChannelId, messageId, content });
  };

  const deleteMessage = (messageId) => {
    if (!socket || !activeChannelId) return;
    socket.emit('delete-message', { channelId: activeChannelId, messageId });
  };

  const toggleReaction = (messageId, emoji) => {
    if (!socket || !activeChannelId || !currentUser) return;
    socket.emit('toggle-reaction', {
      channelId: activeChannelId,
      messageId,
      emoji,
      userId: currentUser.id
    });
  };

  const sendTyping = () => {
    if (!socket || !activeChannelId || !currentUser) return;
    socket.emit('typing', {
      channelId: activeChannelId,
      userId: currentUser.id,
      username: currentUser.displayName || currentUser.username
    });
  };

  const createServer = async (name, icon, description) => {
    try {
      const baseUrl = getServerUrl();
      const res = await fetch(`${baseUrl}/api/servers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, icon, description, ownerId: currentUser.id })
      });
      const newServer = await res.json();
      setActiveServerId(newServer.id);
      if (newServer.categories[0]?.channels[0]) {
        setActiveChannelId(newServer.categories[0].channels[0].id);
      }
      return newServer;
    } catch (err) {
      console.error('Failed to create server:', err);
    }
  };

  const joinServerByInvite = async (inviteCode) => {
    try {
      const baseUrl = getServerUrl();
      const res = await fetch(`${baseUrl}/api/servers/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteCode })
      });
      if (res.ok) {
        const server = await res.json();
        setActiveServerId(server.id);
        if (server.categories[0]?.channels[0]) {
          setActiveChannelId(server.categories[0].channels[0].id);
        }
        return { success: true, server };
      } else {
        const error = await res.json();
        return { success: false, error: error.error };
      }
    } catch (err) {
      return { success: false, error: 'Connection error' };
    }
  };

  const createChannel = async (serverId, categoryId, name, type = 'text', topic = '') => {
    try {
      const baseUrl = getServerUrl();
      const res = await fetch(`${baseUrl}/api/channels`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serverId, categoryId, channelData: { name, type, topic } })
      });
      const channel = await res.json();
      setActiveChannelId(channel.id);
      return channel;
    } catch (err) {
      console.error('Failed to create channel:', err);
    }
  };

  const activeServer = servers.find(s => s.id === activeServerId);
  const activeChannel = activeServer?.categories?.flatMap(c => c.channels).find(ch => ch.id === activeChannelId);

  return (
    <ServerContext.Provider value={{
      servers,
      activeServerId,
      setActiveServerId,
      activeChannelId,
      setActiveChannelId,
      activeServer,
      activeChannel,
      messages,
      sendMessage,
      editMessage,
      deleteMessage,
      toggleReaction,
      sendTyping,
      typingUsers: typingUsers[activeChannelId] || [],
      createServer,
      joinServerByInvite,
      createChannel,
      activeDMUser,
      setActiveDMUser
    }}>
      {children}
    </ServerContext.Provider>
  );
};

export const useServer = () => useContext(ServerContext);
