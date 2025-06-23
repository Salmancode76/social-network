"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { FetchAllPosts } from "./utils/FetchAllPosts";
import { Internal505 } from "./Errors/page";
import "./styles/auth.css";
import { useRouter } from "next/navigation";


export default function Home() {
  const[posts,setPosts]= useState([]);
  const [hasError, setHasError] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function checkSession() {
      const res = await fetch("http://localhost:8080/api/check-session", {
        credentials: "include",
      });

      if (!res.ok) {
        router.push("/auth");
      }
    }

    checkSession();
  }, []);

  useEffect(() => {
    async function load() {
      try {
        await FetchAllPosts(setPosts);
      } catch (e) {
        console.error("Error fetching posts:", e);
        setHasError(true);
      }
    }

    load();
  }, []);
  if(hasError){
    return <Internal505 />;
  }
  
  return (
    <div>
      Frontend
      {posts  &&
        posts.map((x) => {
          return (
            <Link href={`/ViewPost?id=${x.ID}`} key={x.ID}>
              <div className="post">
                {x.image_file ? (
                  <img
                    src={`http://localhost:8080/Image/Posts/${x.image_file}`}
                  />
                ) : (
                  ""
                )}
                {x.content}
                {x.CreatedAt}
                <br></br>
                {x.privacy_type_id}
              </div>
            </Link>
          );
        })}
    </div>
  );
}
