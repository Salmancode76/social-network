"use client";
import { useEffect,useState } from "react";
import { socket } from "../utils/ws";
import "./ChatBox.css"; // Create this for styles

export default function Chatbox() {
  const [isOpen, setIsOpen] = useState(false);

 useEffect(() => {
    if (isOpen) {
      socket.send(JSON.stringify({ type: "get_users" }));
    }
  }, [isOpen]); // Runs when `isOpen` changes


  return (
    <>
      <div className={`chatbox-container ${isOpen ? "open" : ""}`}>
        <div className="chatbox-header">
          <span>Chat</span>
          <button className="close-btn" onClick={() => setIsOpen(false)}>✖</button>
        </div>
        <div className="chatbox-body">
          <p></p>
          {/* You can add real-time messages and input later */}
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
