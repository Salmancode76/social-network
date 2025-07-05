"use client";

import { FetchUserIDbySession } from "../utils/FetchUserIDbySession";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [loggedIn, setLoggedIn] = useState(false);
  const router = useRouter();
  const [userID, setUserID] = useState(null);
  const [loading, setLoading] = useState(true);
   useEffect(() => {
          async function fetchData() {
            try{
              
                const data = await FetchUserIDbySession();
                setUserID(data.UserID);
              
  
            }catch(e){
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
        },[]);

       

  useEffect(() => {
    async function checkSession() {
      
        const res = await fetch("http://localhost:8080/api/check-session", {
          credentials: "include",
          method: "GET",
        });
        if(res.ok){
          setLoggedIn(res.ok);
        }else {
        setLoggedIn(false);
        }
      
    }

    checkSession();
    window.addEventListener("session-changed", checkSession);
    return () => {
      window.removeEventListener("session-changed", checkSession);
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
    <nav className="navbar">
      <div className="logo" onClick={() => router.push("/")}>
        King Hashem
      </div>
      <div className="nav-buttons">
        {loggedIn && (
          <>
            <button onClick={() => router.push(`/Profile?id=${userID}`)}>My Profile</button>
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
