"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState,useRef } from "react";
import { FetchPostByID } from "../utils/FetchPostByID";
import { Lost404 } from "../Errors/page";
import { Internal505 } from "../Errors/page";
import { fileChangeHandler } from "../utils/fileChangeHandler";

function ViewPost() {
  const [post, setPost] = useState(null);
    const fileInputRef = useRef();
    const [errorMessage,seterrorMessage] = useState('');
    const ImageDiv = useRef(null);
  
    const [error,setError] = useState(false);
  
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams();
  const [comment,setComment] = useState("");
  const [ErrorType, setErrorType] = useState(null);


  const [formData, setFormData] = useState({
    image_file: "",
  });

  const id = searchParams.get("id");


  const HandleCommentSubmit = async (e)=>{
    e.preventDefault();

    const data = {
      PostID: id,
      image_file: formData.image_file,

      content: comment,
      user_id: "1",
      date: new Date().toISOString(),
    };

    const result = await fetch(
      `http://localhost:8080/api/CreateComment?id=${id}`,

      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );
    setComment("");
    setFormData({ image_file: "" });
    ImageDiv.current.style.backgroundImage = "none";

    await FetchPostByID(id, setPost);
  }

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
      <div>
        <h2>Post Details</h2>
        {post.image_file ? (
          <img src={`http://localhost:8080/Image/Posts/${post.image_file}`} />
        ) : (
          ""
        )}

        <p>ID: {post.ID}</p>
        <p>User ID: {post.user_id}</p>
        <p>Content: {post.content}</p>
        <p>Created At: {post.CreatedAt}</p>
        <p>Privacy Type ID: {post.privacy_type_id}</p>
      </div>

      <div>
        <form onSubmit={HandleCommentSubmit}>
          {error && <div> {errorMessage} </div>}

          <textarea
            onChange={(e) => setComment(e.target.value)}
            maxLength={1500}
            value={comment}
          />
          <label>Image Path:</label>
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
          <button
            type="submit"
            disabled={
             error
            }
          >
            Post
          </button>
        </form>
        <h3>Comments:</h3>
        {post.Comments && post.Comments.length > 0 ? (
          post.Comments.map((commentObj, index) => (
            <div
              key={index}
              style={{
                border: "1px solid #ccc",
                padding: "10px",
                margin: "5px 0",
              }}
            >
              {console.table(commentObj)}
              <p>
                <strong>User:</strong>{" "}
                {commentObj.Username || `User ${commentObj.user_id}`}
              </p>
              {commentObj.image_file ? (
                <img
                  src={`http://localhost:8080/Image/Posts/${commentObj.image_file}`}
                />
              ) : (
                ""
              )}
              <p>
                <strong>Comment:</strong> {commentObj.content}
              </p>
              <p>
                <strong>Date:</strong>{" "}
                {commentObj.createdAt || commentObj.CreatedAt}
              </p>
            </div>
          ))
        ) : (
          <p>No comments yet</p>
        )}
      </div>
    </>
  );
}

export default ViewPost;
