import React from 'react';
import './ChattingScreen.css'; // You'll create this CSS file

function ChattingScreen({ userName, onClose }) {
  return (
    <div className="chatting-screen-overlay">
      <div className="chatting-screen-content">
        <div className="chatting-screen-header">
          <h2>Chatting with {userName}</h2>
          <button onClick={onClose} className="close-button">X</button>
        </div>
        <div className="chatting-screen-body">
          {/* Your chat messages and input field will go here */}
          <p>Start your conversation with {userName}!</p>
        </div>
        <div className="chatting-screen-footer">
          <input type="text" placeholder="Type a message..." />
          <button>Send</button>
        </div>
      </div>
    </div>
  );
}

export default ChattingScreen;