"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FetchPostByID } from "../utils/FetchPostByID";
import { Lost404, Internal505 } from "../Errors/page";

export default function ViewPostContent() {
    const searchParams = useSearchParams();
    const id = searchParams.get("id");

    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [comment, setComment] = useState("");
    const [errorType, setErrorType] = useState(null);


    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                await FetchPostByID(id, setPost);
            } catch (err) {
                console.error(err);
                setErrorType(err);
            } finally {
                setLoading(false);
            }
        }
        if (id) fetchData();
    }, [id]);


    async function handleCommentSubmit(e) {
        e.preventDefault();

        const payload = {
            PostID: id,
            content: comment,
            user_id: "1",
            date: new Date().toISOString(),
        };

        await fetch(
            `http://backend:8080/api/CreateComment?id=${id}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            }
        );

        setComment("");
        await FetchPostByID(id, setPost);
    }


    if (errorType?.message?.includes("404")) return <Lost404 />;
    if (errorType?.message) return <Internal505 />;
    if (loading) return <p>Loading…</p>;


    return (
        <>
            <h2>Post Details</h2>

            {post.image_file && (
                <img
                    src={`http://backend:8080/Image/Posts/${post.image_file}`} // ⚠︎ backend بدلاً من localhost
                    alt="post image"
                />
            )}

            <p><strong>ID:</strong> {post.ID}</p>
            <p><strong>User ID:</strong> {post.user_id}</p>
            <p><strong>Content:</strong> {post.content}</p>
            <p><strong>Created At:</strong> {post.CreatedAt}</p>
            <p><strong>Privacy Type:</strong> {post.privacy_type_id}</p>

        
            <form onSubmit={handleCommentSubmit}>
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    maxLength={1500}
                    required
                />
                <button type="submit" disabled={!comment.trim()}>
                    Post
                </button>
            </form>

         
            <h3>Comments</h3>
            {post.Comments?.length ? (
                post.Comments.map((c, i) => (
                    <div key={i} style={{ border: "1px solid #ccc", margin: "6px 0", padding: "8px" }}>
                        <p><strong>User:</strong> {c.Username || `User ${c.user_id}`}</p>
                        <p><strong>Comment:</strong> {c.content}</p>
                        <p><strong>Date:</strong> {c.createdAt || c.CreatedAt}</p>
                    </div>
                ))
            ) : (
                <p>No comments yet.</p>
            )}
        </>
    );
}
