"use client";
import { useEffect, useState, Suspense, useRef } from "react";
import Link from "next/link";
import Chatbox from "./components/Chatbox";
import { FetchAllPosts } from "./utils/FetchAllPosts";
import CheckSession from "./utils/CheckSession";
import { Internal505 } from "./Errors/page";
import "./styles/auth.css";
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
                    ref={postDiv}
                    style={
                      x.privacy_type_id === "3" ? { background: "red" } : {}
                    }
                  >
                    <div className="avatar_div">
                      <img
                        className="avatar-img"
                        src={`http://localhost:8080/Image/Users/${x.userImage?.String || "profile_notfound.png"
                          }`}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            "http://localhost:8080/Image/Users/profile_notfound.png";
                        }}
                        alt="User avatar"
                      />
                    </div>
                    <small> {x.userEmail}</small>

                    {x.image_file && (
                      <img
                        src={`http://localhost:8080/Image/Posts/${x.image_file}`}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            "http://localhost:8080/Image/Posts/images_notfound.png";
                        }}
                        alt="Post image"
                      />
                    )}
                    <p>{x.content}</p>
                    <small>{x.CreatedAt}</small>
                    <br />
                    <span>
                      Privacy:{" "}
                      {x.privacy_type_id === "1"
                        ? "Public"
                        : x.privacy_type_id === "2"
                          ? "Followers"
                          : "Private"}
                    </span>
                    <p>{x.UserFullname}</p>
                    <p>{x.UserNickname != "" ? "AKA " + x.UserNickname : ""}</p>
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
