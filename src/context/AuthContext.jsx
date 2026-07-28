import React, { createContext, useContext, useState, useEffect } from 'react';
import { getServerUrl } from '../utils/apiConfig';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInitialData = async () => {
    try {
      const baseUrl = getServerUrl();
      const res = await fetch(`${baseUrl}/api/initial`);
      const data = await res.json();
      setAllUsers(data.users || []);
      
      // Default to first user (Alex Host) if no user selected
      const savedUserId = localStorage.getItem('harmony_user_id');
      const found = data.users.find(u => u.id === savedUserId);
      if (found) {
        setCurrentUser(found);
      } else if (data.users && data.users.length > 0) {
        setCurrentUser(data.users[0]);
        localStorage.setItem('harmony_user_id', data.users[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch initial users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const switchUser = (user) => {
    setCurrentUser(user);
    localStorage.setItem('harmony_user_id', user.id);
  };

  const updateUserProfile = async (updates) => {
    if (!currentUser) return;
    try {
      const baseUrl = getServerUrl();
      const res = await fetch(`${baseUrl}/api/users/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, updates })
      });
      if (res.ok) {
        const updated = await res.json();
        setCurrentUser(updated);
        setAllUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
      }
    } catch (err) {
      console.error('Error updating profile:', err);
    }
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      allUsers,
      setAllUsers,
      switchUser,
      updateUserProfile,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
