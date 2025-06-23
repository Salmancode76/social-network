"use client";

import { useEffect, useState } from "react";

export default function Navbar() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch("http://localhost:8080/api/check-session", {
          credentials: "include",
        });

        if (res.ok) {
          setLoggedIn(true);
        } else {
          setLoggedIn(false);
        }
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

    const data = await response.json();
    
    if (response.ok) {
      localStorage.clear();
      sessionStorage.clear();
      
      window.location.href = "/auth";
    } else {
      console.error("Logout failed:", data.message);
      alert("Failed to logout: " + data.message);
    }
  } catch (err) {
    console.error("Logout error:", err);
    alert("Logout error: " + err.message);
  }
  }

  return (
    <nav className="p-4 bg-black text-white flex justify-between">
      <div className="text-xl font-bold">Social Network</div>
      <div className="space-x-4">
        {loggedIn && (
          <button
            onClick={logout}
            className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded"
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}
