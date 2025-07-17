"use client";
import React, { useRef } from "react";
import { useState, useEffect } from "react";
import { fileChangeHandler } from "../utils/fileChangeHandler";
import { Internal505 } from "../Errors/page";
import { useRouter } from "next/navigation";
import { FetchAllUsers } from "../utils/FetchAllUsers"
import CheckSession from "../utils/CheckSession";
import "./creatPost.css"


import { FaAlignLeft, FaPaperPlane, FaLock } from "react-icons/fa"; // Add icons

import "primereact/resources/themes/lara-light-blue/theme.css";

import "primereact/resources/primereact.min.css";

import "primeicons/primeicons.css";

import { MultiSelect } from "primereact/multiselect";



// app/api/session/route.js



function CreatePostPage() {

  const router = useRouter();



  const fileInputRef = useRef();
  const ImageDiv = useRef(null);
  const [ErrorType, setErrorType] = useState(null);


  const [showUserPopup, setShowUserPopup] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState(false);
  const [errorMessage, seterrorMessage] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [formData, setFormData] = useState({
    user_id: null,
    content: "",
    image_file: "",
    privacy_type_id: "1",
    group_id: "",
  });


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
          console.log(data);
          const currentUserId = data.sessionId;

          setFormData((prevFormData) => ({
            ...prevFormData,
            user_id: currentUserId,
          }));
          const users = await FetchAllUsers();
          const formattedUsers = users.map((user) => ({
            ...user,
            label: `${user.first_name} ${user.last_name} | (${user.email})`,
          }));



          setAllUsers(formattedUsers);



        } catch (err) {
          console.error("Failed to fetch session ID", err);
          setError("Failed to load session. Please refresh the page.");

        } finally {
          setLoading(false);
        }
      };
    }

    fetchSessionId();
  }, []);


  const PrivateUsers = () => {
    setShowUserPopup(false);
    //alert(selectedUsers);

  }

  const ValidatePost = () => {
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
    //alert(postData.user_id)

    if (!error) {
      try {
        const result = await fetch("http://localhost:8080/api/CreatePost", {
          method: "POST",
          credentials: "include",
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

      } catch (e) {
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

      <div className="creatPost">
        <div className="creatPost-content">
          <div className="creatPost-header">Create Post</div>

          <form onSubmit={handleSubmit}>

            {/* Content Section */}
            <div className="creatPost-section">
              <FaAlignLeft className="creatPost-section-icon" />
              <div className="creatPost-section-content">
                <label>Content:</label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={(e) => {
                    setFormData({ ...formData, content: e.target.value });
                    ValidatePost();
                  }}
                  maxLength={2500}
                />
              </div>
            </div>

            {/* Image Upload Section */}
            <div className="creatPost-section">
              <FaPaperPlane className="creatPost-section-icon" />
              <div className="creatPost-section-content">
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
              </div>
            </div>

            {/* Privacy Section */}
            <div className="creatPost-section">
              <FaLock className="creatPost-section-icon" />
              <div className="creatPost-section-content">
                <label>Privacy:</label><br />
                <input
                  type="radio"
                  name="privacy_type_id"
                  value="1"
                  onChange={(e) =>
                    setFormData({ ...formData, privacy_type_id: e.target.value })
                  }
                  defaultChecked
                /> Public<br />
                <input
                  type="radio"
                  name="privacy_type_id"
                  value="2"
                  onChange={(e) =>
                    setFormData({ ...formData, privacy_type_id: e.target.value })
                  }
                /> Friends<br />
                <input
                  type="radio"
                  name="privacy_type_id"
                  value="3"
                  onChange={() => {
                    setFormData({ ...formData, privacy_type_id: "3" });
                    setShowUserPopup(true);
                  }}
                /> Private
              </div>
            </div>

            {selectedUsers.length > 0 && formData.privacy_type_id === "3" && (
              <div className="creatPost-section">
                <div className="creatPost-section-content">
                  <h1>Private Users</h1>
                  {selectedUsers.map((id) => {
                    const user = allUsers.find((u) => u.id === id);
                    return <h3 key={id}>{user.label || "Unknown User"}</h3>;
                  })}
                </div>
              </div>
            )}

            <div ref={ImageDiv} className="image"></div>

            <button disabled={error} type="submit">Create Post</button>
            {error && <div className="error-message"> {errorMessage} </div>}
          </form>
        </div>
      </div>

    </div>
  );
}



export default CreatePostPage;
