import React, { useState } from 'react';
import ChattingScreen from './ChattingScreen'; // Import the new component

export default function ChatUser({ user }) {
  const [showChattingScreen, setShowChattingScreen] = useState(false);

  const handleUserClick = () => {
    setShowChattingScreen(true);
  };

  const handleCloseChattingScreen = () => {
    setShowChattingScreen(false);
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