"use client";
import {useSearchParams, useRouter } from "next/navigation";
import { useState,useEffect } from "react";
import { FetchUserByID } from "../utils/FetchUserByID";
import { FetchPostsByUserID } from "../utils/FetchPostsByUserID";
import { FetchUserIDbySession } from "../utils/FetchUserIDbySession";
import Link from "next/link";
//import { socket, WS_URL } from "../utils/ws";
import "../styles/Profile.css";
import { useWebSocket } from "../contexts/WebSocketContext";

export default function ProfilePage(){

  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isFollowing, setIsFollowing] = useState(null);
    const [profileData, setProfileData] = useState(null);

  const [currentUserID ,setCurrentUser] = useState([])
    const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const { socket } = useWebSocket();

     useEffect(() => {
        async function checkSession() {
          try {
            const res = await fetch("http://localhost:8080/api/check-session", {
              credentials: "include",
            });
        const data = await res.json();

            if (data.authenticated == false) {
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


        

      useEffect(() => {
        async function fetchData() {
          try{
            if (id){
              const data = await FetchUserByID(id);
              setUser(data);
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

              
         
            }

          }catch(e){
            console.error("Failed to load user data:", e);
          }
          
        }
        fetchPosts();
      },[id]);

      useEffect(() => {
        async function fetchFollowStatus() {
          if (!currentUserID || !id || currentUserID === id) return;
          const res = await fetch(
             `http://localhost:8080/api/follow-status?follower_id=${currentUserID}&following_id=${id}`,
             {
                method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
             }
          );
          const data = await res.json();
          setIsFollowing(data.status);
        }
        fetchFollowStatus();

      }, [currentUserID, id ]);

      async function handleFollowClick() {
        
        if (isFollowing === "accepted"){
          
          const res = await fetch("http://localhost:8080/api/unfollow",{
              method: "DELETE",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
              follower_id: currentUserID,
              following_id: id,
            }),
          });
          if (res.ok){
            setIsFollowing(null);
          }
        }else if (user.User.is_public == 0) {
            const data = await FetchUserIDbySession();
            const userID = data.UserID;
            console.log("WebSocket connected! User ID:", userID);

            const request = {
              type: "sendFollowRequest",
              follower_id: currentUserID,
              following_id: id,
              is_public: "0",
              userID: parseInt(userID),
            };
            console.table(request);
            socket.send(JSON.stringify(request));
          
          setIsFollowing("requested");
        } else {
          const res = await fetch("http://localhost:8080/api/follow", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              follower_id: currentUserID,
              following_id: id,
              is_public: user?.User?.is_public === "1" ? "1" : "0",
            }),
          });

          if (res.ok) {
            setIsFollowing(
              user?.User?.is_public == 1 ? "accepted" : "requested"
            );
          }
        }
      }

      useEffect(() => {
          async function fetchCounts() {
            if (!id) return;
            
            const followersRes = await fetch(`http://localhost:8080/api/followers?user_id=${id}`);
            const followers = await followersRes.json();
            setFollowersCount(Array.isArray(followers.Users) ? followers.Users.length : 0);

            const followingRes = await fetch(`http://localhost:8080/api/following?user_id=${id}`);
            const following = await followingRes.json();
            setFollowingCount(Array.isArray(following.Users) ? following.Users.length : 0);
          }

          fetchCounts();
        }, [id, isFollowing]);



      

     return (
       <div className="container">
         {user ? (
           <>
             <div className="profileHeader">
               <img
                 src={`http://localhost:8080/Image/Users/${user.User.avatar}`}
                 alt="User Avatar"
                 className="avatar"
               />
               <div className="userInfo">
                 <h2>
                   {user.User.nickname}
                   <span>
                     {user.User.first_name} {user.User.last_name}
                   </span>
                 </h2>
                 <p>{user.User.about_me}</p>
                 Account Privacy:{" "}
                 {user.User.is_public == "0" ? "Private" : "Public"}
               </div>
             </div>

             <div className="stats">
               <div className="statItem">
                 <strong>{Array.isArray(posts) ? posts.length : 0}</strong>
                 <span>Posts</span>
               </div>
               <div className="statItem">
                 <strong style={{ cursor: "pointer" }}>{followersCount}</strong>
                 <span>Followers</span>
               </div>
               <div className="statItem">
                 <strong style={{ cursor: "pointer" }}>{followingCount}</strong>
                 <span>Following</span>
               </div>
               {user.User.id === currentUserID && (
                 <Link href={`/Profile/EditProfile?id=${user.User.id}`}>
                   <button className="editButton">Edit Profile</button>
                 </Link>
               )}
               {user.User.id !== currentUserID && (
                 <button
                   className="editButton"
                   style={{
                     backgroundColor:
                       isFollowing === "accepted"
                         ? "#28a745"
                         : isFollowing === "requested"
                         ? "#ffc107"
                         : "#0070f3",
                     cursor: "pointer",
                     marginLeft: "10px",
                   }}
                   onClick={handleFollowClick}
                   disabled={isFollowing === "requested"}
                 >
                   {isFollowing === "accepted"
                     ? "Followed"
                     : isFollowing === "requested"
                     ? "Requested"
                     : "Follow"}
                 </button>
               )}
             </div>
             {user.User.is_public == 0 && user.User.id !== currentUserID ? (
               <p>This account is private.</p>
             ) : (
               <div className="postsSection">
                 <h3>Posts</h3>
                 {Array.isArray(posts) && posts.length > 0 ? (
                   posts.map((post) => (
                     <Link href={`/ViewPost?id=${post.ID}`} key={post.ID}>
                       <div className="postCard">
                         <div className="postHeader">
                           <span>
                             {user.User.nickname ||
                               `${user.User.first_name} ${user.User.last_name}`}
                           </span>
                           <span>
                             {new Date(post.CreatedAt).toLocaleString()}
                           </span>
                         </div>

                         <p
                           style={{
                             marginBottom: post.image_file ? "10px" : "0",
                           }}
                         >
                           {post.content}
                         </p>

                         {post.image_file && post.image_file.trim() !== "" && (
                           <img
                             src={`http://localhost:8080/Image/Posts/${post.image_file}`}
                             onError={(e) => {
                               e.target.onerror = null;
                               e.target.src =
                                 "http://localhost:8080/Image/Posts/images_notfound.png";
                             }}
                             alt="Post image"
                             className="postImage"
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

