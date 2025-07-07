import React, { useState } from 'react';
import { FetchUserIDbySession } from '../utils/FetchUserIDbySession';
import ChattingScreen from './ChattingScreen';

export default function ChatUser({ user }) {
  const [showChattingScreen, setShowChattingScreen] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const WS_URL = 'ws://localhost:8080/ws';

  const handleUserClick = () => {
    sendWebSocketMessage(user);
    setShowChattingScreen(true);
  };

  const handleCloseChattingScreen = () => {
    setShowChattingScreen(false);
    setChatHistory([]); // Optional: clear chat when closing
  };

  const sendWebSocketMessage = (targetUser) => {
    if (!('WebSocket' in window)) {
      console.error('WebSockets are not supported by your browser.');
      return;
    }

    const ws = new WebSocket(WS_URL);

    ws.onopen = async () => {
      const data = await FetchUserIDbySession();
      const userID = data.UserID;
      console.log('WebSocket connected! User ID:', userID);

      const message = {
        type: 'get_chat_history',
        to: targetUser,
        from: userID,
      };

      ws.send(JSON.stringify(message));
      console.log('JSON WebSocket message sent:', message);
    };

    ws.onmessage = (event) => {
      console.log('WebSocket message received:', event.data);
      const data = JSON.parse(event.data);

      if (data.type === 'oldmessages' && Array.isArray(data.chathistory)) {
        setChatHistory(data.chathistory);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = (event) => {
      console.log('WebSocket closed:', event.code, event.reason);
    };
  };

  return (
    <>
      <div className="chat-user" onClick={handleUserClick}>
        <div className="chat-user-info">
          <strong>{user}</strong>
        </div>
      </div>

      {showChattingScreen && (
        <ChattingScreen
          userName={user}
          onClose={handleCloseChattingScreen}
          chatHistory={chatHistory}
        />
      )}
    </>
  );
}
