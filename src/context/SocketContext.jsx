import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { getServerUrl } from '../utils/apiConfig';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { currentUser, setAllUsers } = useAuth();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const serverUrl = getServerUrl();
    const newSocket = io(serverUrl, {
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('Connected to Harmony Socket server:', newSocket.id);
      setConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from Harmony Socket server');
      setConnected(false);
    });

    newSocket.on('user-status-changed', ({ userId, status }) => {
      setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, status } : u));
    });

    newSocket.on('user-updated', (updatedUser) => {
      setAllUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    if (socket && currentUser) {
      socket.emit('register-user', { userId: currentUser.id });
    }
  }, [socket, currentUser]);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
