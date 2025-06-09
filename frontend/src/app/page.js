"use client";
import { useEffect, useState } from "react";

export default function Home() {
  const[posts,setPosts]= useState([]);
  async function FetchAllPosts() {
    const response = await fetch("http://localhost:8080/api/FetchAllPosts", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();

    console.table(data.Posts)
    setPosts(data.Posts);
  }

  useEffect(() => {
    FetchAllPosts();
  }, []);
  return (
    <div>
      Frontend
      {posts.map((x) => {
        return (
          <div key={x.ID} className="post">
            <img src={`http://localhost:8080/Image/Posts/${x.image_file}`} />
            {x.content}
            {x.CreatedAt}
            <br></br>
            {x.privacy_type_id}
          </div>
        );
      })}
    </div>
  );
}
