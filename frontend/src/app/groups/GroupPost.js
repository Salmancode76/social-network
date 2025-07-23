"use client";
import { useState, useRef, useEffect } from "react";
import { FetchPostsGroup, CreateGroupPost, CreateGroupComment } from "../utils/FetchGroupPosts";
import "./group.css";
import { RiImageAddFill } from "react-icons/ri";


export default function GroupPost({ group, onBack }) {
  const [posts, setPosts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ content: "", image_file: "" });
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const imageInputRef = useRef();
  const ImageDiv = useRef();


  const [commentVisibility, setCommentVisibility] = useState({});
  const [commentForm, setCommentForm] = useState({});
  const commentImageRefs = useRef({});
  const commentImageDivs = useRef({});

  useEffect(() => {
    async function loadPosts() {
      const groupPosts = await FetchPostsGroup(group.id);
      setPosts(groupPosts);
    }
    loadPosts();
  }, [group.id]);

  const validateImage = (file) => {
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    const maxSize = 1024 * 1024 * 2; // 2MB
    if (!validTypes.includes(file.type)) {
      return "Invalid file type. Please upload a JPEG/PNG/WEBP image.";
    }
    if (file.size > maxSize) {
      return "Image is too large. Max size is 2MB.";
    }
    return null;
  };

  const handlePostImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validationError = validateImage(file);
    if (validationError) {
      setError(true);
      setErrorMessage(validationError);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({ ...prev, image_file: reader.result }));
      ImageDiv.current.style.backgroundImage = `url(${reader.result})`;
      setError(false);
      setErrorMessage("");
    };
    reader.readAsDataURL(file);
  };

  const handleCommentImageUpload = (postId) => async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validationError = validateImage(file);
    if (validationError) {
      setError(true);
      setErrorMessage(validationError);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setCommentForm((prev) => ({
        ...prev,
        [postId]: {
          ...(prev[postId] || {}),
          image: reader.result,
        },
      }));

      if (commentImageDivs.current[postId]) {
        commentImageDivs.current[postId].style.backgroundImage = `url(${reader.result})`;
      }

      setError(false);
      setErrorMessage("");
    };
    reader.readAsDataURL(file);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.content.trim() && !formData.image_file) return;

    const payload = {
      content: formData.content,
      image_file: formData.image_file,
      group_id: group.id,
    };

    const createdPost = await CreateGroupPost(payload);
    if (createdPost) {
      setPosts((prev) => [...prev, createdPost]);
      setFormData({ content: "", image_file: "" });
      imageInputRef.current.value = "";
      ImageDiv.current.style.backgroundImage = "none";
      setShowModal(false);
    }
  };

  const toggleComment = (postId) => {
    setCommentVisibility((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  const handleCommentChange = (postId, field, value) => {
    setCommentForm((prev) => ({
      ...prev,
      [postId]: {
        ...prev[postId],
        [field]: value,
      },
    }));
  };

  const handleCommentSubmit = async (postId) => {
    const comment = commentForm[postId];
    if (!comment || !comment.content?.trim()) return;

    const res = await CreateGroupComment({
      post_id: postId,
      content: comment.content,
      image_file: comment.image || "",
    });

    if (!res) return;

    const newComment = {
      text: res.text,
      image: res.image || null,
      created_at: res.created_at,
    };

    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? { ...post, comments: [...(post.comments || []), newComment] }
          : post
      )
    );

    setCommentForm((prev) => ({
      ...prev,
      [postId]: { content: "", image: null },
    }));

    if (commentImageDivs.current[postId]) {
      commentImageDivs.current[postId].style.backgroundImage = "none";
    }

    if (commentImageRefs.current[postId]) {
      commentImageRefs.current[postId].value = "";
    }

    setCommentVisibility((prev) => ({ ...prev, [postId]: false }));
  };

  return (
    <div className="group-chat-container">
      <div className="chat-header">
        <button className="back-button" onClick={onBack}>← Back</button>
        <div className="group-title">Posts in {group.title} group</div>
        <button className="send-button" onClick={() => setShowModal(true)}>+ Create Post</button>
      </div>

      <div className="messages-container">
        {posts.length === 0 ? (
          <div className="no-messages">No posts yet.</div>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="post">
              <p style={{ fontWeight: "bold", color: "#2196f3" }}>You</p>
              <p className="group-post-content">{post.content}</p>
              {post.image && (
                <img
                  src={`http://localhost:8080/Image/Posts/${post.image}`}
                  alt="Post visual"
                  className="group-post-image"
                />
              )}

              <div className="message-time-group">
                {new Date(post.created_at).toLocaleString("en-US", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </div>

              <button onClick={() => toggleComment(post.id)} className="comment-group-button"> Comment</button>

              {commentVisibility[post.id] && (
                <form onSubmit={(e) => { e.preventDefault(); handleCommentSubmit(post.id); }}>
                  <textarea
                    value={commentForm[post.id]?.content || ""}
                    onChange={(e) => handleCommentChange(post.id, "content", e.target.value)}
                    placeholder="Write a comment..."
                  />

                  <input
                    type="file"
                    accept="image/*"
                    ref={(el) => (commentImageRefs.current[post.id] = el)}
                    style={{ display: "none" }}
                    onChange={handleCommentImageUpload(post.id)}
                  />

                  <div
                    ref={(el) => (commentImageDivs.current[post.id] = el)}
                    style={{
                      width: "200px",
                      height: "140px",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      borderRadius: "10px",
                      marginTop: "10px",
                      backgroundImage: commentForm[post.id]?.image
                        ? `url(${commentForm[post.id].image})`
                        : "none",
                    }}
                  />

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between", // 🔹 pushes buttons to left and right
                      alignItems: "center",
                      marginTop: "10px",
                      width: "100%", // ensure it spans the container
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => commentImageRefs.current[post.id]?.click()}
                      className="add-img-button"
                    >
                      <RiImageAddFill />
                      Add Img
                    </button>

                    <button type="submit" className="add-img-button">
                      Post
                    </button>
                  </div>

                </form>
              )}

              {post.comments?.length > 0 && (
                <div className="comment-list">
                  {post.comments.map((c, i) => (
                    <div key={i} className="comment">
                      <p><strong>You</strong></p>
                      <p>{c.text}</p>
                      {c.image && (
                        <img
                          src={`http://localhost:8080/Image/Posts/${c.image}`}
                          alt="Comment"
                          className="group-post-image"
                        />
                      )}
                      <div className="message-time">
                        {new Date(c.created_at).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={(e) => {
          if (e.target.className === "modal-overlay") setShowModal(false);
        }}>
          <div className="modal-content scrollable">
            <button className="modal-close" onClick={() => setShowModal(false)}>✖</button>
            <h2>Create New Post</h2>
            <form onSubmit={handleCreate}>
              <textarea
                placeholder="What's on your mind?"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              />
              <label className="custom-file-button" htmlFor="postImageInput">
                <RiImageAddFill />
                Add Image
              </label>
              <input
                type="file"
                id="postImageInput"
                accept="image/*"
                className="hidden-file-input"
                ref={imageInputRef}
                onChange={handlePostImageUpload}
              />
              <div
                ref={ImageDiv}
                className="image"
                style={{
                  width: "250px",
                  height: "200px",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  borderRadius: "10px",
                  marginTop: "10px",
                  backgroundImage: formData.image_file ? `url(${formData.image_file})` : "none",
                }}
              />
              {error && <p className="error-message">{errorMessage}</p>}
              <button type="submit" className="fancy-submit-button">Create</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
