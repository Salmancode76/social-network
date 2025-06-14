"use client";
import React, { useRef } from "react";
import { useState,useEffect } from "react";
import { fileChangeHandler } from "./fileChangeHandler";
import { Internal505 } from "../Errors/page";
import { useRouter } from "next/navigation";



function CreatePostPage() {
  const fileInputRef = useRef();
  const ImageDiv = useRef(null);
  //Server side Error
  const [ErrorType, setErrorType] = useState(null);

  const router = useRouter();


  const [error,setError] = useState(false);
  const [errorMessage,seterrorMessage] = useState('');
  const [formData, setFormData] = useState({
      user_id: "1",
      content: "",
        image_file:"",
      privacy_type_id: "1",
      group_id: "",
    });


    const ValidatePost = ()=>{
      if (
        formData.content.trim().length === 0 &&
        formData.image_file.trim().length === 0
      ) {
        setError(true);
        seterrorMessage(
          "You need to enter either Post Content or a image to create a post."
        );      
      }

    }
    useEffect(() => {
      setError(false);
      seterrorMessage(
""      );
      ValidatePost();
    }, [formData.content, formData.image_file]);
    const handleSubmit = async (e) => {
      e.preventDefault();
    
      const postData = {
        user_id: formData.user_id,
        content: formData.content.trim(),
        image_file: formData.image_file,
        privacy_type_id: formData.privacy_type_id,
        group_id: formData.group_id ? formData.group_id : null,
      };
      
      if(!error){
        try{
      const result = await fetch("http://localhost:8080/api/CreatePost", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      });
      if (!result.ok) {
        const errorText = await result.text();
        throw new Error(errorText || "Server error");
      }
      router.push("/")

    }catch(e){
      console.error(e);
      setErrorType(e);
    }

      //alert(`Post Data: ${postData.image_file}`);
    };

 
 

  }
  if (ErrorType) return <Internal505 />;

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
          onChange={(e) => {
            setFormData({ ...formData, content: e.target.value });
            ValidatePost();
          }}
          maxLength={2500}
        ></textarea>
        <br />
        <br />
        <label>Image Path:</label>
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
        <div ref={ImageDiv} className="image"></div>
        <button disabled={error} type="submit">
          Create Post
        </button>
      </form>
      {error && <div> {errorMessage} </div>}
    </div>
  );
}



export default CreatePostPage;
