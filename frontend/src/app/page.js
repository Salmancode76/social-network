"use client";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { FetchAllPosts } from "./utils/FetchAllPosts";
import { Internal505 } from "./Errors/page";
import "./styles/auth.css";
import { useRouter } from "next/navigation";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [hasError, setHasError] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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
    async function load() {
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

    load();
  }, []);

  if (hasError) {
    return <Internal505 />;
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div>
        <h1>Frontend</h1>
        {loading ? (
          <div>Loading posts...</div>
        ) : (
          <>
            {posts && posts.length > 0 ? (
              posts.map((x) => (
                <Link href={`/ViewPost?id=${x.ID}`} key={x.ID}>
                  <div className="post">
                    {x.image_file && (
                      <img
                        src={`http://localhost:8080/Image/Posts/${x.image_file}`}
                        alt="Post image"
                      />
                    )}
                    <p>{x.content}</p>
                    <small>{x.CreatedAt}</small>
                    <br />
                    <span>Privacy: {x.privacy_type_id}</span>
                  </div>
                </Link>
              ))
            ) : (
              <p>No posts available</p>
            )}
          </>
        )}
      </div>
    </Suspense>
  );
}
