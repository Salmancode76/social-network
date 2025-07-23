import React, { useState } from 'react';
import { FetchUserIDbySession } from '../utils/FetchUserIDbySession';
import ChattingScreen from './ChattingScreen';
import { useWebSocket } from "../contexts/WebSocketContext";



export default function ChatUser({ user }) {
  const [showChattingScreen, setShowChattingScreen] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  
 const { socket } = useWebSocket();

  const handleUserClick = () => {
    sendWebSocketMessage(user);
    setShowChattingScreen(true);
  };

  const handleCloseChattingScreen = () => {
    setShowChattingScreen(false);
    setChatHistory([]); // Optional: clear chat when closing
  };

  const sendWebSocketMessage = async (targetUser) => {
    if (!('WebSocket' in window)) {
      console.error('WebSockets are not supported by your browser.');
      return;
    }

      const data = await FetchUserIDbySession();
      const userID = data.UserID;
      console.log('WebSocket connected! User ID:', userID);

      const message = {
        type: 'get_chat_history',
        to: targetUser,
        from: userID,
      };

      socket.send(JSON.stringify(message));
      console.log('JSON WebSocket message sent:', message);
    

    socket.onmessage = (event) => {
      console.log('WebSocket message received:', event.data);
      const data = JSON.parse(event.data);

      if (data.type === 'oldmessages' && Array.isArray(data.chathistory)) {
        setChatHistory(data.chathistory);
      }
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
