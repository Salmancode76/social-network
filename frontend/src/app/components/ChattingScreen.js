import React, { useState, useEffect } from 'react';
import { socket } from "../utils/ws";
import { FetchUserIDbySession } from '../utils/FetchUserIDbySession';
import './ChattingScreen.css';
import { useWebSocket } from "../contexts/WebSocketContext";


// Helper function to format date
const formatTimestamp = (dateString) => {
  if (!dateString) return ''; // Handle cases where dateString might be undefined or null
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

function ChattingScreen({ userName, onClose, chatHistory: initialChatHistory }) {
  const [messageText, setMessageText] = useState("");
  const [currentChatHistory, setCurrentChatHistory] = useState(initialChatHistory);
    const { socket } = useWebSocket();
  

  useEffect(() => {
    setCurrentChatHistory(initialChatHistory);
  }, [initialChatHistory]);

  useEffect(() => {
    const handleNewMessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "new" && (message.from === userName || message.to === userName)) {
        // Ensure the received message has a createdat, or add one if missing (e.g., from server)
        const formattedMessage = {
          ...message,
          createdat: message.createdat ? formatTimestamp(message.createdat) : formatTimestamp(new Date().toISOString()),
        };
        setCurrentChatHistory((prevHistory) => [...prevHistory, formattedMessage]);
      }
    };

    socket.addEventListener("message", handleNewMessage);

    return () => {
      socket.removeEventListener("message", handleNewMessage);
    };
  }, [userName]);

  const handleSend = async () => {
    if (!messageText.trim()) return;

    const data = await FetchUserIDbySession();
    const userID = data.UserID;
    const now = new Date().toISOString(); // Get current time in ISO format
    const formattedNow = formatTimestamp(now); // Format for display

    const payload = {
      type: "new_message",
      from: userID,
      to: userName,
      text: messageText,
      createdat: formattedNow, // Send formatted time
    };

    socket.send(JSON.stringify(payload));

    // Optimistically add the sent message to the chat history with formatted time
    setCurrentChatHistory((prevHistory) => [...prevHistory, { ...payload, from: userID, createdat: formattedNow }]);
    setMessageText("");
  };

  return (
    <div className="chatting-screen-overlay">
      <div className="chatting-screen-content">
        <div className="chatting-screen-header">
          <h2>Chatting with {userName}</h2>
          <button onClick={onClose} className="close-button">X</button>
        </div>

        <div className="chatting-screen-body">
          {currentChatHistory && currentChatHistory.length > 0 ? (
            currentChatHistory.map((msg, index) => (
              <div
                key={index}
                className={`chat-message ${msg.from === userName ? 'received' : 'sent'}`}
              >
                <div className="message-meta">
                  {/* Display formatted timestamp */}
                  <small>{msg.createdat}</small>
                </div>
                <div className="message-text">{msg.text}</div>
              </div>
            ))
          ) : (
            <p>No chat history found with {userName}.</p>
          )}
        </div>

        <div className="chatting-screen-footer">
          <input
            type="text"
            placeholder="Type a message..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
          />
          <button onClick={handleSend}>Send</button>
        </div>
      </div>
    </div>
  );
}

export default ChattingScreen;