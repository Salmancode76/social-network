"use client";
import {useSearchParams, useRouter } from "next/navigation";
import { useState,useEffect } from "react";
import { FetchUserByID } from "../../utils/FetchUserByID";
import { FetchPostsByUserID } from "../../utils/FetchPostsByUserID";
import { FetchUserIDbySession } from "../../utils/FetchUserIDbySession";
import Link from "next/link";
export default function ProfilePage(){
        const [currentUserID ,setCurrentUser] = useState([])
        const router = useRouter();
        const searchParams = useSearchParams();
        const [errors, setErrors] = useState({});

       useEffect(() => {
              async function checkSession() {
                try {
                  const res = await fetch("http://localhost:8080/api/check-session", {
                    credentials: "include",
                  });
          
                  if (!res.ok) {
                    router.push("/auth");
                  }
                } catch (error) {
                  console.error("Session check failed:", error);
                  router.push("/auth");
                }
              }
          
              checkSession();
            }, [router]);
      
             useEffect(() => {
                async function fetchSession() {
                  try {
                    const data = await FetchUserIDbySession();
                    setCurrentUser(data.UserID);
                  } catch (e) {
                    console.error("Failed to load user data:", e);
                    if (e.message.includes("401")) {
                    } else {
                      console.error("Error loading session:", e);
                    }
                  } 
                }
                fetchSession();
              }, []);

              const id = searchParams.get("id");
    
              const [userData, setUserData] = useState({
    first_name: "",
    last_name: "",
    nickname: "",
    about_me: "",
    is_public: false ,
    
  });
  const [userID, setUserID] = useState(null);

  useEffect(() => {
    async function loadUser() {
      try {
        const session = await FetchUserIDbySession();
        setUserID(session.UserID);

        const pageUserId = searchParams.get("id");
      if (session.UserID !== pageUserId) {
        router.push("/"); 
        return;
      }

        const user = await FetchUserByID(session.UserID);
        const u = user.User;
        setUserData({
          first_name: u.first_name || "",
          last_name: u.last_name || "",
          nickname: u.nickname || "",
          about_me: u.about_me || "",
          is_public: u.is_public ,
        });
      } catch (err) {
        console.error("Error loading user:", err);
      }
    }

    loadUser();
  }, []);

  function handleChange(e) {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  }

  async function handleSave() {

    const newErrors = {};


      if (!userData.first_name) {
      newErrors.first_name = "First name is required.";
      }else if (!/^[a-zA-Z0-9]+$/.test(userData.first_name)) {
      newErrors.first_name = "Only letters and numbers are allowed.";
    }


    if (!userData.last_name) {
      newErrors.last_name = "Last name is required.";
    } else if (!/^[a-zA-Z0-9]+$/.test(userData.last_name)) {
      newErrors.last_name = "Only letters and numbers are allowed.";
    }

    if (userData.nickname && !/^[a-zA-Z0-9_.-]+$/.test(userData.nickname)) {
    newErrors.nickname = "Only letters, numbers, '.', '-', '_' are allowed.";
    }

     setErrors(newErrors);

     if (Object.keys(newErrors).length > 0) {
    return; 
    } 
    try {
      const res = await fetch("http://localhost:8080/api/update-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: userID,
          ...userData,
        }),
      });

      if (res.ok) {
        router.push(`/Profile?id=${userID}`);
      } else {
        setErrors({ general: "Error updating profile." });
      }
    } catch (err) {
      console.error("Save error:", err);
      setErrors({ general: "An error occurred during save." });
    }
  }

    
              return (
    <div style={styles.container}>
      <h2>Edit Profile</h2>

      <label style={styles.label}>First Name</label>
      <input
        style={styles.input}
        type="text"
        name="first_name"
        value={userData.first_name}
        onChange={handleChange}
        required
      />
      {errors.first_name && (
  <p style={styles.error}>{errors.first_name}</p>
)}

      <label style={styles.label}>Last Name</label>
      <input
        style={styles.input}
        type="text"
        name="last_name"
        value={userData.last_name}
        onChange={handleChange}
        required
      />
      {errors.last_name && (
  <p style={styles.error}>{errors.last_name}</p>
)}

      <label style={styles.label}>Nickname</label>
      <input
        style={styles.input}
        type="text"
        name="nickname"
        value={userData.nickname}
        onChange={handleChange}
      />
      {errors.nickname && (
  <p style={styles.error}>{errors.nickname}</p>
)}

      <label style={styles.label}>About Me</label>
      <textarea
        style={styles.textarea}
        name="about_me"
        value={userData.about_me}
        onChange={handleChange}
      />
      <label style={styles.label}>Account Privacy</label>
    <select
      style={styles.input}
      name="is_private"
      value={userData.is_public }
      onChange={(e) =>
        setUserData({
          ...userData,
          is_public: e.target.value,
        })
      }
    >
      <option value="1">Public</option>
      <option value="0">Private</option>
    </select>

      <button style={styles.button} onClick={handleSave}>Save Changes</button>
      <button
          style={{ ...styles.button, backgroundColor: "#999", marginLeft: "10px" }}
          onClick={() => router.back()}
        >
          Back
        </button>
        {errors.general && (
  <p style={styles.error}>{errors.general}</p>
)}
    </div>
    );
    
}
const styles = {
  container: {
    maxWidth: "600px",
    margin: "0 auto",
    padding: "20px",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  label: {
    display: "block",
    marginBottom: "5px",
    fontWeight: "bold",
  },
  input: {
    width: "100%",
    padding: "8px",
    marginBottom: "15px",
    borderRadius: "4px",
    border: "1px solid #ccc",
  },
  textarea: {
    width: "100%",
    height: "100px",
    padding: "8px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    marginBottom: "15px",
  },
  button: {
    padding: "10px 20px",
    backgroundColor: "#0070f3",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  error: {
  color: "red",
  fontSize: "0.9em",
  marginTop: "-10px",
  marginBottom: "10px",
},
};
