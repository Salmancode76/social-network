"use client";
import {useSearchParams, useRouter } from "next/navigation";
import { useState,useEffect } from "react";
import { FetchUserByID } from "../utils/FetchUserByID";
import { FetchPostsByUserID } from "../utils/FetchPostsByUserID";
import { FetchUserIDbySession } from "../utils/FetchUserIDbySession";
import Link from "next/link";
export default function ProfilePage(){

  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [currentUserID ,setCurrentUser] = useState([])
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

      useEffect(() => {
        async function fetchData() {
          try{
            if (id){
              const data = await FetchUserByID(id);
              setUser(data);

              
          setFollowersCount(120);
          setFollowingCount(75);
            }

          }catch(e){
            console.error("Failed to load user data:", e);
          }
          
        }
        fetchData();
      },[id]);

       useEffect(() => {
        async function fetchPosts() {
          
          try{
            if (id){
              const data = await FetchPostsByUserID(id);
              console.log("Fetched Posts:", data.Posts);
              setPosts(data.Posts);

              
          setFollowersCount(120);
          setFollowingCount(75);
            }

          }catch(e){
            console.error("Failed to load user data:", e);
          }
          
        }
        fetchPosts();
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
              <h2 style={{ margin: 0 }}>
                {user.User.nickname}
                <span style={{ display: "block", fontSize: "14px", color: "#888" }}>
                  {user.User.first_name} {user.User.last_name}
                </span>
              </h2>
              <p style={{ color: "#666", fontStyle: "italic" , whiteSpace: "pre-line" }}>{user.User.about_me}</p>
            </div>
          </div>

          <div style={styles.stats}>
            <div style={styles.statItem}>
              <strong>{Array.isArray(posts) ? posts.length : 0}</strong>
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
            {user.User.id === currentUserID && (
              <Link href={`/Profile/EditProfile?id=${user.User.id}`}>
                <button style={styles.editButton}>Edit Profile</button>
              </Link>
            )}
          </div>
        {user.User.is_public == 0 && user.User.id !== currentUserID ? (
        <p>This account is private.</p>
      ) : (
      
          <div style={styles.postsSection}>
            <h3>Posts</h3>
            {Array.isArray(posts) && posts.length > 0  ? (
              posts.map((post) => (
               <Link  href={`/ViewPost?id=${post.ID}`} key={post.ID} >
                <div style={styles.postCard}>
      
      <div style={styles.postHeader}>
        <span>{user.User.nickname || `${user.User.first_name} ${user.User.last_name}`}</span>
        <span>{new Date(post.CreatedAt).toLocaleString()}</span>
      </div>

     
      <p style={{ marginBottom: post.image_file ? "10px" : "0" }}>{post.content}</p>

      
      {post.image_file && post.image_file.trim() !== "" && (
        <img
          src={`http://localhost:8080/Image/Posts/${post.image_file}`}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "http://localhost:8080/Image/Posts/images_notfound.png";
          }}
          alt="Post image"
          style={styles.postImage}
        />
      )}
    </div>
                </Link>
              ))
            ) : (
              <p>No posts yet.</p>
            )}
          </div>
          )}
        </>
      ) : (
        <p>User Not Found</p>
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
 postHeader: {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "10px",
  color: "#888",
  fontSize: "12px",
},

postImage: {
  width: "100%",
  maxHeight: "300px",
  objectFit: "contain",
  borderRadius: "8px",
  marginTop: "10px",
  backgroundColor: "#f9f9f9",
},
editButton: {
  padding: "8px 15px",
  backgroundColor: "#0070f3",
  color: "#fff",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
  marginTop: "10px",
}
};
