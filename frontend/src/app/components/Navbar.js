"use client";

import { FetchUserIDbySession } from "../utils/FetchUserIDbySession";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import {NotificationContainer,fetchNotifications} from "../utils/notification/notification_container"
import "../styles/nav.css";

export default function Navbar() {
  const [loggedIn, setLoggedIn] = useState(false);
  const router = useRouter();
  const [userID, setUserID] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);

  const hoverTimeoutRef = useRef(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await FetchUserIDbySession();
        setUserID(data.UserID);
      } catch (e) {
        console.error("Failed to load user data:", e);
        if (e.message.includes("401")) {
        } else {
          console.error("Error loading session:", e);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    async function checkSession() {
      const res = await fetch("http://localhost:8080/api/check-session", {
        credentials: "include",
        method: "GET",
      });
      if (res.ok) {
        setLoggedIn(res.ok);
      } else {
        setLoggedIn(false);
      }
    }

    checkSession();
    window.addEventListener("session-changed", checkSession);
    return () => {
      window.removeEventListener("session-changed", checkSession);
    };
  }, []);


  useEffect(() => {
    if (loggedIn && userID) {
      fetchNotifications(userID, setNotifications, setNotificationCount);
    }
  }, [loggedIn, userID]);

  const manageInvites = async (
    notificationId,
    related_group_id,
    related_user_id,
    accept
  ) => {
    try {
      const response = await fetch("http://localhost:8080/api/ManageInvites", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          notification_id: notificationId,
          related_group_id: related_group_id,
          related_user_id: related_user_id,
          accepted: accept,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      // Refresh notifications after action
      fetchNotifications(userID, setNotifications, setNotificationCount);
    } catch (error) {
      console.error("Failed to manage request:", error);
    }
  }



  // Handle notification actions
  const manageRequest = async (
    notificationId,
    related_group_id,
    related_user_id,
    accept
  ) => {
    try {
      const response = await fetch("http://localhost:8080/api/ManageRequest", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          notification_id: notificationId,
          related_group_id: related_group_id,
          related_user_id: related_user_id,
          accepted: accept,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      // Refresh notifications after action
      fetchNotifications(userID, setNotifications, setNotificationCount);
    } catch (error) {
      console.error("Failed to manage request:", error);
    }
  };

  const handleNotificationEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setShowNotifications(true);
  };

  const handleNotificationLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setShowNotifications(false);
    }, 300); 
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (!event.target.closest(".notification-container")) {
        setShowNotifications(false);
      }
    }

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);



  if (loading) return null;
  if (!userID) return null;

  async function logout() {
    try {
      const logoutUrl = `http://localhost:8080/api/Logout?t=${Date.now()}`;
      const response = await fetch(logoutUrl, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        localStorage.clear();
        sessionStorage.clear();
        setUserID(null);
        setLoggedIn(false);
        window.dispatchEvent(new Event("session-changed"));
        router.push("/auth");
      }
    } catch (err) {
      alert("Logout error: " + err.message);
    }
  }

  return (
    <>
      <nav className="navbar">
        <div className="logo" onClick={() => router.push("/")}>
          King Hashem
        </div>
        <div className="nav-buttons">
          {loggedIn && (
            <>
              <button onClick={() => router.push(`/Profile?id=${userID}`)}>
                My Profile
              </button>
              <button onClick={() => router.push("/CreatePost")}>
                Create Post
              </button>
              <button onClick={() => router.push("/groups")}>
                Create Group
              </button>

              <div
                className="notification-container"
                onMouseEnter={handleNotificationEnter}
                onMouseLeave={handleNotificationLeave}
              >
                <button
                  className={`notification-bell ${
                    showNotifications ? "active" : ""
                  }`}
                >
                  🔔
                  {notificationCount > 0 && (
                    <span className="notification-badge">
                      {notificationCount > 10 ? "10+" : notificationCount}
                    </span>
                  )}
                </button>

                <NotificationContainer
                  notifications={notifications}
                  showNotifications={showNotifications}
                  setNotificationCount={setNotificationCount}
                  manageRequest={manageRequest}
                  manageInvites={manageInvites}
                />
              </div>

              <button onClick={logout}>Logout</button>
            </>
          )}
        </div>
      </nav>
    </>
  );
}
