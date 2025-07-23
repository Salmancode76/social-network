"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import GroupEvent from "./GroupEvent";
import GroupPost from "./GroupPost";
import "./group.css";
import "primereact/resources/themes/lara-light-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import { FetchUserIDbySession } from "../utils/FetchUserIDbySession";
import { MultiSelect } from "primereact/multiselect";
import { FetchAllUsers } from "../utils/FetchAllUsers";
import CheckSession from "../utils/CheckSession";
import { useWebSocket } from "../contexts/WebSocketContext";
import { FaComments, FaPen, FaCalendarAlt, FaUserPlus } from "react-icons/fa";

export default function GroupChat({ group, onBack }) {
  const router = useRouter();
  const [showUserPopup, setShowUserPopup] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showEventPage, setShowEventPage] = useState(false);
  const [showPostPage, setShowPostPage] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);

  const messagesEndRef = useRef(null);
  const { socket } = useWebSocket();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendText = async (group, message) => {
    const data = await FetchUserIDbySession();
    const userID = data.UserID;

    const payload = {
      type: "group_message",
      from: userID,
      to: group.id,
      text: message,
    };
    socket.send(JSON.stringify(payload));
  };

  useEffect(() => {
    socket.onmessage = (event) => {
      console.log("WebSocket message received:", event.data);
    };
  }, []);

  useEffect(() => {
    if (showUserPopup) {
      setSelectedUsers([]);
    }
  }, [showUserPopup]);

  const HandleInGroupInviteUsers = async (group_id, users) => {
    try {
      const data = await FetchUserIDbySession();
      const userID = parseInt(data.UserID);
      const Invites = {
        type: "sendInviteToGroup",
        sender_id: userID,
        user_ids: users,
        group_id: parseInt(group_id),
      };
      socket.send(JSON.stringify(Invites));

      setSelectedUsers([]);
      setAllUsers([]);
      setShowUserPopup(false);

      setTimeout(async () => {
        const data = await FetchUsersInvites(group_id);
        if (data) {
          const formattedUsers = data.map((user) => ({
            ...user,
            label: `${user.first_name} ${user.last_name} | (${user.email})`,
          }));
          setAllUsers(formattedUsers);
        }
      }, 100);
    } catch (e) {
      console.error("Error: ", e);
      throw e;
    }
  };

  async function FetchUsersInvites(group_id) {
    try {
      const response = await fetch(
        `http://localhost:8080/api/FetchUninvitedUsersToGroup?group_id=${group_id}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      const data = await response.json();
      return data;
    } catch (e) {
      console.error("Error: ", e);
      throw e;
    }
  }

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchSessionId = async () => {
      const ok = await CheckSession(router);
      if (ok) {
        try {
          setLoading(false);
          const res = await fetch("/api/session");
          if (!res.ok) throw new Error("Failed to fetch session");
          const data = await res.json();

          const non_group_users = await FetchUsersInvites(group.id);
          if (non_group_users) {
            const formattedUsers = non_group_users.map((user) => ({
              ...user,
              label: `${user.first_name} ${user.last_name} | (${user.email})`,
            }));
            setAllUsers(formattedUsers);
          }
        } catch (err) {
          console.error("Failed to fetch session ID", err);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchSessionId();
  }, []);

  const getStorageKey = (groupId) => `group_messages_${groupId}`;

  const loadMessagesFromStorage = () => {
    try {
      const saved = localStorage.getItem(getStorageKey(group.id));
      if (saved) return JSON.parse(saved);
    } catch (err) {
      console.error("Error loading messages from storage:", err);
    }
    return [];
  };

  const saveMessagesToStorage = (msgs) => {
    try {
      localStorage.setItem(getStorageKey(group.id), JSON.stringify(msgs));
    } catch (err) {
      console.error("Error saving messages to storage:", err);
    }
  };

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const savedMessages = loadMessagesFromStorage();
      setMessages(savedMessages);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [group.id]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    sendText(group, newMessage);

    const tempMessage = {
      id: Date.now(),
      user_name: "You",
      content: newMessage,
      created_at: new Date().toISOString(),
      group_id: group.id,
    };
    const updatedMessages = [...messages, tempMessage];
    setMessages(updatedMessages);
    saveMessagesToStorage(updatedMessages);
    setNewMessage("");
  };

  if (showEventPage) return <GroupEvent group={group} onBack={() => setShowEventPage(false)} />;
  if (showPostPage) return <GroupPost group={group} onBack={() => setShowPostPage(false)} />;

  const groupedMessages = messages.reduce((acc, message) => {
    const label = formatMessageDate(message.created_at);
    if (!acc[label]) acc[label] = [];
    acc[label].push(message);
    return acc;
  }, {});

  return (
    <div className="group-chat-container">
      {showUserPopup && (
        <div className="modal">
          <div className="modal-content">
            <button className="modal-close" onClick={() => setShowUserPopup(false)}>X</button>
            <h3>Select users to share with</h3>
            <MultiSelect
              value={selectedUsers}
              onChange={(e) => setSelectedUsers(e.target.value || [])}
              options={allUsers}
              optionLabel="label"
              optionValue="id"
              display="chip"
              placeholder="Select Users"
              maxSelectedLabels={5}
              style={{ width: "100%" }}
              showClear
              resetFilterOnHide
            />
            <button
              className="btn"
              onClick={() => HandleInGroupInviteUsers(group.id, selectedUsers)}
              disabled={selectedUsers.length === 0}
            >
              Done
            </button>
          </div>
        </div>
      )}

      <div className="chat-header">
        <div className="chat-header-left">
          <button className="back-button" onClick={onBack}>← Back</button>
          <div className="group-info">
            <h2>{group.title}</h2>
            <p>{group.description}</p>
          </div>
        </div>
        <div className="chat-header-buttons">
          <button className="create-btn"><FaComments style={{ marginRight: "8px" }} />Chat</button>
          <button className="create-btn" onClick={() => setShowPostPage(true)}><FaPen style={{ marginRight: "8px" }} />Post</button>
          <button className="create-btn" onClick={() => setShowEventPage(true)}><FaCalendarAlt style={{ marginRight: "8px" }} />Event</button>
          <button className="create-btn" onClick={() => setShowUserPopup(true)}><FaUserPlus style={{ marginRight: "8px" }} />Invite</button>
        </div>
      </div>

      <div className="messages-container">
        {loading ? (
          <div className="loading-message">Loading messages...</div>
        ) : messages.length > 0 ? (
          <>
            {Object.entries(groupedMessages).map(([label, msgs]) => (
              <div key={label} className="message-group">
                <div className="message-date-wrapper">
                  <div className="message-date-label">{label}</div>
                </div>
                {msgs.map((message) => (
                  <div key={message.id} className={`message ${message.user_name === "You" ? "you" : "other"}`}>
                    <div className="message-header">
                      <span className="message-author">{message.user_name}</span>
                    </div>
                    <div className="message-content">{message.content}</div>
                    <div className="message-time">
                      {new Date(message.created_at).toLocaleDateString("en-US")},{" "}
                      {new Date(message.created_at).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      }).toLowerCase()}
                    </div>
                  </div>
                ))}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        ) : (
          <div className="no-messages">No messages yet. Start the conversation!</div>
        )}
      </div>

      <form className="message-form" onSubmit={handleSendMessage}>
        <input
          type="text"
          className="message-input"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
        />
        <button type="submit" className="send-button fancy-submit-button">
          Send
        </button>
      </form>
    </div>
  );
}

function formatMessageDate(dateStr) {
  const msgDate = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const isSameDay = (d1, d2) =>
    d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getFullYear() === d2.getFullYear();

  if (isSameDay(msgDate, today)) return "Today";
  if (isSameDay(msgDate, yesterday)) return "Yesterday";

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(today.getDate() - 7);

  if (msgDate > oneWeekAgo) {
    return msgDate.toLocaleDateString("en-US", { weekday: "long" });
  }

  return msgDate.toLocaleDateString("en-US");
}
