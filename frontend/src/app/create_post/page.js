"use client";
import React from "react";
import { useState } from "react";
import { fileChangeHandler } from "./fileChangeHandler";

function CreatePostPage() {
  const [error,setError] = useState(false);
  const [errorMessage,seterrorMessage] = useState('');
  const [formData, setFormData] = useState({
      user_id: 1,
      content: "ewqdhjiweb",
       // image_path: "",
        image_file:"",
      
      privacy_type_id: "1",
      group_id: "",
    });
    const handleSubmit = async (e) => {
      e.preventDefault();

      const postData = {
        user_id: parseInt(formData.user_id),
        content: formData.content,
        image_file: formData.image_file,
        privacy_type_id: parseInt(formData.privacy_type_id),
        group_id: formData.group_id ? parseInt(formData.group_id) : null,
      };
      
      if(!error){
      const result = await fetch("http://localhost:8080/api/CreatePost", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      });

      //alert(`Post Data: ${postData.image_file}`);
    };
  }
  return (
    <div>
      <h1>Create Post</h1>

      <form onSubmit={handleSubmit}>
        <label>User ID:</label>
        <input type="number" name="user_id" />
        <br />
        <br />
        <label>Content:</label>
        <textarea
          name="content"
          value={formData.content}
          onChange={(e) =>
            setFormData({ ...formData, content: e.target.value })
          }
        ></textarea>
        <br />
        <br />
        <label>Image Path:</label>
        <input
          type="file"
          accept="image/*"
          onChange={fileChangeHandler(setError, seterrorMessage, setFormData)}
        />
        <br />
        <br />
        <label>Privacy:</label>
        <input
          type="radio"
          name="privacy_type_id"
          value="1"
          onChange={(e) =>
            setFormData({ ...formData, privacy_type_id: e.target.value })
          }
          defaultChecked
        />
        Public
        <input
          type="radio"
          name="privacy_type_id"
          value="2"
          onChange={(e) =>
            setFormData({ ...formData, privacy_type_id: e.target.value })
          }
        />{" "}
        Friends
        <input
          type="radio"
          name="privacy_type_id"
          value="3"
          onChange={(e) =>
            setFormData({ ...formData, privacy_type_id: e.target.value })
          }
        />{" "}
        Private
        <br />
        <br />
        <br />
        <div className="image"></div>
        <button type="submit">Create Post</button>
      </form>
      {error && <div> Error: {errorMessage} </div>}
    </div>
  );
}



export default CreatePostPage;
