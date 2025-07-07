// ChattingScreen.js
import React from 'react';
import './ChattingScreen.css';
function handleSend() {
  console.log("Send button clicked");

}
function ChattingScreen({ userName, onClose, chatHistory }) {
  return (
    <div className="chatting-screen-overlay">
      <div className="chatting-screen-content">
        <div className="chatting-screen-header">
          <h2>Chatting with {userName}</h2>
          <button onClick={onClose} className="close-button">X</button>
        </div>

        <div className="chatting-screen-body">
          {chatHistory && chatHistory.length > 0 ? (
            chatHistory.map((msg, index) => (
              <div
                key={index}
                className={`chat-message ${msg.from === userName ? 'received' : 'sent'}`}
              >
                <div className="message-meta">
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
          <input type="text" placeholder="Type a message..." />
         <button onClick={handleSend()}>Send</button>
        </div>
      </div>
    </div>
  );
}

export default ChattingScreen;
