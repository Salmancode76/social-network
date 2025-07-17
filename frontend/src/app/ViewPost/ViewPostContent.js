"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { FetchPostByID } from "../utils/FetchPostByID";
import { Lost404 } from "../Errors/page";
import { Internal505 } from "../Errors/page";
import { fileChangeHandler } from "../utils/fileChangeHandler";
import CheckSession from "../utils/CheckSession";
import "../styles/ViewPost.css";
export default function ViewPostContent() {
  const [post, setPost] = useState(null);
  const fileInputRef = useRef();
  const [errorMessage, seterrorMessage] = useState("");
  const ImageDiv = useRef(null);

  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const [comment, setComment] = useState("");
  const [ErrorType, setErrorType] = useState(null);

  const [formData, setFormData] = useState({
    image_file: "",
    user_id: null,
  });

  const id = searchParams.get("id");

  const router = useRouter();


  const HandleCommentSubmit = async (e) => {
    
    e.preventDefault();

    const data = {
      PostID: id,
      image_file: formData.image_file,
      content: comment,
      user_id: formData.user_id,
      date: new Date().toISOString(),
    };
    console.table(data)




    const result = await fetch(
      `http://localhost:8080/api/CreateComment?id=${id}`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );
    setComment("");
    setFormData({ image_file: "" });
    if (ImageDiv.current) {
      ImageDiv.current.style.backgroundImage = "none";
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    await FetchPostByID(id, setPost);
  };

  useEffect(() => {
    const fetchSessionId = async () => {
      const ok = await CheckSession(router);
      if (ok) {
        try {
          setLoading(false);
          const res = await fetch("/api/session");
          if (!res.ok) {
            throw new Error("Failed to fetch session");
          }
          const data = await res.json();
          setFormData({ ...formData, user_id: data.sessionId });
        } catch (err) {
          console.error("Failed to fetch session ID", err);
          setError("Failed to load session. Please refresh the page.");
        } finally {
          setLoading(false);
        }
      }
    };
    fetchSessionId();
  }, []);
      

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        await FetchPostByID(id, setPost);
      } catch (error) {
        console.error("Error fetching post:", error);
        setErrorType(error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  useEffect(() => {
    ValidateComment();
  }, [formData.image_file, comment]);

  const ValidateComment = () => {
    if (
      comment.trim().length === 0 &&
      formData.image_file.trim().length === 0
    ) {
      setError(true);
      seterrorMessage(
        "You need to enter either a Comment text or an image to create a comment."
      );
    } else {
      setError(false);
      seterrorMessage("");
    }
  };

  if (ErrorType?.message?.includes("404")) {
    return <Lost404 />;
  }

  if (ErrorType?.message) {
    return <Internal505 />;
  }

  if (loading) {
    return <p>Loading post details...</p>;
  }

  return (
    <>
      <div className="viewpost-container">
  <h2>Post Details</h2>

  {post?.image_file && (
    <img
      className="viewpost-image"
      src={`http://localhost:8080/Image/Posts/${post.image_file}`}
      onError={(e) => {
        e.target.onerror = null;
        e.target.src = "http://localhost:8080/Image/Posts/images_notfound.png";
      }}
      alt="Post image"
    />
  )}

  <div className="post-details">
    <p>ID: {post?.ID}</p>
    <p>User ID: {post?.user_id}</p>
    <p>Content: {post?.content}</p>
    <p>Created At: {post?.CreatedAt}</p>
    <p>Privacy Type ID: {post?.privacy_type_id}</p>
  </div>

  <form className="comment-form" onSubmit={HandleCommentSubmit}>
    {error && <div style={{ color: 'red', marginBottom: '10px' }}>{errorMessage}</div>}

    <textarea
      onChange={(e) => setComment(e.target.value)}
      maxLength={1500}
      value={comment}
      placeholder="Write your comment here..."
    />

    <label>Attach an image (optional):</label>
    <div ref={ImageDiv} className="image"></div>

    <input
      type="file"
      accept="image/*"
      ref={fileInputRef}
      onChange={fileChangeHandler(
        setError,
        seterrorMessage,
        setFormData,
        ImageDiv,
        fileInputRef
      )}
    />

    <button type="submit" disabled={error}>
      Post
    </button>
  </form>

  <div className="comments-section">
    <h3>Comments:</h3>
    {post?.Comments && post?.Comments.length > 0 ? (
      post.Comments.map((commentObj, index) => (
        <div key={index} className="comment-card">
          <div className="comment-avatar">
            <img
              src={`http://localhost:8080/Image/Users/${
                commentObj.userImage?.String || "profile_notfound.png"
              }`}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "http://localhost:8080/Image/Users/profile_notfound.png";
              }}
              alt="User avatar"
            />
          </div>
          <div className="comment-content">
            <p className="comment-username">
              {commentObj.Username || `User #${commentObj.user_id}`}
            </p>
            <p>{commentObj.content}</p>
            {commentObj.image_file && (
              <img
                src={`http://localhost:8080/Image/Posts/${commentObj.image_file}`}
                alt={`Comment image ${index}`}
              />
            )}
            <p className="comment-meta">
              Full Name: {commentObj.UserFname} <br />
              {commentObj.UserNickname !== ""
                ? "Username: " + commentObj.UserNickname
                : ""}{" "}
              <br />
              Date: {commentObj.createdAt || commentObj.CreatedAt}
            </p>
          </div>
        </div>
      ))
    ) : (
      <p>No comments yet</p>
    )}
  </div>
</div>
    </>
  );
}
