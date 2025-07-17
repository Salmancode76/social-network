"use client";
import { useEffect, useState, Suspense, useRef } from "react";
import Link from "next/link";
import Chatbox from "./components/Chatbox";
import { FetchAllPosts } from "./utils/FetchAllPosts";
import CheckSession from "./utils/CheckSession";
import { Internal505 } from "./Errors/page";
import "./styles/main.css";
import { useRouter } from "next/navigation";

export default function Home() {
  const postDiv = useRef(null);
  const [posts, setPosts] = useState([]);
  const [hasError, setHasError] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function init() {
      const ok = await CheckSession(router);
      if (ok) {
        try {
          setLoading(true);
          const postsData = await FetchAllPosts();
          setPosts(postsData || []);
        } catch (e) {
          console.error("Error fetching posts:", e);
          setHasError(true);
        } finally {
          setLoading(false);
        }
      }
    }

    init();
  }, [router]);


  if (hasError) {
    return <Internal505 />;
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="main-content">
        <h1>Frontend</h1>
        {loading ? (
          <div>Loading posts...</div>
        ) : (
          <>
            {posts && posts.length > 0 ? (
              posts.map((x) => (
                <Link href={`/ViewPost?id=${x.ID}`} key={x.ID}>
                 <div
  className="post"
  key={x.ID}
  ref={postDiv}
  style={x.privacy_type_id === "3" ? { background: "#ffe6e6" } : {}}
>
  <div className="post-header">
    <div className="avatar_div">
      <img
        className="avatar-img"
        src={`http://localhost:8080/Image/Users/${x.userImage?.String || "profile_notfound.png"}`}
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = "http://localhost:8080/Image/Users/profile_notfound.png";
        }}
        alt="User avatar"
      />
    </div>
    <div className="user-info">
      <p className="user-fullname">{x.UserFullname}</p>
      {x.UserNickname && <p className="user-nickname">AKA {x.UserNickname}</p>}
      <small className="user-email">{x.userEmail}</small>
    </div>
  </div>
  <div className="post-content">
    <p>{x.content}</p>
    {x.image_file && (
      <img
        className="post-image"
        src={`http://localhost:8080/Image/Posts/${x.image_file}`}
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = "http://localhost:8080/Image/Posts/images_notfound.png";
        }}
        alt="Post image"
      />
    )}
  </div>
  <div className="post-footer">
    <span
      className={`privacy-${
        x.privacy_type_id === "1"
          ? "public"
          : x.privacy_type_id === "2"
          ? "followers"
          : "private"
      }`}
    >
      Privacy:{" "}
      {x.privacy_type_id === "1"
        ? "Public"
        : x.privacy_type_id === "2"
        ? "Followers"
        : "Private"}
    </span>
    <small>{x.CreatedAt}</small>
  </div>
</div>
                </Link>
              ))
            ) : (
              <p>No posts available</p>
            )}
          </>
        )}
        <Chatbox />
      </div>
    </Suspense>
  );
}
