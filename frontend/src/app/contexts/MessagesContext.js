'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const MessagesContext = createContext();

export function MessagesProvider({ children }) {
  const [groupMessages, setGroupMessages] = useState({});

  // Load messages from localStorage on mount
  useEffect(() => {
    try {
      const savedMessages = localStorage.getItem('all_group_messages');
      if (savedMessages) {
        setGroupMessages(JSON.parse(savedMessages));
      }
    } catch (error) {
      console.error("Error loading messages from storage:", error);
    }
  }, []);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('all_group_messages', JSON.stringify(groupMessages));
    } catch (error) {
      console.error("Error saving messages to storage:", error);
    }
  }, [groupMessages]);

  const addMessage = (groupId, message) => {
    setGroupMessages(prev => ({
      ...prev,
      [groupId]: [...(prev[groupId] || []), message]
    }));
  };

  const getMessages = (groupId) => {
    return groupMessages[groupId] || [];
  };

  const setMessages = (groupId, messages) => {
    setGroupMessages(prev => ({
      ...prev,
      [groupId]: messages
    }));
  };

  return (
    <MessagesContext.Provider value={{
      addMessage,
      getMessages,
      setMessages
    }}>
      {children}
    </MessagesContext.Provider>
  );
}

export const useMessages = () => {
  const context = useContext(MessagesContext);
  if (!context) {
    throw new Error('useMessages must be used within a MessagesProvider');
  }
  return context;
};