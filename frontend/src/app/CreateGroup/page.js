"use client";

import "primereact/resources/themes/lara-light-blue/theme.css";

import "primereact/resources/primereact.min.css";

import "primeicons/primeicons.css";
import { useState ,useEffect} from "react";
import { MultiSelect } from "primereact/multiselect";
import { FetchAllUsers } from "../utils/FetchAllUsers";

function CreateGroupPage() {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const[loading,setLoading] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [showUserPopup, setShowUserPopup] = useState(false);

  const PrivateUsers = () => {
    console.log("Selected users:", selectedUsers);
    setShowUserPopup(false);
  };

     useEffect(() => {
        const fetchSessionId = async () => {
          try {
            setLoading(false);
            const res = await fetch("/api/session");
            if (!res.ok) {
              throw new Error("Failed to fetch session");
            }
            const data = await res.json();
            console.log(data);  
            const users = await FetchAllUsers();
            const formattedUsers = users.map((user) => ({
              ...user,
              label: `${user.first_name} ${user.last_name} | (${user.email})`,
            }));
  
    
  
            setAllUsers(formattedUsers);
  
  
  
          } catch (err) {
            console.error("Failed to fetch session ID", err);
            setError("Failed to load session. Please refresh the page.");
  
          }finally{
            setLoading(false);
          }
        };
  
        fetchSessionId();
      }, []);


      const handleSubmit = async ()=>{
        const formData = {
          title: title,
          description: desc,
          invited_users: selectedUsers,
        };
        let result ;
        try {
           result =await fetch("http://localhost:8080/api/CreateGroup", {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
          });
          if (!result.ok) {
            throw new Error(`HTTP error: ${result.status}`);
          }
        } catch (e) {
          console.error("Error: ", e);
          throw e;
        }    
      }

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setTitle("");
          setDesc("");

          handleSubmit();
        }}
      >
        <label htmlFor="group-title">Title</label>
        <input
          id="group-title"
          name="Group_title"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <br />
        <label htmlFor="group-desc">Description</label>
        <textarea
          id="group-desc"
          name="Group_Desc"
          placeholder="Description"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          required
        />

        <button onClick={() => setShowUserPopup(true)}>
          Open User Selector
        </button>
        <button onClick={() => setSelectedUsers([])}>Clear Invited User</button>
        {showUserPopup && (
          <div className="modal">
            <div className="modal-content">
              <h3>Select users to share with</h3>

              <MultiSelect
                value={selectedUsers}
                onChange={(e) => setSelectedUsers(e.value)}
                options={allUsers}
                optionLabel="label"
                optionValue="id"
                display="chip"
                placeholder="Select Users"
                maxSelectedLabels={5}
                style={{ width: "100%" }}
              />

              <button className="btn" onClick={PrivateUsers}>
                Done
              </button>
            </div>
          </div>
        )}
        {selectedUsers.length > 0 && (
          <>
            <h1>Invited Users</h1>
            {selectedUsers.map((id) => {
              const user = allUsers.find((u) => u.id === id);
              return <h3 key={id}>{user.label || "Unknown User"}</h3>;
            })}
          </>
        )}
        <br />
        <button type="submit">Create Group</button>
      </form>
    </div>
  );
}

export default CreateGroupPage;
