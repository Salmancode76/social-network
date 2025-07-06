"use client";
import { useEffect, useState } from "react";
import { socket } from "../utils/ws";
import ChatUser from "./ChatUser.js";
import "./ChatBox.css";

export default function Chatbox() {
  const [isOpen, setIsOpen] = useState(false);
  const [users, setUsers] = useState([]); 

  
  useEffect(() => {
    const handleSocketMessage = (event) => {
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

    socket.addEventListener("message", handleSocketMessage);

    return () => {
      socket.removeEventListener("message", handleSocketMessage);
    };
  }, []); 

  
  useEffect(() => {
    if (isOpen) {
      
      socket.send(JSON.stringify({ type: "get_users" }));
    }
  }, [isOpen]); 

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
            <ChatUser key={user.id} user={user} />
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
