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


  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

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

  useEffect(()=> {

    const timeout = setTimeout(async () =>{
       if (searchQuery.trim().length === 0) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    try {
      const res = await fetch(`http://localhost:8080/api/search-users?query=${searchQuery}`,{
        credentials: "include",
      });
      if (res.ok){
        const data = await res.json();
        setSearchResults(data.users || [] );
        setShowSearchResults(true);
      }else {
       setSearchResults([]);
       setShowSearchResults(false); 
      }

    }catch (e){
       console.error("Search error:", e);
    }

    }, 300);

    return () => clearTimeout(timeout);
  }, [searchQuery]);



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
                      <span>{user.nickname || `${user.first_name} ${user.last_name}`}</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

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
