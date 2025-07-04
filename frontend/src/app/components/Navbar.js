"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [loggedIn, setLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch("http://localhost:8080/api/check-session", {
          credentials: "include",
        });

        setLoggedIn(res.ok);
      } catch (err) {
        setLoggedIn(false);
      }
    }

    checkSession();
    window.addEventListener("session-changed", checkSession);
    return () => {
      window.removeEventListener("session-changed", checkSession);
    };
  }, []);

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
        window.location.href = "/auth";
      }
    } catch (err) {
      alert("Logout error: " + err.message);
    }
  }

  return (
    <nav className="navbar">
      <div className="logo" onClick={() => router.push("/")}>
        King Hashem
      </div>
      <div className="nav-buttons">
        {loggedIn && (
          <>
            <button onClick={() => router.push("/Profile")}>My Profile</button>
            <button onClick={() => router.push("/CreatePost")}>
              Create Post
            </button>
            <button onClick={() => router.push("/groups")}>Create Group</button>
            <button onClick={() => router.push("/Notification")}>
              Check notifctaions
            </button>

            <button onClick={logout}>Logout</button>
          </>
        )}
      </div>
    </nav>
  );
}
