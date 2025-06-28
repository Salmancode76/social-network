// components/ChatBox.js
"use client";
import { useState } from "react";
import "./ChatBox.css"; // Create this for styles

export default function ChatBox() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className={`chatbox-container ${isOpen ? "open" : ""}`}>
        <div className="chatbox-header">
          <span>Chat</span>
          <button className="close-btn" onClick={() => setIsOpen(false)}>✖</button>
        </div>
        <div className="chatbox-body">
          <p>This is a chat placeholder.</p>
          {/* You can add real-time messages and input later */}
        </div>
        <div className="chatbox-footer">
          <input type="text" placeholder="Type a message..." />
          <button>Send</button>
        </div>
      </div>

      <button
        className="chatbox-toggle"
        onClick={() => setIsOpen(true)}
        aria-label="Open Chat"
      >
        💬
      </button>
    </>
  );
}
