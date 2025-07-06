import React, { useState } from 'react';
import { FetchUserIDbySession } from '../utils/FetchUserIDbySession'; // Import the utility function
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

    ws.onopen = async () => {
     const data = await FetchUserIDbySession() ;
     const userID = data.UserID
      console.log('WebSocket connected! and user ID:', userID);
      // Prepare the JSON message
      const message = {
        type: 'get_chat_history',
        to: targetUser,
        from: userID, // Use the fetched user ID
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