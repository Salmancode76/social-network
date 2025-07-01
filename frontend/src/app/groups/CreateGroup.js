'use client';

import { useState, useEffect } from "react";
import { MultiSelect } from "primereact/multiselect";
import { FetchAllUsers } from "../utils/FetchAllUsers"; // Use the working utility
import "primereact/resources/themes/lara-light-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "./group.css";

export default function CreateGroupButton({ onGroupCreated }) {
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);

  useEffect(() => {
    if (showModal) {
      const fetchUsers = async () => {
        try {
          setLoading(true);
          
          // Use the working approach from CreateGroup/page.js
          const users = await FetchAllUsers();
          const formatted = users.map((user) => ({
            ...user,
            label: `${user.first_name} ${user.last_name} (${user.email})`,
            value: user.id,
          }));
          setAllUsers(formatted);
          
        } catch (err) {
          console.error("Error loading users:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchUsers();
    }
  }, [showModal]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = {
      title,
      description: desc,
      invited_users: selectedUsers,
    };

    try {
      const res = await fetch("http://localhost:8080/api/CreateGroup", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to create group");

      alert(`Group "${title}" created!`);
      setShowModal(false);
      setTitle("");
      setDesc("");
      setSelectedUsers([]);
      
      // Notify parent component that a group was created
      if (onGroupCreated) {
        onGroupCreated();
      }
    } catch (err) {
      console.error("Error creating group:", err);
      alert("Group creation failed.");
    }
  };

  return (
    <>
      <button className="create-btn" onClick={() => setShowModal(true)}>
        Create Group
      </button>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <button className="close-button" onClick={() => setShowModal(false)}>✕</button>
            <h2>Create Group</h2>
            <form onSubmit={handleSubmit}>
              <label>
                Title:
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </label>
              <label>
                Description:
                <textarea
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  required
                />
              </label>

              <label>
                Invite Users:
                {loading ? (
                  <div>Loading users...</div>
                ) : (
                  <MultiSelect
                    value={selectedUsers}
                    onChange={(e) => setSelectedUsers(e.value)}
                    options={allUsers}
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Select users"
                    display="chip"
                    style={{ width: "100%" }}
                  />
                )}
              </label>

              <button type="submit" className="submit-button">
                Create
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
