"use client";
import {useSearchParams, useRouter } from "next/navigation";
import { useState,useEffect } from "react";
import { FetchUserByID } from "../utils/FetchUserByID";

export default function ProfilePage(){

  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
    const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const router = useRouter();
  const searchParams = useSearchParams();
  
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


        const id = searchParams.get("id");

      useEffect(() => {
        async function fetchData() {
          try{
            if (id){
              const data = await FetchUserByID(id);
              setUser(data);

              setPosts([
            { id: 1, title: "My first post", content: "Hello world!" },
            { id: 2, title: "Another day", content: "Loving this app." },
            { id: 3, title: "Vacation time", content: "Can't wait to travel." },
          ]);
          setFollowersCount(120);
          setFollowingCount(75);
            }

          }catch(e){
            console.error("Failed to load user data:", e);
          }
          
        }
        fetchData();
      },[id]);
      

     return (
    <div style={styles.container}>
      {user ? (
        <>
          <div style={styles.profileHeader}>
            <img
              src={`http://localhost:8080/Image/Users/${user.User.avatar}`}
              alt="User Avatar"
              style={styles.avatar}
            />
            <div style={styles.userInfo}>
              <h2 style={{ margin: 0 }}>{user.User.nickname}</h2>
              <p style={{ color: "#666", fontStyle: "italic" , whiteSpace: "pre-line" }}>{user.User.about_me}</p>
            </div>
          </div>

          <div style={styles.stats}>
            <div style={styles.statItem}>
              <strong>{posts.length}</strong>
              <span>Posts</span>
            </div>
            <div style={styles.statItem}>
              <strong>{followersCount}</strong>
              <span>Followers</span>
            </div>
            <div style={styles.statItem}>
              <strong>{followingCount}</strong>
              <span>Following</span>
            </div>
          </div>

          <div style={styles.postsSection}>
            <h3>Posts</h3>
            {posts.length > 0 ? (
              posts.map((post) => (
                <div key={post.id} style={styles.postCard}>
                  <h4>{post.title}</h4>
                  <p>{post.content}</p>
                </div>
              ))
            ) : (
              <p>No posts yet.</p>
            )}
          </div>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "600px",
    margin: "20px auto",
    padding: "0 15px",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  profileHeader: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    borderBottom: "1px solid #ddd",
    paddingBottom: "15px",
    marginBottom: "20px",
  },
  avatar: {
    width: "90px",
    height: "90px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "3px solid #0070f3",
  },
  userInfo: {
    flex: 1,
  },
  stats: {
    display: "flex",
    justifyContent: "space-around",
    marginBottom: "25px",
    borderTop: "1px solid #eee",
    borderBottom: "1px solid #eee",
    padding: "15px 0",
  },
  statItem: {
    textAlign: "center",
  },
  postsSection: {
    marginTop: "20px",
  },
  postCard: {
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "15px",
    marginBottom: "12px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
  },
};