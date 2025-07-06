import React, { useState } from 'react';
import ChattingScreen from './ChattingScreen'; // Import the new component

export default function ChatUser({ user }) {
  const [showChattingScreen, setShowChattingScreen] = useState(false);
  const WS_URL = 'ws://localhost:8080/ws';
  const handleUserClick = () => {
    sendWebSocketMessage(user)
    setShowChattingScreen(true);
  };

  const handleCloseChattingScreen = () => {
    setShowChattingScreen(false);
  };


  const sendWebSocketMessage = (targetUser) => {
    // Check if the WebSocket API is supported by the browser
    if (!('WebSocket' in window)) {
      console.error('WebSockets are not supported by your browser.');
      return;
    }

    // Create a new WebSocket instance
    // For a real application, you might want to reuse an existing connection
    const ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      console.log('WebSocket connected!');
      // Prepare the JSON message
      const message = {
        type: 'get_chat_history',
        to: targetUser,
      };

      ws.send(JSON.stringify(message));
      console.log('JSON WebSocket message sent:', message);
    };

    ws.onmessage = (event) => {
      // Handle incoming messages if needed
      console.log('WebSocket message received:', event.data);
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
        <ChattingScreen userName={user} onClose={handleCloseChattingScreen} />
      )}
    </>
  );
}