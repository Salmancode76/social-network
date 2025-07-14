"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { WS_URL } from "../utils/ws";

const WebSocketContext = createContext();

export function WebSocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [userID, setUserID] = useState(null);
  const wsRef = useRef(null);
  
  const connect = (userId) => {
    if (wsRef.current) {
      wsRef.current.close();
    }

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      setSocket(ws);
      setUserID(userId);

      const message = {
        type: "get_all_notifications",
        user_id: parseInt(userId),
      };
      ws.send(JSON.stringify(message));
    };

    ws.onclose = () => {
      setIsConnected(false);
      setSocket(null);
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setIsConnected(false);
    };

    return ws;
  };

  const disconnect = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setSocket(null);
    setIsConnected(false);
    setUserID(null);
  };


  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  const value = {
    socket,
    isConnected,
    userID,
    connect,
    disconnect,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
}

export { WebSocketContext };
