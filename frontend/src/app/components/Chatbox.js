"use client";
import { useEffect, useState } from "react";
import { useWebSocket } from "../contexts/WebSocketContext";
import ChatUser from "./ChatUser.js";
import "./ChatBox.css";

export default function Chatbox() {
  const [isOpen, setIsOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const { socket } = useWebSocket();

  useEffect(() => {
    if (!socket) return;

    const handleMessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("Received message:", data);

        if (data.type === "allusers" && Array.isArray(data.allusers)) {
          setUsers(data.allusers);
        }
      } catch (err) {
        console.error("Failed to parse message", err);
      }
    };

    socket.onmessage = handleMessage;

    // Clean up on unmount or when socket changes
    return () => {
      socket.onmessage = null;
    };
  }, [socket]);

  useEffect(() => {
    if (isOpen && socket) {
      socket.send(JSON.stringify({ type: "get_users" }));
    }
  }, [isOpen, socket]);

  return (
    <>
      <div className={`chatbox-container ${isOpen ? "open" : ""}`}>
        <div className="chatbox-header">
          <span>Chat</span>
          <button className="close-btn" onClick={() => setIsOpen(false)}>
            ✖
          </button>
        </div>
        <div className="chatbox-body">
          {users.map((user) => (
            <ChatUser key={user} user={user} />
          ))}
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
