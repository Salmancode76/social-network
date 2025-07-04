'use client';
import { useState, useEffect, useRef } from 'react';
import './group.css';

export default function GroupChat({ group, onBack }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Get localStorage key for this group
  const getStorageKey = (groupId) => `group_messages_${groupId}`;

  // Load messages from localStorage
  const loadMessagesFromStorage = () => {
    try {
      const storageKey = getStorageKey(group.id);
      const savedMessages = localStorage.getItem(storageKey);
      if (savedMessages) {
        return JSON.parse(savedMessages);
      }
    } catch (error) {
      console.error("Error loading messages from storage:", error);
    }
    return [];
  };

  // Save messages to localStorage
  const saveMessagesToStorage = (messagesToSave) => {
    try {
      const storageKey = getStorageKey(group.id);
      localStorage.setItem(storageKey, JSON.stringify(messagesToSave));
    } catch (error) {
      console.error("Error saving messages to storage:", error);
    }
  };

  // Fetch messages for this group
  const fetchMessages = async () => {
    try {
      setLoading(true);
      
      // Load messages from localStorage first
      const savedMessages = loadMessagesFromStorage();
      setMessages(savedMessages);

      // TODO: Later, fetch from backend API and merge with local messages
      // const response = await fetch(`http://localhost:8080/api/group/${group.id}/messages`, {
      //   credentials: "include"
      // });
      // const data = await response.json();
      // const serverMessages = data.messages || [];
      // 
      // // Merge server messages with local messages (avoid duplicates)
      // const allMessages = [...serverMessages, ...savedMessages];
      // const uniqueMessages = allMessages.filter((msg, index, self) => 
      //   index === self.findIndex(m => m.id === msg.id)
      // );
      // setMessages(uniqueMessages);
      // saveMessagesToStorage(uniqueMessages);
      
    } catch (error) {
      console.error("Failed to fetch messages:", error);
      // Still load from localStorage even if API fails
      const savedMessages = loadMessagesFromStorage();
      setMessages(savedMessages);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [group.id]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const tempMessage = {
        id: Date.now(),
        user_name: "You",
        content: newMessage,
        created_at: new Date().toISOString(),
        group_id: group.id
      };
      
      // Update state
      const updatedMessages = [...messages, tempMessage];
      setMessages(updatedMessages);
      
      // Save to localStorage
      saveMessagesToStorage(updatedMessages);
      
      setNewMessage('');

      // TODO: Send to backend API
      // const response = await fetch(`http://localhost:8080/api/group/${group.id}/messages`, {
      //   method: "POST",
      //   credentials: "include",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify({ content: tempMessage.content }),
      // });

    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <div className="group-chat-container">
      {/* Header with back button and group info */}
      <div className="chat-header">
        <button className="back-button" onClick={onBack}>
          ← Back to Groups
        </button>
        <div className="group-info">
          <h2>{group.title}</h2>
          <p>{group.description}</p>
        </div>
      </div>
      <div>Chats</div>
      <div>Posts</div>
      <div>Events</div>

      {/* Messages area */}
      <div className="messages-container">
        {loading ? (
          <div className="loading-message">Loading messages...</div>
        ) : messages.length > 0 ? (
          <>
            {messages.map((message) => (
              <div key={message.id} className="message">
                <div className="message-header">
                  <span className="message-author">{message.user_name}</span>
                  <span className="message-time">
                    {new Date(message.created_at).toLocaleTimeString()}
                  </span>
                </div>
                <div className="message-content">{message.content}</div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        ) : (
          <div className="no-messages">
            No messages yet. Start the conversation!
          </div>
        )}
      </div>

      {/* Message input */}
      <form className="message-form" onSubmit={handleSendMessage}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="message-input"
        />
        <button type="submit" className="send-button">
          Send
        </button>
      </form>
    </div>
  );
}