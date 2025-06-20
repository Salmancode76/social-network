"use client";
import React, { useRef } from "react";
import { useState,useEffect } from "react";
import { fileChangeHandler } from "../utils/fileChangeHandler";
import { Internal505 } from "../Errors/page";
import { useRouter } from "next/navigation";
import {FetchAllUsers} from "../utils/FetchAllUsers"

import "primereact/resources/themes/lara-light-blue/theme.css";

import "primereact/resources/primereact.min.css";

import "primeicons/primeicons.css";

import { MultiSelect } from "primereact/multiselect";
        



function CreatePostPage() {
  const fileInputRef = useRef();
  const ImageDiv = useRef(null);
  const [ErrorType, setErrorType] = useState(null);

  const router = useRouter();

  const [showUserPopup, setShowUserPopup] = useState(false);
  const [allUsers, setAllUsers] = useState([]);

  const [error,setError] = useState(false);
  const [errorMessage,seterrorMessage] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]); 
  const [formData, setFormData] = useState({
      user_id: "1",
      content: "",
        image_file:"",
      privacy_type_id: "1",
      group_id: "",
    });

    const PrivateUsers = ()=>{
      setShowUserPopup(false);
      //alert(selectedUsers);

    }

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
      const fetchUsersAndValidate = async () => {
        setError(false);
        seterrorMessage("");

        const users = await FetchAllUsers();
        const formattedUsers = users.map((user) => ({
          ...user,
          label: `${user.first_name} ${user.last_name} | (${user.email})`,
        }));
        setAllUsers(formattedUsers);

        ValidatePost();
      };

      fetchUsersAndValidate();
    }, [formData.content, formData.image_file]);
    


    const handleSubmit = async (e) => {
      e.preventDefault();
    
      const postData = {
        user_id: formData.user_id,
        content: formData.content.trim(),
        image_file: formData.image_file,
        privacy_type_id: formData.privacy_type_id,
        group_id: formData.group_id ? formData.group_id : null,
        visible_to: formData.privacy_type_id === "3" ? selectedUsers : [],
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
      {showUserPopup && (
        <div className="modal">
          <div className="modal-content">
            <h3>Select users to share with</h3>

            <MultiSelect
              value={selectedUsers}
              onChange={(e) => setSelectedUsers(e.target.value)}
              options={allUsers}
              optionLabel="label"
              optionValue="id"
              display="chip"
              placeholder="Select Users"
              maxSelectedLabels={5}
              style={{ width: "100%" }}
            />

            <button className="btn" onClick={() => PrivateUsers()}>
              Done
            </button>
          </div>
        </div>
      )}

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
          onChange={async (e) => {
            setFormData({ ...formData, privacy_type_id: e.target.value });
            setShowUserPopup(true);
          }}
        />{" "}
        Private Private
        <br />
        <br />
        <br />
        {selectedUsers.length > 0 && formData.privacy_type_id === "3" && (
          <>
            <h1>Private Users</h1>
            {selectedUsers.map((id) => {
              const user = allUsers.find((u) => u.id === id);
              return <h3 key={id}>{user.label || "Unknown User"}</h3>;
            })}
          </>
        )}
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
