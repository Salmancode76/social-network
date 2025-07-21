"use client";

import { FetchUserIDbySession } from "../utils/FetchUserIDbySession";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import {
  NotificationContainer,
  fetchNotifications,
} from "../utils/notification/notification_container";
import "../styles/nav.css";
import { useWebSocket } from "../contexts/WebSocketContext";
import { AiFillHome, AiOutlinePlus } from "react-icons/ai";
import { FaUser, FaUsers } from "react-icons/fa";
import { usePathname } from "next/navigation";


export default function Navbar() {
  const [loggedIn, setLoggedIn] = useState(false);
  const router = useRouter();
  const [userID, setUserID] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const hoverTimeoutRef = useRef(null);

  const { socket, isConnected, connect, disconnect } = useWebSocket();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const pathname = usePathname();
  const isAuthPage = pathname.startsWith("/auth");



  useEffect(() => {
    if (socket) {
      const handleMessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("WebSocket message received:", data);

          if (data.type === "notifications") {
            setNotifications(data.notifications || []);
            //alert(data.notifications);
            let count = 0;
            console.log(data);
            for (let i = 0; i < data.notifications.length; i++) {
              console.log("Read " + data.notifications[i].is_read);
              if (!data.notifications[i].is_read) count++;
            }
            setNotificationCount(count || 0);
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      socket.addEventListener("message", handleMessage);

      return () => {
        socket.removeEventListener("message", handleMessage);
      };
    }
  }, [socket]);

  useEffect(() => {
    if (loggedIn && userID && !isConnected) {
      connect(userID);
    } else if (!loggedIn && isConnected) {
      disconnect();
    }
  }, [loggedIn, userID, isConnected, connect, disconnect]);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await FetchUserIDbySession();
        setUserID(data.UserID);
      } catch (e) {
        console.error("Failed to load user data:", e);
        if (e.message.includes("401")) {
          setLoggedIn(false);
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
      try {
        const res = await fetch("http://localhost:8080/api/check-session", {
          credentials: "include",
          method: "GET",
        });
         const data = await res.json();
         if (data.authenticated == true) {
           setLoggedIn(res.ok);
         }
      } catch (error) {
        console.error("Session check failed:", error);
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

      fetchNotifications(userID, setNotifications, setNotificationCount);
    } catch (error) {
      console.error("Failed to manage request:", error);
    }
  };

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

      fetchNotifications(userID, setNotifications, setNotificationCount);
    } catch (error) {
      console.error("Failed to manage request:", error);
    }
  };

const manageFollow = async (
    notificationId,
    creator_id,
    related_user_id,
    accept
  ) => {
    try {
      const response = await fetch("http://localhost:8080/api/ManageFollowRequest", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
        notification_id: notificationId,
          creator_id: creator_id ,
          related_user_id: related_user_id,
          accepted: accept,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

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

  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (searchQuery.trim().length === 0) {
        setSearchResults([]);
        setShowSearchResults(false);
        return;
      }

      try {
        const res = await fetch(
          `http://localhost:8080/api/search-users?query=${encodeURIComponent(
            searchQuery
          )}`,
          {
            credentials: "include",
          }
        );
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.users || []);
          setShowSearchResults(true);
        } else {
          setSearchResults([]);
          setShowSearchResults(false);
        }
      } catch (e) {
        console.error("Search error:", e);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchQuery]);

  if (loading || !userID || isAuthPage) return null;


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
        disconnect();
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
      {/* Navbar always first */}
      {loggedIn && (
      <nav className="navbar">
        <div className="logo" onClick={() => router.push("/")}>
          King Hashem
        </div>
        <div className="nav-buttons">
          <div className="search-container">
            <input
              type="text"
              className="search-input"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (searchResults.length > 0) setShowSearchResults(true);
              }}
            />
            {showSearchResults && (
              <div className="search-results">
                {searchResults.length === 0 ? (
                  <p>No users found.</p>
                ) : (
                  searchResults.map((user) => (
                    <div
                      key={user.id}
                      className="search-result-item"
                      onClick={() => {
                        router.push(`/Profile?id=${user.id}`);
                        setSearchQuery("");
                        setShowSearchResults(false);
                      }}
                    >
                      <img
                        src={`http://localhost:8080/Image/Users/${user.avatar}`}
                        alt="avatar"
                        className="search-avatar"
                      />
                      <span>
                        {user.nickname ||
                          `${user.first_name} ${user.last_name}`}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          
            <>
              <div
                className="notification-container"
                onMouseEnter={handleNotificationEnter}
                onMouseLeave={handleNotificationLeave}
              >
                <button
                  className={`notification-bell ${showNotifications ? "active" : ""
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
                  manageFollow={manageFollow}
                />
              </div>

              <button className="btn-logout" onClick={logout}>Logout</button>
            </>
        </div>
      </nav>
          )}

      
      {/* Page Layout after Navbar */}
      {loggedIn && (
      <aside>
        <div className="page-container">
          <div className={`left-sidebar ${sidebarOpen ? "expanded" : "collapsed"}`}>
            {/* Toggle Sidebar Button */}
            <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? "←" : "☰"}
            </button>

            {/* HOME */}
            <button className="side-btn" onClick={() => router.push("/")}>
              <AiFillHome className="sidebar-icon" />
              {sidebarOpen && <span>Home</span>}
            </button>

            {/* MY PROFILE */}
            {userID && userID > 0 && (
            <button className="side-btn" onClick={() => router.push(`/Profile?id=${userID}`)}>
              <FaUser className="sidebar-icon" />
              {sidebarOpen && <span>My Profile</span>}
            </button>
            )}

            {/* CREATE POST */}
            <button className="side-btn" onClick={() => router.push("/CreatePost")}>
              <AiOutlinePlus className="sidebar-icon" />
              {sidebarOpen && <span>Create Post</span>}
            </button>

            {/* GROUPS */}
            <button className="side-btn" onClick={() => router.push("/groups")}>
              <FaUsers className="sidebar-icon" />
              {sidebarOpen && <span>Groups</span>}
            </button>
          </div>


          <div className="main-content">
            {/* This will hold the main routed content or page-specific elements */}
          </div>
        </div>
      </aside>
      )}
    </>
  );

}
