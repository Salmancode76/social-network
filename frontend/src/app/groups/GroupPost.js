"use client";
import { useState, useRef, useEffect } from "react";
import { FetchPostsGroup, CreateGroupPost, CreateGroupComment } from "../utils/FetchGroupPosts";
import "./group.css";
import { fileChangeHandler } from "../utils/fileChangeHandler";


export default function GroupPost({ group, onBack }) {
  const [posts, setPosts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ content: "" });
  const [imageBase64, setImageBase64] = useState(null);
  const imageInputRef = useRef();
  const [commentVisibility, setCommentVisibility] = useState({});
  const [commentForm, setCommentForm] = useState({});
  const commentImageRefs = useRef({});

  useEffect(() => {
    async function loadPosts() {
      const groupPosts = await FetchPostsGroup(group.id);
      setPosts(groupPosts);
    }
    loadPosts();
  }, [group.id]);

 const groupPostsByDate = (posts) => {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const grouped = {};

  posts.forEach((post) => {
    const postDate = new Date(post.created_at);
    let label;

    if (postDate.toDateString() === today.toDateString()) {
      label = "Today";
    } else if (postDate.toDateString() === yesterday.toDateString()) {
      label = "Yesterday";
    } else {
      const diff = (today - postDate) / (1000 * 60 * 60 * 24);
      if (diff <= 6) {
        label = postDate.toLocaleDateString("en-US", { weekday: "long" }); // e.g., Sunday
      } else {
        label = postDate.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      }
    }

    if (!grouped[label]) grouped[label] = { posts: [], rawDate: postDate };
    grouped[label].posts.push(post);
  });

  // Now return sorted array by rawDate
  return Object.entries(grouped)
    .sort((a, b) => new Date(a[1].rawDate) - new Date(b[1].rawDate))
    .map(([label, value]) => [label, value.posts]);
};


  const handleImageUpload = (file, postId = null) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (postId === null) {
        setImageBase64(reader.result);
      } else {
        setCommentForm(prev => ({
          ...prev,
          [postId]: {
            ...prev[postId],
            image: reader.result,
          },
        }));
      }
    };
    if (file) reader.readAsDataURL(file);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const payload = {
      content: form.content,
      image_file: imageBase64,
      group_id: group.id,
    };
    const createdPost = await CreateGroupPost(payload);
    if (createdPost) {
      setPosts(prev => [...prev, createdPost]);
      setForm({ content: "" });
      setImageBase64(null);
      imageInputRef.current.value = "";
      setShowModal(false);
    }
  };

  const toggleComment = (postId) => {
    setCommentVisibility(prev => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  const handleCommentChange = (postId, field, value) => {
    setCommentForm(prev => ({
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

    setPosts(prev =>
      prev.map(post =>
        post.id === postId
          ? { ...post, comments: [...(post.comments || []), newComment] }
          : post
      )
    );

    setCommentForm(prev => ({
      ...prev,
      [postId]: { content: "", image: null },
    }));
    setCommentVisibility(prev => ({ ...prev, [postId]: false }));
  };

  return (
    <div className="group-chat-container">
      <div className="chat-header">
        <div className="chat-header-left">
          <button className="back-button" onClick={onBack}>← Back</button>
          <div className="group-info">
            <h2>Posts in {group.title}</h2>
          </div>
        </div>
        <button className="send-button" onClick={() => setShowModal(true)}>+ Create Post</button>
      </div>

      <div className="messages-container">
        {posts.length === 0 ? (
          <div className="no-messages">No posts yet.</div>
        ) : (
         groupPostsByDate(posts).map(([label, postGroup]) => (
              <div key={label}>
                <div className="message-date-wrapper">
                  <div className="message-date-label">{label}</div>
                </div>
                {postGroup.map((post) => (
                  <div
                    className="message"
                    key={post.id}
                    style={{
                      background: "#474747",
                      color: "#f4eee2",
                      borderRadius: "12px",
                      padding: "16px",
                      marginBottom: "16px",
                    }}
                  >
                    <p style={{ fontWeight: "bold", color: "#2196f3" }}>You</p>
                    <p>{post.content}</p>
                    {post.image && (
                      <img
                        src={`http://localhost:8080/Image/Posts/${post.image}`}
                        alt="Post visual"
                        style={{
                          maxWidth: "250px",
                          maxHeight: "200px",
                          borderRadius: "10px",
                          objectFit: "cover",
                        }}
                      />
                    )}
                    <div
                      className="message-time"
                      style={{
                        fontSize: "12px",
                        color: "#cccccc",
                        marginTop: "10px",
                      }}
                    >
                      {new Date(post.created_at).toLocaleDateString("en-US")},{" "}
                      {new Date(post.created_at).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      }).toLowerCase()}
                    </div>
                  
      <div className="comment-button-wrapper">
        <button className="fancy-comment-button" onClick={() => toggleComment(post.id)}>
          <span className="comment-icon">💬</span> Comment
        </button>
      </div>

      {commentVisibility[post.id] && (
        <form className="comment-input-area" onSubmit={(e) => {
          e.preventDefault();
          handleCommentSubmit(post.id);
        }}>
          <textarea
            placeholder="Write a comment..."
            value={commentForm[post.id]?.content || ""}
            onChange={(e) => handleCommentChange(post.id, "content", e.target.value)}
            required
          />
          <input
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            ref={(el) => (commentImageRefs.current[post.id] = el)}
            onChange={(e) => handleImageUpload(e.target.files[0], post.id)}
          />

          <div className="comment-buttons-layout">
            <button type="button" className="add-img-button" onClick={() => commentImageRefs.current[post.id]?.click()}>
              + Add img
            </button>
            <div className="comment-image-wrapper">
              {commentForm[post.id]?.image && (
                <img
                  src={commentForm[post.id].image}
                  alt="Comment preview"
                  className="comment-preview-image"
                />
              )}
            </div>
            <button type="submit" className="post-button">Post</button>
          </div>
        </form>
      )}

      {post.comments && post.comments.length > 0 && (
        <div className="comment-list">
          {post.comments.map((c, i) => (
            <div key={i} className="comment" style={{ background: "#eeeeee", padding: "10px", borderRadius: "10px", marginTop: "10px" }}>
              <p style={{ fontWeight: "bold", color: "#555" }}>You</p>
              <p>{c.text}</p>
              {c.image && (
                <img
                  src={`http://localhost:8080/Image/Posts/${c.image}`}
                  alt="Comment"
                  style={{
                    maxWidth: "250px",
                    maxHeight: "200px",
                    borderRadius: "10px",
                    objectFit: "cover",
                    marginTop: "10px"
                  }}
                />
              )}
              <div className="message-time-comments" style={{ fontSize: "12px", color: "#888", marginTop: "8px" }}>
                {new Date(c.created_at).toLocaleDateString("en-US")},{" "}
                {new Date(c.created_at).toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                }).toLowerCase()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  ))
}
            </div >
          ))
        )}
      </div >

  { showModal && (
    <div className="modal-overlay" onClick={(e) => {
      if (e.target.className === "modal-overlay") setShowModal(false);
    }}>
      <div className="modal-content scrollable">
        <button className="modal-close" onClick={() => setShowModal(false)}>✖</button>
        <h2>Create New Post</h2>
        <form onSubmit={handleCreate}>
          <textarea
            placeholder="What's on your mind?"
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            required
          />
          <input
            type="file"
            accept="image/*"
            ref={imageInputRef}
            onChange={(e) => handleImageUpload(e.target.files[0])}
          />
          {imageBase64 && (
            <div style={{ marginTop: "10px" }}>
              <img
                src={imageBase64}
                alt="Preview"
                style={{
                  maxWidth: "250px",
                  maxHeight: "200px",
                  borderRadius: "10px",
                  objectFit: "cover"
                }}
              />
            </div>
          )}
          <div className="modal-buttons">
            <button type="submit" className="fancy-submit-button">Create</button>
          </div>
        </form>
      </div>
    </div>
  )}
    </div >
  );
}
