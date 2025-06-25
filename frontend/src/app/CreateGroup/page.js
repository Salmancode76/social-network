"use client";

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
  const [formData, setFormData] = useState({
      user_id: null,
      content: "",
        image_file:"",
      privacy_type_id: "1",
      group_id: "",
    });
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
  
          }finally{
            setLoading(false);
          }
        };
  
        fetchSessionId();
      }, []);

  return (
    <div>
      <label htmlFor="group-title">Title</label>
      <input
        id="group-title"
        name="Group_title"
        placeholder="Title"
        onChange={(e) => setTitle(e.target.value)}
      />
      <br />
      <label htmlFor="group-desc">Description</label>
      <textarea
        id="group-desc"
        name="Group_Desc"
        placeholder="Description"
        onChange={(e) => setDesc(e.target.value)}
      />

      <button onClick={() => setShowUserPopup(true)}>Open User Selector</button>

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
    </div>
  );
}

export default CreateGroupPage;
